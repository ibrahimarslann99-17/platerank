// /zayiflama-ignesi → zayıflama iğnesi (GLP-1: Ozempic, Wegovy, Mounjaro) kullananlar için beslenme rehberi.
// Arama niyeti: "ozempic kullanırken ne yemeli", "zayıflama iğnesi protein", "iğnede kaç öğün".
// Kaynak: ACLM/ASN/OMA/TOS ortak tavsiyesi (Mozaffarian ve ark., 2025). Sayılar oradan; yemek listeleri canlı veriden.
// Bilgilendirme sayfasıdır: ilaç önermez, satış dili kullanılmaz. Protein hesabı index.html (pHedefGram) ve
// api/_hedef.js (igne profili) ile aynıdır; biri değişirse üçü birlikte değişir.

const { esc, LIG_RENK, SITE } = require('./_veri.js');
const { sayfa } = require('./_sablon.js');

const SLUG = 'zayiflama-ignesi';
const GUNCELLEME = '2026-11-12';
const KAYNAK_URL = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12304835/';

// Boyuna göre esas alınan kilo (BKİ 25) ve protein: 1,2-1,6 g/kg aralığı, PlateRank hedefi 1,5 g/kg, en çok 120 g
function proteinTablosu() {
  const satirlar = [];
  for (let boy = 150; boy <= 190; boy += 5) {
    const m = boy / 100, kilo = Math.round(25 * m * m);
    const alt = Math.round(kilo * 1.2), ust = Math.round(kilo * 1.6), hedef = Math.min(120, Math.round(kilo * 1.5));
    satirlar.push(`<tr><td>${boy} cm</td><td>${kilo} kg</td><td>${alt}-${ust} g</td><td><b>${hedef} g</b></td></tr>`);
  }
  return satirlar.join('');
}

// Az yağlı, porsiyonu küçük, proteini yoğun yemekler (kalori başına protein sırasıyla)
function uygun(y, minP) {
  return !y.kanonikSlug && y.tur !== 'icecek' && y.mutfak !== 'zincir'
    && y.protein >= minP && y.kcal > 0 && y.kcal <= 500 && (y.yag * 9) / y.kcal <= 0.35;
}
function satirP(y) {
  const kucuk = y.gorsel ? `<img class="kc" src="/img/yemek/k/${y.slug}.webp" alt="" width="48" height="36" loading="lazy" decoding="async">` : '';
  return `<li><a href="/yemek/${y.slug}">${kucuk}<span class="lg" style="background:${LIG_RENK[y.lig]}">${y.lig}</span>`
    + `<span class="ad">${esc(y.ad)}</span><span class="dg">${y.protein} g protein · ${y.kcal} kcal</span></a></li>`;
}

const SSS = [
  ['Zayıflama iğnesi kullanırken günde kaç gram protein almalıyım?',
    'Kilo verirken önerilen aralık günde kilo başına 1,2-1,6 gram, toplamda kabaca 80-120 gram. Fazla kiloluysan hesabı gerçek kilonla değil, boyuna göre sağlıklı kilonun üst sınırıyla yap; yoksa ihtiyaç olduğundan yüksek çıkar. Günde kilo başına 2 gramın üstüne uzun süre çıkılması önerilmiyor.'],
  ['İğnedeyken günde kaç öğün yemeliyim?',
    'Küçük ve sık öğün daha iyi gider: hafif bir kahvaltının ardından 3-4 saatte bir küçük öğün. Büyük öğün bulantıyı ve kusmayı tetikleyebilir.'],
  ['İştahım hiç yok, az yemek sorun mu?',
    'Evet, olabilir. İğne iştahı kestiği için asıl risk az yemek: kas ve kemik kaybı ile vitamin ve mineral eksikliği. Günde kadınlarda yaklaşık 1.200, erkeklerde 1.800 kalorinin altında besin eksikliği olasılığı artar. Tabağa proteinden başlamak, iştah bitmeden en önemli kısmı almanı sağlar.'],
  ['Bulantı ve kabızlık için ne yemeli?',
    'Bulantıda yağlı ve büyük öğünlerden uzak dur; zencefil ya da nane çayı işe yarayabilir. Kabızlıkta lifi yiyeceklerden ve yavaş yavaş artır, gün boyu su iç. İlk günlerde çok lifli yiyecekleri geçici olarak azaltmak da bir seçenek. Magnezyum takviyesi gibi adımlar için doktoruna danış.'],
  ['Protein tek başına kası korur mu?',
    'Hayır. Tavsiye haftada en az 3 gün kuvvet antrenmanı ve haftada en az 150 dakika orta tempolu hareket. Protein kası yapacak malzemeyi verir, antrenman onu kullanır.'],
];

