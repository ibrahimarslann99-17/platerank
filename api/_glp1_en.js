// /en/glp1-diet → İngilizce GLP-1 (Ozempic, Wegovy, Mounjaro, Zepbound) beslenme rehberi. Türkçesi: /zayiflama-ignesi (_igne_sayfa.js).
// Arama niyeti: "what to eat on ozempic", "glp-1 protein", "how much protein on wegovy".
// Kaynak ve sayılar Türkçe sayfayla aynı (ACLM/ASN/OMA/TOS 2025); protein hesabı _hedef.js igne profiliyle aynı.
// en.js'in sayfa() ve satir() kabuğunu parametre olarak alır (döngüsel require olmasın diye).

const { esc, SITE } = require('./_veri.js');

const SLUG = 'en/glp1-diet';
const GUNCELLEME = '2026-11-12';
const KAYNAK_URL = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12304835/';

function ftIn(cm) { const i = Math.round(cm / 2.54); return `${Math.floor(i / 12)}′${i % 12}″`; }
function tablo() {
  const s = [];
  for (let cm = 150; cm <= 190; cm += 5) {
    const kg = 25 * (cm / 100) ** 2;
    const lb = Math.round(kg * 2.2046);
    const alt = Math.round(kg * 1.2), ust = Math.round(kg * 1.6), hedef = Math.min(120, Math.round(kg * 1.5));
    s.push(`<tr><td>${ftIn(cm)} <small style="color:var(--muted)">${cm} cm</small></td><td>${lb} lb</td><td>${alt}-${ust} g</td><td><b>${hedef} g</b></td></tr>`);
  }
  return s.join('');
}
function uygun(y, minP) {
  return !y.kanonik && y.tur !== 'icecek' && y.protein >= minP && y.kcal > 0 && y.kcal <= 500 && (y.yag * 9) / y.kcal <= 0.35;
}

const FAQ = [
  ['How much protein should I eat on Ozempic or another GLP-1?',
    'During weight loss the suggested range is 1.2 to 1.6 grams per kilogram of body weight a day, roughly 80 to 120 grams in total. If you carry extra weight, base it on the top of the healthy weight range for your height, not your current weight, or the number comes out too high. Staying above 2 grams per kilogram for long periods is not recommended.'],
  ['How many meals a day on a GLP-1?',
    'Small and frequent works better: a light breakfast, then a small meal every 3 to 4 hours. Large meals are more likely to trigger nausea and vomiting.'],
  ['I have no appetite. Is eating too little a problem?',
    'It can be. Because the medication cuts appetite, the main risk is undereating: losing muscle and bone, and running short on vitamins and minerals. Below about 1,200 calories a day for women or 1,800 for men, nutrient gaps become more likely. Starting each plate with the protein makes sure the most important part gets eaten before your appetite runs out.'],
  ['What helps with nausea and constipation?',
    'For nausea, avoid fatty and large meals; ginger or peppermint tea may help. For constipation, get fiber from food, increase it slowly and drink through the day. Cutting back on very high-fiber foods for the first few days is also an option. Ask your doctor about steps like a magnesium supplement.'],
  ['Does protein alone protect muscle?',
    'No. The advice is strength training at least 3 times a week and at least 150 minutes of moderate activity a week. Protein supplies the material; training puts it to use.'],
];

