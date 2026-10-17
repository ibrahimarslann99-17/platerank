// İngilizce site. Tek fonksiyon, ?p= ile yönlenir (Vercel fonksiyon sayısı sınırlı):
//   /en                 → p=home     ana sayfa: arama, en uzun/en kısa tok tutanlar, öne çıkan karşılaştırmalar
//   /en/food            → p=food     mutfak mutfak tüm yemekler
//   /en/food/:slug      → p=food&s=  tek yemek: kaç saat tok tutar, kalori, alternatifler
//   /en/vs/:a-vs-:b     → p=vs&s=    iki yemek: hangisi daha uzun tok tutar
//   /en/method          → p=method   yöntem
//   /sitemap-en.xml     → p=sitemap
// HTML sunucuda üretilir; tasarım ve CSS Türkçe sayfalarla aynı.

const { veri, esc, LIG_RENK, SITE, HALK_ESIK } = require('./_veri.js');
const { CSS, ONBELLEK, yanit } = require('./_sablon.js');
const { enHazirla, ciftSlug, saatYaz, saatEk, dkYaz, CUISINES, CUISINE, TIER } = require('./_en_veri.js');

const EK_CSS = `
.tokcevap{display:flex;gap:16px;align-items:center;background:var(--forest);color:#fff;border-radius:22px;padding:16px 18px;margin:0 0 16px}
.tokcevap .ts{flex:0 0 92px;height:92px;border-radius:50%;background:var(--lime);color:var(--forest);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Bricolage Grotesque',sans-serif;line-height:1}
.tokcevap .ts small{font-size:11px;font-weight:600}
.tokcevap .ts b{font-size:34px;font-weight:800;margin:2px 0}
.tokcevap .ts span{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.tokcevap p{margin:0;font-size:16px;line-height:1.45;color:#e3eee6}
.ikili{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 16px}
.ikili a{display:block;background:var(--card);border-radius:18px;overflow:hidden;text-decoration:none;color:var(--ink);box-shadow:0 1px 2px rgba(14,34,23,.05),0 10px 24px -14px rgba(14,34,23,.2);position:relative}
.ikili a.kazanan{outline:3px solid var(--lime)}
.ikili img,.ikili .bos{display:block;height:auto;width:100%;aspect-ratio:4/3;object-fit:cover;background:var(--line)}
.ikili .ic{padding:10px 12px 12px}
.ikili .ic b{display:block;font-family:'Bricolage Grotesque',sans-serif;font-size:17px;line-height:1.2}
.ikili .ic span{display:block;font-size:14px;color:var(--muted);margin-top:4px}
.ikili .rozet{position:absolute;top:8px;left:8px;background:var(--lime);color:var(--forest);font-weight:800;font-size:12px;padding:3px 9px;border-radius:999px;letter-spacing:.04em}
.ikili .ic .lgk{display:inline-flex;color:#fff;margin-top:0;align-items:center;justify-content:center;width:24px;height:24px;border-radius:7px;color:#fff;font-weight:800;font-size:13px;margin-right:6px;vertical-align:middle}
table.kars{width:100%;border-collapse:collapse;background:var(--card);border-radius:18px;overflow:hidden;font-size:15px}
table.kars th,table.kars td{padding:10px 12px;text-align:right;border-bottom:1px solid var(--line)}
table.kars th:first-child,table.kars td:first-child{text-align:left;color:var(--muted);font-weight:400}
table.kars thead th{font-family:'Bricolage Grotesque',sans-serif;color:var(--ink);font-weight:700;font-size:15px}
table.kars td.iyi{font-weight:700;color:var(--teal)}
table.kars tr:last-child td{border-bottom:0}
.ara{position:relative;margin:18px 0 8px}
.ara input{width:100%;font:inherit;font-size:17px;padding:14px 18px;border-radius:999px;border:2px solid var(--line);background:var(--card);color:var(--ink);outline:none}
.ara input:focus{border-color:var(--teal)}
.ara ul{list-style:none;margin:6px 0 0;padding:6px;background:var(--card);border-radius:18px;box-shadow:0 10px 24px -12px rgba(14,34,23,.3);position:absolute;left:0;right:0;z-index:5;max-height:340px;overflow:auto}
.ara ul:empty{display:none}
.ara li a{display:flex;gap:10px;align-items:center;padding:9px 10px;border-radius:12px;text-decoration:none;color:var(--ink)}
.ara li a:hover,.ara li a:focus{background:var(--paper)}
.ara .lgk{flex:0 0 24px;height:24px;border-radius:7px;color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center}
.ara small{margin-left:auto;color:var(--muted)}
@media (max-width:480px){.tokcevap{gap:12px;padding:14px}.tokcevap .ts{flex-basis:78px;height:78px}.tokcevap .ts b{font-size:28px}table.kars th,table.kars td{padding:9px 8px;font-size:14px}}
`;

const ADRES = {
  home: `${SITE}/en`, food: `${SITE}/en/food`, method: `${SITE}/en/method`,
  yemek: (y) => `${SITE}/en/food/${y.kanonik || y.slug}`,
  cift: (s) => `${SITE}/en/vs/${s}`,
};

