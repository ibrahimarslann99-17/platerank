// Yemek sayfalarındaki "nasıl yapılır" bölümü: tarifler tablosundan okur, HTML ve schema.org Recipe üretir.
const { SITE } = require('./_veri.js');

const SUPABASE_URL = 'https://hpxnektzsrdhqzwwkfau.supabase.co';
const SUPABASE_KEY = 'sb_publishable_D1jGcv4slm8P3fBsPpbKOA_WkoH2PjJ';
const OMUR = 10 * 60 * 1000;
const onbellek = new Map(); // `${id}:${dil}` -> { t, zaman }

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function tarifCek(id, dil) {
  const k = `${id}:${dil}`;
  const o = onbellek.get(k);
  if (o && Date.now() - o.zaman < OMUR) return o.t;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/tarifler?select=sure_dk,kisi,zorluk,malzemeler,adimlar,tok_ipucu,updated_at&yemek_id=eq.${id}&dil=eq.${dil}`,
      { headers: { apikey: SUPABASE_KEY } });
    if (!r.ok) return o ? o.t : null;
    const t = (await r.json())[0] || null;
    onbellek.set(k, { t, zaman: Date.now() });
    return t;
  } catch (e) { return o ? o.t : null; }
}

const ZORLUK = { tr: { kolay: 'Kolay', orta: 'Orta', zor: 'Zor' }, en: { kolay: 'Easy', orta: 'Medium', zor: 'Hard' } };
const METIN = {
  tr: { baslik: (k) => `${k} nasıl yapılır?`, sure: 'dk', zorluk: 'Zorluk', ne: 'Ne lazım', nasil: 'Nasıl yapılır', tok: 'Daha tok tutsun istersen:', not: (kcal) => `Sayfadaki değerler 1 porsiyon (${kcal} kcal) içindir. Tarif ev usulü, genel bir anlatımdır.` },
  en: { baslik: (k) => `How to make ${k}`, sure: 'min', zorluk: 'Difficulty', ne: 'What you need', nasil: 'How to make it', tok: 'To make it more filling:', not: (kcal) => `Values on this page are for 1 serving (${kcal} kcal). This is a home-style, general recipe.` },
};

const CSS = `<style>
.tarif{background:var(--card,#fff);border-radius:22px;padding:18px 18px 16px;margin:22px 0;box-shadow:0 6px 20px rgba(20,32,26,.06)}
.tarif h2{margin:0 0 4px}
.tarif .tm{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:14px;color:var(--muted,#5B6B60);margin:0 0 6px}.tarif .tm b{color:var(--ink,#0F1A13)}
.tarif h3{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--teal,#1F5C3B);margin:16px 0 6px}
.tarif ul.mz{list-style:none;margin:0;padding:0}.tarif ul.mz li{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-bottom:1px dashed var(--line,#D6E3D9);font-size:16px}.tarif ul.mz li span:last-child{color:var(--muted,#5B6B60);text-align:right}
.tarif ol{list-style:none;counter-reset:a;margin:0;padding:0}.tarif ol li{counter-increment:a;position:relative;padding:0 0 12px 36px;line-height:1.5}
.tarif ol li:before{content:counter(a);position:absolute;left:0;top:1px;width:25px;height:25px;border-radius:50%;background:var(--forest,#0E2217);color:var(--lime,#D5EC62);font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center}
.tarif .tk{background:#E1EEE4;border-radius:16px;padding:12px 14px;margin:4px 0 0;line-height:1.5}.tarif .tk b{color:#15432A}
.tarif .tn{font-size:13px;color:var(--muted,#5B6B60);margin:10px 0 0}
</style>`;

function tarifHtml(t, kok, kcal, dil) {
  if (!t) return '';
  const M = METIN[dil];
  return `${CSS}<section class="tarif" id="${dil === 'en' ? 'recipe' : 'tarif'}">
<h2>${esc(M.baslik(kok))}</h2>
<div class="tm"><span>⏲ <b>${t.sure_dk} ${M.sure}</b></span><span>👤 <b>${esc(t.kisi)}</b></span><span>${M.zorluk}: <b>${ZORLUK[dil][t.zorluk]}</b></span></div>
<h3>${M.ne}</h3>
<ul class="mz">${t.malzemeler.map((m) => `<li><span>${esc(m.ad)}</span><span>${esc(m.miktar)}</span></li>`).join('')}</ul>
<h3>${M.nasil}</h3>
<ol>${t.adimlar.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>
${t.tok_ipucu ? `<p class="tk">🌿 <b>${M.tok}</b> ${esc(t.tok_ipucu)}</p>` : ''}
<p class="tn">${M.not(kcal)}</p>
</section>`;
}

// Google tarif zengin sonucu için schema.org Recipe
function tarifLd(t, { ad, kcal, mutfak, gorsel, url, dil }) {
  if (!t) return null;
  const r = {
    '@type': 'Recipe',
    name: ad,
    inLanguage: dil,
    url: url + (dil === 'en' ? '#recipe' : '#tarif'),
    totalTime: `PT${t.sure_dk}M`,
    recipeYield: t.kisi,
    recipeCuisine: mutfak || undefined,
    recipeIngredient: t.malzemeler.map((m) => `${m.miktar} ${m.ad}`.trim()),
    recipeInstructions: t.adimlar.map((a, i) => ({ '@type': 'HowToStep', position: i + 1, text: a })),
    nutrition: { '@type': 'NutritionInformation', calories: `${kcal} kcal`, servingSize: dil === 'en' ? '1 serving' : '1 porsiyon' },
    author: { '@type': 'Organization', name: 'PlateRank', url: SITE },
  };
  if (gorsel) r.image = [SITE + gorsel];
  if (t.updated_at) r.datePublished = String(t.updated_at).slice(0, 10);
  return r;
}

module.exports = { tarifCek, tarifHtml, tarifLd };
