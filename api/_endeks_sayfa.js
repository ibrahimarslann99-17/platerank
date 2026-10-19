// /tokluk-endeksi → İstanbul'da 1 saat tok kalmanın fiyatı. Basın ve paylaşım için yazıldı:
// bulgular canlı hesaptan cümleye dökülür, her fiyatın kaynağı sayfada açıkça listelenir, veri CSV olarak indirilir.

const { esc, hamSaat, LIG_RENK, SITE } = require('./_veri.js');
const { sayfa } = require('./_sablon.js');
const { ENDEKS, GRUP, endeksKur } = require('./_endeks.js');

const sayi = (n, ondalik) => n.toLocaleString('tr-TR', { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik });
const tl = (n) => (n < 10 ? sayi(n, 1) : sayi(Math.round(n), 0));
const saatY = (s) => sayi(Math.round(s * 10) / 10, 1);
const yalinAd = (ad) => ad.replace(/\s*\([^)]*\)\s*$/, '');
const slugOf = (y) => y.kanonikSlug || y.slug;

const CSS_EK = `
.te-ust{font-size:12px;font-weight:700;letter-spacing:.1em;color:var(--teal);margin:0 0 6px}
.te-ozet{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:18px 0 6px}
.te-ozet div{background:var(--card);border-radius:18px;padding:12px 12px 14px;box-shadow:0 1px 2px rgba(14,34,23,.05),0 10px 24px -14px rgba(14,34,23,.2)}
.te-ozet span{display:block;font-size:12px;color:var(--muted);line-height:1.3}
.te-ozet b{display:block;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:28px;line-height:1.1;margin:4px 0 2px}
.te-ozet b small{font-size:13px;font-weight:700;color:var(--muted);margin-left:3px}
.te-ozet em{font-style:normal;font-size:13px;font-weight:600}
.te-ozet .koyu{background:var(--forest);color:#fff}.te-ozet .koyu span{color:#b9cfc0}.te-ozet .koyu b small{color:#b9cfc0}.te-ozet .koyu b{color:var(--lime)}
.te-filtre{display:flex;flex-wrap:wrap;gap:6px;margin:22px 0 8px}
.te-filtre button{font:inherit;font-size:14px;font-weight:600;border:0;background:var(--card);color:var(--ink);padding:7px 13px;border-radius:999px;cursor:pointer}
.te-filtre button.on{background:var(--forest);color:var(--lime)}
ol.te-liste{list-style:none;margin:0;padding:0}
.te-s{display:flex;align-items:center;gap:10px;padding:12px 2px;border-bottom:1px solid var(--line)}
.te-s[hidden]{display:none}
.te-no{flex:0 0 24px;font-size:13px;color:var(--muted);text-align:right}
.te-orta{flex:1;min-width:0}
.te-ad{display:flex;align-items:center;gap:7px;font-weight:600}
.te-ad a{color:var(--ink);text-decoration:none}
.te-lg{flex:none;width:20px;height:20px;border-radius:6px;color:#fff;font-size:12px;font-weight:800;display:grid;place-items:center;font-family:'Bricolage Grotesque',sans-serif}
.te-meta{font-size:13px;color:var(--muted);margin-top:1px}
.te-bos{display:inline-block;font-size:11px;font-weight:700;color:#8F2A26;background:#FBE6E4;border-radius:999px;padding:1px 8px;margin-left:4px;vertical-align:1px}
.te-bar{height:6px;border-radius:4px;background:var(--card);margin-top:7px;overflow:hidden}
.te-bar i{display:block;height:100%;border-radius:4px}
.te-tl{flex:0 0 74px;text-align:right}
.te-tl b{display:block;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:22px;line-height:1}
.te-tl small{font-size:11px;color:var(--muted)}
details.te-k{border-bottom:1px solid var(--line);padding:8px 0}
details.te-k summary{cursor:pointer;font-size:15px}
details.te-k ul{margin:6px 0 2px;padding-left:20px;font-size:14px;color:var(--muted)}
.te-cite{background:var(--card);border-radius:14px;padding:12px 14px;font-size:14px}
@media (max-width:480px){.te-ozet{grid-template-columns:1fr 1fr}.te-ozet div:first-child{grid-column:1/-1}.te-tl{flex-basis:64px}.te-tl b{font-size:20px}}
`;

