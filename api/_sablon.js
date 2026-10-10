// Yemek ve liste sayfalarının ortak görünümü: CSS, sayfa iskeleti, liste satırı, yanıt.
const { esc, LIG_RENK, SITE } = require('./_veri.js');

const ONBELLEK = 'public, max-age=0, s-maxage=21600, stale-while-revalidate=604800';

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
.halk{background:var(--forest);color:#fff;border-radius:18px;padding:16px 18px;margin:18px 0}.halk b{color:var(--lime);font-size:17px}.halk p{margin:6px 0 12px;color:#cfe0d4}.halk .btn{background:var(--lime);color:var(--forest)}
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

function sayfa({ baslik, aciklama, kanonik, govde, jsonld, ogGorsel, ekCss }) {
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
<style>${CSS}${ekCss || ''}</style>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : ''}
<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
<div class="wrap">
<header class="top"><a class="logo" href="/">Plate<i>Rank</i></a><a class="btn" href="/">Tüm liste</a></header>
${govde}
<footer><a href="/liste">Listeler</a> · <a href="/yemek">Tüm yemekler</a> · <a href="/">PlateRank ana sayfa</a> · iletisim@platerank.dev</footer>
</div>
</body>
</html>`;
}

function yanit(html, durum = 200, onbellek = ONBELLEK) {
  return new Response(html, {
    status: durum,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': onbellek },
  });
}

module.exports = { ONBELLEK, satir, sayfa, yanit, CSS };