function sayfa({ baslik, aciklama, kanonik, govde, jsonld, ogGorsel, alternatlar, robots }) {
  const og = ogGorsel ? SITE + ogGorsel : `${SITE}/og-v2.png`;
  const alt = (alternatlar || []).map((a) => `<link rel="alternate" hreflang="${a.dil}" href="${a.href}">`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(baslik)}</title>
<meta name="description" content="${esc(aciklama)}">
<link rel="canonical" href="${kanonik}">
${alt}
${robots ? `<meta name="robots" content="${robots}">` : ''}
<meta name="theme-color" content="#E6EFE8">
<meta property="og:type" content="article">
<meta property="og:site_name" content="PlateRank">
<meta property="og:locale" content="en_US">
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
<style>${CSS}${EK_CSS}</style>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : ''}
<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};window.va('beforeSend',function(e){try{if(localStorage.getItem('pr_ben')==='1')return null;}catch(x){}return e;});</script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
<div class="wrap">
<header class="top"><a class="logo" href="/en">Plate<i>Rank</i></a><a class="btn" href="/en/food">All foods</a></header>
${govde}
<footer><a href="/en/food">All foods</a> · <a href="/en/method">Method</a> · <a href="/en">PlateRank home</a> · <a href="/" hreflang="tr" lang="tr">Türkçe</a> · iletisim@platerank.dev</footer>
</div>
</body>
</html>`;
}

// ---------- ortak parçalar ----------

function satir(x, sag) {
  const kucuk = x.gorsel ? `<img class="kc" src="/img/yemek/k/${x.trSlug}.webp" alt="" width="48" height="36" loading="lazy" decoding="async">` : '';
  return `<li><a href="/en/food/${x.slug}">${kucuk}<span class="lg" style="background:${LIG_RENK[x.lig]}">${x.lig}</span>`
    + `<span class="ad">${esc(x.tam)}</span><span class="dg">${sag || `${x.doyuruculuk} pts · ${x.kcal} kcal`}</span></a></li>`;
}
function ciftSatiri(c, y) {
  const o = y ? (c.a === y ? c.b : c.a) : null;
  const metin = o ? `${y.ad} vs ${o.tam}` : `${c.a.ad} vs ${c.b.ad}`;
  const sag = o && o.saat != null && y.saat != null ? (o.saat > y.saat ? `${o.ad} wins` : o.saat < y.saat ? `${y.ad} wins` : 'tie') : '';
  return `<li><a href="/en/vs/${c.slug}"><span class="lg" style="background:var(--teal)">vs</span><span class="ad">${esc(metin)}</span>${sag ? `<span class="dg">${esc(sag)}</span>` : ''}</a></li>`;
}
function mutfakAdi(y) { return CUISINE[y.mutfak] || { ad: 'Other', ic: '🍽️', id: y.mutfak }; }
function yuzdeAd(n) { return `${n}%`; }

function hukum(y) {
  return {
    S: 'Yes, very. It keeps you full for a long time on few calories.',
    A: 'Yes. It gives reliable fullness for its calories.',
    B: 'Somewhat. It gives average fullness for its calories.',
    C: 'Not really. For its calories, it leaves you hungry fast.',
    D: "No. Its calories outweigh its fullness: you eat it but you don't feel full.",
  }[y.lig];
}

function sebepler(y) {
  const s = [];
  if (y.protein >= 20) s.push(`<b>${y.protein} g of protein</b> stretches out fullness.`);
  else if (y.protein <= 4 && y.kcal >= 150) s.push(`It is low in protein (<b>${y.protein} g</b>), so the fullness fades quickly.`);
  if (y.lif >= 6) s.push(`<b>${y.lif} g of fiber</b> slows digestion and keeps you full longer.`);
  if ((y.tur === 'corba' || y.tur === 'salata') && y.doyuruculuk >= 150) s.push('Its watery, bulky volume fills your stomach on few calories.');
  if (y.seker >= 20) s.push(`<b>${y.seker} g of sugar</b> spikes your blood sugar; when it drops, hunger comes back early.`);
  if (y.yag >= 25) s.push(`It is high in fat (<b>${y.yag} g</b>): that adds calories without adding the same amount of fullness.`);
  if (y.kcal >= 600) s.push(`One serving is <b>${y.kcal} kcal</b>, a large share of a day's energy.`);
  return s;
}

function saatCevabi(y) {
  if (y.saat == null) return null;
  let c = `${y.ad} keeps you full for about ${saatEk(y.saat)}, by our estimate.`;
  const uzun = 100 - y.saatYuzde;
  if (y.saatYuzde >= 60) c += ` That is longer than ${yuzdeAd(y.saatYuzde)} of the foods we score.`;
  else if (uzun >= 95) c += ' Almost every food we score keeps you full longer.';
  else if (y.saatYuzde <= 30) c += ` That is shorter than most: ${yuzdeAd(uzun)} of the foods we score keep you full longer.`;
  if (y.halkDk != null) c += ` ${y.halkN} people who ate it reported a median of ${dkYaz(y.halkDk)}.`;
  return c;
}

function kaynakYaz(k) {
  if (!k) return null;
  const m = String(k).match(/^USDA FDC:(\d+)/);
  if (m) return `USDA FoodData Central (FDC ${m[1]})`;
  if (/perakende etiket/i.test(k)) return 'average of retail nutrition labels';
  return null;
}

