const satori = require('satori').default;
const sharp = require('sharp');

const DURUM = {
  asgari: 'sadece eksik kalmamak için',
  saglik: 'sağlıklı ve dinç olmak için',
  spor: 'düzenli spor yaparken',
  diyet: 'kilo verirken',
  yasli: '65 yaş üstü için',
  iyilesme: 'iyileşme sürecinde',
  igne: 'zayıflama iğnesi kullanırken',
};

// İngilizce kart (?l=en): /en'den gelen paylaşımlar
const DURUM_EN = {
  asgari: 'just to avoid falling short',
  saglik: 'to stay healthy and energetic',
  spor: 'while training regularly',
  diyet: 'while losing weight',
  yasli: 'for people over 65',
  iyilesme: 'while recovering',
  igne: 'while on a weight-loss shot',
};
// Kartın alt satırı (varsa): günlük kalori, VKİ, tahmini yağ oranı. Değerler bağlantıdaki k, v (VKİ × 10), y'den gelir.
const METIN = {
  tr: { ust: 'PLATERANK · PROTEİN HEDEFİ', alt: (d) => `Günde ${d}`, slogan: 'Kalori sayan çok, tokluk soran yok.',
    kcal: 'kcal / gün', vki: 'VKİ', yag: 'tahmini yağ', vkiYaz: (v) => v.toFixed(1).replace('.', ','), yagYaz: (y) => `~%${y}` },
  en: { ust: 'PLATERANK · PROTEIN TARGET', alt: (d) => `a day, ${d}`, slogan: 'Everyone counts calories. Nobody asks about fullness.',
    kcal: 'kcal / day', vki: 'BMI', yag: 'est. body fat', vkiYaz: (v) => v.toFixed(1), yagYaz: (y) => `~${y}%` },
};

// Bağlantıdan gelen sayı: yalnızca rakam, verilen aralıkta değilse yok sayılır
function sayi(ham, alt, ust) {
  const s = String(ham || '').replace(/[^0-9]/g, '');
  if (!s || s.length > 5) return null;
  const n = Number(s);
  return n >= alt && n <= ust ? n : null;
}

const ALL_TEXT =
  Object.values(DURUM).join(' ') + ' ' + Object.values(DURUM_EN).join(' ') +
  ' PLATERANK · PROTEİN HEDEFİ PROTEIN TARGET platerank.dev Kalori sayan çok, tokluk soran yok. Everyone counts calories. Nobody asks about fullness. Günde a day, 0123456789 g' +
  ' kcal / gün day VKİ BMI tahmini yağ est. body fat ~%,.';

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

function olcu(deger, etiket) {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', gap: 2 },
      children: [
        { type: 'div', props: { style: { fontSize: 44, fontWeight: 700, color: '#1E5A3D', lineHeight: 1.1, display: 'flex' }, children: deger } },
        { type: 'div', props: { style: { fontSize: 22, color: '#6B7079', display: 'flex' }, children: etiket } },
      ],
    },
  };
}

function buildTree(p, durumMetin, M, ek = {}) {
  const olculer = [];
  if (ek.kcal) olculer.push(olcu(String(ek.kcal), M.kcal));
  if (ek.vki) olculer.push(olcu(M.vkiYaz(ek.vki), M.vki));
  if (ek.yag) olculer.push(olcu(M.yagYaz(ek.yag), M.yag));
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
            children: M.ust,
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
                  children: M.alt(durumMetin),
                },
              },
              ...(olculer.length ? [{ type: 'div', props: { style: { display: 'flex', gap: 56, marginTop: 28 }, children: olculer } }] : []),
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
                props: { style: { fontSize: 18, color: '#6B7079', display: 'flex' }, children: M.slogan },
              },
            ],
          },
        },
      ],
    },
  };
}

module.exports = {
  _ic: { buildTree, METIN, sayi },
  fetch: async function (request) {
    try {
      const { searchParams } = new URL(request.url);
      let p = (searchParams.get('p') || '100').replace(/[^0-9]/g, '');
      if (!p || p.length > 4) p = '100';
      const d = searchParams.get('d') || 'saglik';
      const en = searchParams.get('l') === 'en';
      const durumMetin = en ? (DURUM_EN[d] || DURUM_EN.saglik) : (DURUM[d] || DURUM.saglik);

      const fontData = await getFont();

      const vki10 = sayi(searchParams.get('v'), 100, 700);
      const ek = { kcal: sayi(searchParams.get('k'), 500, 9999), vki: vki10 ? vki10 / 10 : null, yag: sayi(searchParams.get('y'), 3, 60) };

      const svg = await satori(buildTree(p, durumMetin, en ? METIN.en : METIN.tr, ek), {
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
