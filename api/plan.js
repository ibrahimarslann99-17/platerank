// /api/plan  (Tok Plan)
// POST: form girdisini alir, hedefi hesaplar, plani kaydeder. Ucretsiz kisim: gunluk hedef + ogun sayisi.
// GET ?id=<plan_id>: girisli kullanici. Abone degilse sadece ucretsiz kisim, aboneyse ogun haritasi + plan.
// Hesap ve kapi sadece burada calisir; tarayiciya yalnizca sonuc gider.

const { hedefHesapla } = require('./_hedef');
const { sorgu, kullanici, aboneMi } = require('./_supa');

const ZORUNLU = ['boy', 'kilo', 'yas', 'cinsiyet', 'aktivite', 'hedef', 'kalkis', 'yatis', 'email'];
const SAAT = /^([01]\d|2[0-3]):[0-5]\d$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function dogrula(g) {
  for (const k of ZORUNLU) if (g[k] === undefined || g[k] === '') return `eksik: ${k}`;
  g.boy = Number(g.boy); g.kilo = Number(g.kilo); g.yas = Number(g.yas);
  if (g.ogunSayisi !== undefined) g.ogunSayisi = Number(g.ogunSayisi);
  if (!(g.boy >= 120 && g.boy <= 230)) return 'boy';
  if (!(g.kilo >= 30 && g.kilo <= 300)) return 'kilo';
  if (!(g.yas >= 10 && g.yas <= 100)) return 'yas';
  if (!['kadin', 'erkek'].includes(g.cinsiyet)) return 'cinsiyet';
  if (!['hareketsiz', 'hafif', 'orta', 'yuksek'].includes(g.aktivite)) return 'aktivite';
  if (!['ver', 'saglik', 'kas'].includes(g.hedef)) return 'hedef';
  if (!SAAT.test(g.kalkis) || !SAAT.test(g.yatis)) return 'saat';
  if (!/^[^@\s"]+@[^@\s"]+\.[^@\s"]+$/.test(g.email) || g.email.length > 200) return 'email';
  return null;
}

// Ucretsiz kisim: gunluk toplamlar ve ogun sayisi. Ogun bazinda harita ucretli.
function ucretsiz(h) {
  return {
    gunluk: h.gunluk,
    uyanikSaat: h.uyanikSaat,
    ogunSayisi: h.ogunSayisi,
    onerilenOgunSayisi: h.onerilenOgunSayisi,
    kilitli: true,
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'POST') {
      const g = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const hata = dogrula(g);
      if (hata) return res.status(400).json({ hata });

      const h = hedefHesapla(g);
      if (h.engel) return res.status(200).json({ engel: h.engel });

      const [kayit] = await sorgu('planlar', {
        method: 'POST',
        prefer: 'return=representation',
        body: { email: g.email.toLowerCase(), dil: g.dil === 'en' ? 'en' : 'tr', girdi: g, hedef: h },
      });
      return res.status(200).json({ plan_id: kayit.id, ...ucretsiz(h) });
    }

    if (req.method === 'GET') {
      const id = String(req.query.id || '');
      if (!UUID.test(id)) return res.status(400).json({ hata: 'id' });

      const [plan] = await sorgu(`planlar?id=eq.${id}&select=id,email,user_id,hedef`);
      if (!plan) return res.status(404).json({ hata: 'yok' });
      if (plan.hedef?.engel) return res.status(200).json({ engel: plan.hedef.engel });

      const u = await kullanici(req);
      const sahip = u && (u.id === plan.user_id || (u.email || '').toLowerCase() === plan.email);
      if (!sahip) return res.status(200).json(ucretsiz(plan.hedef));

      // Ilk giriste plani kullaniciya bagla
      if (!plan.user_id) {
        await sorgu(`planlar?id=eq.${id}`, { method: 'PATCH', body: { user_id: u.id } });
      }

      if (!(await aboneMi(u.id, plan.email))) return res.status(200).json(ucretsiz(plan.hedef));

      // Sonraki adim: motor burada 7 gunluk plani uretecek.
      return res.status(200).json({ ...plan.hedef, kilitli: false, gunler: null });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ hata: 'sunucu' });
  }
};
