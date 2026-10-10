// Liste sayfalarının tanımları. Her liste, bir aramaya ("yüksek proteinli kahvaltı" gibi) gerçek veriyle cevap verir.
// filtre: hangi yemekler girer · sira: sıralama · olcu: satırda öne çıkan değer · limit: en fazla kaç kalem
// giris/sss: listenin kendi verisinden üretilir, elle sabit sayı yazılmaz.

const OLCU = {
  protein: { ad: 'protein', yaz: (y) => `${y.protein} g protein` },
  kcal: { ad: 'kalori', yaz: (y) => `${y.kcal} kcal` },
  lif: { ad: 'lif', yaz: (y) => `${y.lif} g lif` },
  puan: { ad: 'puan', yaz: (y) => `${y.kcal} kcal` },
  oran: { ad: 'protein oranı', yaz: (y) => `${Math.round((y.protein / y.kcal) * 100)} g / 100 kcal` },
};

const puanaGore = (a, b) => b.doyuruculuk - a.doyuruculuk || a.kcal - b.kcal;
const ort = (l, k) => Math.round(l.reduce((t, y) => t + y[k], 0) / Math.max(1, l.length));
const enCok = (l, k) => l.reduce((m, y) => (y[k] > m[k] ? y : m), l[0]);
const enAz = (l, k) => l.reduce((m, y) => (y[k] < m[k] ? y : m), l[0]);

