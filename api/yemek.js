// /yemek          → tüm yemeklerin dizini (mutfak mutfak)
// /yemek/:slug    → tek yemek sayfası: kalori, doyuruculuk puanı, tok tutar mı, daha tok alternatifler
// HTML sunucuda üretilir ki Google içeriği JavaScript çalıştırmadan okusun.

const { veri, esc, MUTFAKLAR, MUTFAK, LIG_BILGI, LIG_RENK, SITE } = require('./_veri.js');

const ONBELLEK = 'public, max-age=0, s-maxage=21600, stale-while-revalidate=604800';

function adParcala(ad) {
  const i = ad.indexOf(' (');
  if (i < 0) return { kok: ad, porsiyon: '' };
  return { kok: ad.slice(0, i), porsiyon: ad.slice(i + 2).replace(/\)\s*$/, '') };
}

function hukum(y) {
  return {
    S: 'Evet, hem de çok. Az kaloriyle uzun süre tok tutan yemeklerden.',
    A: 'Evet. Kalorisine göre güvenilir bir tokluk verir.',
    B: 'Orta. Kalorisi karşılığında ortalama bir tokluk verir.',
    C: 'Pek değil. Kalorisine göre çabuk acıktırır.',
    D: 'Hayır. Kalorisi tokluğundan büyük; yersin ama doymazsın.',
  }[y.lig];
}

function sebepler(y) {
  const s = [];
  if (y.protein >= 20) s.push(`<b>${y.protein} g protein</b> tokluğu uzatır.`);
  else if (y.protein <= 4 && y.kcal >= 150) s.push(`Protein düşük (<b>${y.protein} g</b>), bu yüzden tokluk çabuk biter.`);
  if (y.lif >= 6) s.push(`<b>${y.lif} g lif</b> sindirimi yavaşlatır, tokluğu uzatır.`);
  if ((y.tur === 'corba' || y.tur === 'salata') && y.doyuruculuk >= 150) s.push('Sulu ve hacimli yapısı mideyi az kaloriyle doldurur.');
  if (y.seker >= 20) s.push(`<b>${y.seker} g şeker</b> kan şekerini hızla yükseltir; düşüşüyle birlikte erken acıkırsın.`);
  if (y.yag >= 25) s.push(`Yağı yüksek (<b>${y.yag} g</b>): kaloriyi artırır, tokluğu aynı oranda artırmaz.`);
  if (y.kcal >= 600) s.push(`Tek porsiyonda <b>${y.kcal} kcal</b>, günlük ihtiyacın büyük bir kısmı.`);
  return s;
}

function dahaTok(y, d) {
  const alt = y.kcal * 0.75, ust = y.kcal * 1.25;
  return d.sirali
    .filter((x) => x !== y && x.kcal >= alt && x.kcal <= ust && x.doyuruculuk > y.doyuruculuk)
    .sort((a, b) => (b.mutfak === y.mutfak) - (a.mutfak === y.mutfak) || (b.tur === y.tur) - (a.tur === y.tur) || b.doyuruculuk - a.doyuruculuk)
    .slice(0, 5);
}

function komsular(y, d) {
  const ayni = d.sirali.filter((x) => x.mutfak === y.mutfak);
  const i = ayni.indexOf(y);
  const bas = Math.max(0, Math.min(i - 3, ayni.length - 7));
  return ayni.slice(bas, bas + 7).filter((x) => x !== y);
}

function satir(x) {
  const kucuk = x.gorsel ? `<img class="kc" src="/img/yemek/k/${x.slug}.webp" alt="" width="48" height="36" loading="lazy" decoding="async">` : '';
  return `<li><a href="/yemek/${x.slug}">${kucuk}<span class="lg" style="background:${LIG_RENK[x.lig]}">${x.lig}</span>`
    + `<span class="ad">${esc(x.ad)}</span><span class="dg">${x.doyuruculuk} puan · ${x.kcal} kcal</span></a></li>`;
}

