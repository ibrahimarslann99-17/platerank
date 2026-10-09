// /sitemap-yemekler.xml → yemek dizini + her yemek sayfası
const { veri, SITE } = require('./_veri.js');

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
${d.sirali.filter((y) => !y.kanonikSlug).map((y) => url(`${SITE}/yemek/${y.slug}`, gun(y.updated_at || y.created_at))).join('\n')}
</urlset>`;
    return new Response(xml, {
      headers: {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'public, max-age=0, s-maxage=21600, stale-while-revalidate=604800',
      },
    });
  },
};