function dahaTok(y, e) {
  const alt = y.kcal * 0.75, ust = y.kcal * 1.25;
  return e.sirali
    .filter((x) => x !== y && !x.kanonik && x.kcal >= alt && x.kcal <= ust && x.doyuruculuk > y.doyuruculuk)
    .sort((a, b) => (b.mutfak === y.mutfak) - (a.mutfak === y.mutfak) || (b.tur === y.tur) - (a.tur === y.tur) || b.doyuruculuk - a.doyuruculuk)
    .slice(0, 5);
}

function komsular(y, e) {
  const ayni = e.sirali.filter((x) => x.mutfak === y.mutfak && !x.kanonik);
  const i = ayni.indexOf(y);
  const bas = Math.max(0, Math.min(i - 3, ayni.length - 7));
  return ayni.slice(bas, bas + 7).filter((x) => x !== y);
}

function trAlternatif(y) {
  if (y.kanonik || y.trKanonik) return null;
  return `${SITE}/yemek/${y.trSlug}`;
}

// ---------- yemek sayfası ----------

function yemekSayfasi(y, e) {
  const m = mutfakAdi(y);
  const L = TIER[y.lig];
  const kanonik = ADRES.yemek(y);
  const saatli = y.saat != null;
  const sc = saatCevabi(y);
  const tr = trAlternatif(y);
  const baslik = saatli
    ? `How long does ${y.ad} keep you full? Calories & satiety · PlateRank`
    : `${y.ad}: calories and satiety score · PlateRank`;
  const aciklama = saatli
    ? `${y.ad}${y.porsiyon ? ` (${y.porsiyon})` : ''} keeps you full for about ${saatEk(y.saat)}${y.halkDk != null ? ` (${dkYaz(y.halkDk)} by eaters' reports)` : ''}. ${y.kcal} kcal, ${y.protein} g protein, ${y.lif} g fiber; tier ${y.lig}, #${y.sira} of ${e.toplam} foods. See more filling alternatives.`
    : `${y.tam}: ${y.kcal} kcal, ${y.protein} g protein, ${y.lif} g fiber. Satiety score ${y.doyuruculuk} (tier ${y.lig}, ${L.kisa.toLowerCase()}). #${y.sira} of ${e.toplam} foods.`;
  const sb = sebepler(y);
  const alternatif = dahaTok(y, e);
  const komsu = komsular(y, e);
  const ciftler = (e.yemegin.get(y.slug) || []).slice().sort((a, b) => b.secme - a.secme).slice(0, 8);
  const kaynak = kaynakYaz(y.kaynak);
  const altBaslik = [`${m.ic} ${m.ad}`, y.tanim, y.porsiyon ? `serving: ${y.porsiyon}` : ''].filter(Boolean).map(esc).join(' · ');

  const kisaCevap = `${y.tam}${y.porsiyon ? '' : ' (1 serving)'} has <b>${y.kcal} calories</b>. Its PlateRank satiety score is <b>${y.doyuruculuk}</b>, which puts it in <b>tier ${y.lig}</b>: ${L.uzun}. It ranks <b>#${y.sira}</b> of the ${e.toplam} foods we score.`;

  const govde = `
<nav class="yol"><a href="/en">PlateRank</a> › <a href="/en/food">Foods</a> › <a href="/en/food#${m.id}">${esc(m.ad)}</a></nav>
${y.gorsel ? `<figure class="foto"><img src="${y.gorsel}" alt="${esc(y.ad)}" width="1200" height="900" fetchpriority="high"><figcaption>Illustrative image</figcaption></figure>` : ''}
<h1>${saatli ? `How long does ${esc(y.ad)} keep you full?` : esc(y.tam)}</h1>
<p class="alt">${altBaslik}</p>
${saatli ? `<div class="tokcevap"><div class="ts"><small>about</small><b>${saatYaz(y.saat)}</b><span>hour${y.saat === 1 ? '' : 's'}</span></div><p>${esc(sc)}</p></div>` : ''}

<div class="kart">
  <div class="skor">
    <div class="harf" style="background:${LIG_RENK[y.lig]}"><b>${y.lig}</b><span>${esc(L.kisa)}</span></div>
    <div>
      <div class="puan">${y.doyuruculuk}<small>satiety score</small></div>
      <div class="izah">#${y.sira} of ${e.toplam} foods</div>
    </div>
  </div>
  <div class="makro">
    <div><b>${y.kcal}</b><span>kcal</span></div>
    <div><b>${y.protein} g</b><span>protein</span></div>
    <div><b>${y.lif} g</b><span>fiber</span></div>
    <div><b>${y.yag} g</b><span>fat</span></div>
    <div><b>${y.seker} g</b><span>sugar</span></div>
  </div>
</div>

<h2>How many calories are in ${esc(y.ad)}?</h2>
<p class="cevap">${kisaCevap}</p>

<h2>Is ${esc(y.ad)} filling?</h2>
<p class="cevap"><b>${hukum(y)}</b></p>
${sb.length ? `<ul class="sebep">${sb.map((s) => `<li>${s}</li>`).join('')}</ul>` : ''}

${ciftler.length ? `<h2>${esc(y.ad)} vs other foods</h2><ul class="liste">${ciftler.map((c) => ciftSatiri(c, y)).join('')}</ul>` : ''}

<h2>More filling foods with similar calories</h2>
${alternatif.length
    ? `<ul class="liste">${alternatif.map((x) => satir(x)).join('')}</ul>`
    : `<p>Nothing around ${y.kcal} kcal keeps you fuller than this. It is the best in its calorie range.</p>`}

${komsu.length ? `<h2>Nearby in the ${esc(m.ad)} ranking</h2><ul class="liste">${komsu.map((x) => satir(x)).join('')}</ul>` : ''}

<p class="not">The score is not a lab measurement; it ranks foods against each other. Protein, fiber and volume per serving raise it; calorie density and sugar lower it. 200 and above is tier S, below 70 is tier D. ${kaynak ? `Nutrition source: ${esc(kaynak)}.` : 'Nutrition values are approximate, for a typical serving.'} <a href="/en/method">How we calculate it</a>.</p>

<div class="cta"><a class="btn" href="/en/food">See all ${e.toplam} foods ranked</a></div>
`;

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'PlateRank', item: ADRES.home },
          { '@type': 'ListItem', position: 2, name: 'Foods', item: ADRES.food },
          { '@type': 'ListItem', position: 3, name: y.tam, item: kanonik },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          ...(saatli ? [{ '@type': 'Question', name: `How long does ${y.ad} keep you full?`,
            acceptedAnswer: { '@type': 'Answer', text: `${sc} Protein, fiber and volume extend fullness the most; sugar shortens it.` } }] : []),
          { '@type': 'Question', name: `How many calories are in ${y.ad}?`,
            acceptedAnswer: { '@type': 'Answer', text: `${y.tam} has ${y.kcal} calories, with ${y.protein} g protein, ${y.lif} g fiber, ${y.yag} g fat and ${y.seker} g sugar.` } },
          { '@type': 'Question', name: `Is ${y.ad} filling?`,
            acceptedAnswer: { '@type': 'Answer', text: `${hukum(y)} Its PlateRank satiety score is ${y.doyuruculuk} (tier ${y.lig}).` } },
        ],
      },
    ],
  };

  const alternatlar = !y.kanonik ? [
    { dil: 'en', href: kanonik },
    ...(tr ? [{ dil: 'tr', href: tr }] : []),
    { dil: 'x-default', href: kanonik },
  ] : null;

  return sayfa({ baslik, aciklama, kanonik, govde, jsonld, ogGorsel: y.gorsel, alternatlar });
}