const LISTELER = [
  {
    slug: 'yuksek-proteinli-kahvalti',
    baslik: 'Yüksek proteinli kahvaltı: en tok tutan seçenekler',
    kisa: 'Yüksek proteinli kahvaltı',
    filtre: (y) => y.tur === 'kahvalti' && y.protein >= 15,
    olcu: 'protein', limit: 20,
    giris: (l) => `Sabah aldığın protein, öğlene kadar ne kadar dayanacağını belirler. Bu listede en az 15 g protein içeren ${l.length} kahvaltı var; ortalama proteinleri ${ort(l, 'protein')} g, ortalama kalorileri ${ort(l, 'kcal')} kcal. Sıralama sadece proteine göre değil, kalorisine göre ne kadar tok tuttuğuna göre yapıldı.`,
    sss: (l) => [
      ['En yüksek proteinli kahvaltı hangisi?', `${enCok(l, 'protein').ad}, ${enCok(l, 'protein').protein} g proteinle listenin en proteinlisi.`],
      ['Hangisi en uzun tok tutar?', `${l[0].ad}: ${l[0].kcal} kcal ve ${l[0].protein} g proteinle doyuruculuk puanı ${l[0].doyuruculuk}.`],
    ],
    ilgili: ['tok-tutan-kahvaltiliklar', 'proteinli-atistirmaliklar', 'yuksek-proteinli-yemekler'],
  },
  {
    slug: 'tok-tutan-kahvaltiliklar',
    baslik: 'En tok tutan kahvaltılıklar',
    kisa: 'Tok tutan kahvaltılıklar',
    filtre: (y) => y.tur === 'kahvalti',
    olcu: 'puan', limit: 20,
    giris: (l) => `Kahvaltıdan iki saat sonra acıkıyorsan sorun miktarda değil, seçimdedir. Bu liste kahvaltılıkları kalori başına ne kadar tok tuttuklarına göre sıralıyor. İlk sıradaki ${l[0].ad} ${l[0].kcal} kcal; listenin ortalaması ${ort(l, 'kcal')} kcal.`,
    sss: (l) => [
      ['Kahvaltıda ne yersem daha geç acıkırım?', `Protein ve lif oranı yüksek, şekeri düşük seçenekler. Bu listenin ilk üçü: ${l.slice(0, 3).map((y) => y.ad).join(', ')}.`],
      ['Listedeki en düşük kalorili kahvaltılık hangisi?', `${enAz(l, 'kcal').ad}, ${enAz(l, 'kcal').kcal} kcal.`],
    ],
    ilgili: ['yuksek-proteinli-kahvalti', '200-kalori-alti-doyurucu', 'tok-tutan-icecekler'],
  },
  {
    slug: 'yuksek-proteinli-yemekler',
    baslik: 'Yüksek proteinli yemekler: 30 g ve üzeri',
    kisa: 'Yüksek proteinli yemekler',
    filtre: (y) => y.tur === 'ana' && y.protein >= 30,
    olcu: 'protein', limit: 20,
    giris: (l) => `Tek porsiyonda en az 30 g protein veren ana yemekler. Spor yapıyorsan ya da kilo verirken kas kaybetmek istemiyorsan, günün proteinini bu tabaklardan biriyle büyük ölçüde kapatabilirsin. Listenin ortalaması ${ort(l, 'protein')} g protein, ${ort(l, 'kcal')} kcal.`,
    sss: (l) => [
      ['Hangi yemekte en çok protein var?', `${enCok(l, 'protein').ad}: ${enCok(l, 'protein').protein} g protein, ${enCok(l, 'protein').kcal} kcal.`],
      ['Yüksek proteinli ama düşük kalorili yemek hangisi?', `${enAz(l, 'kcal').ad}, ${enAz(l, 'kcal').kcal} kcal ile ${enAz(l, 'kcal').protein} g protein veriyor.`],
    ],
    ilgili: ['kalori-basina-en-cok-protein', 'yuksek-proteinli-kahvalti', 'vejetaryen-protein-kaynaklari'],
  },
  {
    slug: 'proteinli-atistirmaliklar',
    baslik: 'Proteinli atıştırmalıklar: tok tutanlar önde',
    kisa: 'Proteinli atıştırmalıklar',
    filtre: (y) => y.tur === 'atistirmalik' && y.protein >= 8,
    olcu: 'protein', limit: 20,
    giris: (l) => `Öğün arasında acıkınca elin cipse gitmesin diye: en az 8 g protein içeren ${l.length} atıştırmalık, tok tutma gücüne göre sıralandı. Ortalama ${ort(l, 'kcal')} kcal ve ${ort(l, 'protein')} g protein.`,
    sss: (l) => [
      ['En proteinli atıştırmalık hangisi?', `${enCok(l, 'protein').ad}, ${enCok(l, 'protein').protein} g protein.`],
      ['Hangisi en uzun tok tutar?', `${l[0].ad}: ${l[0].kcal} kcal, doyuruculuk puanı ${l[0].doyuruculuk}.`],
    ],
    ilgili: ['100-kalori-alti-doyurucu', 'yuksek-proteinli-kahvalti', 'kalori-basina-en-cok-protein'],
  },
  {
    slug: '100-kalori-alti-doyurucu',
    baslik: '100 kalorinin altında tok tutan yiyecekler',
    kisa: '100 kalori altı doyurucular',
    filtre: (y) => y.kcal <= 100 && y.tur !== 'icecek',
    olcu: 'kcal', limit: 20,
    giris: (l) => `100 kaloriyle neler alabilirsin? Çoğu insan bunu bir bisküvi sanır. Bu listedeki ${l.length} yiyecek 100 kcal'nin altında kalıp yine de uzun süre tok tutuyor. İlk sıradaki ${l[0].ad} sadece ${l[0].kcal} kcal.`,
    sss: (l) => [
      ['100 kalorinin altında en doyurucu yiyecek hangisi?', `${l[0].ad}: ${l[0].kcal} kcal, doyuruculuk puanı ${l[0].doyuruculuk}.`],
      ['Diyette atıştırmalık olarak ne yenir?', `Bu listenin ilk beşi iyi bir başlangıç: ${l.slice(0, 5).map((y) => y.ad).join(', ')}.`],
    ],
    ilgili: ['200-kalori-alti-doyurucu', 'diyet-icin-doyurucu-yemekler', 'en-doyurucu-corbalar'],
  },
  {
    slug: '200-kalori-alti-doyurucu',
    baslik: '200 kalorinin altında en doyurucu yiyecekler',
    kisa: '200 kalori altı doyurucular',
    filtre: (y) => y.kcal <= 200 && y.tur !== 'icecek',
    olcu: 'kcal', limit: 20,
    giris: (l) => `200 kcal, bir simidin üçte ikisi eder. Aynı kaloriyle çok daha uzun tok kalmak mümkün: bu liste 200 kcal'nin altındaki yiyecekleri tok tutma gücüne göre sıralıyor. Listenin ortalaması ${ort(l, 'kcal')} kcal.`,
    sss: (l) => [
      ['200 kalorilik en doyurucu öğün nedir?', `${l[0].ad}, ${l[0].kcal} kcal ile doyuruculuk puanı ${l[0].doyuruculuk}.`],
      ['Bu listedeki en proteinli seçenek hangisi?', `${enCok(l, 'protein').ad}, ${enCok(l, 'protein').protein} g protein.`],
    ],
    ilgili: ['100-kalori-alti-doyurucu', 'diyet-icin-doyurucu-yemekler', 'tok-tutan-kahvaltiliklar'],
  },
  {
    slug: 'diyet-icin-doyurucu-yemekler',
    baslik: 'Diyette tok tutan ana yemekler (400 kcal altı)',
    kisa: 'Diyette tok tutan yemekler',
    filtre: (y) => y.tur === 'ana' && y.kcal <= 400 && y.doyuruculuk >= 150,
    olcu: 'kcal', limit: 20,
    giris: (l) => `Diyetin en zor kısmı aç kalmak. Bu listedeki ana yemekler 400 kcal'nin altında kalıp A veya S liginde tok tutuyor; ortalama ${ort(l, 'kcal')} kcal ve ${ort(l, 'protein')} g protein. Akşam yemeğini buradan seçersen gece buzdolabına gitme ihtimalin düşer.`,
    sss: (l) => [
      ['Diyette akşam yemeğinde ne yenir?', `Az kalorili ama tok tutan bir ana yemek. Bu listenin ilk üçü: ${l.slice(0, 3).map((y) => y.ad).join(', ')}.`],
      ['Listenin en düşük kalorili yemeği hangisi?', `${enAz(l, 'kcal').ad}, ${enAz(l, 'kcal').kcal} kcal.`],
    ],
    ilgili: ['200-kalori-alti-doyurucu', 'yuksek-proteinli-yemekler', 'en-doyurucu-salatalar'],
  },
  {
    slug: 'en-doyurucu-corbalar',
    baslik: 'En doyurucu çorbalar',
    kisa: 'En doyurucu çorbalar',
    filtre: (y) => y.tur === 'corba',
    olcu: 'kcal', limit: 20,
    giris: (l) => `Çorba, kalori başına tokluğun gizli şampiyonudur: suyu ve hacmi mideyi az kaloriyle doldurur. Puanlanan ${l.length} çorbanın ortalaması ${ort(l, 'kcal')} kcal. Mercimekten miso'ya, en tok tutandan başlayarak sıralandı.`,
    sss: (l) => [
      ['En doyurucu çorba hangisi?', `${l[0].ad}: ${l[0].kcal} kcal, doyuruculuk puanı ${l[0].doyuruculuk}.`],
      ['En proteinli çorba hangisi?', `${enCok(l, 'protein').ad}, ${enCok(l, 'protein').protein} g protein.`],
    ],
    ilgili: ['100-kalori-alti-doyurucu', 'en-doyurucu-turk-yemekleri', 'diyet-icin-doyurucu-yemekler'],
  },
  {
    slug: 'en-doyurucu-salatalar',
    baslik: 'En doyurucu salatalar',
    kisa: 'En doyurucu salatalar',
    filtre: (y) => y.tur === 'salata',
    olcu: 'kcal', limit: 20,
    giris: (l) => `Her salata doyurmaz; yeşillikten ibaret olanlar bir saat sonra acıktırır. Bu liste ${l.length} salatayı tok tutma gücüne göre sıralıyor. Baklagil, ton balığı ya da tavuk içerenler öne çıkıyor.`,
    sss: (l) => [
      ['En doyurucu salata hangisi?', `${l[0].ad}: ${l[0].kcal} kcal, ${l[0].protein} g protein.`],
      ['Salata neden bazen doyurmaz?', 'Protein ve lif az, sos çoksa kalori artar ama tokluk artmaz. Listenin üst sıraları bu yüzden baklagil ya da protein içeren salatalardan oluşuyor.'],
    ],
    ilgili: ['diyet-icin-doyurucu-yemekler', 'vejetaryen-protein-kaynaklari', 'lifli-yiyecekler'],
  },
  {
    slug: 'vejetaryen-protein-kaynaklari',
    baslik: 'Vejetaryen protein kaynakları: 15 g ve üzeri',
    kisa: 'Vejetaryen protein kaynakları',
    filtre: (y) => y.mutfak === 'veg' && y.protein >= 15,
    olcu: 'protein', limit: 20,
    giris: (l) => `Et yemeden protein ihtiyacını karşılamak zor değil, sadece doğru tabağı bilmek gerekiyor. Bu listede en az 15 g protein içeren ${l.length} vejetaryen yemek var; ortalama ${ort(l, 'protein')} g protein.`,
    sss: (l) => [
      ['Vejetaryenler için en yüksek proteinli yemek hangisi?', `${enCok(l, 'protein').ad}, ${enCok(l, 'protein').protein} g protein.`],
      ['Etsiz en tok tutan yemek hangisi?', `${l[0].ad}: doyuruculuk puanı ${l[0].doyuruculuk}, ${l[0].kcal} kcal.`],
    ],
    ilgili: ['yuksek-proteinli-yemekler', 'lifli-yiyecekler', 'kalori-basina-en-cok-protein'],
  },
  {
    slug: 'lifli-yiyecekler',
    baslik: 'Lifi yüksek yiyecekler: 8 g ve üzeri',
    kisa: 'Lifi yüksek yiyecekler',
    filtre: (y) => y.lif >= 8,
    olcu: 'lif', limit: 20,
    giris: (l) => `Lif sindirimi yavaşlatır, kan şekerini dengeler ve tokluğu uzatır. Bu listede porsiyon başına en az 8 g lif veren ${l.length} yiyecek var; çoğu baklagil ve tam tahıl.`,
    sss: (l) => [
      ['En çok lif içeren yiyecek hangisi?', `${enCok(l, 'lif').ad}, ${enCok(l, 'lif').lif} g lif.`],
      ['Lif tokluğu nasıl etkiler?', 'Lif mideyi daha geç boşaltır ve kan şekerinin hızlı yükselip düşmesini önler; bu da acıkmayı geciktirir.'],
    ],
    ilgili: ['vejetaryen-protein-kaynaklari', 'en-doyurucu-salatalar', 'en-doyurucu-corbalar'],
  },
  {
    slug: 'kalori-basina-en-cok-protein',
    baslik: 'Kalori başına en çok protein veren yiyecekler',
    kisa: 'Kalori başına en çok protein',
    filtre: (y) => y.protein / y.kcal >= 0.1 && y.tur !== 'icecek',
    sira: (a, b) => b.protein / b.kcal - a.protein / a.kcal,
    olcu: 'oran', limit: 20,
    giris: (l) => `Protein hedefini kaloriyi şişirmeden tutturmak istiyorsan bakılacak sayı, 100 kcal başına düşen protein. Bu liste o orana göre sıralı; ilk sıradaki ${l[0].ad} her 100 kcal'de ${Math.round((l[0].protein / l[0].kcal) * 100)} g protein veriyor.`,
    sss: (l) => [
      ['Kalorisine göre en yüksek proteinli yiyecek hangisi?', `${l[0].ad}: ${l[0].kcal} kcal'de ${l[0].protein} g protein.`],
      ['Protein oranı neden önemli?', 'Aynı protein miktarını daha az kaloriyle almanı sağlar; kilo verirken kas korumanın en verimli yolu.'],
    ],
    ilgili: ['yuksek-proteinli-yemekler', 'proteinli-atistirmaliklar', 'tok-tutan-icecekler'],
  },
  {
    slug: 'en-doyurucu-turk-yemekleri',
    baslik: 'En doyurucu Türk yemekleri',
    kisa: 'En doyurucu Türk yemekleri',
    filtre: (y) => y.mutfak === 'tr',
    olcu: 'kcal', limit: 25,
    giris: (l) => `Türk mutfağında tok tutmanın şampiyonları çoğu zaman en sade tabaklar: çorbalar, zeytinyağlılar, baklagiller. Puanlanan Türk yemeklerinden en tok tutan ${l.length} tanesi burada.`,
    sss: (l) => [
      ['En doyurucu Türk yemeği hangisi?', `${l[0].ad}: ${l[0].kcal} kcal, doyuruculuk puanı ${l[0].doyuruculuk}.`],
      ['Listedeki en proteinli Türk yemeği hangisi?', `${enCok(l, 'protein').ad}, ${enCok(l, 'protein').protein} g protein.`],
    ],
    ilgili: ['en-doyurucu-corbalar', 'en-az-doyurucu-yiyecekler', 'tok-tutan-kahvaltiliklar'],
  },
  {
    slug: 'tok-tutan-icecekler',
    baslik: 'Tok tutan içecekler',
    kisa: 'Tok tutan içecekler',
    filtre: (y) => y.tur === 'icecek',
    olcu: 'kcal', limit: 15,
    giris: (l) => `İçecekler genelde tok tutmaz; meyve suyu ve kola en kötü örnekleri. Ama protein içeren birkaç tanesi sürpriz yapıyor. Listenin başında ${l[0].ad} var.`,
    sss: (l) => [
      ['En tok tutan içecek hangisi?', `${l[0].ad}: ${l[0].kcal} kcal, doyuruculuk puanı ${l[0].doyuruculuk}.`],
      ['Meyve suyu tok tutar mı?', 'Pek tutmaz. Meyvenin lifi suyunda kalmaz, şekeri hızla emilir; bu yüzden aynı kalorideki bütün meyveden çok daha çabuk acıktırır.'],
    ],
    ilgili: ['proteinli-atistirmaliklar', '100-kalori-alti-doyurucu', 'en-az-doyurucu-yiyecekler'],
  },
  {
    slug: 'en-doyurucu-tatlilar',
    baslik: 'Tatlı yiyeceksen: en tok tutan tatlılar',
    kisa: 'En tok tutan tatlılar',
    filtre: (y) => y.tur === 'tatli',
    olcu: 'kcal', limit: 15,
    giris: (l) => `Tatlıların çoğu D liginde; şeker çok, tokluk kısa. Ama hepsi aynı değil. Madem yiyeceksin, bu listenin üst sıralarından seç: ilk sıradaki ${l[0].ad}, ${l[0].kcal} kcal.`,
    sss: (l) => [
      ['En az acıktıran tatlı hangisi?', `${l[0].ad}: doyuruculuk puanı ${l[0].doyuruculuk}.`],
      ['Tatlılar neden çabuk acıktırır?', 'Şeker kan şekerini hızla yükseltir, ardından gelen düşüş açlık hissini geri getirir. Protein ve lif ise bu dalgalanmayı yumuşatır.'],
    ],
    ilgili: ['en-az-doyurucu-yiyecekler', '100-kalori-alti-doyurucu', 'tok-tutan-kahvaltiliklar'],
  },
  {
    slug: 'mcdonalds-en-doyurucu',
    baslik: "McDonald's'ta en tok tutan ürünler",
    kisa: "McDonald's'ta tok tutanlar",
    filtre: (y) => y.mutfak === 'zincir',
    olcu: 'kcal', limit: 20,
    giris: (l) => `Fast food'da da doğru seçim mümkün. McDonald's Türkiye'nin resmi besin değerleri tablosundaki ${l.length} ürün, kalori başına ne kadar tok tuttuğuna göre sıralandı.`,
    sss: (l) => [
      ["McDonald's'ta en doyurucu ürün hangisi?", `${l[0].ad}: ${l[0].kcal} kcal, doyuruculuk puanı ${l[0].doyuruculuk}.`],
      ["McDonald's'ta en proteinli ürün hangisi?", `${enCok(l, 'protein').ad}, ${enCok(l, 'protein').protein} g protein.`],
    ],
    ilgili: ['en-az-doyurucu-yiyecekler', 'yuksek-proteinli-yemekler', 'tok-tutan-icecekler'],
  },
  {
    slug: 'en-az-doyurucu-yiyecekler',
    baslik: 'En az doyuran yiyecekler: boş kalori listesi',
    kisa: 'Boş kalori listesi',
    filtre: (y) => y.lig === 'D' && y.tur !== 'icecek',
    sira: (a, b) => a.doyuruculuk - b.doyuruculuk || b.kcal - a.kcal,
    olcu: 'kcal', limit: 20,
    giris: (l) => `Yersin ama doymazsın. Bu liste ters sıralı (içecekler hariç, onlar ayrı bir dert): en başta kalorisine göre en az tok tutanlar var. Çoğunun ortak noktası yüksek şeker, düşük protein. Listenin ortalaması ${ort(l, 'kcal')} kcal.`,
    sss: (l) => [
      ['En az doyurucu yiyecek hangisi?', `${l[0].ad}: ${l[0].kcal} kcal, doyuruculuk puanı sadece ${l[0].doyuruculuk}.`],
      ['Boş kalori ne demek?', 'Enerji verip tokluk, protein ve lif vermeyen yiyecekler. Kalori sayısı yüksek, yarım saat sonra yine açsın.'],
    ],
    ilgili: ['en-doyurucu-tatlilar', '100-kalori-alti-doyurucu', 'en-doyurucu-turk-yemekleri'],
  },
];

// Aynı adın farklı porsiyonlarını tek kaleme indir (ör. "Edamame" ve "Edamame (1 kase)")
function tekillestir(l) {
  const gorulen = new Set();
  return l.filter((y) => {
    const k = y.ad.split(' (')[0].trim().toLocaleLowerCase('tr');
    if (gorulen.has(k)) return false;
    gorulen.add(k);
    return true;
  });
}

function listeKalemleri(t, d) {
  const aday = d.sirali.filter((y) => !y.kanonikSlug && t.filtre(y));
  const sirali = t.sira ? aday.slice().sort(t.sira) : aday.slice().sort(puanaGore);
  return tekillestir(sirali).slice(0, t.limit);
}

const LISTE = Object.fromEntries(LISTELER.map((t) => [t.slug, t]));

module.exports = { LISTELER, LISTE, OLCU, listeKalemleri };