const CSS = `
:root{--paper:#E6EFE8;--card:#fff;--line:#D6E3D9;--ink:#0F1A13;--muted:#5B6B60;--forest:#0E2217;--teal:#1F5C3B;--lime:#D5EC62}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:Figtree,system-ui,-apple-system,'Segoe UI',sans-serif;font-size:17px;line-height:1.55}
a{color:var(--teal)}
.wrap{max-width:720px;margin:0 auto;padding:0 16px 48px}
header.top{display:flex;align-items:center;justify-content:space-between;padding:16px 0}
.logo{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:22px;color:var(--forest);text-decoration:none}
.logo i{font-style:normal;color:var(--teal)}
.btn{display:inline-block;background:var(--forest);color:var(--lime);text-decoration:none;font-weight:600;padding:10px 18px;border-radius:999px;font-size:15px}
nav.yol{font-size:14px;color:var(--muted);margin:4px 0 12px}
nav.yol a{color:var(--muted)}
h1{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:34px;line-height:1.1;margin:0 0 6px;letter-spacing:-.01em}
h2{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:22px;margin:32px 0 10px}
.alt{color:var(--muted);margin:0 0 18px}
.kart{background:var(--card);border-radius:22px;padding:20px;box-shadow:0 1px 2px rgba(14,34,23,.05),0 10px 24px -14px rgba(14,34,23,.2)}
.skor{display:flex;align-items:center;gap:18px}
.harf{flex:0 0 84px;height:84px;border-radius:20px;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Bricolage Grotesque',sans-serif}
.harf b{font-size:40px;line-height:1}
.harf span{font-size:12px;font-weight:600;opacity:.9}
.puan{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:44px;line-height:1}
.puan small{font-size:16px;font-weight:600;color:var(--muted);margin-left:6px}
.izah{color:var(--muted);font-size:15px;margin-top:4px}
.makro{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:18px}
.makro div{background:var(--paper);border-radius:14px;padding:10px 6px;text-align:center}
.makro b{display:block;font-family:'Bricolage Grotesque',sans-serif;font-size:20px}
.makro span{font-size:12px;color:var(--muted)}
.cevap{font-size:18px}
ul.sebep{padding-left:20px;margin:8px 0 0}
ul.sebep li{margin:4px 0}
ul.liste{list-style:none;padding:0;margin:0}
ul.liste li a{display:flex;align-items:center;gap:12px;padding:11px 4px;border-bottom:1px solid var(--line);text-decoration:none;color:var(--ink)}
ul.liste .lg{flex:0 0 28px;height:28px;border-radius:8px;color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center;font-family:'Bricolage Grotesque',sans-serif}
ul.liste .ad{flex:1;min-width:0}
ul.liste .dg{color:var(--muted);font-size:14px;white-space:nowrap}
.not{font-size:14px;color:var(--muted);margin-top:28px}
.cta{margin:32px 0 0;text-align:center}
figure.foto{margin:0 0 16px;border-radius:22px;overflow:hidden;position:relative;background:#cfd9d1;aspect-ratio:4/3}
figure.foto img{display:block;width:100%;height:100%;object-fit:cover}
figure.foto figcaption{position:absolute;right:10px;bottom:8px;font-size:12px;color:#fff;background:rgba(14,34,23,.55);padding:2px 8px;border-radius:999px}
ul.liste img.kc{flex:0 0 48px;height:36px;border-radius:8px;object-fit:cover}
footer{margin-top:40px;font-size:14px;color:var(--muted);text-align:center}
.mutfak-nav{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 8px}
.mutfak-nav a{background:var(--card);border-radius:999px;padding:6px 12px;text-decoration:none;font-size:14px;color:var(--ink)}
@media (max-width:480px){h1{font-size:28px}.makro b{font-size:16px}.makro div{padding:9px 2px}.harf{flex-basis:72px;height:72px}.puan{font-size:38px}}
`;

