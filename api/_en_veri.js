// İngilizce site (/en) veri katmanı. Türkçe veri modelini (_veri.js) alır, İngilizce adı olan yemekleri
// ayrı bir küme olarak yeniden sıralar ve "X vs Y" karşılaştırma çiftlerini üretir.
// Saf fonksiyon: aynı Türkçe veri nesnesi için sonuç bir kez hesaplanır ve tutulur.

const { slugla, SITE } = require('./_veri.js');
const ADLAR = require('./_en_adlar.js');

const CUISINES = [
  { id: 'temel', ad: 'Basics', ic: '🥚' }, { id: 'us', ad: 'American', ic: '🇺🇸' },
  { id: 'it', ad: 'Italian', ic: '🇮🇹' }, { id: 'mx', ad: 'Mexican', ic: '🇲🇽' },
  { id: 'jp', ad: 'Japanese', ic: '🇯🇵' }, { id: 'cn', ad: 'Chinese', ic: '🇨🇳' },
  { id: 'in', ad: 'Indian', ic: '🇮🇳' }, { id: 'th', ad: 'Thai', ic: '🇹🇭' },
  { id: 'kr', ad: 'Korean', ic: '🇰🇷' }, { id: 'me', ad: 'Middle Eastern', ic: '🌙' },
  { id: 'tr', ad: 'Turkish', ic: '🇹🇷' }, { id: 'veg', ad: 'Vegetarian & protein', ic: '🥦' },
  { id: 'hm', ad: 'Home cooking', ic: '🏠' },
];
const CUISINE = Object.fromEntries(CUISINES.map((m) => [m.id, m]));
const SLUG_EK = { temel: 'basic', us: 'american', it: 'italian', mx: 'mexican', jp: 'japanese', cn: 'chinese',
  in: 'indian', th: 'thai', kr: 'korean', me: 'middle-eastern', tr: 'turkish', veg: 'vegetarian', hm: 'homemade' };

const TIER = {
  S: { kisa: 'Champion', uzun: 'a satiety champion that keeps you full for a long time on few calories' },
  A: { kisa: 'Strong', uzun: 'strongly filling and a reliable choice' },
  B: { kisa: 'Average', uzun: 'average: it does the job' },
  C: { kisa: 'Weak', uzun: 'weakly filling: you get hungry again fast' },
  D: { kisa: 'Empty calories', uzun: "empty calories: you eat it but you don't feel full" },
};

// Videolarda ve aramalarda öne çıkan karşılaştırmalar; kalori farkı büyük olsa da her zaman sayfa olur.
const SECME_CIFTLER = [
  ['b9e41fd9', '1c2500c4'], ['10b4dcab', '13f139d4'], ['c4d68ba1', '5f7049ed'], ['4361844f', 'd59cdb5b'],
  ['766dfdc7', 'd59cdb5b'], ['0b4d1c19', '20cd9daa'], ['2e4bf470', 'f6a6e838'], ['13f139d4', 'd9442f23'],
  ['0f233459', 'f14a8c75'], ['0675dc4f', 'be27b741'], ['0a4b57fd', 'be27b741'], ['9f08b5b0', '4f4cc815'],
  ['97c15c90', '0675dc4f'], ['6a903ae5', '47d6996c'], ['46e1a160', '302ee059'], ['46e1a160', '42242f39'],
  ['1bbb8361', '38948cf6'], ['c2e5b400', '4bbfa378'], ['f6a6e838', 'd4c372f7'], ['9de0e165', 'c6e1caef'],
  ['0708567f', '827a791e'], ['c9641ddc', '766dfdc7'], ['2bdb8756', 'ec7dbf90'], ['06409a50', 'ede980da'],
  ['aa91c377', 'e83dc016'], ['c4da7df0', '67d4f972'], ['5e835c6c', '9aeb1e9f'], ['7c291d6c', 'd59cdb5b'],
  ['59687092', 'cb29c540'], ['0165906e', 'c244a704'], ['b1c632c5', '9f01fe65'], ['2001ce76', 'ede980da'],
  ['760929d9', 'e462dd35'], ['2867ed6d', '6a903ae5'], ['84fdc2e8', 'e81838dd'], ['9360d486', 'cb29c540'],
];
const CIFT_BASINA = 2; // her yemeğin otomatik karşılaştırma ortağı sayısı

function saatYaz(s) { return Number.isInteger(s) ? String(s) : s.toFixed(1); }
function dkYaz(dk) {
  if (dk == null) return '';
  if (dk < 60) return `${Math.round(dk / 5) * 5} min`;
  const s = Math.round((dk / 60) * 2) / 2;
  return `${saatYaz(s)} hour${s === 1 ? '' : 's'}`;
}
function saatEk(s) { return `${saatYaz(s)} hour${s === 1 ? '' : 's'}`; }