function bulgular(r) {
  const ilk = r[0], son = r[r.length - 1];
  const disari = r.filter((x) => x.grup !== 'evde' && x.grup !== 'market');
  const ogun = disari.filter((x) => x.y.tur === 'ana' || x.y.tur === 'corba');
  const evde = r.filter((x) => x.grup === 'evde');
  const ad = (x) => yalinAd(x.ad);
  const c = [];
  c.push(`İstanbul'da 1 saat tok kalmanın en ucuz yolu ${ad(ilk).toLocaleLowerCase('tr')}: saati ${tl(ilk.saatFiyat)} lira. En pahalısı ${ad(son)}: saati ${tl(son.saatFiyat)} lira, yani ${Math.round(son.saatFiyat / ilk.saatFiyat)} katı.`);
  if (ogun.length > 1) {
    const [o1, o2] = ogun, pah = ogun[ogun.length - 1];
    c.push(`Dışarıda bir öğün olarak en verimlisi ${ad(o1).toLocaleLowerCase('tr')} ve ${ad(o2).toLocaleLowerCase('tr')}: saatlik tokluk ${tl(o1.saatFiyat)}-${tl(o2.saatFiyat)} lira. ${ad(pah)} aynı tokluğu ${Math.round(pah.saatFiyat / o1.saatFiyat)} kat pahalıya veriyor.`);
  }
  const bm = r.find((x) => x.ad === 'Big Mac'), td = r.find((x) => x.ad === 'Tavuk döner dürüm');
  if (bm && td && bm.saatFiyat < td.saatFiyat) {
    const pahali = r.filter((x) => x.grup !== 'zincir' && x.saatFiyat > bm.saatFiyat && x.grup !== 'market').length;
    c.push(`Şaşırtan sonuç: Big Mac, tavuk dönerden ucuza tok tutuyor (saati ${tl(bm.saatFiyat)} liraya karşı ${tl(td.saatFiyat)} lira). Fiyatı daha yüksek ama porsiyonu daha uzun tutuyor: ${saatY(bm.saat)} saate karşı ${saatY(td.saat)} saat. Listede ${pahali} yemek Big Mac'ten pahalıya tok tutuyor.`);
  }
  if (evde.length && disari.length) c.push(`Evde hazırlanan seçeneklerde saatlik tokluk ${tl(evde[0].saatFiyat)}-${tl(evde[evde.length - 1].saatFiyat)} lira; dışarıdaki en ucuz seçenek ${tl(disari[0].saatFiyat)} lira.`);
  return c;
}

