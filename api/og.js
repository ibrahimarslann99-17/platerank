const satori = require('satori').default;
const sharp = require('sharp');

const DURUM = {
  asgari: 'sadece eksik kalmamak için',
  saglik: 'sağlıklı ve dinç olmak için',
  spor: 'düzenli spor yaparken',
  diyet: 'kilo verirken',
  yasli: '65 yaş üstü için',
  iyilesme: 'iyileşme sürecinde',
};

const ALL_TEXT =
  Object.values(DURUM).join(' ') +
  ' PLATERANK · PROTEİN HEDEFİ platerank.dev Kalori sayan çok, tokluk soran yok. Günde 0123456789 g';

let fontPromise = null;
async function getFont() {
  if (!fontPromise) {
    fontPromise = (async () => {
      const url = `https://fonts.googleapis.com/css2?family=Figtree:wght@700&text=${encodeURIComponent(ALL_TEXT)}`;
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
    })();
    fontPromise.catch(() => {
      fontPromise = null; // başarısız olursa bir sonraki istek tekrar denesin
    });
  }
  return fontPromise;
}

function buildTree(p, durumMetin) {
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
            style: {
              fontSize: 20,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#1E5A3D',
              fontWeight: 700,
            },
            children: 'PLATERANK · PROTEİN HEDEFİ',
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: 8 },
            children: [
              {
                type: 'div',
                props: {
                  style: { fontSize: 160, fontWeight: 700, color: '#15171B', lineHeight: 1, display: 'flex' },
                  children: `${p} g`,
                },
              },
              {
                type: 'div',
                props: {
                  style: { fontSize: 32, color: '#3A3F47', display: 'flex' },
                  children: `Günde ${durumMetin}`,
                },
              },
            ],
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
                props: { style: { fontSize: 26, fontWeight: 700, color: '#15171B', display: 'flex' }, children: 'platerank.dev' },
              },
              {
                type: 'div',
                props: { style: { fontSize: 18, color: '#6B7079', display: 'flex' }, children: 'Kalori sayan çok, tokluk soran yok.' },
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
      let p = (searchParams.get('p') || '100').replace(/[^0-9]/g, '');
      if (!p || p.length > 4) p = '100';
      const d = searchParams.get('d') || 'saglik';
      const durumMetin = DURUM[d] || DURUM.saglik;

      const fontData = await getFont();

      const svg = await satori(buildTree(p, durumMetin), {
        width: 1200,
        height: 630,
        fonts: [{ name: 'Figtree', data: fontData, weight: 700, style: 'normal' }],
      });

      const png = await sharp(Buffer.from(svg)).png().toBuffer();

      return new Response(png, {
        headers: {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=86400, s-maxage=86400',
        },
      });
    } catch (e) {
      return new Response('og görsel üretilemedi: ' + (e && e.message ? e.message : String(e)), {
        status: 500,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
  },
};
