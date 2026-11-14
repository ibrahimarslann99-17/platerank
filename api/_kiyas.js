// /kiyas            → Türkçe karşılaştırmaların dizini (yemek.js içinden, ?k= ile; Vercel fonksiyon sınırı)
// /kiyas/:a-vs-:b   → iki yemek: hangisi daha uzun tok tutar ("Muz mu, yulaf ezmesi mi?")
// İngilizce /en/vs sayfalarının Türkçesi; yalnızca _kiyas_veri.js'teki seçilmiş çiftler sayfa olur.

const { veri, esc, saatYaz, dkYaz, LIG_BILGI, LIG_RENK, SITE } = require('./_veri.js');
const { sayfa, yanit } = require('./_sablon.js');
const { kiyasHazirla, kiyasMetni } = require('./_kiyas_veri.js');

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
.ikili .ic .lgk{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:7px;color:#fff;font-weight:800;font-size:13px;margin-right:6px;vertical-align:middle}
table.kars{width:100%;border-collapse:collapse;background:var(--card);border-radius:18px;overflow:hidden;font-size:15px}
table.kars th,table.kars td{padding:10px 12px;text-align:right;border-bottom:1px solid var(--line)}
table.kars th:first-child,table.kars td:first-child{text-align:left;color:var(--muted);font-weight:400}
table.kars thead th{font-family:'Bricolage Grotesque',sans-serif;color:var(--ink);font-weight:700;font-size:15px}
table.kars td.iyi{font-weight:700;color:var(--teal)}
table.kars tr:last-child td{border-bottom:0}
@media (max-width:480px){.tokcevap{gap:12px;padding:14px}.tokcevap .ts{flex-basis:78px;height:78px}.tokcevap .ts b{font-size:28px}table.kars th,table.kars td{padding:9px 8px;font-size:14px}}
`;

const sa = (s) => `${saatYaz(s)} saat`;
const adres = (slug) => `${SITE}/kiyas/${slug}`;

// Liste satırı: yemek sayfasında ve dizinde kullanılır. y verilirse "Muz mu, X mi?" yerine karşı tarafa göre yazılır.
function kiyasSatiri(c, y) {
  const m = kiyasMetni(c);
  const sag = m.berabere ? 'berabere' : `${m.k === c.a ? m.A : m.B} kazanır`;
  return `<li><a href="/kiyas/${c.slug}"><span class="lg" style="background:var(--teal)">vs</span><span class="ad">${esc(m.soru)}</span><span class="dg">${esc(sag)}</span></a></li>`;
}

function kiyasSayfasi(c, e) {
  const { a, b } = c;
  const m = kiyasMetni(c);
  const { A, B, fark, berabere, k, z } = m;
  const K = m.k === a ? A : B, Z = m.k === a ? B : A;
  const kanonik = adres(c.slug);
  const porsiyonCumle = ` Porsiyon başına: ${A} (${a.kcal} kcal) yaklaşık ${sa(a.saat)}, ${B} (${b.kcal} kcal) yaklaşık ${sa(b.saat)} tok tutar.`;
  // Porsiyon kazananı kalori kazananıyla aynıysa başlıkta açıkça söylenir; değilse soru kalır, cevap sayfada.
  const porsiyonAyni = (k.saat >= z.saat);

  const baslik = berabere
    ? `${m.soru} İkisi de aynı tok tutar · PlateRank`
    : porsiyonAyni ? `${m.soru} ${K} daha uzun tok tutar · PlateRank` : `${m.soru} Hangisi daha uzun tok tutar? · PlateRank`;
  const aciklama = berabere
    ? `Kalori kalori bakınca ${A} ile ${B} eşit: ikisinden de 300 kalori yaklaşık ${sa(a.ayniSaat)} tok tutar. Kalori, protein, lif ve porsiyon başına tokluk yan yana.`
    : `Kalori kalori bakınca ${K} yaklaşık ${sa(fark)} daha uzun tok tutar: 300 kaloride ${K} ~${saatYaz(k.ayniSaat)}, ${Z} ~${saatYaz(z.ayniSaat)} saat. Kalori, protein, lif ve porsiyon başına tokluk yan yana.`;
  const cevap = berabere
    ? `Kalori kalori bakınca berabere: ikisinden de 300 kalori yaklaşık ${sa(a.ayniSaat)} tok tutar.` + porsiyonCumle
    : `Kalori kalori bakınca ${K} kazanır: 300 kalorisi yaklaşık ${sa(k.ayniSaat)} tok tutarken aynı kalorideki ${Z} yaklaşık ${sa(z.ayniSaat)} tutar.` + porsiyonCumle;

  const KE = esc(K), ZE = esc(Z);
  const neden = [], lehine = [];
  const pd = k.protein - z.protein;
  if (pd >= 5) neden.push(`<b>Protein:</b> ${KE} ${k.protein} g, ${ZE} ${z.protein} g. Tokluğu en çok uzatan protein.`);
  else if (pd <= -5) lehine.push(`daha çok protein (${z.protein} g, öbürü ${k.protein} g)`);
  const lf = k.lif - z.lif;
  if (lf >= 3) neden.push(`<b>Lif:</b> ${KE} ${k.lif} g, ${ZE} ${z.lif} g. Lif sindirimi yavaşlatır.`);
  else if (lf <= -3) lehine.push(`daha çok lif (${z.lif} g, öbürü ${k.lif} g)`);
  if (z.seker - k.seker >= 10) neden.push(`<b>Şeker:</b> ${ZE} ${z.seker} g, ${KE} ${k.seker} g şeker içeriyor. Şeker açlığı erken geri getirir.`);
  if (z.yag - k.yag >= 10) neden.push(`<b>Yağ:</b> ${ZE} ${z.yag} g, ${KE} ${k.yag} g yağ içeriyor. Yağ kaloriyi artırır, tokluğu aynı oranda artırmaz.`);
  if (k.doyuruculuk - z.doyuruculuk >= 40) neden.push(`<b>Kalori başına:</b> doyuruculuk puanı ${KE} ${k.doyuruculuk}, ${ZE} ${z.doyuruculuk}.`);
  if (k.kcal < z.kcal * 0.6) neden.push(`<b>Kalori yoğunluğu:</b> ${KE} bu tokluğu ${k.kcal} kcal ile veriyor, ${ZE} porsiyonu ${z.kcal} kcal.`);
  if (!neden.length) neden.push('İkisi besin değerlerinde birbirine yakın; fark porsiyonun hacminden ve kalori yoğunluğundan geliyor.');
  if (lehine.length) neden.push(`<b>${ZE} için artı:</b> ${lehine.join(' ve ')}; ama farkı kapatmaya yetmiyor.`);
  const takas = !berabere && z.kcal > k.kcal
    ? `<p><b>Takas önerisi:</b> ${ZE} yerine ${KE} seçersen ${z.kcal - k.kcal} kcal kazanırsın${k.saat >= z.saat ? ' ve en az onun kadar tok kalırsın.' : `; porsiyon başına tokluk yaklaşık ${sa(z.saat - k.saat)} kısalır.`}</p>` : '';

  const kart = (y, ad) => {
    const kaz = y === k && !berabere;
    const g = y.gorsel ? `<img src="/img/yemek/k/${y.slug}.webp" alt="${esc(y.ad)}" width="400" height="300" loading="lazy" decoding="async">` : '<span class="bos"></span>';
    return `<a href="/yemek/${y.slug}"${kaz ? ' class="kazanan"' : ''}>${kaz ? '<span class="rozet">DAHA TOK TUTAR</span>' : ''}${g}<div class="ic"><b>${esc(y.ad)}</b><span><span class="lgk" style="background:${LIG_RENK[y.lig]}">${y.lig}</span>porsiyon ~${saatYaz(y.saat)} sa · ${y.kcal} kcal</span></div></a>`;
  };
  const iyi = (x, y, yuksekIyi) => (x === y ? ['', ''] : (x > y) === yuksekIyi ? [' class="iyi"', ''] : ['', ' class="iyi"']);
  const sat = (ad, x, y, yaz, yuksekIyi) => {
    const [ca, cb] = yuksekIyi == null ? ['', ''] : iyi(x, y, yuksekIyi);
    return `<tr><td>${ad}</td><td${ca}>${yaz(x)}</td><td${cb}>${yaz(y)}</td></tr>`;
  };
  const p100 = (y) => String(Math.round((y.protein / Math.max(1, y.kcal)) * 1000) / 10).replace('.', ',');
  const ss = (v) => `~${saatYaz(v)} sa`;
  const tablo = `<table class="kars"><thead><tr><th></th><th>${esc(A)}</th><th>${esc(B)}</th></tr></thead><tbody>
${sat('Tokluk, 300 kaloride', a.ayniSaat, b.ayniSaat, ss, true)}
${sat('Tokluk, porsiyon başına', a.saat, b.saat, ss, true)}
${a.halkDk != null || b.halkDk != null ? `<tr><td>Yiyenlerin bildirdiği</td><td>${a.halkDk != null ? dkYaz(a.halkDk) : '–'}</td><td>${b.halkDk != null ? dkYaz(b.halkDk) : '–'}</td></tr>` : ''}
${sat('Doyuruculuk puanı', a.doyuruculuk, b.doyuruculuk, String, true)}
<tr><td>Lig</td><td>${a.lig} · ${LIG_BILGI[a.lig].kisa}</td><td>${b.lig} · ${LIG_BILGI[b.lig].kisa}</td></tr>
${sat('Kalori', a.kcal, b.kcal, (v) => `${v} kcal`, false)}
${sat('Protein', a.protein, b.protein, (v) => `${v} g`, true)}
<tr><td>100 kaloride protein</td><td>${p100(a)} g</td><td>${p100(b)} g</td></tr>
${sat('Lif', a.lif, b.lif, (v) => `${v} g`, true)}
${sat('Şeker', a.seker, b.seker, (v) => `${v} g`, false)}
${sat('Yağ', a.yag, b.yag, (v) => `${v} g`, null)}
</tbody></table>`;

  const digerleri = [...(e.yemegin.get(a.slug) || []), ...(e.yemegin.get(b.slug) || [])]
    .filter((x, i, l) => x !== c && l.indexOf(x) === i).sort((p, q) => q.secme - p.secme).slice(0, 8);

  const govde = `
<nav class="yol"><a href="/">PlateRank</a> › <a href="/yemek">Yemekler</a> › <a href="/kiyas">Karşılaştırmalar</a></nav>
<h1>${esc(m.soru)} Hangisi daha uzun tok tutar?</h1>
<p class="alt">Porsiyon: ${esc(a.ad)} ve ${esc(b.ad)}. Kalori ve tokluk bu porsiyonlar içindir, 100 gram değil.</p>
<div class="ikili">${kart(a, A)}${kart(b, B)}</div>
<div class="tokcevap"><div class="ts">${berabere ? '<small>ikisi de</small><b>=</b><span>berabere</span>' : `<small>300 kaloride</small><b>+${saatYaz(fark)}</b><span>saat</span>`}</div><p>${esc(cevap)}</p></div>

<h2>Yan yana</h2>
${tablo}

<h2>Farkı ne yaratıyor?</h2>
<ul class="sebep">${neden.map((n) => `<li>${n}</li>`).join('')}</ul>
${takas}

<div class="halk"><b>Hangisi seni daha çok tuttu?</b><p>İkisini birlikte ya da ayrı ayrı yediysen kaç saat tok tuttuğunu bildir. Yiyenlerin saatleri Meclis-i Mide'de toplanıyor.</p><a class="btn" href="/?bildir=${k.slug}" rel="nofollow">Saatini bildir</a></div>

${digerleri.length ? `<h2>Başka karşılaştırmalar</h2><ul class="liste">${digerleri.map((x) => kiyasSatiri(x)).join('')}</ul>` : ''}

<p class="not">Saatler doyuruculuk puanı, protein ve liften türetilen bir tahmindir; açlık kişiye, porsiyona ve günün geri kalanına göre değişir. <a href="/yontem">Nasıl hesaplıyoruz</a>.</p>
<div class="cta"><a class="btn" href="/yemek">Tüm yemekleri gör</a></div>
`;

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'PlateRank', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Karşılaştırmalar', item: `${SITE}/kiyas` },
        { '@type': 'ListItem', position: 3, name: `${A} - ${B}`, item: kanonik },
      ] },
      { '@type': 'FAQPage', mainEntity: [
        { '@type': 'Question', name: `${m.soru} Hangisi daha uzun tok tutar?`, acceptedAnswer: { '@type': 'Answer', text: cevap } },
        { '@type': 'Question', name: `${A} ve ${B} kaç kalori?`,
          acceptedAnswer: { '@type': 'Answer', text: `${a.ad} ${a.kcal} kcal ve ${a.protein} g protein; ${b.ad} ${b.kcal} kcal ve ${b.protein} g protein.` } },
      ] },
    ],
  };
  return sayfa({ baslik, aciklama, kanonik, govde, jsonld, ogGorsel: k.gorsel || z.gorsel, ekCss: EK_CSS });
}

function dizinSayfasi(e) {
  const l = [...e.ciftler.values()].sort((p, q) => q.secme - p.secme || p.slug.localeCompare(q.slug));
  const govde = `
<nav class="yol"><a href="/">PlateRank</a> › <a href="/yemek">Yemekler</a> › Karşılaştırmalar</nav>
<h1>Hangisi daha uzun tok tutar?</h1>
<p class="alt">${l.length} karşılaştırma. Her birinde iki yemeğin kalorisi, proteini ve hem porsiyon başına hem aynı 300 kaloride kaç saat tok tuttuğu yan yana.</p>
<ul class="liste">${l.map((c) => kiyasSatiri(c)).join('')}</ul>
<div class="cta"><a class="btn" href="/yemek">Tüm yemekler</a></div>
`;
  return sayfa({
    baslik: 'Hangisi daha uzun tok tutar? Yemek karşılaştırmaları · PlateRank',
    aciklama: `${l.length} yemek karşılaştırması: muz mu yulaf mı, simit mi poğaça mı? Kalori, protein ve kaç saat tok tuttuğu yan yana.`,
    kanonik: `${SITE}/kiyas`, govde, ekCss: EK_CSS,
    jsonld: { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'PlateRank', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Karşılaştırmalar', item: `${SITE}/kiyas` },
    ] },
  });
}

// yemek.js çağırır: k = '1' dizin, aksi halde çift slug'ı
async function kiyasYanit(k) {
  let d;
  try { d = await veri(); } catch (err) {
    return yanit('<!doctype html><meta charset="utf-8"><title>PlateRank</title><p>Şu an yüklenemedi, birazdan tekrar dene. <a href="/">Ana sayfa</a></p>', 503, 'no-store');
  }
  const e = kiyasHazirla(d);
  const s = String(k || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!s || s === '1') return yanit(dizinSayfasi(e));
  const c = e.ciftler.get(s);
  if (c) return yanit(kiyasSayfasi(c, e));
  // Sıra ters yazılmışsa doğru adrese
  const i = s.indexOf('-vs-');
  if (i > 0) {
    const ters = `${s.slice(i + 4)}-vs-${s.slice(0, i)}`;
    if (e.ciftler.has(ters)) return new Response(null, { status: 301, headers: { location: `/kiyas/${ters}`, 'cache-control': 'public, max-age=0, s-maxage=86400' } });
  }
  return new Response(null, { status: 302, headers: { location: '/kiyas', 'cache-control': 'public, max-age=0, s-maxage=600' } });
}

module.exports = { kiyasYanit, kiyasSatiri, _ic: { kiyasSayfasi, dizinSayfasi } };