// ---------- karşılaştırma sayfası ----------

function ciftSayfasi(c, e, listede) {
  const { a, b } = c;
  const kanonik = ADRES.cift(c.slug);
  const fark = Math.abs(a.saat - b.saat);
  const berabere = fark === 0;
  const [k, z] = berabere ? (a.doyuruculuk >= b.doyuruculuk ? [a, b] : [b, a]) : (a.saat > b.saat ? [a, b] : [b, a]);

  const baslik = `${a.ad} vs ${b.ad}: which keeps you full longer? · PlateRank`;
  const aciklama = berabere
    ? `${a.ad} and ${b.ad} both keep you full for about ${saatEk(a.saat)}. Calories, protein, fiber and satiety score compared side by side.`
    : `${k.ad} keeps you full about ${saatEk(fark)} longer than ${z.ad} (${saatYaz(k.saat)} vs ${saatYaz(z.saat)} hours). Calories, protein, fiber and satiety score compared side by side.`;

  let cevap;
  if (berabere) {
    cevap = `It's a tie on hours: both keep you full for about ${saatEk(a.saat)}. On fullness per calorie, ${k.ad} scores higher (${k.doyuruculuk} vs ${z.doyuruculuk}).`;
  } else {
    cevap = `Winner: ${k.ad}. It keeps you full for about ${saatEk(k.saat)}, ${z.ad} for about ${saatEk(z.saat)}.`;
    if (k.kcal <= z.kcal) cevap += ` And it does it with fewer calories: ${k.kcal} vs ${z.kcal} kcal.`;
    else cevap += ` ${z.ad} is lighter (${z.kcal} vs ${k.kcal} kcal), but its fullness doesn't last as long.`;
  }

  const K = esc(k.ad), Z = esc(z.ad);
  const neden = [];
  const pd = k.protein - z.protein;
  const lehine = [];
  if (pd >= 5) neden.push(`<b>Protein:</b> ${K} has ${k.protein} g against ${z.protein} g. Protein is the strongest driver of fullness.`);
  else if (pd <= -5) lehine.push(`more protein (${z.protein} g vs ${k.protein} g)`);
  const ld = k.lif - z.lif;
  if (ld >= 3) neden.push(`<b>Fiber:</b> ${k.lif} g vs ${z.lif} g. Fiber slows digestion.`);
  else if (ld <= -3) lehine.push(`more fiber (${z.lif} g vs ${k.lif} g)`);
  const sd = z.seker - k.seker;
  if (sd >= 10) neden.push(`<b>Sugar:</b> ${Z} carries ${z.seker} g of sugar against ${k.seker} g. Sugar brings hunger back early.`);
  const yd = z.yag - k.yag;
  if (yd >= 10) neden.push(`<b>Fat:</b> ${Z} has ${z.yag} g of fat vs ${k.yag} g: more calories, not more fullness.`);
  if (k.doyuruculuk - z.doyuruculuk >= 40) neden.push(`<b>Per calorie:</b> ${K} scores ${k.doyuruculuk} on satiety, ${Z} only ${z.doyuruculuk}.`);
  if (k.kcal < z.kcal * 0.6) neden.push(`<b>Calorie density:</b> ${K} delivers its fullness in ${k.kcal} kcal, ${Z} needs ${z.kcal} kcal.`);
  if (!neden.length) neden.push(`The two are close on every macro; the difference comes from volume and calorie density per serving.`);

  if (lehine.length) neden.push(`<b>In ${Z}'s favor:</b> ${lehine.join(' and ')}, but not enough to close the gap.`);
  const takas = !berabere && z.kcal > k.kcal
    ? `<p><b>Swap tip:</b> choosing ${esc(k.ad)} over ${esc(z.ad)} saves ${z.kcal - k.kcal} kcal and keeps you full ${saatEk(fark)} longer.</p>` : '';

  const kart = (y) => {
    const g = y.gorsel ? `<img src="/img/yemek/k/${y.trSlug}.webp" alt="${esc(y.ad)}" width="400" height="300" loading="lazy" decoding="async">` : '<span class="bos"></span>';
    return `<a href="/en/food/${y.slug}"${y === k && !berabere ? ' class="kazanan"' : ''}>${y === k && !berabere ? '<span class="rozet">LASTS LONGER</span>' : ''}${g}<div class="ic"><b>${esc(y.tam)}</b><span><span class="lgk" style="background:${LIG_RENK[y.lig]}">${y.lig}</span>~${saatEk(y.saat)} · ${y.kcal} kcal</span></div></a>`;
  };
  const iyi = (x, y, yuksekIyi) => (x === y ? ['', ''] : (x > y) === yuksekIyi ? [' class="iyi"', ''] : ['', ' class="iyi"']);
  const sat = (ad, x, y, yaz, yuksekIyi) => {
    const [ca, cb] = yuksekIyi == null ? ['', ''] : iyi(x, y, yuksekIyi);
    return `<tr><td>${ad}</td><td${ca}>${yaz(x)}</td><td${cb}>${yaz(y)}</td></tr>`;
  };
  const p100 = (y) => Math.round((y.protein / Math.max(1, y.kcal)) * 1000) / 10;
  const tablo = `<table class="kars"><thead><tr><th></th><th>${esc(a.ad)}</th><th>${esc(b.ad)}</th></tr></thead><tbody>
${sat('Est. hours full', a.saat, b.saat, (v) => `~${saatYaz(v)} h`, true)}
${a.halkDk != null || b.halkDk != null ? `<tr><td>Reported by eaters</td><td>${a.halkDk != null ? dkYaz(a.halkDk) : '–'}</td><td>${b.halkDk != null ? dkYaz(b.halkDk) : '–'}</td></tr>` : ''}
${sat('Satiety score', a.doyuruculuk, b.doyuruculuk, String, true)}
<tr><td>Tier</td><td>${a.lig} · ${TIER[a.lig].kisa}</td><td>${b.lig} · ${TIER[b.lig].kisa}</td></tr>
${sat('Calories', a.kcal, b.kcal, (v) => `${v} kcal`, false)}
${sat('Protein', a.protein, b.protein, (v) => `${v} g`, true)}
${sat('Protein per 100 kcal', p100(a), p100(b), (v) => `${v} g`, true)}
${sat('Fiber', a.lif, b.lif, (v) => `${v} g`, true)}
${sat('Sugar', a.seker, b.seker, (v) => `${v} g`, false)}
${sat('Fat', a.yag, b.yag, (v) => `${v} g`, null)}
</tbody></table>`;

  const digerleri = [...(e.yemegin.get(a.slug) || []), ...(e.yemegin.get(b.slug) || [])]
    .filter((x, i, l) => x !== c && l.indexOf(x) === i).sort((p, q) => q.secme - p.secme).slice(0, 8);

  const govde = `
<nav class="yol"><a href="/en">PlateRank</a> › <a href="/en/food">Foods</a> › Comparison</nav>
<h1>${esc(a.ad)} vs ${esc(b.ad)}: which keeps you full longer?</h1>
<p class="alt">Per serving: ${esc(a.tam)} and ${esc(b.tam)}</p>
<div class="ikili">${kart(a)}${kart(b)}</div>
<div class="tokcevap"><div class="ts">${berabere ? '<small>both</small><b>=</b><span>tie</span>' : `<small>longer by</small><b>+${saatYaz(fark)}</b><span>hour${fark === 1 ? '' : 's'}</span>`}</div><p>${esc(cevap)}</p></div>

<h2>Side by side</h2>
${tablo}

<h2>What makes the difference</h2>
<ul class="sebep">${neden.map((n) => `<li>${n}</li>`).join('')}</ul>
${takas}

${digerleri.length ? `<h2>More comparisons</h2><ul class="liste">${digerleri.map((x) => ciftSatiri(x)).join('')}</ul>` : ''}

<p class="not">Hours are an estimate derived from the satiety score, protein and fiber; hunger varies by person, portion and the rest of your day. <a href="/en/method">How we calculate it</a>.</p>
<div class="cta"><a class="btn" href="/en/food">See all ${e.toplam} foods ranked</a></div>
`;

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'PlateRank', item: ADRES.home },
          { '@type': 'ListItem', position: 2, name: 'Foods', item: ADRES.food },
          { '@type': 'ListItem', position: 3, name: `${a.ad} vs ${b.ad}`, item: kanonik },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: `Which keeps you full longer, ${a.ad} or ${b.ad}?`,
            acceptedAnswer: { '@type': 'Answer', text: cevap } },
          { '@type': 'Question', name: `How many calories are in ${a.ad} vs ${b.ad}?`,
            acceptedAnswer: { '@type': 'Answer', text: `${a.tam} has ${a.kcal} kcal and ${a.protein} g protein; ${b.tam} has ${b.kcal} kcal and ${b.protein} g protein.` } },
        ],
      },
    ],
  };
  return sayfa({ baslik, aciklama, kanonik, govde, jsonld, ogGorsel: k.gorsel, robots: listede ? null : 'noindex,follow' });
}

