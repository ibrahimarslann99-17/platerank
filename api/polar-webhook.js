// /api/polar-webhook  (Tok Plan)
// Polar abonelik olaylarini dinler, abonelikler tablosunu gunceller.
// Imza (Standard Webhooks) dogrulanmadan hicbir sey yazilmaz. Bagimlilik yok.

const crypto = require('crypto');
const { sorgu } = require('./_supa');

const TOLERANS_SN = 5 * 60;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

async function hamGovde(req) {
  const parcalar = [];
  for await (const p of req) parcalar.push(typeof p === 'string' ? Buffer.from(p) : p);
  return Buffer.concat(parcalar).toString('utf8');
}

// Polar sirri ham haliyle HMAC anahtari olarak kullanir (SDK'daki validateEvent ile ayni).
function imzaGecerli(govde, h, sir) {
  const id = h['webhook-id'];
  const zaman = h['webhook-timestamp'];
  const imzalar = h['webhook-signature'];
  if (!id || !zaman || !imzalar || !sir) return false;
  if (Math.abs(Date.now() / 1000 - Number(zaman)) > TOLERANS_SN) return false;

  const beklenen = crypto.createHmac('sha256', Buffer.from(sir, 'utf8'))
    .update(`${id}.${zaman}.${govde}`).digest();
  return String(imzalar).split(' ').some((parca) => {
    const [surum, imza] = parca.split(',');
    if (surum !== 'v1' || !imza) return false;
    const b = Buffer.from(imza, 'base64');
    return b.length === beklenen.length && crypto.timingSafeEqual(b, beklenen);
  });
}

function durumCevir(tip, a) {
  if (tip === 'subscription.revoked') return 'sona_erdi';
  if (a.status === 'active') return a.cancel_at_period_end ? 'iptal_edildi' : 'aktif';
  if (a.status === 'canceled') return a.ended_at ? 'sona_erdi' : 'iptal_edildi';
  if (['past_due', 'unpaid', 'incomplete'].includes(a.status)) return 'odeme_bekliyor';
  return 'sona_erdi';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let olay;
  try {
    const govde = await hamGovde(req);
    if (!imzaGecerli(govde, req.headers, process.env.POLAR_WEBHOOK_SECRET)) return res.status(403).end();
    olay = JSON.parse(govde);
  } catch (e) {
    console.error(e);
    return res.status(400).end();
  }

  if (!String(olay.type || '').startsWith('subscription.')) return res.status(202).end();

  const a = olay.data || {};
  const planId = a.metadata?.plan_id;
  const satir = {
    polar_abonelik_id: a.id,
    email: String(a.customer?.email || '').toLowerCase(),
    plan_id: UUID.test(planId || '') ? planId : null,
    durum: durumCevir(olay.type, a),
    donem_sonu: a.current_period_end || null,
    updated_at: new Date().toISOString(),
  };
  if (!satir.polar_abonelik_id || !satir.email) return res.status(202).end();

  try {
    if (satir.plan_id) {
      const [p] = await sorgu(`planlar?id=eq.${satir.plan_id}&select=user_id`);
      if (p?.user_id) satir.user_id = p.user_id;
    }
    await sorgu('abonelikler?on_conflict=polar_abonelik_id', {
      method: 'POST',
      prefer: 'resolution=merge-duplicates',
      body: satir,
    });
    return res.status(202).end();
  } catch (e) {
    console.error(e);
    return res.status(500).end(); // Polar tekrar dener
  }
};