function igneSayfasi(d) {
  const genel = d.yemekler.filter((y) => uygun(y, 15)).sort((a, b) => b.protein / b.kcal - a.protein / a.kcal).slice(0, 15);
  const turk = d.yemekler.filter((y) => y.mutfak === 'tr' && uygun(y, 12)).sort((a, b) => b.protein / b.kcal - a.protein / a.kcal).slice(0, 8);

  const govde = `
<nav class="yol"><a href="/">PlateRank</a> › Zayıflama iğnesi</nav>
<h1>Zayıflama iğnesi kullanırken ne yemeli?</h1>
<p class="alt">Ozempic, Wegovy, Mounjaro gibi GLP-1 iğnelerinde protein, öğün düzeni ve yan etkiler için beslenme</p>

<p class="cevap">İğnede asıl mesele az yemek. İştah düşünce kilo verilir ama yeterli protein alınmazsa kas da gider. Kısaca: günde kilo başına 1,2-1,6 gram protein, 3-4 saatte bir küçük ve az yağlı öğün, her öğünde önce protein, bol su, haftada en az 3 gün kuvvet antrenmanı.</p>

<div class="cta" style="margin:18px 0 8px"><a class="btn" href="/?durum=igne">Kendi protein hedefini hesapla</a></div>

<h2>Neden beslenme bu kadar önemli?</h2>
<p>GLP-1 iğneleri iştahı keser ve mideyi yavaş boşaltır. Kilo verdikleri kesin; asıl soru verilen kilonun ne kadarının yağ, ne kadarının kas olduğu. Az yenince kas ve kemik kaybı, vitamin ve mineral eksikliği riski artıyor. Üstelik çoğu kişi iğneyi ilk iki yıl içinde bırakıyor. Bıraktıktan sonra kiloyu tutan şey, iğnedeyken kurulan yeme düzeni oluyor.</p>

<h2>Günde ne kadar protein?</h2>
<p>Kilo verirken önerilen aralık <b>günde kilo başına 1,2-1,6 gram</b>, toplamda kabaca <b>80-120 gram</b>. Fazla kiloluysan gerçek kilonla hesaplamak ihtiyacı olduğundan yüksek gösterir. O yüzden PlateRank, boyuna göre sağlıklı kilonun üst sınırını (beden kitle indeksi 25) esas alıp 1,5 g/kg ile hesaplıyor, üst sınırı 120 gram. Kilon bu tablodaki esas kilonun altındaysa kendi kilonla hesapla.</p>
<div class="kart" style="padding:12px 14px;overflow-x:auto">
<table class="tablo"><thead><tr><th>Boy</th><th>Esas kilo</th><th>Aralık</th><th>Hedef</th></tr></thead><tbody>${proteinTablosu()}</tbody></table>
</div>
<p>Uzun süre günde kilo başına 2 gramın üstüne çıkılması önerilmiyor. Böbrek rahatsızlığın varsa yüksek protein uygun değil; hedefini doktorun belirler.</p>

<h2>Öğün düzeni</h2>
<ul class="sebep">
  <li><b>Küçük ve sık:</b> hafif bir kahvaltı, sonra 3-4 saatte bir küçük öğün. Büyük öğün bulantı ve kusmayı tetikleyebilir.</li>
  <li><b>Önce protein:</b> tabağa proteinden başla. İştah çabuk biter, en önemli kısım tabakta kalmasın.</li>
  <li><b>Yağı az tut:</b> yağlı yemek mide boşalmasını daha da yavaşlatır, bulantıyı artırır.</li>
  <li><b>Çok düşme:</b> günde kadınlarda yaklaşık 1.200, erkeklerde 1.800 kalorinin altında besin eksikliği olasılığı artar.</li>
  <li><b>Su:</b> gün boyu iç. İştah azalınca su da unutuluyor.</li>
  <li><b>Alkolü en aza indir.</b></li>
</ul>

<h2>Az kaloriyle çok protein veren yemekler</h2>
<p>Aşağıdakiler en az 15 gram protein veren, 500 kaloriyi geçmeyen ve kalorisinin en fazla %35'i yağdan gelen yemekler. Sıra, kalori başına protein. Küçük midede yer kaplamadan proteini tamamlamak için en verimli seçenekler bunlar.</p>
<ul class="liste">${genel.map(satirP).join('')}</ul>
${turk.length ? `<h3>Türk mutfağından</h3>
<ul class="liste">${turk.map(satirP).join('')}</ul>` : ''}

<h2>Yan etkilere göre beslenme</h2>
<h3>Bulantı</h3>
<p>Yağlı ve büyük öğünlerden uzak dur, yavaş ye. Zencefil ya da nane çayı işe yarayabilir.</p>
<h3>Kabızlık</h3>
<p>Lifi yiyeceklerden al ve yavaş yavaş artır, gün boyu su iç. Kabızlık sürerse yağlı yiyecekleri azalt. Magnezyum takviyesi bir seçenek, ama dozunu doktoruna sor.</p>
<h3>İshal</h3>
<p>Büyük ve yağlı öğünlerden kaçın. İlk günlerde çok lifli yiyecekleri geçici olarak azaltmak işe yarayabilir.</p>

<h2>Kas için hareket</h2>
<p>Protein tek başına kası korumaz. Tavsiye haftada en az 3 gün kuvvet antrenmanı ve haftada en az 150 dakika orta tempolu hareket.</p>

<h2>Gözden kaçan vitamin ve mineraller</h2>
<p>Az yenince en çok eksilenler demir, kalsiyum, magnezyum, çinko ve A, D, E, K, B1, B12 ile C vitaminleri. D vitamini, kalsiyum, B12 ya da multivitamin gibi takviyelere ihtiyacın olup olmadığını kan tahliline bakarak doktorun söyler.</p>

<h2>Sıkça sorulanlar</h2>
${SSS.map(([s, c]) => `<h3>${esc(s)}</h3><p>${esc(c)}</p>`).join('\n')}

<div class="halk"><b>Kendi hedefini çıkar</b><p>Kilonu, boyunu ve yaşını gir, "Zayıflama iğnesi kullanıyorum" seçili gelsin: günlük protein hedefin, öğün başına gramı ve hangi tabaklarla tamamlanacağı.</p><a class="btn" href="/?durum=igne">Protein hesabına git</a></div>

<p class="not">Bu sayfa bilgilendirme amaçlıdır, tıbbi tavsiye değildir; iğneni yazan doktor ya da diyetisyen sana farklı bir hedef verdiyse o geçerlidir. Gebelik, emzirme, diyabet, böbrek veya kalp hastalığında hedefini doktorunla belirle. PlateRank ilaç önermez ve ilaç üreticileriyle bağlantısı yoktur; Ozempic, Wegovy ve Mounjaro üreticilerinin tescilli markalarıdır.<br>
Kaynak: Mozaffarian D. ve ark., <a href="${KAYNAK_URL}" rel="nofollow">Nutritional priorities to support GLP-1 therapy for obesity</a>, American College of Lifestyle Medicine, American Society for Nutrition, Obesity Medicine Association ve The Obesity Society'nin ortak tavsiyesi, 2025. Son güncelleme: 12 Kasım 2026.</p>
`;

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'PlateRank', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Zayıflama iğnesi', item: `${SITE}/${SLUG}` },
        ],
      },
      {
        '@type': 'MedicalWebPage',
        name: 'Zayıflama iğnesi kullanırken ne yemeli?',
        url: `${SITE}/${SLUG}`,
        inLanguage: 'tr-TR',
        dateModified: GUNCELLEME,
        audience: { '@type': 'PeopleAudience', audienceType: 'GLP-1 iğnesi kullanan yetişkinler' },
        about: [{ '@type': 'Drug', name: 'Semaglutid (Ozempic, Wegovy)' }, { '@type': 'Drug', name: 'Tirzepatid (Mounjaro)' }],
        citation: KAYNAK_URL,
        publisher: { '@type': 'Organization', name: 'PlateRank', url: `${SITE}/` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: SSS.map(([s, c]) => ({ '@type': 'Question', name: s, acceptedAnswer: { '@type': 'Answer', text: c } })),
      },
    ],
  };

  return sayfa({
    baslik: 'Zayıflama iğnesi kullanırken ne yemeli? Protein ve öğün rehberi · PlateRank',
    aciklama: 'Ozempic, Wegovy, Mounjaro gibi zayıflama iğnelerinde günlük protein ihtiyacı (boya göre tablo), öğün düzeni, bulantı ve kabızlık için beslenme, az kaloriyle çok protein veren yemekler.',
    kanonik: `${SITE}/${SLUG}`, govde, jsonld,
    alternatlar: [{ dil: 'tr', href: `${SITE}/${SLUG}` }, { dil: 'en', href: `${SITE}/en/glp1-diet` }, { dil: 'x-default', href: `${SITE}/en/glp1-diet` }],
    ekCss: '.tablo{width:100%;border-collapse:collapse;font-size:15px;white-space:nowrap}.tablo th{text-align:left;color:var(--muted);font-weight:600;padding:6px 8px;border-bottom:1px solid var(--line)}.tablo td{padding:6px 8px;border-bottom:1px solid var(--line)}.tablo tr:last-child td{border-bottom:0}',
  });
}

module.exports = { igneSayfasi, IGNE_SLUG: SLUG, IGNE_GUNCELLEME: GUNCELLEME };
