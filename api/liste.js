// /liste          → hazır listelerin dizini
// /liste/:slug    → tek liste: "yüksek proteinli kahvaltı" gibi bir aramaya veriyle cevap veren sıralı sayfa
// Listeler api/_listeler.js'te tanımlı; kalemler canlı veriden hesaplanır.

const { veri, esc, LIG_RENK, SITE } = require('./_veri.js');
const { LISTELER, LISTE, OLCU, listeKalemleri } = require('./_listeler.js');
const { sayfa, yanit } = require('./_sablon.js');

const EK_CSS = `
.kolaj{display:grid;grid-template-columns:2fr 1fr;grid-template-rows:1fr 1fr;gap:6px;border-radius:22px;overflow:hidden;aspect-ratio:16/10;margin:0 0 18px;background:#cfd9d1}
.kolaj a{display:block;position:relative;overflow:hidden}
.kolaj a:first-child{grid-row:1/3}
.kolaj img{width:100%;height:100%;object-fit:cover;display:block}
.kolaj span{position:absolute;left:8px;bottom:8px;background:rgba(14,34,23,.7);color:#fff;font-size:12px;font-weight:600;padding:2px 8px;border-radius:999px}
.kolaj.az{grid-template-columns:1fr;grid-template-rows:1fr}
ol.sira{list-style:none;padding:0;margin:0;counter-reset:s}
ol.sira li a{display:flex;align-items:center;gap:12px;padding:10px 4px;border-bottom:1px solid var(--line);text-decoration:none;color:var(--ink)}
ol.sira .no{flex:0 0 26px;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:18px;color:var(--muted);text-align:right}
ol.sira img,ol.sira .bos{flex:0 0 64px;width:64px;height:48px;border-radius:10px;object-fit:cover;background:var(--line)}
ol.sira .ad{flex:1;min-width:0;font-weight:600;line-height:1.3}
ol.sira .ad small{display:block;font-weight:400;color:var(--muted);font-size:13px;margin-top:2px}
ol.sira .pn{flex:none;text-align:right}
ol.sira .pn b{display:inline-flex;align-items:center;justify-content:center;min-width:44px;height:30px;padding:0 8px;border-radius:9px;color:#fff;font-family:'Bricolage Grotesque',sans-serif;font-size:16px}
ol.sira .pn small{display:block;font-size:11px;color:var(--muted);margin-top:2px}
dl.sss dt{font-weight:700;margin-top:14px}
dl.sss dd{margin:4px 0 0}
.listeler{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.listeler a{display:block;background:var(--card);border-radius:16px;overflow:hidden;text-decoration:none;color:var(--ink);box-shadow:0 1px 2px rgba(14,34,23,.05),0 8px 18px -14px rgba(14,34,23,.25)}
.listeler a img{display:block;width:100%;height:auto;aspect-ratio:1200/630;object-fit:cover;background:var(--line)}
.listeler a span{display:block;padding:9px 11px 11px;font-weight:600;font-size:15px;line-height:1.3}
.gecit{background:var(--forest);color:#fff;border-radius:22px;padding:20px;margin-top:28px}
.gecit h2{color:var(--lime);margin:0 0 6px;font-size:20px}
.gecit p{margin:0 0 14px;color:#cfe0d4}
.gecit .btn{background:var(--lime);color:var(--forest)}
`;

function kolaj(l) {
  const r = l.filter((y) => y.gorsel).slice(0, 3);
  if (!r.length) return '';
  return `<div class="kolaj${r.length < 3 ? ' az' : ''}">${(r.length < 3 ? r.slice(0, 1) : r).map((y, i) =>
    `<a href="/yemek/${y.slug}"><img src="${i === 0 ? y.gorsel : `/img/yemek/${y.slug}.webp`}" alt="${esc(y.ad)}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"><span>${i + 1}. ${esc(y.ad.split(' (')[0])}</span></a>`).join('')}</div>`;
}

function siraSatiri(y, i, t) {
  const o = OLCU[t.olcu];
  const gorsel = y.gorsel
    ? `<img src="/img/yemek/k/${y.slug}.webp" alt="" width="64" height="48" loading="lazy" decoding="async">`
    : '<span class="bos"></span>';
  const alt = t.olcu === 'puan' || t.olcu === 'kcal' ? `${y.kcal} kcal · ${y.protein} g protein` : `${o.yaz(y)} · ${y.kcal} kcal`;
  return `<li><a href="/yemek/${y.slug}"><span class="no">${i + 1}</span>${gorsel}`
    + `<span class="ad">${esc(y.ad)}<small>${alt}</small></span>`
    + `<span class="pn"><b style="background:${LIG_RENK[y.lig]}">${y.doyuruculuk}</b><small>${y.lig} ligi</small></span></a></li>`;
}

function listeKarti(t) {
  return `<a href="/liste/${t.slug}"><img src="/img/liste/k/${t.slug}.jpg" alt="${esc(t.kisa)}" width="600" height="315" loading="lazy" decoding="async"><span>${esc(t.kisa)}</span></a>`;
}