function ciftSlug(a, b) { return a.slug < b.slug ? `${a.slug}-vs-${b.slug}` : `${b.slug}-vs-${a.slug}`; }

function ciftleriKur(liste, idIle) {
  const aday = liste.filter((y) => y.saat != null && !y.kanonik);
  const ciftler = new Map();
  const ekle = (a, b, secme) => {
    if (!a || !b || a === b || a.saat == null || b.saat == null || a.kanonik || b.kanonik) return;
    const slug = ciftSlug(a, b);
    if (ciftler.has(slug)) { if (secme) ciftler.get(slug).secme = true; return; }
    const [x, y] = a.slug < b.slug ? [a, b] : [b, a];
    ciftler.set(slug, { slug, a: x, b: y, secme });
  };
  for (const [p, q] of SECME_CIFTLER) ekle(idIle.get(p), idIle.get(q), true);

  // Otomatik ortaklar: aynı tür, kalori farkı en fazla ~2,2 kat, tokluk süresi en az yarım saat farklı.
  // Önce farklı ligden olan (karşıtlık), sonra kalorisi en yakın olan seçilir.
  for (const a of aday) {
    const ortak = aday
      .filter((b) => b !== a && b.tur === a.tur && Math.abs(b.saat - a.saat) >= 0.5
        && Math.max(a.kcal, b.kcal) / Math.max(1, Math.min(a.kcal, b.kcal)) <= 2.2)
      .sort((p, q) => (q.lig !== a.lig) - (p.lig !== a.lig)
        || Math.abs(p.kcal - a.kcal) - Math.abs(q.kcal - a.kcal)
        || p.slug.localeCompare(q.slug))
      .slice(0, CIFT_BASINA);
    for (const b of ortak) ekle(a, b, false);
  }
  const yemegin = new Map();
  for (const c of ciftler.values()) {
    for (const y of [c.a, c.b]) {
      if (!yemegin.has(y.slug)) yemegin.set(y.slug, []);
      yemegin.get(y.slug).push(c);
    }
  }
  return { ciftler, yemegin };
}

const onbellek = new WeakMap();
function enHazirla(d) {
  if (onbellek.has(d)) return onbellek.get(d);
  const kullanilan = new Set();
  const adIlk = new Map();
  const yemekler = [];
  for (const y of d.yemekler) {
    const a = ADLAR[String(y.id).slice(0, 8)];
    if (!a || !CUISINE[y.mutfak]) continue;
    const [ad, porsiyon, tanim] = a;
    const tam = porsiyon ? `${ad} (${porsiyon})` : ad;
    const e = { ...y, trSlug: y.slug, trKanonik: y.kanonikSlug || null, ad, porsiyon, tanim, tam };
    delete e.kanonikSlug;
    let s = slugla(ad) || 'food';
    if (kullanilan.has(s) && porsiyon) s = slugla(`${ad} ${porsiyon}`);
    if (kullanilan.has(s)) s = `${slugla(ad)}-${SLUG_EK[y.mutfak]}`;
    let n = 2;
    const kok = s;
    while (kullanilan.has(s)) s = `${kok}-${n++}`;
    kullanilan.add(s);
    e.slug = s;
    const anahtar = tam.toLowerCase();
    if (adIlk.has(anahtar)) e.kanonik = adIlk.get(anahtar); else adIlk.set(anahtar, s);
    yemekler.push(e);
  }
  const saatli = yemekler.filter((y) => y.saat != null).map((y) => y.saat);
  for (const y of yemekler) {
    if (y.saat != null) y.saatYuzde = Math.round((saatli.filter((s) => s < y.saat).length / saatli.length) * 100);
  }
  const sirali = [...yemekler].sort((a, b) => b.doyuruculuk - a.doyuruculuk || a.kcal - b.kcal);
  sirali.forEach((y, i) => { y.sira = i + 1; });
  const slugIle = new Map(yemekler.map((y) => [y.slug, y]));
  const idIle = new Map(yemekler.map((y) => [String(y.id).slice(0, 8), y]));
  const trIle = new Map(yemekler.map((y) => [y.trSlug, y]));
  const { ciftler, yemegin } = ciftleriKur(yemekler, idIle);
  const sonuc = { yemekler, sirali, slugIle, idIle, trIle, ciftler, yemegin, toplam: yemekler.length };
  onbellek.set(d, sonuc);
  return sonuc;
}

// Türkçe yemek sayfası için İngilizce karşılığın adresi (iki taraf da kanonikse), yoksa null.
function enAdres(d, trSlug) {
  const e = enHazirla(d).trIle.get(trSlug);
  if (!e || e.kanonik || e.trKanonik) return null;
  return `${SITE}/en/food/${e.slug}`;
}

module.exports = { enHazirla, enAdres, ciftSlug, saatYaz, saatEk, dkYaz, CUISINES, CUISINE, TIER };
