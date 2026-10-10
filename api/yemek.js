// /yemek          → tüm yemeklerin dizini (mutfak mutfak)
// /yemek/:slug    → tek yemek sayfası: kalori, doyuruculuk puanı, tok tutar mı, daha tok alternatifler
// HTML sunucuda üretilir ki Google içeriği JavaScript çalıştırmadan okusun.

const { veri, esc, MUTFAKLAR, MUTFAK, LIG_BILGI, LIG_RENK, SITE } = require('./_veri.js');

const { satir, sayfa, yanit } = require('./_sablon.js');
const { LISTELER, listeKalemleri } = require('./_listeler.js');

function gectigiListeler(y, d) {
  return LISTELER.filter((t) => listeKalemleri(t, d).includes(y)).slice(0, 4);
}

function adParcala(ad) {
  const i = ad.indexOf(' (');
  if (i < 0) return { kok: ad, porsiyon: '' };
  return { kok: ad.slice(0, i), porsiyon: ad.slice(i + 2).replace(/\)\s*$/, '') };
}

function hukum(y) {
  return {
    S: 'Evet, hem de çok. Az kaloriyle uzun süre tok tutan yemeklerden.',
    A: 'Evet. Kalorisine göre güvenilir bir tokluk verir.',
    B: 'Orta. Kalorisi karşılığında ortalama bir tokluk verir.',
    C: 'Pek değil. Kalorisine göre çabuk acıktırır.',
    D: 'Hayır. Kalorisi tokluğundan büyük; yersin ama doymazsın.',
  }[y.lig];
}

function sebepler(y) {
  const s = [];
  if (y.protein >= 20) s.push(`<b>${y.protein} g protein</b> tokluğu uzatır.`);
  else if (y.protein <= 4 && y.kcal >= 150) s.push(`Protein düşük (<b>${y.protein} g</b>), bu yüzden tokluk çabuk biter.`);
  if (y.lif >= 6) s.push(`<b>${y.lif} g lif</b> sindirimi yavaşlatır, tokluğu uzatır.`);
  if ((y.tur === 'corba' || y.tur === 'salata') && y.doyuruculuk >= 150) s.push('Sulu ve hacimli yapısı mideyi az kaloriyle doldurur.');
  if (y.seker >= 20) s.push(`<b>${y.seker} g şeker</b> kan şekerini hızla yükseltir; düşüşüyle birlikte erken acıkırsın.`);
  if (y.yag >= 25) s.push(`Yağı yüksek (<b>${y.yag} g</b>): kaloriyi artırır, tokluğu aynı oranda artırmaz.`);
  if (y.kcal >= 600) s.push(`Tek porsiyonda <b>${y.kcal} kcal</b>, günlük ihtiyacın büyük bir kısmı.`);
  return s;
}

function dahaTok(y, d) {
  const alt = y.kcal * 0.75, ust = y.kcal * 1.25;
  return d.sirali
    .filter((x) => x !== y && x.kcal >= alt && x.kcal <= ust && x.doyuruculuk > y.doyuruculuk)
    .sort((a, b) => (b.mutfak === y.mutfak) - (a.mutfak === y.mutfak) || (b.tur === y.tur) - (a.tur === y.tur) || b.doyuruculuk - a.doyuruculuk)
    .slice(0, 5);
}

function komsular(y, d) {
  const ayni = d.sirali.filter((x) => x.mutfak === y.mutfak);
  const i = ayni.indexOf(y);
  const bas = Math.max(0, Math.min(i - 3, ayni.length - 7));
  return ayni.slice(bas, bas + 7).filter((x) => x !== y);
}