// ---------- dizin, ana sayfa, yöntem ----------

function dizinSayfasi(e) {
  const gruplar = CUISINES
    .map((m) => ({ m, liste: e.sirali.filter((y) => y.mutfak === m.id && !y.kanonik) }))
    .filter((g) => g.liste.length);
  const govde = `
<nav class="yol"><a href="/en">PlateRank</a> › Foods</nav>
<h1>Calories and satiety score of ${e.toplam} foods</h1>
<p class="alt">Every food ranked by how long it keeps you full per calorie. Tap one to see its calories, whether it's filling, and what keeps you fuller for the same calories.</p>
<div class="mutfak-nav">${gruplar.map((g) => `<a href="#${g.m.id}">${g.m.ic} ${esc(g.m.ad)}</a>`).join('')}</div>
${gruplar.map((g) => `<h2 id="${g.m.id}">${g.m.ic} ${esc(g.m.ad)}</h2><ul class="liste">${g.liste.map((x) => satir(x)).join('')}</ul>`).join('')}
`;
  return sayfa({
    baslik: `Calories and satiety score of ${e.toplam} foods · PlateRank`,
    aciklama: `Calories, protein and satiety score for ${e.toplam} foods from 13 cuisines. Which foods keep you full and which leave you hungry? The full list, cuisine by cuisine.`,
    kanonik: ADRES.food, govde,
    alternatlar: [{ dil: 'en', href: ADRES.food }, { dil: 'tr', href: `${SITE}/yemek` }, { dil: 'x-default', href: ADRES.food }],
    jsonld: {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'PlateRank', item: ADRES.home },
        { '@type': 'ListItem', position: 2, name: 'Foods', item: ADRES.food },
      ],
    },
  });
}