function endeksSayfasi(d) {
  const r = endeksKur(d, hamSaat);
  const max = Math.max(...r.map((x) => x.saatFiyat));
  const orta = r[Math.floor(r.length / 2)].saatFiyat;
  const ilk = r[0], son = r[r.length - 1];
  const disari = r.filter((x) => x.grup !== 'evde' && x.grup !== 'market');
  const ogun = disari.filter((x) => x.y.tur === 'ana' || x.y.tur === 'corba');
  const c = bulgular(r);
  const gruplar = ['hepsi', ...Object.keys(GRUP).filter((g) => r.some((x) => x.grup === g))];

  const satirHtml = (x) => {
    const y = x.y, renk = LIG_RENK[y.lig];
    // D ligi: kalori yoğun, saat başına ucuz görünebilir. Ucuz yarıdaysa "ucuz ama boş", pahalı yarıdaysa sadece "boş kalori".
    const bos = y.lig === 'D' ? (x.saatFiyat < orta ? 'ucuz ama boş' : 'boş kalori') : '';
    return `<li class="te-s" data-g="${x.grup}"><span class="te-no">${x.sira}</span><div class="te-orta">`
      + `<div class="te-ad"><a href="/yemek/${slugOf(y)}">${esc(yalinAd(x.ad))}</a><span class="te-lg" style="background:${renk}" title="${y.lig} ligi">${y.lig}</span></div>`
      + `<div class="te-meta">${GRUP[x.grup]} · ${tl(x.fiyat)} TL · ${saatY(x.saat)} saat tok tutar${bos ? `<span class="te-bos">${bos}</span>` : ''}</div>`
      + `<div class="te-bar"><i style="width:${Math.max(1.5, (x.saatFiyat / max) * 100).toFixed(1)}%;background:${renk}"></i></div>`
      + `</div><div class="te-tl"><b>${tl(x.saatFiyat)}</b><small>TL / saat</small></div></li>`;
  };

  const kaynakHtml = (x) => `<details class="te-k"><summary>${esc(yalinAd(x.ad))} · ${tl(x.fiyat)} TL${x.kaynak.length > 1 ? ` · ${x.kaynak.length} kaynağın orta değeri` : ''}</summary><ul>`
    + x.kaynak.map(([yer, f]) => `<li>${esc(yer)}: ${typeof f === 'number' ? `${sayi(f, Number.isInteger(f) ? 0 : 2)} TL` : esc(f)}</li>`).join('')
    + (x.hesap ? `<li>Hesap: ${esc(x.hesap)}</li>` : '') + '</ul></details>';

  const govde = `
<nav class="yol"><a href="/">PlateRank</a> › Tokluk Endeksi</nav>
<p class="te-ust">${esc(ENDEKS.donem.toLocaleUpperCase('tr'))} · ${esc(ENDEKS.sehir.toLocaleUpperCase('tr'))}</p>
<h1>Tokluk Endeksi: 1 saat tok kalmak kaç lira?</h1>
<p class="alt">${r.length} yemeğin fiyatını tok tutma süresiyle birleştirdik. Ölçü basit: porsiyon fiyatı ÷ porsiyonun tahmini tok tutma süresi.</p>

<div class="te-ozet">
<div class="koyu"><span>En ucuz tokluk</span><b>${tl(ilk.saatFiyat)}<small>TL/sa</small></b><em>${esc(yalinAd(ilk.ad))}</em></div>
<div><span>Dışarıda en ucuz öğün</span><b>${tl(ogun[0].saatFiyat)}<small>TL/sa</small></b><em>${esc(yalinAd(ogun[0].ad))}</em></div>
<div><span>En pahalı</span><b>${tl(son.saatFiyat)}<small>TL/sa</small></b><em>${esc(yalinAd(son.ad))}</em></div>
</div>

${c.map((t, i) => `<p${i === 0 ? ' class="cevap"' : ''}>${esc(t)}</p>`).join('\n')}

<div class="te-filtre" role="group" aria-label="Gruba göre süz">${gruplar.map((g, i) => `<button type="button" data-g="${g}"${i === 0 ? ' class="on"' : ''}>${g === 'hepsi' ? 'Hepsi' : GRUP[g]}</button>`).join('')}</div>
<ol class="te-liste">${r.map(satirHtml).join('')}</ol>
<p class="not"><b>Ucuz ama boş:</b> D ligindeki yiyecekler kalorisi yoğun olduğu için saat başına ucuz görünebilir. Ama aynı kalori, listenin üst sıralarındaki bir yemekte çok daha uzun tok tutar. Harfler PlateRank'in kalori başına doyuruculuk ligidir (S en iyi, D boş kalori).</p>

<h2>Nasıl hesapladık?</h2>
<p><b>1 saat tokluğun fiyatı = porsiyon fiyatı ÷ porsiyonun tok tutma süresi.</b> Süre, PlateRank'in porsiyon süresidir: porsiyonun kalorisinden bir taban süre çıkar, yemeğin doyuruculuk puanıyla çarpılır. Bu bir tahmindir, ölçüm değildir; formül ve sınırları <a href="/yontem">yöntem sayfasında</a>. Endekste süreler yarım saate yuvarlanmadan kullanıldı.</p>
<ul class="sebep">
<li><b>Restoran ve sokak yemekleri:</b> ${esc(ENDEKS.restoranKaynak)}, ${esc(ENDEKS.tarihYazi)}. Her yemek için birden çok restoranın orta değeri (medyan) alındı; menü değil tek ürün fiyatı.</li>
<li><b>Bunlar paket servis fiyatları.</b> Dükkânda yemek genellikle daha ucuzdur; örneğin simit fırında 30 TL, paket serviste 50-55 TL. Simit bu yüzden fırın tarifesiyle yazıldı.</li>
<li><b>Evde ve market:</b> ${esc(ENDEKS.marketKaynak)}. Porsiyon fiyatı raf fiyatından çevrildi; her çevirme aşağıda açıkça yazıyor.</li>
<li>${esc(ENDEKS.cikanlar)}</li>
<li>Endeks her ay yenilenir.</li>
</ul>

<h2>Fiyatların kaynağı</h2>
${r.map(kaynakHtml).join('\n')}

<h2>Veriyi kullan</h2>
<p>Tablonun tamamı <a href="/tokluk-endeksi.csv">CSV olarak indirilebilir</a>. Haber ve yazılarda kaynak gösterilerek serbestçe kullanılabilir.</p>
<p class="te-cite">Kaynak: PlateRank Tokluk Endeksi, ${esc(ENDEKS.donem)} (platerank.dev/tokluk-endeksi)</p>
<p>Sorular için: iletisim@platerank.dev</p>
<div class="cta"><a class="btn" href="/">Yemeğinin kaç saat tok tuttuğuna bak</a></div>

<script>document.querySelector('.te-filtre').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var g=b.getAttribute('data-g');document.querySelectorAll('.te-filtre button').forEach(function(x){x.classList.toggle('on',x===b)});document.querySelectorAll('.te-s').forEach(function(li){li.hidden=!(g==='hepsi'||li.getAttribute('data-g')===g)})});</script>
`;

  const kanonik = `${SITE}/tokluk-endeksi`;
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'PlateRank', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Tokluk Endeksi', item: kanonik },
      ] },
      { '@type': 'Dataset',
        name: `PlateRank Tokluk Endeksi, ${ENDEKS.donem}`,
        description: `${ENDEKS.sehir}'da ${r.length} yemeğin porsiyon fiyatı, tahmini tok tutma süresi ve 1 saat tokluğun fiyatı (TL).`,
        url: kanonik, inLanguage: 'tr-TR', isAccessibleForFree: true, license: `${SITE}/lisans`,
        dateModified: ENDEKS.tarih, temporalCoverage: ENDEKS.tarih, spatialCoverage: ENDEKS.sehir,
        creditText: 'PlateRank (platerank.dev)',
        creator: { '@type': 'Organization', name: 'PlateRank', url: `${SITE}/`, email: 'iletisim@platerank.dev' },
        variableMeasured: ['porsiyon fiyatı (TL)', 'tahmini tok tutma süresi (saat)', '1 saat tokluğun fiyatı (TL)'],
        distribution: [{ '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `${SITE}/tokluk-endeksi.csv` }] },
    ],
  };

  return sayfa({
    baslik: `Tokluk Endeksi ${ENDEKS.donem}: İstanbul'da 1 saat tok kalmak kaç lira? · PlateRank`,
    aciklama: `${r.length} yemekte 1 saat tokluğun fiyatı: ${yalinAd(ilk.ad).toLocaleLowerCase('tr')} ${tl(ilk.saatFiyat)} TL, ${yalinAd(son.ad)} ${tl(son.saatFiyat)} TL. Kaynaklı fiyatlar, ${ENDEKS.donem}.`,
    kanonik, govde, jsonld, ekCss: CSS_EK,
  });
}

function endeksCsv(d) {
  const r = endeksKur(d, hamSaat);
  const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const bas = ['sira', 'yemek', 'grup', 'lig', 'porsiyon_kcal', 'porsiyon_fiyat_tl', 'tok_sure_saat', 'bir_saat_tokluk_tl', 'kaynak_sayisi', 'kaynaklar', 'hesap', 'tarih'];
  const satir = (x) => [x.sira, x.ad, GRUP[x.grup], x.y.lig, x.y.kcal, x.fiyat.toFixed(2), x.saat.toFixed(2), x.saatFiyat.toFixed(2), x.kaynak.length,
    x.kaynak.map(([a, f]) => `${a}: ${f}`).join(' | '), x.hesap || '', ENDEKS.tarih].map(q).join(',');
  return '﻿' + [bas.join(','), ...r.map(satir)].join('\r\n') + '\r\n';
}

module.exports = { endeksSayfasi, endeksCsv };
