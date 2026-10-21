// Tok Plan motoru: hedef (api/_hedef.js) + yemek listesi -> 7 gunluk plan.
// Saf fonksiyon: veritabanina dokunmaz, ayni girdi + ayni tohum her zaman ayni plani verir.
// Sadece sunucuda calisir.

// Protein ekleri: ana tabagin yanina eklenen sade, tanidik kalemler (id ilk 8 hane).
// adet: true ise kat "adet" olarak yazilir (yumurta), degilse porsiyon carpani.
// alis: tanidiklik cezasi; herkesin evinde olan kalem 0, alisilmadik kalem yuksek.
const EKLER = {
  'd59cdb5b': { yer: ['ogle', 'aksam'], katlar: [1], alis: 0 },              // Tavuk gogsu izgara 150 g
  '695b73af': { yer: ['ogle', 'aksam'], katlar: [1], alis: 0.05 },           // Hindi gogsu 150 g
  '71cb4e78': { yer: ['ogle', 'aksam'], katlar: [1], alis: 0 },              // Ton baligi 100 g
  '97c15c90': { yer: ['kahvalti', 'ogle', 'aksam', 'ara'], katlar: [1, 2, 3], adet: true, alis: 0 }, // Haslanmis yumurta
  '9f08b5b0': { yer: ['kahvalti', 'ogle', 'aksam', 'ara'], katlar: [1], alis: 0 },  // Suzme yogurt
  '43d1e5e6': { yer: ['kahvalti', 'ara'], katlar: [1], alis: 0.05 },         // Yuksek proteinli yogurt / quark
  '91f66e95': { yer: ['kahvalti', 'ara'], katlar: [1], alis: 0.05 },         // Meyveli lor (cottage)
  'e62253a7': { yer: ['kahvalti', 'ara'], katlar: [1], alis: 0.2 },          // Whey + su
  '300e6d05': { yer: ['kahvalti', 'ara'], katlar: [1], alis: 0.3, bitkisel: true },          // Bezelye proteinli yogurt (vegan)
  '3c7ab74b': { yer: ['ogle', 'aksam', 'ara'], katlar: [1], alis: 0.2, bitkisel: true },     // Edamame kase (vegan)
  '2a21f2fe': { yer: ['kahvalti', 'ara'], katlar: [1, 2], alis: 0.1, bitkisel: true },       // Soya sutu (vegan)
  '56cd17cf': { yer: ['ogle', 'aksam'], katlar: [1], alis: 0.15, bitkisel: true },           // Izgara tofu (vegan)
  '98f95225': { yer: ['kahvalti', 'ara'], katlar: [1], alis: 0.05 },         // Kefir
};

const KATLAR = [0.75, 1, 1.25, 1.5];
const KCAL_TOL = 0.10;      // kalori +-%10
const PROTEIN_ALT = 0.90;   // proteinin en az %90'i
const TEKRAR_GUN = 3;       // ayni ana tabak 3 gun icinde tekrar etmez

// Tokluk suresi (api/_veri.js ile ayni egri), birlesik tabak icin kcal agirlikli puanla
function tabanSaat(kcal) { return 0.8 + 2.7 * Math.pow(Math.max(kcal, 1) / 500, 0.65); }
function verimKatsayi(puan) { return Math.max(0.6, Math.min(1.5, Math.sqrt(Math.max(puan, 1) / 150))); }
function tabakSaat(kcal, puan) { return Math.max(0.5, Math.min(6, tabanSaat(kcal) * verimKatsayi(puan))); }

