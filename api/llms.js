// /llms.txt → yapay zekâ aramaları (ChatGPT, Perplexity, Claude, Gemini) için sitenin özeti.
// llmstxt.org biçimi: başlık, tek paragraf özet, sonra bağlantı listeleri. Canlı veriden üretilir.

const { veri, saatYaz, SITE } = require('./_veri.js');
const { LISTELER, listeKalemleri } = require('./_listeler.js');

function metin(d) {
  const saatli = d.sirali.filter((y) => y.saat != null && !y.kanonikSlug);
  const enUzun = saatli.slice().sort((a, b) => b.saat - a.saat || b.doyuruculuk - a.doyuruculuk).slice(0, 15);
  const enKisa = saatli.slice().sort((a, b) => a.saat - b.saat || a.doyuruculuk - b.doyuruculuk).slice(0, 10);
  const satir = (y) => `- [${y.ad}](${SITE}/yemek/${y.slug}): yaklaşık ${saatYaz(y.saat)} saat tok tutar, ${y.kcal} kcal, ${y.protein} g protein, ${y.lif} g lif, doyuruculuk puanı ${y.doyuruculuk} (${y.lig} ligi)`;
  return `# PlateRank

> PlateRank (platerank.dev), ${d.toplam} yemeği kalori başına ne kadar tok tuttuklarına göre sıralayan Türkçe bir veri sitesidir. Her yemek için kalori ve besin değerleri, bir doyuruculuk puanı, bu puandan türetilen tahmini tokluk süresi (1-5 saat) ve yeterli bildirim varsa yiyenlerin bildirdiği gerçek tokluk saatlerinin medyanı verilir.

Tahmini tokluk süresi = 1 + (puan ÷ 280) × 3,2 + protein (g) × 0,02 + lif (g) × 0,05; 1-5 saat arasında sınırlanır, yarım saate yuvarlanır. Puan ölçüm değil, yemekleri birbirine göre sıralayan bir hesaptır: protein, lif ve hacim artırır; kalori yoğunluğu ve şeker düşürür. Ligler: S 200+, A 150-199, B 100-149, C 70-99, D 70 altı. Besin değerlerinin bir kısmı USDA FoodData Central, Open Food Facts ve McDonald's Türkiye resmi tablosundan gelir; kaynak her yemek sayfasında yazılıdır. Klinik araç değildir, diyet tavsiyesi vermez. Alıntılarda kaynak: PlateRank (platerank.dev).

## Yöntem

- [PlateRank nasıl hesaplıyor?](${SITE}/yontem): puan ve tokluk süresi formülü, yiyenlerin bildirimlerinin nasıl sayıldığı, kaynaklar ve sınırlar

## Listeler

${LISTELER.map((t) => { const l = listeKalemleri(t, d); return `- [${t.baslik}](${SITE}/liste/${t.slug}): ${l.length} yemek; ilk sıralar ${l.slice(0, 3).map((y) => y.ad.split(' (')[0]).join(', ')}`; }).join('\n')}

## En uzun tok tutan yemekler

${enUzun.map(satir).join('\n')}

## En çabuk acıktıranlar

${enKisa.map(satir).join('\n')}

## Diğer

- [Tüm yemekler](${SITE}/yemek): ${d.toplam} yemeğin mutfak mutfak dizini; her yemeğin kendi sayfası var (/yemek/<ad>)
- [Site haritası](${SITE}/sitemap-yemekler.xml)
`;
}

module.exports = {
  fetch: async function () {
    let d;
    try { d = await veri(); } catch (e) {
      return new Response('', { status: 503, headers: { 'cache-control': 'no-store' } });
    }
    return new Response(metin(d), {
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=0, s-maxage=21600, stale-while-revalidate=604800' },
    });
  },
};
