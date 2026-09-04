const satori = require('satori').default;
const sharp = require('sharp');

function kisalt(s, n) {
  s = String(s);
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

// Font, her istekte gerçek içerikten (yemek adları dahil) türetilen text= parametresiyle
// çekiliyor — protein kartındaki sabit ALL_TEXT'in aksine burada içerik dinamik (kullanıcının
// seçtiği yemek adları), o yüzden global önbellek kullanılmıyor: her istek kendi karakter
// kümesini ister, böylece hiçbir Türkçe karakter eksik glif olarak çıkmaz.
async function getFont(text) {
  const url = `https://fonts.googleapis.com/css2?family=Figtree:wght@700&text=${encodeURIComponent(text)}`;
  const css = await (
    await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36',
      },
    })
  ).text();
  const m = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype|woff)'\)/);
  if (!m) throw new Error('font css eşleşmedi');
  const res = await fetch(m[1]);
  if (res.status !== 200) throw new Error('font dosyası indirilemedi');
  return Buffer.from(await res.arrayBuffer());
}

function itemRow(item, i) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px dashed #D2D1C4',
        paddingTop: 14,
        paddingBottom: 14,
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: 16 },
            children: [
              {
                type: 'div',
                props: {
                  style: { fontSize: 15, color: '#6B7079', width: 26, display: 'flex' },
                  children: String(i + 1).padStart(2, '0'),
                },
              },
              {
                type: 'div',
                props: { style: { fontSize: 24, fontWeight: 600, color: '#15171B', display: 'flex' }, children: kisalt(item.a, 38) },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { fontSize: 17, color: '#6B7079', display: 'flex', whiteSpace: 'nowrap' },
            children: item.p != null ? `${item.k} kcal · ${item.p} g protein` : `${item.k} kcal`,
          },
        },
      ],
    },
  };
}

function buildTree(items, toplamKcal, toplamProtein) {
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#F5F5F2',
        padding: '64px',
        fontFamily: 'Figtree',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { fontSize: 20, letterSpacing: 4, textTransform: 'uppercase', color: '#1E5A3D', fontWeight: 700, display: 'flex' },
            children: 'PLATERANK · MENÜM',
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' },
            children: items.map((it, i) => itemRow(it, i)),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #D2D1C4',
              paddingTop: 24,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { fontSize: 30, fontWeight: 700, color: '#15171B', display: 'flex' },
                  children: `Toplam: ${toplamKcal} kcal · ${toplamProtein} g protein`,
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
                  children: [
                    { type: 'div', props: { style: { fontSize: 22, fontWeight: 700, color: '#15171B', display: 'flex' }, children: 'platerank.dev' } },
                    { type: 'div', props: { style: { fontSize: 14, color: '#6B7079', display: 'flex' }, children: 'Kalori sayan çok, tokluk soran yok.' } },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

module.exports = {
  fetch: async function (request) {
    try {
      const { searchParams } = new URL(request.url);
      const raw = searchParams.get('i') || '';
      let items = [];
      try {
        const json = Buffer.from(decodeURIComponent(raw), 'base64').toString('utf8');
        items = JSON.parse(json);
      } catch (e) {
        items = [];
      }
      if (!Array.isArray(items) || !items.length) {
        return new Response('menü verisi geçersiz', { status: 400, headers: { 'content-type': 'text/plain; charset=utf-8' } });
      }
      items = items
        .slice(0, 6)
        .map((it) => ({
          a: String(it.a || '').replace(/[^\p{L}\p{N} .,()İıĞğÜüŞşÖöÇç-]/gu, '').slice(0, 60) || 'Yemek',
          k: Math.max(0, Math.min(5000, Math.round(Number(it.k) || 0))),
          p: it.p == null ? null : Math.max(0, Math.min(200, Math.round(Number(it.p)))),
        }));

      const toplamKcal = items.reduce((s, it) => s + it.k, 0);
      const toplamProtein = items.reduce((s, it) => s + (it.p || 0), 0);

      const metinToplam = items.map((it) => (it.p != null ? `${it.a} ${it.k} kcal ${it.p} g protein` : `${it.a} ${it.k} kcal`)).join(' ');
      const ALL_TEXT =
        'PLATERANK · MENÜM Toplam: kcal g protein platerank.dev Kalori sayan çok, tokluk soran yok. 0123456789 · ' + metinToplam;

      const fontData = await getFont(ALL_TEXT);

      const svg = await satori(buildTree(items, toplamKcal, toplamProtein), {
        width: 1200,
        height: 630,
        fonts: [{ name: 'Figtree', data: fontData, weight: 700, style: 'normal' }],
      });

      const png = await sharp(Buffer.from(svg)).png().toBuffer();

      return new Response(png, {
        headers: {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=3600',
        },
      });
    } catch (e) {
      return new Response('menü kartı üretilemedi: ' + (e && e.message ? e.message : String(e)), {
        status: 500,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
  },
};
