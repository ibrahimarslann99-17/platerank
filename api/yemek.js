// /yemek          → tüm yemeklerin dizini (mutfak mutfak)
// /yemek/:slug    → tek yemek sayfası: kalori, doyuruculuk puanı, tok tutar mı, daha tok alternatifler
// HTML sunucuda üretilir ki Google içeriği JavaScript çalıştırmadan okusun.

const { veri, esc, saatYaz, dkYaz, MUTFAKLAR, MUTFAK, LIG_BILGI, LIG_RENK, SITE } = require('./_veri.js');
const ICERIK = require('./_icerik.js');

const { satir, sayfa, yanit, surgu } = require('./_sablon.js');
const { LISTELER, listeKalemleri } = require('./_listeler.js');
const { enAdres } = require('./_en_veri.js');

// Türkçe sayfanın İngilizce karşılığı varsa hreflang üçlüsü (x-default İngilizce)
function dilAlternatif(tr, en) {
  return en ? [{ dil: 'tr', href: tr }, { dil: 'en', href: en }, { dil: 'x-default', href: en }] : undefined;
}

const TOK_CSS = `
.tokcevap{display:flex;gap:16px;align-items:center;background:var(--forest);color:#fff;border-radius:22px;padding:16px 18px;margin:0 0 16px}
.tokcevap .ts{flex:0 0 92px;height:92px;border-radius:50%;background:var(--lime);color:var(--forest);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Bricolage Grotesque',sans-serif;line-height:1}
.tokcevap .ts small{font-size:11px;font-weight:600}
.tokcevap .ts b{font-size:34px;font-weight:800;margin:2px 0}
.tokcevap .ts span{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.tokcevap p{margin:0;font-size:16px;line-height:1.45;color:#e3eee6}
@media (max-width:480px){.tokcevap{gap:12px;padding:14px}.tokcevap .ts{flex-basis:78px;height:78px}.tokcevap .ts b{font-size:28px}}
`;

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

// Sayıya iyelik eki: 76 → "76'sı", ablatif "76'sından". Son okunan kelimeye göre.
const IYELIK_BIRLER = ['', 'i', 'si', 'ü', 'ü', 'i', 'sı', 'si', 'i', 'u'];
const IYELIK_ONLAR = ['ı', 'u', 'si', 'u', 'ı', 'si', 'ı', 'i', 'i', 'ı'];
function iyelik(n) {
  if (n === 100) return "100'ü";
  const e = n % 10 ? IYELIK_BIRLER[n % 10] : IYELIK_ONLAR[Math.floor(n / 10)];
  return `${n}'${e}`;
}
function iyelikDen(n) { const k = iyelik(n); return k + (/[iü]$/.test(k) ? 'nden' : 'ndan'); }

// "Kaç saat tok tutar?" sorusunun tek cümlelik cevabı. Hesap tahmini; halkın saati varsa yanına eklenir.
function saatCevabi(y, kok) {
  if (y.saat == null) return null;
  const S = saatYaz(y.saat);
  let c = `${kok} hesaba göre yaklaşık ${S} saat tok tutar.`;
  const uzun = 100 - y.saatYuzde;
  if (y.saatYuzde >= 60) c += ` Bu, puanlanan yemeklerin %${iyelikDen(y.saatYuzde)} uzun.`;
  else if (uzun >= 95) c += ' Puanlanan yemeklerin neredeyse hepsi bundan uzun tok tutuyor.';
  else if (y.saatYuzde <= 30) c += ` Bu, puanlanan yemeklerin çoğundan kısa; %${iyelik(uzun)} daha uzun tok tutuyor.`;
  if (y.halkDk != null) c += ` Yiyenlerden ${y.halkN} kişinin bildirdiği orta değer ${dkYaz(y.halkDk)}.`;
  return c;
}

