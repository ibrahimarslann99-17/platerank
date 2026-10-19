// /yontem → PlateRank'in puanı ve tokluk süresini nasıl hesapladığı.
// Arama motorları ve yapay zekâ aramaları bir rakamı kaynak gösterirken yöntemi açıklayan sayfayı alıntılar;
// bu sayfa o yüzden düz, ölçülü ve sayılarla yazıldı. Sayılar canlı veriden gelir.

const { veri, esc, saatYaz, SITE, HALK_ESIK } = require('./_veri.js');
const { sayfa, yanit } = require('./_sablon.js');

function yontemSayfasi(d) {
  const saatli = d.yemekler.filter((y) => y.saat != null);
  const kaynakli = d.yemekler.filter((y) => y.kaynak).length;
  const halkli = d.yemekler.filter((y) => y.halkDk != null).length;
  const ornek = ['mercimek-corbasi', 'kuru-fasulye', 'simit', 'baklava'].map((s) => d.slugIle.get(s)).filter(Boolean);

  const govde = `
<nav class="yol"><a href="/">PlateRank</a> › Yöntem</nav>
<h1>PlateRank nasıl hesaplıyor?</h1>
<p class="alt">Doyuruculuk puanı, tahmini tokluk süresi ve yiyenlerin bildirdiği saatler</p>

<p class="cevap">PlateRank, ${d.toplam} yemeği kalori başına ne kadar tok tuttuklarına göre sıralayan Türkçe bir veri sitesidir. Her yemek için üç bilgi verir: bir doyuruculuk puanı, bu puandan türetilen tahmini tokluk süresi ve, yeterli bildirim varsa, yiyenlerin bildirdiği gerçek tokluk saatlerinin orta değeri.</p>

<h2>Doyuruculuk puanı</h2>
<p>Puan ölçülmüş bir değer değil, yemekleri birbirine göre sıralayan bir hesaptır. Porsiyon başına protein, lif ve hacim (su içeriği) puanı yükseltir; kalori yoğunluğu ve şeker düşürür. Çorba ve sulu yemekler, makro tablosunda görünmeyen hacimleri nedeniyle ayrıca yukarı alınır ve her yemek kendi türündeki komşularına göre yerleştirilir.</p>
<ul class="sebep">
  <li><b>S ligi:</b> 200 ve üzeri, az kaloriyle uzun tokluk</li>
  <li><b>A ligi:</b> 150-199</li>
  <li><b>B ligi:</b> 100-149</li>
  <li><b>C ligi:</b> 70-99</li>
  <li><b>D ligi:</b> 70 altı, boş kalori</li>
</ul>

<h2>Tahmini tokluk süresi</h2>
<p>PlateRank iki süre verir. <b>Porsiyon süresi</b> "bu porsiyon seni kaç saat tutar?" sorusunun cevabıdır. <b>Aynı kaloride süre</b> ise yemekleri adil karşılaştırmak içindir: her yemeğin 300 kalorisi kaç saat tutar?</p>
<p class="cevap"><b>porsiyon süresi = taban(kalori) × verim<br>taban = 0,8 + 2,7 × (kalori ÷ 500)<sup>0,65</sup> · verim = √(puan ÷ 150), 0,6 ile 1,5 arası<br>aynı kaloride süre = taban(300) × verim</b></p>
<p>Mantığı şu: mide karışık bir öğünü kabaca dakikada birkaç kalori hızla boşaltır, yani süre önce porsiyonun enerjisine bağlıdır; büyük porsiyon daha uzun tutar. Puan ise o enerjinin ne kadar verimli doyurduğunu ölçer: protein, lif ve hacim süreyi uzatır, şeker kısaltır. Bu yüzden protein ve lif formüle ayrıca eklenmez, zaten puanın içindedir. Verimin ağırlığı en belirsiz parçadır ve yiyenlerin bildirdiği saatlerle kalibre edilecektir.</p>
<p>Sonuç yarım saate yuvarlanır. İçeceklere ve tek başına yenmeyen malzemelere süre verilmez. Bu bir tahmindir; açlık kişiye, porsiyona ve gün içindeki diğer öğünlere göre değişir. Puanlanan ${saatli.length} yemeğin tahmini süreleri ${saatYaz(Math.min(...saatli.map((y) => y.saat)))} ile ${saatYaz(Math.max(...saatli.map((y) => y.saat)))} saat arasında dağılıyor.</p>
${ornek.length ? `<p>Örnekler: ${ornek.map((y) => `<a href="/yemek/${y.slug}">${esc(y.ad)}</a> ${y.kcal} kcal, yaklaşık ${saatYaz(y.saat)} saat`).join('; ')}.</p>` : ''}

<h2>Yiyenlerin bildirdiği saatler</h2>
<p>Ziyaretçiler bir yemeğin onları kaç saat tok tuttuğunu 30 dakika ile 6 saat arasında bildirebilir. Bir yemek için en az ${HALK_ESIK} kişi bildirdiğinde orta değer (medyan) sayfada gösterilir. Giriş yapan kullanıcının bildirimi tam, giriş yapmayanınki yarım ağırlıkla sayılır; aynı kişinin aynı yemeğe verdiği yalnızca son bildirim geçerlidir. Şu an ${halkli} yemekte bu eşik aşılmış durumda.</p>

<h2>Besin değerlerinin kaynağı</h2>
<p>${kaynakli} kalemin değerleri kaynaklıdır: USDA FoodData Central, Open Food Facts (ODbL lisansı, ambalaj etiketi) ve McDonald's Türkiye'nin resmi besin değerleri tablosu. Kaynağı olan kalemlerde değer tahmin edilmez; karşılığı bulunmayan kalem yayından kaldırılır. Diğer yemeklerin değerleri tipik bir porsiyon için yaklaşıktır. Her yemek sayfasında kaynak ayrıca yazılır. Kullanım koşulları: <a href="/lisans">veri lisansı</a>.</p>

<h2>Sınırlar</h2>
<ul class="sebep">
  <li>PlateRank klinik bir araç değildir, diyet tavsiyesi vermez.</li>
  <li>Puan ve süre aynı porsiyon büyüklüğü varsayımıyla hesaplanır; porsiyon değiştikçe değer de değişir.</li>
  <li>Yiyenlerin bildirdiği saatler kişisel beyandır, kontrollü ölçüm değildir.</li>
</ul>

<h2>Veriye erişim</h2>
<p>Yemek veri seti salt okunur bir REST API üzerinden herkese açıktır. Alıntı yaparken kaynak olarak PlateRank (platerank.dev) ve ilgili yemek sayfası gösterilebilir. Sorular için iletisim@platerank.dev.</p>

<div class="cta"><a class="btn" href="/liste/hangi-yemek-kac-saat-tok-tutar">Hangi yemek kaç saat tok tutar?</a></div>
`;

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'PlateRank', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Yöntem', item: `${SITE}/yontem` },
        ],
      },
      {
        '@type': 'Dataset',
        name: 'PlateRank doyuruculuk ve tokluk süresi veri seti',
        description: `${d.toplam} yemeğin kalori, protein, lif, yağ ve şeker değerleri; kalori başına doyuruculuk puanı, tahmini tokluk süresi ve yiyenlerin bildirdiği tokluk saatleri.`,
        url: `${SITE}/yontem`,
        inLanguage: 'tr-TR',
        isAccessibleForFree: true,
        license: `${SITE}/lisans`,
        creditText: 'PlateRank (platerank.dev)',
        creator: { '@type': 'Organization', name: 'PlateRank', url: `${SITE}/`, email: 'iletisim@platerank.dev' },
        keywords: ['doyuruculuk', 'tokluk süresi', 'kalori', 'protein', 'lif', 'Türk yemekleri'],
        variableMeasured: ['kalori', 'protein', 'lif', 'yağ', 'şeker', 'doyuruculuk puanı', 'tahmini tokluk süresi (saat)', 'bildirilen tokluk süresi (dakika, medyan)'],
        distribution: [{ '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: 'https://hpxnektzsrdhqzwwkfau.supabase.co/rest/v1/yemekler' }],
      },
    ],
  };

  return sayfa({
    baslik: 'PlateRank nasıl hesaplıyor? Doyuruculuk puanı ve tokluk süresi · PlateRank',
    aciklama: `Doyuruculuk puanının ve tahmini tokluk süresinin formülü, yiyenlerin bildirdiği saatlerin nasıl sayıldığı ve besin değerlerinin kaynakları. ${d.toplam} yemek.`,
    kanonik: `${SITE}/yontem`, govde, jsonld,
    alternatlar: [{ dil: 'tr', href: `${SITE}/yontem` }, { dil: 'en', href: `${SITE}/en/method` }, { dil: 'x-default', href: `${SITE}/en/method` }],
  });
}

module.exports = {
  fetch: async function () {
    let d;
    try { d = await veri(); } catch (e) {
      return yanit('<!doctype html><meta charset="utf-8"><title>PlateRank</title><p>Şu an yüklenemedi, birazdan tekrar dene. <a href="/">Ana sayfa</a></p>', 503, 'no-store');
    }
    return yanit(yontemSayfasi(d));
  },
  _ic: { yontemSayfasi },
};
