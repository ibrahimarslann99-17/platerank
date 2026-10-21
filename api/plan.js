// /api/plan  (Tok Plan)
// POST                 : form girdisini alir, hedefi hesaplar, plani kaydeder. Doner: ucretsiz kisim + onizleme
//                        (ogun saatleri ve kahvalti karsilastirmasi; yemek adlari yok).
// POST ?islem=odeme    : { plan_id } -> Polar odeme oturumu acar, { url } doner.
// GET  ?id=            : plan. Erisim su yollardan biriyle acilir, yoksa sadece ucretsiz kisim:
//                        1) checkout_id: Polar'a sorulur, odeme bu plana aitse plan hemen acilir ve erisim anahtari verilir
//                        2) x-plan-anahtar basligi (odemede verilen anahtar) + aktif abonelik
//                        3) girisli kullanici (Supabase oturumu) + aktif abonelik
// Hesap ve kapi sadece burada calisir; tarayiciya yalnizca sonuc gider.

const crypto = require('crypto');
const { hedefHesapla } = require('./_hedef');
const { planUret, tabakSaat } = require('./_motor');
const { sorgu, kullanici, aboneMi } = require('./_supa');
const { slugla } = require('./_veri');
const EN_AD = require('./_en_adlar');

let GORSELLER = new Set();
try { GORSELLER = new Set(require('../img/yemek/liste.json')); } catch (e) { /* gorsel yok */ }

const SITE = 'https://platerank.dev';
const POLAR = process.env.POLAR_API || 'https://api.polar.sh/v1';
// Stay Full Plan urunu ($5/ay). Gizli degil; erisim anahtari ayrica POLAR_ACCESS_TOKEN ortam degiskeninde.
const URUN = process.env.POLAR_PRODUCT_ID || '6295304f-b7d7-4848-8209-69b486131d0d';

const ZORUNLU = ['boy', 'kilo', 'yas', 'cinsiyet', 'aktivite', 'hedef', 'kalkis', 'yatis', 'email'];
// Veritabanina yalnizca bunlar yazilir. Saglik kapisi cevaplari (hamile, kronikHastalik) asla saklanmaz.
const SAKLANAN = ['boy', 'kilo', 'yas', 'cinsiyet', 'aktivite', 'hedef', 'kalkis', 'yatis', 'ogunSayisi', 'kahvalti', 'dil', 'diyet', 'alerjen', 'mutfakHaric', 'birim', 'onay'];
const ALERJENLER = ['et', 'balik', 'sut', 'yumurta', 'gluten', 'kuruyemis', 'soya', 'baklagil'];
const MUTFAKLAR = ['tr', 'us', 'it', 'jp', 'mx', 'cn', 'me', 'kr', 'in', 'th', 'veg', 'hm', 'temel'];
const HAFTA_MS = 7 * 24 * 3600 * 1000;
const SAAT = /^([01]\d|2[0-3]):[0-5]\d$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// "Normalde kahvaltida ne yersin" sikki -> tipik porsiyonun besin degerleri.
// Doyuruculuk, sitedeki puanla ayni regresyonla hesaplanir; kendimize avantaj saglayacak bir duzeltme yok.
const TIPIK = {
  tost_recel: { kcal: 300, p: 7, lif: 2, yag: 9, seker: 15 },     // 2 dilim kizarmis ekmek, tereyagi, recel
  gevrek: { kcal: 300, p: 10, lif: 3, yag: 5, seker: 20 },        // kahvaltilik gevrek + sut
  yumurta_tost: { kcal: 300, p: 18, lif: 1.5, yag: 17, seker: 2 }, // 2 yumurta + 1 dilim ekmek
  hamur: { kcal: 350, p: 6, lif: 1.5, yag: 18, seker: 14 },       // kruvasan / muffin + kahve
  bagel: { kcal: 360, p: 12, lif: 2, yag: 12, seker: 6 },         // krem peynirli bagel
  yulaf: { kcal: 300, p: 10, lif: 5, yag: 6, seker: 12 },         // sutlu yulaf
  simit: { kcal: 330, p: 11, lif: 2, yag: 8, seker: 4 },          // simit + peynir + cay
  serpme: { kcal: 520, p: 22, lif: 3, yag: 32, seker: 10 },       // peynir, zeytin, yumurta, ekmek
  kahve: { kcal: 10, p: 0, lif: 0, yag: 0, seker: 1 },            // sadece kahve
  atla: null,                                                      // kahvalti yapmiyor
};
function regresyonPuan(m) {
  return Math.max(1, 159.65 - 0.2704 * m.kcal + 3.8921 * m.p + 8.8695 * Math.min(m.lif, 6) - 0.9682 * m.yag - 1.0398 * m.seker);
}
function tipikSaat(anahtar) {
  const m = TIPIK[anahtar];
  if (!m || m.kcal < 50) return 0;
  return Math.round(tabakSaat(m.kcal, regresyonPuan(m)) * 2) / 2;
}

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
  if (g.kahvalti != null && !(g.kahvalti in TIPIK)) return 'kahvalti';
  if (g.birim != null && !['metrik', 'imperial'].includes(g.birim)) return 'birim';
  // Saglikla iliskili veri (boy, kilo) acik riza olmadan islenmez
  if (g.onay !== true) return 'onay';
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
async function yemekleriCek(dil) {
  const kolon = 'id,ad,tur,mutfak,kcal,protein,yag,lif,karbonhidrat,doyuruculuk,alerjenler,diyet';
  const f = 'yayinda=eq.true&or=(sadece_malzeme.is.null,sadece_malzeme.is.false)&mutfak=not.in.(zincir,market)&tur=neq.malzeme&kcal=not.is.null&doyuruculuk=not.is.null';
  const liste = await sorgu(`yemekler?select=${kolon}&${f}&order=id.asc&limit=5000`);
  const sonuc = [];
  for (const y of liste) {
    const slug = slugla(y.ad);
    const z = { ...y, slug, gorsel: GORSELLER.has(slug) };
    if (dil === 'en') {
      const en = EN_AD[y.id.slice(0, 8)];
      if (!en) continue;
      z.ad = en[0];
      if (en[1]) z.porsiyon = en[1];
    }
    sonuc.push(z);
  }
  return sonuc;
}

