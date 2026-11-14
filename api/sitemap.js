// /sitemap-yemekler.xml → yemek dizini + her yemek sayfası
const { veri, SITE } = require('./_veri.js');
const { kiyasHazirla } = require('./_kiyas_veri.js');
const { LISTELER } = require('./_listeler.js');
const ICERIK = require('./_icerik.js');
const { IGNE_SLUG, IGNE_GUNCELLEME } = require('./_igne_sayfa.js');
const ICERIK_TARIHI = '2026-10-13'; // elle yazılmış içerik eklenen sayfaların lastmod'u; içerik değişince güncelle

module.exports = {
  fetch: async function () {
    let d;
    try { d = await veri(); } catch (e) {
      return new Response('', { status: 503, headers: { 'cache-control': 'no-store' } });
    }
    const gun = (t) => (t ? String(t).slice(0, 10) : null);
    const sonGuncelleme = d.yemekler.reduce((m, y) => {
      const t = gun(y.updated_at || y.created_at);
      return t && t > m ? t : m;
    }, '2026-09-01');
    const url = (loc, lastmod) => `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${url(`${SITE}/yemek`, sonGuncelleme)}
${url(`${SITE}/liste`, sonGuncelleme)}
${url(`${SITE}/yontem`, sonGuncelleme)}
${url(`${SITE}/tokluk-endeksi`, sonGuncelleme)}
${url(`${SITE}/${IGNE_SLUG}`, IGNE_GUNCELLEME)}
${LISTELER.map((t) => url(`${SITE}/liste/${t.slug}`, sonGuncelleme)).join('\n')}
${url(`${SITE}/kiyas`, sonGuncelleme)}
${[...kiyasHazirla(d).ciftler.values()].map((c) => url(`${SITE}/kiyas/${c.slug}`, [gun(c.a.updated_at || c.a.created_at), gun(c.b.updated_at || c.b.created_at), '2026-11-14'].filter(Boolean).sort().pop())).join('\n')}
${d.sirali.filter((y) => !y.kanonikSlug).map((y) => { const t = gun(y.updated_at || y.created_at); return url(`${SITE}/yemek/${y.slug}`, ICERIK[y.slug] && (!t || t < ICERIK_TARIHI) ? ICERIK_TARIHI : t); }).join('\n')}
</urlset>`;
    return new Response(xml, {
      headers: {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'public, max-age=0, s-maxage=21600, stale-while-revalidate=604800',
      },
    });
  },
};
