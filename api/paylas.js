export const config = { runtime: 'edge' };

const DURUM = {
  asgari: 'sadece eksik kalmamak için',
  saglik: 'sağlıklı ve dinç olmak için',
  spor: 'düzenli spor yaparken',
  diyet: 'kilo verirken',
  yasli: '65 yaş üstü için',
  iyilesme: 'iyileşme sürecinde',
};

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export default async function handler(req) {
  const url = new URL(req.url);
  let p = (url.searchParams.get('p') || '').replace(/[^0-9]/g, '');
  const d = url.searchParams.get('d') || 'saglik';
  const durumMetin = DURUM[d] || DURUM.saglik;

  const baslik = p ? `Günlük protein hedefim: ${p} g` : "PlateRank · protein hesabım";
  const aciklama = p
    ? `${p} gram, ${durumMetin} günlük hedefim. Seninki kaç? PlateRank'te kilonu gir, 5 saniyede öğren.`
    : 'Günlük protein ihtiyacını 5 saniyede öğren.';

  const ogImgUrl = `${url.origin}/api/og?${url.searchParams.toString()}`;
  const siteUrl = 'https://platerank.dev/';

  const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(baslik)} · PlateRank</title>
<meta name="description" content="${esc(aciklama)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(baslik)}">
<meta property="og:description" content="${esc(aciklama)}">
<meta property="og:image" content="${esc(ogImgUrl)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${esc(req.url)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(baslik)}">
<meta name="twitter:description" content="${esc(aciklama)}">
<meta name="twitter:image" content="${esc(ogImgUrl)}">
<style>
  *{box-sizing:border-box;}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F5F5F2;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#15171B;padding:24px;}
  .card{max-width:480px;text-align:center;}
  img{width:100%;border-radius:12px;border:1px solid #D2D1C4;margin-bottom:24px;}
  h1{font-size:22px;margin:0 0 8px;}
  p{color:#6B7079;font-size:15px;line-height:1.5;margin:0 0 24px;}
  a.btn{display:inline-block;background:#1E5A3D;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;}
</style>
</head>
<body>
  <div class="card">
    <img src="${esc(ogImgUrl)}" alt="${esc(baslik)}">
    <h1>${esc(baslik)}</h1>
    <p>${esc(aciklama)}</p>
    <a class="btn" href="${esc(siteUrl)}">Kendi hedefini hesapla →</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