function listeSayfasi(t, d) {
  const l = listeKalemleri(t, d);
  const kanonik = `${SITE}/liste/${t.slug}`;
  const sss = t.sss(l);
  const ilgili = (t.ilgili || []).map((s) => LISTE[s]).filter(Boolean);
  const aciklama = `${t.baslik}. ${l.length} yemek, kalori başına ne kadar tok tuttuğuna göre sıralandı: ${l.slice(0, 3).map((y) => y.ad.split(' (')[0]).join(', ')} ve diğerleri.`;

  const govde = `
<nav class="yol"><a href="/">PlateRank</a> › <a href="/liste">Listeler</a></nav>
<h1>${esc(t.baslik)}</h1>
<p class="alt">${l.length} yemek · doyuruculuk puanına göre</p>
${kolaj(l)}
<p class="cevap">${esc(t.giris(l))}</p>

<ol class="sira">${l.map((y, i) => siraSatiri(y, i, t)).join('')}</ol>

<h2>Sık sorulanlar</h2>
<dl class="sss">${sss.map(([s, c]) => `<dt>${esc(s)}</dt><dd>${esc(c)}</dd>`).join('')}</dl>

<div class="gecit">
  <h2>Kendi gününü kur</h2>
  <p>Bu listeden seçtiklerini Menüm'e ekle, günün kalorisini ve proteinini tek ekranda gör. Ya da ne yiyeceğine karar veremiyorsan "Ne yesem?" seçsin.</p>
  <a class="btn" href="/">PlateRank'i aç</a>
</div>

${ilgili.length ? `<h2>Benzer listeler</h2><div class="listeler">${ilgili.map((x) => listeKarti(x)).join('')}</div>` : ''}

<p class="not">Puan ölçülmüş bir değer değil, yemekleri birbirine göre sıralayan bir hesaptır: porsiyon başına protein, lif ve hacim puanı yükseltir; kalori yoğunluğu ve şeker düşürür. 200 ve üzeri S ligi, 70 altı D ligidir. Besin değerleri kaynaklı kalemlerde resmi tablolardan, diğerlerinde tipik porsiyon tahmininden gelir.</p>
`;

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'PlateRank', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Listeler', item: `${SITE}/liste` },
          { '@type': 'ListItem', position: 3, name: t.baslik, item: kanonik },
        ],
      },
      {
        '@type': 'ItemList', name: t.baslik, numberOfItems: l.length,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListElement: l.map((y, i) => ({ '@type': 'ListItem', position: i + 1, name: y.ad, url: `${SITE}/yemek/${y.slug}` })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: sss.map(([s, c]) => ({ '@type': 'Question', name: s, acceptedAnswer: { '@type': 'Answer', text: c } })),
      },
    ],
  };

  return sayfa({ baslik: `${t.baslik} · PlateRank`, aciklama, kanonik, govde, jsonld, ogGorsel: `/img/liste/${t.slug}.jpg`, ekCss: EK_CSS });
}

function dizinSayfasi(d) {
  const govde = `
<nav class="yol"><a href="/">PlateRank</a> › Listeler</nav>
<h1>Hazır listeler</h1>
<p class="alt">Yüksek proteinli kahvaltıdan 100 kalori altı atıştırmalıklara: her liste, kalori başına ne kadar tok tuttuğuna göre sıralı.</p>
<div class="listeler">${LISTELER.map((t) => listeKarti(t)).join('')}</div>
<div class="gecit"><h2>Tek tek bakmak istersen</h2><p>Puanlanan tüm yemekler, mutfak mutfak.</p><a class="btn" href="/yemek">Tüm yemekler</a></div>
`;
  return sayfa({
    baslik: 'Hazır listeler: en doyurucu, en proteinli, en az kalorili · PlateRank',
    aciklama: 'Yüksek proteinli kahvaltı, diyette tok tutan yemekler, 100 kalori altı doyurucular, en doyurucu çorbalar ve daha fazlası. Her liste doyuruculuk puanına göre sıralı.',
    kanonik: `${SITE}/liste`, govde, ekCss: EK_CSS,
    jsonld: {
      '@context': 'https://schema.org', '@type': 'ItemList', name: 'PlateRank listeleri',
      itemListElement: LISTELER.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.baslik, url: `${SITE}/liste/${t.slug}` })),
    },
  });
}

module.exports = {
  fetch: async function (request) {
    const url = new URL(request.url);
    let d;
    try { d = await veri(); } catch (e) {
      return yanit('<!doctype html><meta charset="utf-8"><title>PlateRank</title><p>Şu an yüklenemedi, birazdan tekrar dene. <a href="/">Ana sayfa</a></p>', 503, 'no-store');
    }
    const s = (url.searchParams.get('s') || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!s) return yanit(dizinSayfasi(d));
    const t = LISTE[s];
    if (!t) return yanit(dizinSayfasi(d), 404, 'public, max-age=0, s-maxage=600');
    return yanit(listeSayfasi(t, d));
  },
  _ic: { listeSayfasi, dizinSayfasi },
};