function glp1Sayfasi(e, sayfa, satir) {
  const sira = (a, b) => b.protein / b.kcal - a.protein / a.kcal;
  const liste = e.yemekler.filter((y) => uygun(y, 15)).sort(sira).slice(0, 15);
  const sag = (y) => `${y.protein} g protein · ${y.kcal} kcal`;

  const govde = `
<nav class="yol"><a href="/en">PlateRank</a> › GLP-1 diet</nav>
<h1>What to eat on Ozempic and other GLP-1s</h1>
<p class="alt">Protein, meal timing and side-effect tips for Ozempic, Wegovy, Mounjaro and Zepbound</p>

<p class="cevap">On a GLP-1 the real risk is eating too little. Appetite drops, weight comes off, but without enough protein some of that weight is muscle. In short: 1.2 to 1.6 grams of protein per kilogram a day, a small low-fat meal every 3 to 4 hours, protein first at every meal, plenty of water, and strength training at least 3 times a week.</p>

<div class="cta" style="margin:18px 0 8px"><a class="btn" href="/en/plan">Get a GLP-1 meal plan</a><p style="margin:10px 0 0;font-size:15px"><a href="/en?durum=igne">Or just calculate your daily protein →</a></p></div>

<h2>Why nutrition matters more on a GLP-1</h2>
<p>GLP-1 medications cut appetite and slow down how fast the stomach empties. They work for weight loss; the open question is how much of the lost weight is fat and how much is muscle. Eating little raises the risk of muscle and bone loss and of vitamin and mineral shortfalls. Many people also stop the medication within the first two years, and what keeps the weight off afterwards is the way of eating built while on it.</p>

<h2>How much protein a day?</h2>
<p>During weight loss the suggested range is <b>1.2 to 1.6 g per kilogram of body weight a day</b>, roughly <b>80 to 120 g</b> in total. Using your current weight overstates the need if you carry extra weight, so PlateRank uses the top of the healthy range for your height (a BMI of 25) at 1.5 g/kg, capped at 120 g. If you weigh less than the reference weight below, use your own weight.</p>
<div class="kart" style="padding:12px 14px;overflow-x:auto">
<table class="kars" style="white-space:nowrap;font-size:14px"><thead><tr><th>Height</th><th>Ref. weight</th><th>Range</th><th>Target</th></tr></thead><tbody>${tablo()}</tbody></table>
</div>
<p>Staying above 2 g per kilogram for long periods is not recommended. If you have kidney disease, high protein may not be right for you; your doctor sets the target.</p>

<h2>Meal pattern</h2>
<ul class="sebep">
  <li><b>Small and frequent:</b> a light breakfast, then a small meal every 3 to 4 hours. Big meals can trigger nausea and vomiting.</li>
  <li><b>Protein first:</b> start the plate with the protein. Appetite runs out fast; don’t leave the important part behind.</li>
  <li><b>Keep fat low:</b> fatty food slows the stomach even more and makes nausea worse.</li>
  <li><b>Don’t go too low:</b> below about 1,200 calories a day for women or 1,800 for men, nutrient gaps become more likely.</li>
  <li><b>Water:</b> drink through the day. When appetite fades, people forget to drink too.</li>
  <li><b>Keep alcohol to a minimum.</b></li>
</ul>

<h2>Foods with the most protein for the fewest calories</h2>
<p>Each of these gives at least 15 g of protein, stays under 500 calories, and gets no more than 35% of its calories from fat. They are ranked by protein per calorie: the most efficient way to reach your protein without filling a smaller stomach.</p>
<ul class="liste">${liste.map((y) => satir(y, sag(y))).join('')}</ul>

<h2>Eating around side effects</h2>
<h3>Nausea</h3>
<p>Avoid fatty and large meals and eat slowly. Ginger or peppermint tea may help.</p>
<h3>Constipation</h3>
<p>Get fiber from food and increase it slowly, and drink through the day. If it persists, cut back on fatty foods. A magnesium supplement is an option, but ask your doctor about the dose.</p>
<h3>Diarrhea</h3>
<p>Avoid large and fatty meals. Cutting back on very high-fiber foods for the first few days may help.</p>

<h2>Movement for muscle</h2>
<p>Protein alone doesn’t keep muscle. The advice is strength training at least 3 times a week and at least 150 minutes of moderate activity a week.</p>

<h2>Vitamins and minerals to watch</h2>
<p>When intake drops, the most common shortfalls are iron, calcium, magnesium, zinc and vitamins A, D, E, K, B1, B12 and C. Whether you need supplements such as vitamin D, calcium, B12 or a multivitamin is something your doctor can tell from blood work.</p>

<h2>Frequently asked questions</h2>
${FAQ.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}

<div class="halk"><b>A week of small meals, built for you</b><p>Pick “I’m on a weight-loss shot” as your goal: 5 small meals a day, timed every 3 to 4 hours, with calorie and protein targets for each one. Your daily targets are free.</p><a class="btn" href="/en/plan">Build my plan</a></div>

<p class="not">This page is for information only and is not medical advice; if the doctor who prescribed your medication gave you different targets, follow theirs. If you are pregnant or breastfeeding, or have diabetes, kidney or heart disease, set your targets with your doctor. PlateRank does not recommend medications and is not affiliated with their makers; Ozempic, Wegovy, Mounjaro and Zepbound are trademarks of their respective owners.<br>
Source: Mozaffarian D. et al., <a href="${KAYNAK_URL}" rel="nofollow">Nutritional priorities to support GLP-1 therapy for obesity</a>, a joint advisory from the American College of Lifestyle Medicine, the American Society for Nutrition, the Obesity Medicine Association and The Obesity Society, 2025. Last updated November 12, 2026.</p>
`;

  const url = `${SITE}/${SLUG}`;
  return sayfa({
    baslik: 'What to eat on Ozempic: GLP-1 protein and meal guide · PlateRank',
    aciklama: 'How much protein to eat on Ozempic, Wegovy or Mounjaro (table by height), small-meal timing, a calorie floor, foods for nausea and constipation, and the foods with the most protein per calorie.',
    kanonik: url, govde,
    alternatlar: [{ dil: 'en', href: url }, { dil: 'tr', href: `${SITE}/zayiflama-ignesi` }, { dil: 'x-default', href: url }],
    jsonld: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'PlateRank', item: `${SITE}/en` },
          { '@type': 'ListItem', position: 2, name: 'GLP-1 diet', item: url },
        ] },
        { '@type': 'MedicalWebPage', name: 'What to eat on Ozempic and other GLP-1s', url, inLanguage: 'en', dateModified: GUNCELLEME,
          audience: { '@type': 'PeopleAudience', audienceType: 'Adults taking GLP-1 medications' },
          about: [{ '@type': 'Drug', name: 'Semaglutide (Ozempic, Wegovy)' }, { '@type': 'Drug', name: 'Tirzepatide (Mounjaro, Zepbound)' }],
          citation: KAYNAK_URL, publisher: { '@type': 'Organization', name: 'PlateRank', url: `${SITE}/en` } },
        { '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
      ],
    },
  });
}

module.exports = { glp1Sayfasi, GLP1_URL: `${SITE}/${SLUG}`, GLP1_GUNCELLEME: GUNCELLEME };