function sayfa({ baslik, aciklama, kanonik, govde, jsonld, ogGorsel }) {
  const og = ogGorsel ? SITE + ogGorsel : `${SITE}/og.png`;
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(baslik)}</title>
<meta name="description" content="${esc(aciklama)}">
<link rel="canonical" href="${kanonik}">
<meta name="theme-color" content="#E6EFE8">
<meta property="og:type" content="article">
<meta property="og:site_name" content="PlateRank">
<meta property="og:locale" content="tr_TR">
<meta property="og:title" content="${esc(baslik)}">
<meta property="og:description" content="${esc(aciklama)}">
<meta property="og:url" content="${kanonik}">
<meta property="og:image" content="${og}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${og}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Figtree:wght@400;600&display=swap">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='44' fill='%23227A54' stroke='%23F5F5F2' stroke-width='6'/%3E%3Ctext x='50' y='66' text-anchor='middle' font-family='Arial Black' font-size='44' font-weight='900' fill='%23FFFFFF'%3ES%3C/text%3E%3C/svg%3E">
<style>${CSS}</style>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : ''}
<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
<div class="wrap">
<header class="top"><a class="logo" href="/">Plate<i>Rank</i></a><a class="btn" href="/">Tüm liste</a></header>
${govde}
<footer><a href="/yemek">Tüm yemekler</a> · <a href="/">PlateRank ana sayfa</a> · iletisim@platerank.dev</footer>
</div>
</body>
</html>`;
}

function yemekSayfasi(y, d) {
  const { kok, porsiyon } = adParcala(y.ad);
  const m = MUTFAK[y.mutfak] || { ad: 'Diğer', ic: '🍽️', id: y.mutfak };
  const L = LIG_BILGI[y.lig];
  const kanonik = `${SITE}/yemek/${y.kanonikSlug || y.slug}`;
  const baslik = `${y.ad} kaç kalori, tok tutar mı? · PlateRank`;
  const aciklama = `${y.ad}: ${y.kcal} kcal, ${y.protein} g protein, ${y.lif} g lif. Doyuruculuk puanı ${y.doyuruculuk} (${y.lig} ligi, ${L.kisa.toLowerCase()}). ${d.toplam} yemek arasında ${y.sira}. sırada. Daha tok tutan alternatifleri gör.`;

  const sb = sebepler(y);
  const alternatif = dahaTok(y, d);
  const komsu = komsular(y, d);

  const kisaCevap = `${y.ad}${porsiyon ? '' : ' (1 porsiyon)'} <b>${y.kcal} kalori</b>. PlateRank doyuruculuk puanı <b>${y.doyuruculuk}</b>; bu puanla <b>${y.lig} ligine</b> giriyor: ${L.uzun}. Puanlanan ${d.toplam} yemek arasında <b>${y.sira}. sırada</b>.`;

  const govde = `
<nav class="yol"><a href="/">PlateRank</a> › <a href="/yemek">Yemekler</a> › <a href="/yemek#${m.id}">${esc(m.ad)}</a></nav>
${y.gorsel ? `<figure class="foto"><img src="${y.gorsel}" alt="${esc(y.ad)}" width="1200" height="900" fetchpriority="high"><figcaption>Temsilî görsel</figcaption></figure>` : ''}
<h1>${esc(y.ad)}</h1>
<p class="alt">${m.ic} ${esc(m.ad)} mutfağı${porsiyon ? ` · porsiyon: ${esc(porsiyon)}` : ''}</p>

<div class="kart">
  <div class="skor">
    <div class="harf" style="background:${LIG_RENK[y.lig]}"><b>${y.lig}</b><span>${esc(L.kisa)}</span></div>
    <div>
      <div class="puan">${y.doyuruculuk}<small>doyuruculuk puanı</small></div>
      <div class="izah">${d.toplam} yemek arasında ${y.sira}. sırada</div>
    </div>
  </div>
  <div class="makro">
    <div><b>${y.kcal}</b><span>kcal</span></div>
    <div><b>${y.protein} g</b><span>protein</span></div>
    <div><b>${y.lif} g</b><span>lif</span></div>
    <div><b>${y.yag} g</b><span>yağ</span></div>
    <div><b>${y.seker} g</b><span>şeker</span></div>
  </div>
</div>

<h2>${esc(kok)} kaç kalori?</h2>
<p class="cevap">${kisaCevap}</p>

<h2>${esc(kok)} tok tutar mı?</h2>
<p class="cevap"><b>${hukum(y)}</b></p>
${sb.length ? `<ul class="sebep">${sb.map((s) => `<li>${s}</li>`).join('')}</ul>` : ''}

<h2>Benzer kaloride daha tok tutanlar</h2>
${alternatif.length
    ? `<ul class="liste">${alternatif.map(satir).join('')}</ul>`
    : `<p>${y.kcal} kcal civarında bundan daha tok tutan bir yemek yok. Bu kalori aralığının en iyisi.</p>`}

${komsu.length ? `<h2>${esc(m.ad)} mutfağında yakın sıralar</h2><ul class="liste">${komsu.map(satir).join('')}</ul>` : ''}