function yemekSayfasi(y, d) {
  const { kok, porsiyon } = adParcala(y.ad);
  const m = MUTFAK[y.mutfak] || { ad: 'Diğer', ic: '🍽️', id: y.mutfak };
  const L = LIG_BILGI[y.lig];
  const kanonik = `${SITE}/yemek/${y.kanonikSlug || y.slug}`;
  const baslik = `${y.ad} kaç kalori, tok tutar mı? · PlateRank`;
  const aciklama = `${y.ad}: ${y.kcal} kcal, ${y.protein} g protein, ${y.lif} g lif. Doyuruculuk puanı ${y.doyuruculuk} (${y.lig} ligi, ${L.kisa.toLowerCase()}). ${d.toplam} yemek arasında ${y.sira}. sırada. Daha tok tutan alternatifleri gör.`;

  const sb = sebepler(y);
  const alternatif = dahaTok(y, d);
  const komsu = komsular(y, d);

  const kisaCevap = `${y.ad}${porsiyon ? '' : ' (1 porsiyon)'} <b>${y.kcal} kalori</b>. PlateRank doyuruculuk puanı <b>${y.doyuruculuk}</b>; bu puanla <b>${y.lig} ligine</b> giriyor: ${L.uzun}. Puanlanan ${d.toplam} yemek arasında <b>${y.sira}. sırada</b>.`;

  const govde = `
<nav class="yol"><a href="/">PlateRank</a> › <a href="/yemek">Yemekler</a> › <a href="/yemek#${m.id}">${esc(m.ad)}</a></nav>
${y.gorsel ? `<figure class="foto"><img src="${y.gorsel}" alt="${esc(y.ad)}" width="1200" height="900" fetchpriority="high"><figcaption>Temsilî görsel</figcaption></figure>` : ''}
<h1>${esc(y.ad)}</h1>
<p class="alt">${m.ic} ${esc(m.ad)} mutfağı${porsiyon ? ` · porsiyon: ${esc(porsiyon)}` : ''}</p>

<div class="kart">
  <div class="skor">
    <div class="harf" style="background:${LIG_RENK[y.lig]}"><b>${y.lig}</b><span>${esc(L.kisa)}</span></div>
    <div>
      <div class="puan">${y.doyuruculuk}<small>doyuruculuk puanı</small></div>
      <div class="izah">${d.toplam} yemek arasında ${y.sira}. sırada</div>
    </div>
  </div>
  <div class="makro">
    <div><b>${y.kcal}</b><span>kcal</span></div>
    <div><b>${y.protein} g</b><span>protein</span></div>
    <div><b>${y.lif} g</b><span>lif</span></div>
    <div><b>${y.yag} g</b><span>yağ</span></div>
    <div><b>${y.seker} g</b><span>şeker</span></div>
  </div>
</div>

<h2>${esc(kok)} kaç kalori?</h2>
<p class="cevap">${kisaCevap}</p>

<h2>${esc(kok)} tok tutar mı?</h2>
<p class="cevap"><b>${hukum(y)}</b></p>
${sb.length ? `<ul class="sebep">${sb.map((s) => `<li>${s}</li>`).join('')}</ul>` : ''}

<h2>Benzer kaloride daha tok tutanlar</h2>
${alternatif.length
    ? `<ul class="liste">${alternatif.map(satir).join('')}</ul>`
    : `<p>${y.kcal} kcal civarında bundan daha tok tutan bir yemek yok. Bu kalori aralığının en iyisi.</p>`}

${komsu.length ? `<h2>${esc(m.ad)} mutfağında yakın sıralar</h2><ul class="liste">${komsu.map(satir).join('')}</ul>` : ''}

${(() => { const gl = gectigiListeler(y, d); return gl.length ? `<h2>${esc(kok)} bu listelerde</h2><ul class="liste">${gl.map((t) => `<li><a href="/liste/${t.slug}"><img class="kc" src="/img/liste/k/${t.slug}.jpg" alt="" width="48" height="36" loading="lazy" decoding="async"><span class="ad">${esc(t.kisa)}</span><span class="dg">${listeKalemleri(t, d).indexOf(y) + 1}. sırada</span></a></li>`).join('')}</ul>` : ''; })()}

<p class="not">Puan ölçülmüş bir değer değil, yemekleri birbirine göre sıralayan bir hesaptır: porsiyon başına protein, lif ve hacim puanı yükseltir; kalori yoğunluğu ve şeker düşürür. 200 ve üzeri S ligi, 70 altı D ligidir. ${y.kaynak ? `Besin değerleri kaynağı: ${esc(y.kaynak)}.` : 'Besin değerleri tipik bir porsiyon için yaklaşık değerlerdir.'}</p>

<div class="cta"><a class="btn" href="/">Kendi yemeğini PlateRank'te bul</a></div>
`;

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'PlateRank', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Yemekler', item: `${SITE}/yemek` },
          { '@type': 'ListItem', position: 3, name: y.ad, item: kanonik },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: `${kok} kaç kalori?`,
            acceptedAnswer: { '@type': 'Answer', text: `${y.ad} ${y.kcal} kalori; ${y.protein} g protein, ${y.lif} g lif, ${y.yag} g yağ ve ${y.seker} g şeker içerir.` } },
          { '@type': 'Question', name: `${kok} tok tutar mı?`,
            acceptedAnswer: { '@type': 'Answer', text: `${hukum(y)} PlateRank doyuruculuk puanı ${y.doyuruculuk} (${y.lig} ligi).` } },
        ],
      },
    ],
  };

  return sayfa({ baslik, aciklama, kanonik, govde, jsonld, ogGorsel: y.gorsel });
}