function anaSayfa(e) {
  const saatli = e.sirali.filter((y) => y.saat != null && !y.kanonik);
  const enUzun = saatli.slice().sort((a, b) => b.saat - a.saat || b.doyuruculuk - a.doyuruculuk || a.kcal - b.kcal).slice(0, 10);
  const enKisa = saatli.slice().sort((a, b) => a.saat - b.saat || a.doyuruculuk - b.doyuruculuk).slice(0, 10);
  const secme = [...e.ciftler.values()].filter((c) => c.secme)
    .sort((p, q) => ((p.a.mutfak === 'tr') + (p.b.mutfak === 'tr')) - ((q.a.mutfak === 'tr') + (q.b.mutfak === 'tr'))).slice(0, 12);
  const arama = JSON.stringify(e.sirali.filter((y) => !y.kanonik).map((y) => [y.tam, y.slug, y.lig, y.saat]))
    .replace(/</g, '\\u003c');
  const govde = `
<h1>How long does food keep you full?</h1>
<p class="alt">PlateRank ranks ${e.toplam} foods from 13 cuisines by how long they keep you full per calorie. Every food gets a satiety score, a tier from S to D and an estimated number of hours before you're hungry again.</p>
<div class="ara"><input id="ara" type="search" placeholder="Search a food: lentil soup, ramen, Greek yogurt…" autocomplete="off" aria-label="Search a food"><ul id="sonuc"></ul></div>

<h2>Keep you full the longest</h2>
<ul class="liste">${enUzun.map((x) => satir(x, `~${saatYaz(x.saat)} h · ${x.kcal} kcal`)).join('')}</ul>

<h2>Leave you hungry the fastest</h2>
<ul class="liste">${enKisa.map((x) => satir(x, `~${saatYaz(x.saat)} h · ${x.kcal} kcal`)).join('')}</ul>

<h2>Head-to-head</h2>
<ul class="liste">${secme.map((c) => ciftSatiri(c)).join('')}</ul>

<h2>Browse by cuisine</h2>
<div class="mutfak-nav">${CUISINES.filter((m) => e.sirali.some((y) => y.mutfak === m.id)).map((m) => `<a href="/en/food#${m.id}">${m.ic} ${esc(m.ad)}</a>`).join('')}</div>

<p class="not">The score ranks foods against each other: protein, fiber and volume per serving push it up; calorie density and sugar pull it down. Hours are estimated from the score, protein and fiber. <a href="/en/method">Read the method</a>.</p>
<script>
(function(){var D=${arama},R={S:'#1E7A4C',A:'#5A9135',B:'#C2961B',C:'#D06C28',D:'#BF3B38'};
var i=document.getElementById('ara'),u=document.getElementById('sonuc');
function n(s){return s.toLowerCase().normalize('NFKD').replace(/[\\u0300-\\u036f]/g,'').replace(/ı/g,'i');}
var N=D.map(function(d){return n(d[0]);});
i.addEventListener('input',function(){var q=n(i.value.trim());u.innerHTML='';if(q.length<2)return;var h=[];
for(var k=0;k<D.length&&h.length<12;k++){if(N[k].indexOf(q)>-1)h.push(D[k]);}
u.innerHTML=h.map(function(d){var a=document.createElement('a');a.textContent=d[0];return '<li><a href="/en/food/'+d[1]+'"><span class="lgk" style="background:'+R[d[2]]+'">'+d[2]+'</span>'+a.innerHTML+(d[3]!=null?'<small>~'+d[3]+' h</small>':'')+'</a></li>';}).join('');});
})();
</script>
`;
  return sayfa({
    baslik: 'PlateRank: how long does food keep you full?',
    aciklama: `Satiety scores for ${e.toplam} foods. See how many hours each food keeps you full, how many calories it has, and what keeps you fuller for the same calories.`,
    kanonik: ADRES.home, govde,
    alternatlar: [{ dil: 'en', href: ADRES.home }, { dil: 'tr', href: `${SITE}/` }, { dil: 'x-default', href: ADRES.home }],
    jsonld: {
      '@context': 'https://schema.org', '@type': 'WebSite', name: 'PlateRank', url: ADRES.home, inLanguage: 'en',
    },
  });
}

