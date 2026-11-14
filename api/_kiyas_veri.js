// Türkçe karşılaştırma ("X mı, Y mi?") çiftleri. Bilerek küçük tutulur: Google'ın tarama kuyruğu zaten dolu,
// sayfa sayısını şişirmek dizine girmeyi hızlandırmaz. Küme:
//   - _en_veri.js'teki seçme çiftler (videolarda ve aramalarda öne çıkanlar), iki taraf da Türkçe sitede varsa
//   - Türk, Temel Gıdalar ve Zincir yemeklerine birer otomatik ortak (aynı tür, kalorisi yakın, aynı kaloride
//     tokluk süresi en az yarım saat farklı; önce farklı ligden olan)
// Saf fonksiyon: aynı veri nesnesi için sonuç bir kez hesaplanır.

const { SECME_CIFTLER } = require('./_en_veri.js');

const OTO_MUTFAK = new Set(['tr', 'temel', 'zincir']);
const ORTAK_SAYISI = 1;

function kiyasSlug(a, b) { return a.slug < b.slug ? `${a.slug}-vs-${b.slug}` : `${b.slug}-vs-${a.slug}`; }

// Soru eki: son ünlüye göre mı/mi/mu/mü ("Muz mu", "Yulaf ezmesi mi", "Cheeseburger mi")
function soruEki(ad) {
  const k = String(ad).toLocaleLowerCase('tr');
  for (let i = k.length - 1; i >= 0; i--) {
    const c = k[i];
    if ('aı'.includes(c)) return 'mı';
    if ('ei'.includes(c)) return 'mi';
    if ('ou'.includes(c)) return 'mu';
    if ('öü'.includes(c)) return 'mü';
  }
  return 'mi';
}
// Porsiyon parantezini at: "Yulaf ezmesi (pişmiş, 1 kase)" → "Yulaf ezmesi"
function kokAd(ad) { const i = ad.indexOf(' ('); return i < 0 ? ad : ad.slice(0, i); }

function kur(d) {
  const uygun = (y) => y && y.saat != null && y.ayniSaat != null && !y.kanonikSlug;
  const idIle = new Map(d.yemekler.map((y) => [String(y.id).slice(0, 8), y]));
  const ciftler = new Map();
  const ekle = (a, b, secme) => {
    if (!uygun(a) || !uygun(b) || a === b || kokAd(a.ad) === kokAd(b.ad)) return;
    const slug = kiyasSlug(a, b);
    if (ciftler.has(slug)) { if (secme) ciftler.get(slug).secme = true; return; }
    const [x, y] = a.slug < b.slug ? [a, b] : [b, a];
    ciftler.set(slug, { slug, a: x, b: y, secme });
  };
  for (const [p, q] of SECME_CIFTLER) ekle(idIle.get(p), idIle.get(q), true);

  const aday = d.yemekler.filter((y) => uygun(y) && OTO_MUTFAK.has(y.mutfak));
  for (const a of aday) {
    const ortak = aday
      // atıştırmalık türü çok geniş (meyve, meze, cips): orada yalnızca aynı mutfak eşleşir, "kuru kayısı mı acılı ezme mi" çıkmasın
      .filter((b) => b !== a && b.tur === a.tur && (a.tur !== 'atistirmalik' || b.mutfak === a.mutfak)
        && kokAd(b.ad) !== kokAd(a.ad) && Math.abs(b.ayniSaat - a.ayniSaat) >= 0.5
        && Math.max(a.kcal, b.kcal) / Math.max(1, Math.min(a.kcal, b.kcal)) <= 2.2)
      .sort((p, q) => (q.lig !== a.lig) - (p.lig !== a.lig)
        || (q.mutfak === a.mutfak) - (p.mutfak === a.mutfak)
        || Math.abs(p.kcal - a.kcal) - Math.abs(q.kcal - a.kcal)
        || p.slug.localeCompare(q.slug))
      .slice(0, ORTAK_SAYISI);
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
function kiyasHazirla(d) {
  if (!onbellek.has(d)) onbellek.set(d, kur(d));
  return onbellek.get(d);
}

// "Muz mu, yulaf ezmesi mi?" ve kazanan (aynı 300 kaloride daha uzun tutan; eşitse doyuruculuk puanı yüksek olan)
function kiyasMetni(c) {
  const A = kokAd(c.a.ad), B = kokAd(c.b.ad);
  const fark = Math.round(Math.abs(c.a.ayniSaat - c.b.ayniSaat) * 2) / 2;
  const berabere = fark === 0;
  const [k, z] = berabere ? (c.a.doyuruculuk >= c.b.doyuruculuk ? [c.a, c.b] : [c.b, c.a]) : (c.a.ayniSaat > c.b.ayniSaat ? [c.a, c.b] : [c.b, c.a]);
  return { A, B, soru: `${A} ${soruEki(A)}, ${B} ${soruEki(B)}?`, fark, berabere, k, z };
}

module.exports = { kiyasHazirla, kiyasSlug, kiyasMetni, soruEki, kokAd };