function secenekler(kayit, hafta, ek = {}) {
  const g = kayit.girdi || {};
  return {
    diyet: g.diyet || null,
    alerjen: g.alerjen || [],
    mutfakHaric: g.mutfakHaric || [],
    mutfakAgirlik: kayit.dil === 'en' ? { tr: 0.7 } : {},
    kalkis: g.kalkis,
    yatis: g.yatis,
    tohum: `${kayit.id}:${hafta}`,
    ...ek,
  };
}

// Haftalik plan: plan olusturulduktan sonraki her 7 gunde yeni hafta, tohum plan id + hafta no.
async function haftalikPlan(kayit) {
  const hafta = Math.floor((Date.now() - Date.parse(kayit.created_at)) / HAFTA_MS);
  if (kayit.plan && kayit.plan.hafta === hafta) return kayit.plan;
  const yemekler = await yemekleriCek(kayit.dil);
  const sonuc = planUret(kayit.hedef, yemekler, secenekler(kayit, hafta));
  const plan = { hafta, olusturma: new Date().toISOString(), gunler: sonuc.gunler };
  await sorgu(`planlar?id=eq.${kayit.id}`, { method: 'PATCH', body: { plan } });
  return plan;
}

// Odeme oncesi onizleme: ilk gunun ogun saatleri ve kahvalti karsilastirmasi. Yemek adi icermez.
async function onizleme(kayit) {
  const yemekler = await yemekleriCek(kayit.dil);
  const gun = planUret(kayit.hedef, yemekler, secenekler(kayit, 0, { gun: 1 })).gunler[0];
  const ilk = gun.ogunler[0];
  const g = kayit.girdi || {};
  return {
    ogunler: gun.ogunler.map((o) => ({
      ogun: o.ogun, saat: o.saat, tokBitis: o.tokBitis, acDk: o.acDk,
      kcal: o.hedef.kcal, protein: o.hedef.protein,
      tokSaat: o.secim ? o.secim.toplam.tokSaat : null,
    })),
    kahvalti: {
      tipik: g.kahvalti || null,
      tipikSaat: g.kahvalti ? tipikSaat(g.kahvalti) : null,
      planSaat: ilk && ilk.secim ? ilk.secim.toplam.tokSaat : null,
    },
  };
}

