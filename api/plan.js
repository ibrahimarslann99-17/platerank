// /api/plan  (Tok Plan)
// POST: form girdisini alir, hedefi hesaplar, plani kaydeder. Ucretsiz kisim: gunluk hedef + ogun sayisi.
// GET ?id=<plan_id>: girisli kullanici. Abone degilse sadece ucretsiz kisim, aboneyse ogun haritasi + plan.
// Hesap ve kapi sadece burada calisir; tarayiciya yalnizca sonuc gider.

const { hedefHesapla } = require('./_hedef');
const { planUret } = require('./_motor');
const { sorgu, kullanici, aboneMi } = require('./_supa');
const EN_AD = require('./_en_adlar');

const ZORUNLU = ['boy', 'kilo', 'yas', 'cinsiyet', 'aktivite', 'hedef', 'kalkis', 'yatis', 'email'];
// Veritabanina yalnizca bunlar yazilir. Saglik kapisi cevaplari (hamile, kronikHastalik) asla saklanmaz.
const SAKLANAN = ['boy', 'kilo', 'yas', 'cinsiyet', 'aktivite', 'hedef', 'kalkis', 'yatis', 'ogunSayisi', 'kahvalti', 'dil', 'diyet', 'alerjen', 'mutfakHaric'];
const ALERJENLER = ['et', 'balik', 'sut', 'yumurta', 'gluten', 'kuruyemis', 'soya', 'baklagil'];
const MUTFAKLAR = ['tr', 'us', 'it', 'jp', 'mx', 'cn', 'me', 'kr', 'in', 'th', 'veg', 'hm', 'temel'];
const HAFTA_MS = 7 * 24 * 3600 * 1000;
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
  if (g.diyet != null && !['vejetaryen', 'vegan'].includes(g.diyet)) return 'diyet';
  if (g.alerjen != null && !(Array.isArray(g.alerjen) && g.alerjen.every((a) => ALERJENLER.includes(a)))) return 'alerjen';
  if (g.mutfakHaric != null && !(Array.isArray(g.mutfakHaric) && g.mutfakHaric.every((m) => MUTFAKLAR.includes(m)))) return 'mutfak';
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

// Plana girebilecek yemekler. Zincir ve market urunleri ile tek basina malzemeler disarida.
// Icecek ve tatlilari motor kendisi eler; yalnizca protein eki olan icecekler (kefir, whey, soya sutu) plana girer.
async function yemekleriCek() {
  const kolon = 'id,ad,tur,mutfak,kcal,protein,yag,lif,karbonhidrat,doyuruculuk,alerjenler,diyet';
  const f = 'yayinda=eq.true&or=(sadece_malzeme.is.null,sadece_malzeme.is.false)&mutfak=not.in.(zincir,market)&tur=neq.malzeme&kcal=not.is.null&doyuruculuk=not.is.null';
  return sorgu(`yemekler?select=${kolon}&${f}&order=id.asc&limit=5000`);
}

// Haftalik plan: plan olusturulduktan sonraki her 7 gunde yeni hafta, tohum plan id + hafta no.
async function haftalikPlan(kayit) {
  const hafta = Math.floor((Date.now() - Date.parse(kayit.created_at)) / HAFTA_MS);
  if (kayit.plan && kayit.plan.hafta === hafta) return kayit.plan;
  const g = kayit.girdi || {};
  const en = kayit.dil === 'en';
  let yemekler = await yemekleriCek();
  if (en) yemekler = yemekler.filter((y) => EN_AD[y.id.slice(0, 8)]).map((y) => ({ ...y, ad: EN_AD[y.id.slice(0, 8)][0] }));
  const sonuc = planUret(kayit.hedef, yemekler, {
    diyet: g.diyet || null,
    alerjen: g.alerjen || [],
    mutfakHaric: g.mutfakHaric || [],
    mutfakAgirlik: en ? { tr: 0.7 } : {},
    kalkis: g.kalkis,
    yatis: g.yatis,
    tohum: `${kayit.id}:${hafta}`,
  });
  const plan = { hafta, olusturma: new Date().toISOString(), gunler: sonuc.gunler };
  await sorgu(`planlar?id=eq.${kayit.id}`, { method: 'PATCH', body: { plan } });
  return plan;
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
        body: { email: g.email.toLowerCase(), dil: g.dil === 'en' ? 'en' : 'tr', girdi: Object.fromEntries(SAKLANAN.filter((k) => g[k] !== undefined).map((k) => [k, g[k]])), hedef: h },
      });
      return res.status(200).json({ plan_id: kayit.id, ...ucretsiz(h) });
    }

    if (req.method === 'GET') {
      const id = String(req.query.id || '');
      if (!UUID.test(id)) return res.status(400).json({ hata: 'id' });

      const [plan] = await sorgu(`planlar?id=eq.${id}&select=id,email,user_id,dil,girdi,hedef,plan,created_at`);
      if (!plan) return res.status(404).json({ hata: 'yok' });
      if (plan.hedef?.engel) return res.status(200).json({ engel: plan.hedef.engel });

      const u = await kullanici(req);
      const sahip = u && (u.id === plan.user_id || (u.email || '').toLowerCase() === plan.email);
      if (!sahip) return res.status(200).json(ucretsiz(plan.hedef));

      // Ilk giriste plani kullaniciya bagla
      if (!plan.user_id) {
        await sorgu(`planlar?id=eq.${id}`, { method: 'PATCH', body: { user_id: u.id } });
      }

      if (!(await aboneMi(u.id, plan.email, plan.id))) return res.status(200).json(ucretsiz(plan.hedef));

      const hafta = await haftalikPlan(plan);
      return res.status(200).json({ ...plan.hedef, kilitli: false, hafta: hafta.hafta, gunler: hafta.gunler });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ hata: 'sunucu' });
  }
};