function yontemSayfasi(e) {
  const saatli = e.yemekler.filter((y) => y.saat != null);
  const kaynakli = e.yemekler.filter((y) => kaynakYaz(y.kaynak)).length;
  const ornek = ['5e835c6c', '13f139d4', '9b839359', '71b76697', 'd59cdb5b', '0675dc4f']
    .map((id) => e.idIle.get(id)).filter((y) => y && y.saat != null).slice(0, 4);
  const govde = `
<nav class="yol"><a href="/en">PlateRank</a> › Method</nav>
<h1>How PlateRank calculates fullness</h1>
<p class="alt">The satiety score, the estimated hours and the hours reported by eaters</p>

<p class="cevap">PlateRank ranks ${e.toplam} foods by how long they keep you full per calorie. For each food it gives three things: a satiety score, an estimated number of hours derived from that score and, when enough people have reported it, the median number of hours real eaters stayed full.</p>

<h2>Satiety score</h2>
<p>The score is not a lab measurement; it ranks foods against each other. Protein, fiber and volume (water content) per serving push it up; calorie density and sugar pull it down. Soups and watery dishes get extra credit for volume that a macro table doesn't show, and every food is placed relative to its neighbors of the same type.</p>
<ul class="sebep">
  <li><b>Tier S:</b> 200 and above, long fullness on few calories</li>
  <li><b>Tier A:</b> 150 to 199</li>
  <li><b>Tier B:</b> 100 to 149</li>
  <li><b>Tier C:</b> 70 to 99</li>
  <li><b>Tier D:</b> below 70, empty calories</li>
</ul>

<h2>Estimated hours full</h2>
<p>Hours are derived from the score, protein and fiber:</p>
<p class="cevap"><b>hours = 1 + (score ÷ 280) × 3.2 + protein (g) × 0.02 + fiber (g) × 0.05</b></p>
<p>The result is capped between 1 and 5 hours and rounded to the nearest half hour. Drinks get no estimate. It is an estimate: hunger depends on the person, the portion and the rest of the day. Across the ${saatli.length} foods with an estimate, it ranges from ${saatYaz(Math.min(...saatli.map((y) => y.saat)))} to ${saatYaz(Math.max(...saatli.map((y) => y.saat)))} hours.</p>
${ornek.length ? `<p>Examples: ${ornek.map((y) => `<a href="/en/food/${y.slug}">${esc(y.tam)}</a>, ${y.kcal} kcal, about ${saatEk(y.saat)}`).join('; ')}.</p>` : ''}

<h2>Hours reported by eaters</h2>
<p>Visitors can report how many hours a food kept them full, from 30 minutes to 6 hours. Once at least ${HALK_ESIK} people have reported a food, the median appears on its page. Reports from signed-in users count fully, anonymous ones at half weight, and only a person's latest report for a food counts.</p>

<h2>Where the nutrition data comes from</h2>
<p>${kaynakli} items carry a cited source, mostly USDA FoodData Central; for those, values are never estimated, and an item without a match is removed. Values for the other dishes are approximate, for a typical serving. Each food page names its source when there is one.</p>

<h2>Limits</h2>
<ul class="sebep">
  <li>PlateRank is not a clinical tool and does not give diet advice.</li>
  <li>Scores and hours assume the serving size shown; a different portion changes the numbers.</li>
  <li>Reported hours are self-reports, not controlled measurements.</li>
</ul>

<h2>Citing PlateRank</h2>
<p>You are welcome to quote the numbers. Please credit PlateRank (platerank.dev) and link the relevant food page. Questions: iletisim@platerank.dev.</p>
<div class="cta"><a class="btn" href="/en">Find a food</a></div>
`;
  return sayfa({
    baslik: 'How PlateRank calculates fullness · Method',
    aciklama: 'How the PlateRank satiety score and estimated hours of fullness are calculated: the formula, the tiers, eaters\' reports, data sources and limits.',
    kanonik: ADRES.method, govde,
    alternatlar: [{ dil: 'en', href: ADRES.method }, { dil: 'tr', href: `${SITE}/yontem` }, { dil: 'x-default', href: ADRES.method }],
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: 'PlateRank satiety and hours-full dataset',
      description: `Calories, protein, fiber, fat and sugar for ${e.toplam} foods; a satiety score per calorie, estimated hours of fullness and eater-reported hours.`,
      url: ADRES.method, inLanguage: 'en', isAccessibleForFree: true, license: `${SITE}/lisans`,
      creditText: 'PlateRank (platerank.dev)',
      creator: { '@type': 'Organization', name: 'PlateRank', url: ADRES.home, email: 'iletisim@platerank.dev' },
      keywords: ['satiety', 'satiety index', 'hours full', 'calories', 'protein', 'fiber', 'most filling foods'],
    },
  });
}

