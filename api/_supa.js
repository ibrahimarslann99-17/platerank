// Sunucu tarafi Supabase erisimi. Bagimlilik yok, dogrudan REST.
// SUPABASE_SERVICE_ROLE_KEY sadece Vercel ortam degiskeninde durur; tarayiciya asla gitmez.

const URL_ = process.env.SUPABASE_URL || 'https://hpxnektzsrdhqzwwkfau.supabase.co';
const SERVIS = process.env.SUPABASE_SERVICE_ROLE_KEY;

function basliklar(ekstra = {}) {
  return {
    apikey: SERVIS,
    Authorization: `Bearer ${SERVIS}`,
    'Content-Type': 'application/json',
    ...ekstra,
  };
}

async function sorgu(yol, { method = 'GET', body, prefer } = {}) {
  const r = await fetch(`${URL_}/rest/v1/${yol}`, {
    method,
    headers: basliklar(prefer ? { Prefer: prefer } : {}),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`supabase ${method} ${yol}: ${r.status} ${await r.text()}`);
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

// Tarayicidan gelen kullanici oturumunu dogrular, kullaniciyi dondurur (yoksa null).
async function kullanici(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  const r = await fetch(`${URL_}/auth/v1/user`, {
    headers: { apikey: SERVIS, Authorization: h },
  });
  return r.ok ? r.json() : null;
}

// Kapi: aktif abonelik ya da iptal edilmis ama donemi bitmemis abonelik.
// E-postalar kucuk harfle saklanir; PostgREST or() icinde nokta iceren deger tirnakla verilir.
async function aboneMi(userId, email) {
  const e = String(email || '').toLowerCase().replace(/"/g, '');
  const kosul = userId ? `(user_id.eq.${userId},email.eq."${e}")` : `(email.eq."${e}")`;
  const satirlar = await sorgu(`abonelikler?select=durum,donem_sonu&or=${encodeURIComponent(kosul)}`);
  const simdi = Date.now();
  return (satirlar || []).some((s) =>
    s.durum === 'aktif' ||
    (s.durum === 'iptal_edildi' && s.donem_sonu && Date.parse(s.donem_sonu) > simdi)
  );
}

module.exports = { sorgu, kullanici, aboneMi };