function yemekSayfasi(y, d) {
  const { kok, porsiyon } = adParcala(y.ad);
  const m = MUTFAK[y.mutfak] || { ad: 'Diğer', ic: '🍽️', id: y.mutfak };
  const L = LIG_BILGI[y.lig];
  const kanonik = `${SITE}/yemek/${y.kanonikSlug || y.slug}`;
  const saatli = y.saat != null;
  const S = saatli ? saatYaz(y.saat) : null;
  const baslik = saatli
    ? `${kok} kaç saat tok tutar, kaç kalori? · PlateRank`
    : `${y.ad} kaç kalori, tok tutar mı? · PlateRank`;
  const aciklama = saatli
    ? `${kok} yaklaşık ${S} saat tok tutar${y.halkDk != null ? ` (yiyenlere göre ${dkYaz(y.halkDk)})` : ''}. ${y.kcal} kcal, ${y.protein} g protein, ${y.lif} g lif; ${y.lig} ligi, ${d.toplam} yemek arasında ${y.sira}. sırada. Daha uzun tok tutan alternatifleri gör.`
    : `${y.ad}: ${y.kcal} kcal, ${y.protein} g protein, ${y.lif} g lif. Doyuruculuk puanı ${y.doyuruculuk} (${y.lig} ligi, ${L.kisa.toLowerCase()}). ${d.toplam} yemek arasında ${y.sira}. sırada. Daha tok tutan alternatifleri gör.`;
  const sc = saatCevabi(y, kok);

  const sb = sebepler(y);
  const ic = ICERIK[y.slug] || null;   // elle yazılmış içerik (varsa)
  const alternatif = dahaTok(y, d);
  const komsu = komsular(y, d);

  const kisaCevap = `${y.ad}${porsiyon ? '' : ' (1 porsiyon)'} <b>${y.kcal} kalori</b>. PlateRank doyuruculuk puanı <b>${y.doyuruculuk}</b>; bu puanla <b>${y.lig} ligine</b> giriyor: ${L.uzun}. Puanlanan ${d.toplam} yemek arasında <b>${y.sira}. sırada</b>.`;

  const govde = `
<nav class="yol"><a href="/">PlateRank</a> › <a href="/yemek">Yemekler</a> › <a href="/yemek#${m.id}">${esc(m.ad)}</a></nav>
${y.gorsel ? `<figure class="foto"><img src="${y.gorsel}" alt="${esc(y.ad)}" width="1200" height="900" fetchpriority="high"><figcaption>Temsilî görsel</figcaption></figure>` : ''}
<h1>${saatli ? `${esc(kok)} kaç saat tok tutar?` : esc(y.ad)}</h1>
<p class="alt">${m.ic} ${esc(m.ad)} mutfağı · ${porsiyon ? `porsiyon: ${esc(porsiyon)}` : 'tipik 1 porsiyon'}, ${y.kcal} kcal. Kalori ve tok tutma süresi bu porsiyon içindir, 100 gram değil.</p>
${saatli ? `<div class="tokcevap"><div class="ts"><small>yaklaşık</small><b>${S}</b><span>saat</span></div><p>${esc(sc)}</p></div>${surgu(y.saat, LIG_RENK[y.lig])}` : ''}

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

<h2>${esc(kok)} ${saatli ? 'ne kadar tok tutar' : 'tok tutar mı'}?</h2>
<p class="cevap"><b>${hukum(y)}</b></p>
${ic ? `<p>${esc(ic.giris)}</p>` : ''}
${sb.length ? `<ul class="sebep">${sb.map((s) => `<li>${s}</li>`).join('')}</ul>` : ''}
${y.tur === 'icecek' || y.sadece_malzeme ? '' : `<div class="halk"><b>Seni kaç saat tok tuttu?</b><p>${y.halkDk != null
      ? `Hesap ${S} saat diyor, ${y.halkN} kişi ${dkYaz(y.halkDk)} dedi. Sen ne diyorsun? Tek dokunuş, giriş şart değil.`
      : `Hesap ${S} saat diyor. Yiyenlerin bildirdiği saatler Meclis-i Mide'de toplanıyor; 3 kişi bildirince ${esc(kok)} için halkın saati oturur.`}</p><a class="btn" href="/?bildir=${y.slug}" rel="nofollow">Saatini bildir</a></div>`}

${ic ? `<h2>${esc(kok)} nasıl daha tok tutar?</h2>
<ul class="sebep">${ic.dahaTok.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
<h2>Porsiyon ve hazırlanış farkı</h2>
<p>${esc(ic.porsiyon)}</p>` : ''}

<h2>Benzer kaloride daha tok tutanlar</h2>
${alternatif.length
    ? `<ul class="liste">${alternatif.map(satir).join('')}</ul>`
    : `<p>${y.kcal} kcal civarında bundan daha tok tutan bir yemek yok. Bu kalori aralığının en iyisi.</p>`}

${komsu.length ? `<h2>${esc(m.ad)} mutfağında yakın sıralar</h2><ul class="liste">${komsu.map(satir).join('')}</ul>` : ''}

${(() => { const gl = gectigiListeler(y, d); return gl.length ? `<h2>${esc(kok)} bu listelerde</h2><ul class="liste">${gl.map((t) => `<li><a href="/liste/${t.slug}"><img class="kc" src="/img/liste/k/${t.slug}.jpg" alt="" width="48" height="36" loading="lazy" decoding="async"><span class="ad">${esc(t.kisa)}</span><span class="dg">${listeKalemleri(t, d).indexOf(y) + 1}. sırada</span></a></li>`).join('')}</ul>` : ''; })()}

${ic && ic.sss.length ? `<h2>Sık sorulanlar</h2>${ic.sss.map((q) => `<h3>${esc(q.s)}</h3><p>${esc(q.c)}</p>`).join('')}` : ''}

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
          ...(saatli ? [{ '@type': 'Question', name: `${kok} kaç saat tok tutar?`,
            acceptedAnswer: { '@type': 'Answer', text: `${sc} Tokluğu en çok protein, lif ve hacim uzatır; şeker kısaltır.` } }] : []),
          { '@type': 'Question', name: `${kok} kaç kalori?`,
            acceptedAnswer: { '@type': 'Answer', text: `${y.ad} ${y.kcal} kalori; ${y.protein} g protein, ${y.lif} g lif, ${y.yag} g yağ ve ${y.seker} g şeker içerir.` } },
          { '@type': 'Question', name: `${kok} tok tutar mı?`,
            acceptedAnswer: { '@type': 'Answer', text: `${hukum(y)} PlateRank doyuruculuk puanı ${y.doyuruculuk} (${y.lig} ligi).${ic ? ' ' + ic.giris : ''}` } },
          ...(ic ? ic.sss.map((q) => ({ '@type': 'Question', name: q.s, acceptedAnswer: { '@type': 'Answer', text: q.c } })) : []),
        ],
      },
    ],
  };

  const alternatlar = y.kanonikSlug ? undefined : dilAlternatif(kanonik, enAdres(d, y.slug));
  return sayfa({ baslik, aciklama, kanonik, govde, jsonld, ogGorsel: y.gorsel, ekCss: TOK_CSS, alternatlar });
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
    alternatlar: dilAlternatif(`${SITE}/yemek`, `${SITE}/en/food`),
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