function bulunamadi(e, ne) {
  const govde = `<h1>${ne === 'vs' ? 'Comparison not found' : 'Food not found'}</h1><p class="alt">It may have been renamed or removed.</p>
<h2>The 10 most filling foods</h2><ul class="liste">${e.sirali.filter((y) => !y.kanonik).slice(0, 10).map((x) => satir(x)).join('')}</ul>
<div class="cta"><a class="btn" href="/en/food">All foods</a></div>`;
  return sayfa({ baslik: 'Not found · PlateRank', aciklama: 'This page is not on PlateRank.', kanonik: ADRES.food, govde, robots: 'noindex' });
}

function sitemap(d, e) {
  const gun = (t) => (t ? String(t).slice(0, 10) : null);
  const son = e.yemekler.reduce((m, y) => { const t = gun(y.updated_at || y.created_at); return t && t > m ? t : m; }, '2026-10-17');
  const url = (loc, lastmod) => `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
  const yemekler = e.sirali.filter((y) => !y.kanonik);
  const ciftler = [...e.ciftler.values()];
  const enGec = (...l) => l.map(gun).filter(Boolean).sort().pop() || son;
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${url(ADRES.home, son)}
${url(ADRES.food, son)}
${url(ADRES.method, son)}
${yemekler.map((y) => url(`${SITE}/en/food/${y.slug}`, enGec(y.updated_at || y.created_at, '2026-10-17'))).join('\n')}
${ciftler.map((c) => url(ADRES.cift(c.slug), enGec(c.a.updated_at || c.a.created_at, c.b.updated_at || c.b.created_at, '2026-10-17'))).join('\n')}
</urlset>`;
}

function ciftCoz(s, e) {
  // "a-vs-b": slug'larda da "-vs-" geçebilir, her bölme noktasını dene
  let i = s.indexOf('-vs-');
  while (i > 0) {
    const a = e.slugIle.get(s.slice(0, i)), b = e.slugIle.get(s.slice(i + 4));
    if (a && b && a !== b) return [a, b];
    i = s.indexOf('-vs-', i + 1);
  }
  return null;
}

function yonlendir(yer) {
  return new Response(null, { status: 301, headers: { location: yer, 'cache-control': ONBELLEK } });
}

module.exports = {
  fetch: async function (request) {
    const url = new URL(request.url);
    const p = url.searchParams.get('p') || 'home';
    const s = (url.searchParams.get('s') || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
    let d;
    try { d = await veri(); } catch (err) {
      if (p === 'sitemap') return new Response('', { status: 503, headers: { 'cache-control': 'no-store' } });
      return yanit('<!doctype html><meta charset="utf-8"><title>PlateRank</title><p>Could not load right now, please try again shortly. <a href="/en">Home</a></p>', 503, 'no-store');
    }
    const e = enHazirla(d);
    if (p === 'sitemap') {
      return new Response(sitemap(d, e), { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': ONBELLEK } });
    }
    if (p === 'method') return yanit(yontemSayfasi(e));
    if (p === 'food') {
      if (!s) return yanit(dizinSayfasi(e));
      const y = e.slugIle.get(s);
      if (!y) return yanit(bulunamadi(e, 'food'), 404, 'public, max-age=0, s-maxage=600');
      return yanit(yemekSayfasi(y, e));
    }
    if (p === 'vs') {
      const ab = ciftCoz(s, e);
      if (!ab || ab[0].saat == null || ab[1].saat == null) return yanit(bulunamadi(e, 'vs'), 404, 'public, max-age=0, s-maxage=600');
      const kanonikSlug = ciftSlug(ab[0], ab[1]);
      if (kanonikSlug !== s) return yonlendir(`/en/vs/${kanonikSlug}`);
      const c = e.ciftler.get(s) || { slug: s, a: ab[0].slug < ab[1].slug ? ab[0] : ab[1], b: ab[0].slug < ab[1].slug ? ab[1] : ab[0], secme: false };
      return yanit(ciftSayfasi(c, e, e.ciftler.has(s)));
    }
    return yanit(anaSayfa(e));
  },
  _ic: { yemekSayfasi, ciftSayfasi, dizinSayfasi, anaSayfa, yontemSayfasi, sitemap },
};