// Odeme sonrasi erisim anahtari: plan id'sinin sunucu sirriyla imzasi. Abonelik bitince anahtar da ise yaramaz.
function planAnahtari(id) {
  return crypto.createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY || 'yok').update('tokplan:' + id).digest('hex').slice(0, 40);
}
function anahtarDogru(id, a) {
  const b = planAnahtari(id);
  return typeof a === 'string' && a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

async function polar(yol, { method = 'GET', body } = {}) {
  const r = await fetch(POLAR + yol, {
    method,
    headers: { Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`polar ${method} ${yol}: ${r.status} ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

function govde(req) {
  return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'POST' && req.query.islem === 'odeme') {
      if (!process.env.POLAR_ACCESS_TOKEN) return res.status(503).json({ hata: 'odeme_kapali' });
      const id = String(govde(req).plan_id || '');
      if (!UUID.test(id)) return res.status(400).json({ hata: 'id' });
      const [kayit] = await sorgu(`planlar?id=eq.${id}&select=id,email,dil`);
      if (!kayit) return res.status(404).json({ hata: 'yok' });
      const sayfa = kayit.dil === 'en' ? '/en/plan' : '/tok-plan';
      const c = await polar('/checkouts/', {
        method: 'POST',
        body: {
          products: [URUN],
          customer_email: kayit.email,
          metadata: { plan_id: id },
          success_url: `${SITE}${sayfa}?id=${id}&checkout_id={CHECKOUT_ID}`,
        },
      });
      return res.status(200).json({ url: c.url });
    }

    if (req.method === 'POST') {
      const g = govde(req);
      const hata = dogrula(g);
      if (hata) return res.status(400).json({ hata });

      const h = hedefHesapla(g);
      if (h.engel) return res.status(200).json({ engel: h.engel });

      g.onay = true;
      const [kayit] = await sorgu('planlar', {
        method: 'POST',
        prefer: 'return=representation',
        body: { email: g.email.toLowerCase(), dil: g.dil === 'en' ? 'en' : 'tr', girdi: Object.fromEntries(SAKLANAN.filter((k) => g[k] !== undefined).map((k) => [k, g[k]])), hedef: h },
      });
      let on = null;
      try { on = await onizleme(kayit); } catch (e) { console.error('onizleme', e); }
      return res.status(200).json({ plan_id: kayit.id, ...ucretsiz(h), onizleme: on });
    }

    if (req.method === 'GET') {
      const id = String(req.query.id || '');
      if (!UUID.test(id)) return res.status(400).json({ hata: 'id' });

      const [plan] = await sorgu(`planlar?id=eq.${id}&select=id,email,user_id,dil,girdi,hedef,plan,created_at`);
      if (!plan) return res.status(404).json({ hata: 'yok' });
      if (plan.hedef?.engel) return res.status(200).json({ engel: plan.hedef.engel });

      let erisim = false;
      let anahtar = null;

      // 1) Odemeden donus: webhook gecikse bile odeme dogrudan Polar'dan dogrulanir
      const kc = String(req.query.checkout_id || '');
      if (kc && /^[0-9a-f-]{36}$/.test(kc) && process.env.POLAR_ACCESS_TOKEN) {
        try {
          const c = await polar(`/checkouts/${kc}`);
          if (['succeeded', 'confirmed'].includes(c.status) && c.metadata && c.metadata.plan_id === id) {
            erisim = true;
            anahtar = planAnahtari(id);
          }
        } catch (e) { console.error('checkout', e); }
      }

      // 2) Erisim anahtari + aktif abonelik
      if (!erisim && anahtarDogru(id, req.headers['x-plan-anahtar'])) {
        erisim = await aboneMi(null, plan.email, plan.id);
      }

      // 3) Girisli kullanici + aktif abonelik
      if (!erisim) {
        const u = await kullanici(req);
        const sahip = u && (u.id === plan.user_id || (u.email || '').toLowerCase() === plan.email);
        if (sahip) {
          if (!plan.user_id) await sorgu(`planlar?id=eq.${id}`, { method: 'PATCH', body: { user_id: u.id } });
          erisim = await aboneMi(u.id, plan.email, plan.id);
          if (erisim) anahtar = planAnahtari(id);
        }
      }

      if (!erisim) return res.status(200).json(ucretsiz(plan.hedef));

      const hafta = await haftalikPlan(plan);
      return res.status(200).json({ ...plan.hedef, kilitli: false, hafta: hafta.hafta, gunler: hafta.gunler, ...(anahtar ? { anahtar } : {}) });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ hata: 'sunucu' });
  }
};