<p class="not">Puan ölçülmüş bir değer değil, yemekleri birbirine göre sıralayan bir hesaptır: porsiyon başına protein, lif ve hacim puanı yükseltir; kalori yoğunluğu ve şeker düşürür. 200 ve üzeri S ligi, 70 altı D ligidir. ${y.kaynak ? `Besin değerleri kaynağı: ${esc(y.kaynak)}.` : 'Besin değerleri tipik bir porsiyon için yaklaşık değerlerdir.'}</p>

<div class="cta"><a class="btn" href="/">Kendi yemeğini PlateRank'te bul</a></div>
`;

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'PlateRank', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Yemekler', item: `${SITE}/yemek` },
          { '@type': 'ListItem', position: 3, name: y.ad, item: kanonik },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: `${kok} kaç kalori?`,
            acceptedAnswer: { '@type': 'Answer', text: `${y.ad} ${y.kcal} kalori; ${y.protein} g protein, ${y.lif} g lif, ${y.yag} g yağ ve ${y.seker} g şeker içerir.` } },
          { '@type': 'Question', name: `${kok} tok tutar mı?`,
            acceptedAnswer: { '@type': 'Answer', text: `${hukum(y)} PlateRank doyuruculuk puanı ${y.doyuruculuk} (${y.lig} ligi).` } },
        ],
      },
    ],
  };

  return sayfa({ baslik, aciklama, kanonik, govde, jsonld, ogGorsel: y.gorsel });
}

function dizinSayfasi(d) {
  const gruplar = MUTFAKLAR
    .map((m) => ({ m, liste: d.sirali.filter((y) => y.mutfak === m.id) }))
    .filter((g) => g.liste.length);
  const govde = `
<nav class="yol"><a href="/">PlateRank</a> › Yemekler</nav>
<h1>Yemeklerin kalorisi ve doyuruculuk puanı</h1>
<p class="alt">${d.toplam} yemek, kalori başına ne kadar tok tuttuğuna göre sıralandı. Bir yemeğe dokun: kaç kalori olduğunu, tok tutup tutmadığını ve aynı kaloride daha tok tutan alternatiflerini gör.</p>
<div class="mutfak-nav">${gruplar.map((g) => `<a href="#${g.m.id}">${g.m.ic} ${esc(g.m.ad)}</a>`).join('')}</div>
${gruplar.map((g) => `<h2 id="${g.m.id}">${g.m.ic} ${esc(g.m.ad)}</h2><ul class="liste">${g.liste.map(satir).join('')}</ul>`).join('')}
`;
  return sayfa({
    baslik: 'Yemeklerin kalorisi ve doyuruculuk puanı · PlateRank',
    aciklama: `${d.toplam} yemeğin kalorisi, proteini ve doyuruculuk puanı. Hangi yemek tok tutar, hangisi çabuk acıktırır? Mutfak mutfak tam liste.`,
    kanonik: `${SITE}/yemek`,
    govde,
    jsonld: {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'PlateRank', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Yemekler', item: `${SITE}/yemek` },
      ],
    },
  });
}

function bulunamadi(d) {
  const govde = `<h1>Bu yemek bulunamadı</h1><p class="alt">Adı değişmiş ya da yayından kalkmış olabilir.</p>
<h2>En tok tutan 10 yemek</h2><ul class="liste">${d.sirali.slice(0, 10).map(satir).join('')}</ul>
<div class="cta"><a class="btn" href="/yemek">Tüm yemekler</a></div>`;
  return sayfa({ baslik: 'Yemek bulunamadı · PlateRank', aciklama: 'Aradığın yemek PlateRank listesinde yok.', kanonik: `${SITE}/yemek`, govde });
}

function yanit(html, durum = 200, onbellek = ONBELLEK) {
  return new Response(html, {
    status: durum,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': onbellek },
  });
}

module.exports = {
  fetch: async function (request) {
    const url = new URL(request.url);
    let d;
    try {
      d = await veri();
    } catch (e) {
      return yanit('<!doctype html><meta charset="utf-8"><title>PlateRank</title><p>Şu an yüklenemedi, birazdan tekrar dene. <a href="/">Ana sayfa</a></p>', 503, 'no-store');
    }
    const s = (url.searchParams.get('s') || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!s) return yanit(dizinSayfasi(d));
    const y = d.slugIle.get(s);
    if (!y) return yanit(bulunamadi(d), 404, 'public, max-age=0, s-maxage=600');
    return yanit(yemekSayfasi(y, d));
  },
  // test için
  _ic: { yemekSayfasi, dizinSayfasi, bulunamadi },
};
