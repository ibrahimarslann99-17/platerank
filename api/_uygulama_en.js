// /en: Türkçe uygulamanın (index.html) İngilizce hali. Ayrı bir uygulama yazılmaz; index.html'in kaynağı
// _ceviri_en.js tablosuyla çevrilir, başlık ve SEO bölümü İngilizce üretilir, yemek adları İngilizce adlarla
// (_en_adlar.js) değiştirilir. Türkçe dosyada yapılan her değişiklik İngilizceye kendiliğinden geçer;
// yalnızca yeni eklenen Türkçe metinler için _ceviri_en.js'e satır eklemek gerekir.

const fs = require('fs');
const path = require('path');
const CEVIRI = require('./_ceviri_en.js');
const { esc } = require('./_veri.js');

const KAYNAK = path.join(__dirname, '..', 'index.html');
let cevrik = null; // { html, eksik } — kaynak değişmediği sürece bir kez hesaplanır

function kacis(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Kaynağı çevirir. <style> blokları dokunulmadan kalır. 'kod' satırları birebir, diğerleri kelime sınırıyla aranır.
function cevir(src) {
  const p = src.split(/(<style[\s\S]*?<\/style>)/);
  const eksik = [];
  for (const [tr, en, tip] of CEVIRI) {
    let n = 0;
    let re = null;
    if (tip !== 'kod') {
      const bas = /^[\p{L}\p{N}]/u.test(tr) ? '(?<![\\p{L}\\p{N}_])' : '';
      const son = /[\p{L}\p{N}]$/u.test(tr) ? '(?![\\p{L}\\p{N}_])' : '';
      re = new RegExp(bas + kacis(tr) + son, 'gu');
    }
    for (let i = 0; i < p.length; i += 2) {
      if (re) p[i] = p[i].replace(re, () => { n++; return en; });
      else { const s = p[i].split(tr); n += s.length - 1; p[i] = s.join(en); }
    }
    if (!n) eksik.push(tr);
  }
  return { html: p.join(''), eksik };
}

// Uygulamanın İngilizce moda geçmesi için kod düzeltmeleri (metin değil, davranış).
const DAVRANIS = [
  // görseller ve eski bağlantılar Türkçe ada göre: İngilizce ad gelince Türkçe ad ad_tr'de durur
  ['slugla(f.ad)', 'slugla(f.ad_tr||f.ad)'],
  ['slugla(x.ad)', 'slugla(x.ad_tr||x.ad)'],
  ['href="/yemek/${slug}">Food page →</a>', 'href="/en/food/${(window.PR_EN[f.id]||[])[1]||\'\'}">Food page →</a>'],
  ["emailRedirectTo: 'https://platerank.dev' }", "emailRedirectTo: 'https://platerank.dev/en' }"],
  ["let currentCuisine = 'tr';", "let currentCuisine = 'us';"],
  // Türkçe hazır listeler (/liste) İngilizcede yok
  ['function listeSeridi(mod){', "function listeSeridi(mod){ return '';"],
  ["  {sec:'.lseridi', lab:'Ready-made lists', b:'Ready-made lists',\n   m:'High-protein breakfasts, filling foods under 100 calories, the most filling soups… Ready-ranked lists, tap to open.'}\n", ''],
  // plana giden kapılar: ana ekran ve Profil
  ['</head>', '<style>.m-oneri{display:none!important}</style></head>'],
  // Supabase istemcisi oluşur oluşmaz İngilizce veri kancası takılır
  ["const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { flowType: 'pkce' } });",
    "const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { flowType: 'pkce' } }); prEnKanca(sb);"],
];

// Yemek sorgularını İngilizceye çeviren kanca: İngilizce adı olmayan yemekler (Zincir, Market) düşer,
// ad İngilizce olur, Türkçe ad ad_tr'de kalır; ada göre arama İngilizce adlarda yapılır.
const KANCA = `
function prEnKanca(sb){
  var EN = window.PR_EN || {}, N = Object.keys(EN).length;
  function norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,''); }
  function cev(y){ if(!y || !y.id) return y; var e = EN[y.id]; if(!e) return null; if(!('ad' in y)) return y; var z = Object.assign({}, y); z.ad_tr = y.ad; z.ad = e[0]; return z; }
  function sonuc(r){
    if(!r) return r;
    if(Array.isArray(r.data)) r.data = r.data.map(cev).filter(Boolean);
    else if(r.data && r.data.id){ var c = cev(r.data); r.data = c; }
    if(r.data == null && typeof r.count === 'number') r.count = N;
    return r;
  }
  function sar(q){
    return new Proxy(q, { get: function(o, k){
      if(k === 'then') return function(a, b){ return o.then(sonuc).then(a, b); };
      if(k === 'ilike') return function(kol, desen){
        if(kol !== 'ad') return sar(o.ilike(kol, desen));
        var s = norm(String(desen).replace(/%/g,'')).trim();
        var ids = Object.keys(EN).filter(function(id){ return norm(EN[id][0]).indexOf(s) >= 0; }).slice(0, 150);
        return sar(o.in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']));
      };
      var v = o[k];
      if(typeof v !== 'function') return v;
      return function(){ var r = v.apply(o, arguments); return (r && typeof r === 'object' && typeof r.then === 'function') ? sar(r) : r; };
    }});
  }
  var asil = sb.from.bind(sb);
  sb.from = function(t){ var q = asil(t); return t === 'yemekler' ? sar(q) : q; };
}
`;

function seoBolumu(e) {
  const ust = e.sirali.filter((y) => !y.kanonik && y.tur !== 'icecek' && !y.sadece_malzeme).slice(0, 15);
  const alt = e.sirali.filter((y) => !y.kanonik && y.tur === 'tatli').slice(-4).reverse();
  const ciftler = [...e.ciftler.values()].filter((c) => c.secme).slice(0, 12);
  return `<section id="seo">
    <h2>The most filling foods: fullness per calorie</h2>
    <p>The answer to “which foods keep you full the longest?” isn’t portion size, it’s <b>fullness per calorie</b>. The list below shows the 15 highest satiety scores among the <span class="toplam-sayi">${e.toplam}</span> foods on PlateRank. What they share is clear: lots of water volume, lots of protein, lots of fiber and little sugar.</p>
    <ol class="seo-list">
${ust.map((y) => `      <li><b><a href="/en/food/${y.slug}">${esc(y.tam)}</a></b> · ${y.kcal} kcal · score ${y.doyuruculuk}${y.tanim ? ' · ' + esc(y.tanim) : ''}</li>`).join('\n')}
    </ol>
    <p>What’s at the other end? Sugar-heavy desserts like ${alt.map((y) => `${esc(y.ad)} (score ${y.doyuruculuk})`).join(', ')}: lots of calories, short-lived fullness, so they sit in the <b>D league</b>.</p>
    <h3>Head-to-head</h3>
    <ul class="seo-list">
${ciftler.map((c) => `      <li><a href="/en/vs/${c.slug}">${esc(c.a.ad)} vs ${esc(c.b.ad)}</a></li>`).join('\n')}
    </ul>
    <h3>How many grams of protein do I need a day?</h3>
    <p>Simple math: <b>your weight × a factor</b>. The factor depends on your situation: 0.8 to avoid falling short, 1.1 to be healthy and energetic, 1.5 if you train regularly, 1.8 if you’re losing weight, 1.6 if you’re over 65, 2.0 if you’re recovering from illness or surgery (grams per kg of body weight). The <b>What to eat?</b> section below works it out for you and shows sample plates.</p>
    <h3>How is the score calculated?</h3>
    <p>The satiety score isn’t a lab measurement; it’s a calculation built to rank foods against each other. Protein and fiber per serving push it up, calorie density and sugar pull it down. The full explanation is on the <a href="/en/method">method page</a>, and every food is on the <a href="/en/food">full list</a>.</p>
    <p>Want a week of meals built around staying full? <a href="/en/plan"><b>Build your Stay Full Plan</b></a>.</p>
  </section>`;
}

function basligiCevir(html) {
  const t = (a, b) => { html = html.split(a).join(b); };
  html = html.replace('<html lang="tr">', '<html lang="en">');
  html = html.replace(/<title>[^<]*<\/title>/, '<title>PlateRank: Which Foods Keep You Full the Longest?</title>');
  html = html.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Which foods keep you full the longest? PlateRank ranks 760+ foods by fullness per calorie, with a satiety tier from S to D and the hours until you are hungry again.">');
  t('<link rel="canonical" href="https://platerank.dev/">', '<link rel="canonical" href="https://platerank.dev/en">');
  t('<meta property="og:url" content="https://platerank.dev/">', '<meta property="og:url" content="https://platerank.dev/en">');
  t('<meta property="og:locale" content="tr_TR">', '<meta property="og:locale" content="en_US">');
  html = html.replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="PlateRank: what actually keeps you full?">');
  html = html.replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="Calories are on every label. How long a food keeps you full is not. 760+ foods ranked by fullness per calorie.">');
  html = html.replace(/<meta property="og:image:alt" content="[^"]*">/, '<meta property="og:image:alt" content="PlateRank: which food really keeps you full?">');
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');
  return html;
}

function uygulamaEn(e) {
  if (!cevrik) {
    let src = fs.readFileSync(KAYNAK, 'utf8');
    // Türkçe sayfadaki dil bağlantısı İngilizcede Türkçeye döner
    src = src.split('<a href="/en" onclick="document.cookie=\'pr_dil=en;path=/;max-age=31536000\'">English</a>')
      .join('<a href="/" lang="tr" onclick="document.cookie=\'pr_dil=tr;path=/;max-age=31536000\'">Türkçe</a>');
    const c = cevir(src);
    let html = c.html;
    const eksik = c.eksik.slice();
    for (const [a, b] of DAVRANIS) {
      if (!html.includes(a)) eksik.push('DAVRANIS: ' + a.slice(0, 60));
      html = html.split(a).join(b);
    }
    cevrik = { html: basligiCevir(html), eksik };
    if (eksik.length) console.warn('en çeviri: kaynakta bulunamayan parçalar', eksik.length, eksik.slice(0, 20));
  }
  const ad = {};
  for (const y of e.yemekler) ad[y.id] = [y.tam, y.slug];
  const veri = `<script>window.PR_DIL='en';window.PR_EN=${JSON.stringify(ad).replace(/</g, '\\u003c')};${KANCA}</script>\n`;
  return cevrik.html
    .replace(/<section id="seo">[\s\S]*?<\/section>/, () => seoBolumu(e))
    .replace('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>', (m) => veri + m);
}

module.exports = { uygulamaEn, cevir, _eksik: () => (cevrik ? cevrik.eksik : null) };