// Deterministik rastgele (mulberry32), tohum plan id'sinden
function tohumla(metin) {
  let h = 1779033703 ^ metin.length;
  for (let i = 0; i < metin.length; i++) { h = Math.imul(h ^ metin.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function uygun(y, s) {
  if (s.diyet === 'vegan' && !y.diyet.includes('vegan')) return false;
  if (s.diyet === 'vejetaryen' && !y.diyet.includes('vejetaryen')) return false;
  if (s.alerjen.some((a) => y.alerjenler.includes(a))) return false;
  if (s.mutfakHaric.includes(y.mutfak)) return false;
  return true;
}

function ogunTipi(ad) { return ad.startsWith('ara') ? 'ara' : ad; }

// Ogun tipine gore ana tabak havuzu
// Temel gidalar (haslanmis patates, tek dilim ekmek, meyve) ana tabak olmaz; ancak ek olarak girer.
function tabanHavuz(tip, liste, ekIdler, gevsek) {
  const ek = (y) => ekIdler.has(y.id.slice(0, 8));
  const yemek = (y) => !ek(y) && y.mutfak !== 'temel';
  if (tip === 'kahvalti') return liste.filter((y) => yemek(y) && (y.tur === 'kahvalti' || (gevsek && y.tur === 'ana')) && y.kcal >= 120);
  if (tip === 'ara') return liste.filter((y) => yemek(y) && (y.tur === 'atistirmalik' || y.tur === 'kahvalti') && y.kcal >= 60 && y.kcal <= 450);
  return liste.filter((y) => yemek(y) && ['ana', 'corba', 'salata'].includes(y.tur) && y.kcal >= (gevsek ? 150 : 250));
}

function parca(y, kat, rol) {
  return {
    id: y.id, ad: y.ad, mutfak: y.mutfak, kat, rol, slug: y.slug, gorsel: y.gorsel, porsiyon: y.porsiyon,
    kcal: y.kcal * kat, protein: y.protein * kat, yag: y.yag * kat, lif: y.lif * kat,
    karbonhidrat: y.karbonhidrat * kat, puanKcal: y.doyuruculuk * y.kcal * kat,
  };
}

function topla(parcalar) {
  const t = { kcal: 0, protein: 0, yag: 0, lif: 0, karbonhidrat: 0, puanKcal: 0 };
  for (const p of parcalar) for (const k in t) t[k] += p[k];
  t.puan = t.kcal ? t.puanKcal / t.kcal : 0;
  t.tokSaat = tabakSaat(t.kcal, t.puan);
  return t;
}

// Bir ogun icin tum adaylari puanla. Donus: puana gore sirali aday listesi.
function adaylar(hedef, tip, taban, ekler, yanlar, ceza, rnd, tol = KCAL_TOL, pAlt = PROTEIN_ALT, yanCeza = () => 0) {
  const sonuc = [];
  const kMin = hedef.kcal * (1 - tol), kMax = hedef.kcal * (1 + tol);
  const pMin = hedef.protein * pAlt;
  const ekSecenek = [null];
  for (const e of ekler) for (const k of e.katlar) ekSecenek.push([e.y, k, e.ceza]);

  for (const b of taban) {
    const jitter = rnd() * 0.35; // ayni profildeki kullanicilar ayni haftayi gormesin
    const bCeza = ceza(b);
    if (bCeza === Infinity) continue;
    for (const kat of KATLAR) {
      const bp = parca(b, kat, 'ana');
      if (bp.kcal > kMax) continue;
      for (const es of ekSecenek) {
        const ps = [bp];
        if (es) ps.push(parca(es[0], es[1], 'ek'));
        let t = topla(ps);
        // Kalori eksikse ogle/aksamda bir yan tabak (salata/corba) dene
        if (t.kcal < kMin && yanlar.length && tip !== 'kahvalti' && tip !== 'ara') {
          const eksik = hedef.kcal - t.kcal;
          let enIyi = null;
          for (const y of yanlar) {
            if (y.id === b.id) continue;
            if (y.tur === b.tur) continue; // corbanin yanina corba, salatanin yanina salata yok
            // Kaloriye yakinlik + ayni mutfaktan olma + hafta icinde az tekrar
            const fark = Math.abs(y.kcal - eksik) / hedef.kcal + (y.mutfak === b.mutfak ? 0 : 0.15) + yanCeza(y);
            if (!enIyi || fark < enIyi[1]) enIyi = [y, fark];
          }
          if (enIyi) { ps.push(parca(enIyi[0], 1, 'yan')); t = topla(ps); }
        }
        if (t.kcal < kMin || t.kcal > kMax || t.protein < pMin) continue;
        if (t.protein > hedef.protein * 1.8) continue;
        const sapma = (t.kcal - hedef.kcal) / hedef.kcal;
        const skor = t.tokSaat
          - Math.abs(sapma) * 2
          - Math.max(0, sapma) * 6   // hedefin ustune cikmak kilo verme acigini yer; altinda kalmak daha az zararli
          - Math.max(0, t.protein / hedef.protein - 1.2) * 2.5   // proteini abartma; makro haritasi bozulur
          - (kat === 1 ? 0 : 0.15)
          - (ps.length - 1) * 0.25
          - (es ? es[2] : 0)
          - bCeza
          + jitter;
        sonuc.push({ parcalar: ps, toplam: t, skor, tabanId: b.id });
      }
    }
  }
  sonuc.sort((a, b) => b.skor - a.skor);
  return sonuc;
}

function yuvarla(t) {
  return { kcal: Math.round(t.kcal), protein: Math.round(t.protein), yag: Math.round(t.yag), lif: Math.round(t.lif), karbonhidrat: Math.round(t.karbonhidrat), tokSaat: Math.round(t.tokSaat * 2) / 2 };
}
function disari(a) {
  return {
    parcalar: a.parcalar.map((p) => ({
      id: p.id, ad: p.ad, rol: p.rol, kat: p.kat, kcal: Math.round(p.kcal), protein: Math.round(p.protein),
      ...(p.slug ? { slug: p.slug } : {}), ...(p.gorsel ? { gorsel: true } : {}), ...(p.porsiyon ? { porsiyon: p.porsiyon } : {}),
      ...(EKLER[p.id.slice(0, 8)] && EKLER[p.id.slice(0, 8)].adet ? { adet: true } : {}),
    })),
    toplam: yuvarla(a.toplam),
  };
}

// Ogun saatleri: ilk ogun kalkistan 30 dk sonra. Sonrakiler bir onceki ogunun toklugu bittiginde konur:
// en az 2 saat ara, son ogun en gec yatmadan 3 saat once, kalan ogunlere yer birakarak.
// Her ogune tokluk bitis saati ve bir sonraki ogune kadar kalan ac sure (dk) yazilir; grafik bunu cizer.
function saatDk(hhmm) { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; }
function dkSaat(dk) { dk = ((Math.round(dk / 15) * 15) % 1440 + 1440) % 1440; return `${String(Math.floor(dk / 60)).padStart(2, '0')}:${String(dk % 60).padStart(2, '0')}`; }
function saatAta(ogunler, kalkis, yatis) {
  if (!kalkis || !yatis) return;
  const bas = saatDk(kalkis) + 30;
  let son = saatDk(yatis) - 180;
  if (son <= bas) son += 1440;
  const n = ogunler.length;
  const zaman = [bas];
  for (let i = 1; i < n; i++) {
    const onceki = ogunler[i - 1].secim ? ogunler[i - 1].secim.toplam.tokSaat * 60 : 240;
    const enGec = son - (n - 1 - i) * 120;
    zaman.push(Math.max(zaman[i - 1] + 120, Math.min(zaman[i - 1] + onceki, enGec)));
  }
  ogunler.forEach((o, i) => {
    const t = zaman[i];
    o.saat = dkSaat(t);
    if (!o.secim) return;
    const bitis = t + o.secim.toplam.tokSaat * 60;
    o.tokBitis = dkSaat(bitis);
    const sonraki = i < n - 1 ? zaman[i + 1] : son + 180;
    o.acDk = Math.max(0, Math.round((sonraki - bitis) / 15) * 15);
  });
}

// Ana giris
// hedef: hedefHesapla() ciktisi; yemekler: [{id,ad,tur,mutfak,kcal,protein,yag,lif,karbonhidrat,doyuruculuk,alerjenler[],diyet[]}]
// secenek: { diyet: 'vegan'|'vejetaryen'|null, alerjen: [], mutfakHaric: [], mutfakAgirlik: {kod: 0..1}, tohum: 'plan-id', gun: 7 }
function planUret(hedef, yemekler, secenek = {}) {
  const s = { diyet: null, alerjen: [], mutfakHaric: [], mutfakAgirlik: {}, tohum: 'tok', gun: 7, ...secenek };
  // Et yiyen kullaniciya ozel urunler (TVP, Quorn, natto vb.) daha seyrek gelsin
  if (!s.diyet && s.mutfakAgirlik.veg === undefined) s.mutfakAgirlik = { ...s.mutfakAgirlik, veg: 0.6 };
  const rnd = tohumla(s.tohum);
  const liste = yemekler.filter((y) => uygun(y, s) && y.tur !== 'tatli' && y.tur !== 'icecek' || (EKLER[y.id.slice(0, 8)] && uygun(y, s)));
  const ekIdler = new Set(Object.keys(EKLER));
  const ekY = liste.filter((y) => ekIdler.has(y.id.slice(0, 8)));
  const yanlar = liste.filter((y) => (y.tur === 'salata' || y.tur === 'corba') && y.kcal <= 300);

  const sonKullanim = new Map(); // tabanId -> gun
  const ekSayac = new Map();     // ek id -> haftadaki kullanim
  const yanSayac = new Map();    // yan tabak id -> haftadaki kullanim
  const yanCeza = (y) => (yanSayac.get(y.id) || 0) * 0.12;
  const gunler = [];
  for (let g = 0; g < s.gun; g++) {
    const gunMutfak = new Set();
    const gunEk = new Set();
    const ogunler = [];
    for (const oh of hedef.ogunler) {
      const tip = ogunTipi(oh.ogun);
      const ekler = ekY.filter((y) => EKLER[y.id.slice(0, 8)].yer.includes(tip)).map((y) => {
        const e = EKLER[y.id.slice(0, 8)];
        // Yumurta kahvaltida 3'e kadar, diger ogunlerde en fazla 2. Bitkisel ekler et yiyene seyrek.
        const katlar = e.adet && tip !== 'kahvalti' ? e.katlar.filter((k) => k <= 2) : e.katlar;
        const alis = e.alis + (e.bitkisel && !s.diyet ? 0.4 : 0);
        return { y, katlar, ceza: alis + (ekSayac.get(y.id) || 0) * 0.2 + (gunEk.has(y.id) ? 0.6 : 0) };
      });
      const ceza = (b) => {
        const son = sonKullanim.get(b.id);
        if (son !== undefined && g - son < TEKRAR_GUN) return Infinity;
        let c = 0;
        if (son !== undefined) c += 0.3;
        if ((tip === 'ogle' || tip === 'aksam') && gunMutfak.has(b.mutfak)) c += 0.4;
        const w = s.mutfakAgirlik[b.mutfak];
        if (w !== undefined) c += (1 - w) * 0.8;
        return c;
      };
      // Bulamazsa kademeli gevset: once havuz, sonra tolerans
      let a = adaylar(oh, tip, tabanHavuz(tip, liste, ekIdler, false), ekler, yanlar, ceza, rnd, KCAL_TOL, PROTEIN_ALT, yanCeza);
      if (!a.length) a = adaylar(oh, tip, tabanHavuz(tip, liste, ekIdler, true), ekler, yanlar, ceza, rnd, KCAL_TOL, PROTEIN_ALT, yanCeza);
      if (!a.length) a = adaylar(oh, tip, tabanHavuz(tip, liste, ekIdler, true), ekler, yanlar, ceza, rnd, 0.15, 0.8, yanCeza);
      if (!a.length) { ogunler.push({ ogun: oh.ogun, hedef: oh, secim: null, alternatifler: [] }); continue; }
      const secim = a[0];
      // Alternatifler: farkli ana tabakli sonraki en iyi iki aday
      const alt = [];
      const goruldu = new Set([secim.tabanId]);
      for (const x of a) { if (alt.length >= 2) break; if (!goruldu.has(x.tabanId)) { alt.push(x); goruldu.add(x.tabanId); } }
      sonKullanim.set(secim.tabanId, g);
      for (const p of secim.parcalar) {
        if (p.rol === 'ek') { ekSayac.set(p.id, (ekSayac.get(p.id) || 0) + 1); gunEk.add(p.id); }
        if (p.rol === 'yan') yanSayac.set(p.id, (yanSayac.get(p.id) || 0) + 1);
      }
      if (tip === 'ogle' || tip === 'aksam') gunMutfak.add(secim.parcalar[0].mutfak);
      ogunler.push({ ogun: oh.ogun, hedef: oh, secim: disari(secim), alternatifler: alt.map(disari) });
    }
    saatAta(ogunler, s.kalkis, s.yatis);
    const t = { kcal: 0, protein: 0, yag: 0, lif: 0, karbonhidrat: 0 };
    for (const o of ogunler) if (o.secim) for (const k in t) t[k] += o.secim.toplam[k];
    gunler.push({ gun: g + 1, ogunler, toplam: t });
  }
  return { gunler };
}

module.exports = { planUret, EKLER, tabakSaat };