function dizinSayfasi(d) {
  const gruplar = MUTFAKLAR
    .map((m) => ({ m, liste: d.sirali.filter((y) => y.mutfak === m.id) }))
    .filter((g) => g.liste.length);
  const govde = `
<nav class="yol"><a href="/">PlateRank</a> › Yemekler</nav>
<h1>Yemeklerin kalorisi ve doyuruculuk puanı</h1>
<p class="alt">${d.toplam} yemek, kalori başına ne kadar tok tuttuğuna göre sıralandı. Bir yemeğe dokun: kaç kalori olduğunu, tok tutup tutmadığını ve aynı kaloride daha tok tutan alternatiflerini gör.</p>
<p><a class="btn" href="/liste">Hazır listeler: yüksek proteinli kahvaltı, 100 kalori altı doyurucular ve fazlası</a></p>
<div class="mutfak-nav">${gruplar.map((g) => `<a href="#${g.m.id}">${g.m.ic} ${esc(g.m.ad)}</a>`).join('')}</div>
${gruplar.map((g) => `<h2 id="${g.m.id}">${g.m.ic} ${esc(g.m.ad)}</h2><ul class="liste">${g.liste.map(satir).join('')}</ul>`).join('')}
`;
  return sayfa({
    baslik: 'Yemeklerin kalorisi ve doyuruculuk puanı · PlateRank',
    aciklama: `${d.toplam} yemeğin kalorisi, proteini ve doyuruculuk puanı. Hangi yemek tok tutar, hangisi çabuk acıktırır? Mutfak mutfak tam liste.`,
    kanonik: `${SITE}/yemek`,
    govde,
    jsonld: {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'PlateRank', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Yemekler', item: `${SITE}/yemek` },
      ],
    },
  });
}

function bulunamadi(d) {
  const govde = `<h1>Bu yemek bulunamadı</h1><p class="alt">Adı değişmiş ya da yayından kalkmış olabilir.</p>
<h2>En tok tutan 10 yemek</h2><ul class="liste">${d.sirali.slice(0, 10).map(satir).join('')}</ul>
<div class="cta"><a class="btn" href="/yemek">Tüm yemekler</a></div>`;
  return sayfa({ baslik: 'Yemek bulunamadı · PlateRank', aciklama: 'Aradığın yemek PlateRank listesinde yok.', kanonik: `${SITE}/yemek`, govde });
}

module.exports = {
  fetch: async function (request) {
    const url = new URL(request.url);
    let d;
    try {
      d = await veri();
    } catch (e) {
      return yanit('<!doctype html><meta charset="utf-8"><title>PlateRank</title><p>Şu an yüklenemedi, birazdan tekrar dene. <a href="/">Ana sayfa</a></p>', 503, 'no-store');
    }
    const s = (url.searchParams.get('s') || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!s) return yanit(dizinSayfasi(d));
    const y = d.slugIle.get(s);
    if (!y) return yanit(bulunamadi(d), 404, 'public, max-age=0, s-maxage=600');
    return yanit(yemekSayfasi(y, d));
  },
  // test için
  _ic: { yemekSayfasi, dizinSayfasi, bulunamadi },
};
