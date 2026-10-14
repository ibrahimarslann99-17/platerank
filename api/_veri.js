// Yemek sayfaları ve site haritası için ortak veri katmanı.
// Veri Supabase'in herkese açık (salt-okunur) REST API'sinden gelir; sıcak fonksiyonda 10 dk bellekte tutulur.

const SUPABASE_URL = 'https://hpxnektzsrdhqzwwkfau.supabase.co';
const SUPABASE_KEY = 'sb_publishable_D1jGcv4slm8P3fBsPpbKOA_WkoH2PjJ';
const SITE = 'https://platerank.dev';

// Yemek görselleri: araclar/gorsel_isle.py img/yemek/ altına WebP ve liste.json yazar
let GORSELLER = new Set();
try { GORSELLER = new Set(require('../img/yemek/liste.json')); } catch (e) { /* henüz görsel yok */ }

const MUTFAKLAR = [
  { id: 'tr', ad: 'Türk', ic: '🇹🇷' }, { id: 'temel', ad: 'Temel Gıdalar', ic: '🥚' },
  { id: 'veg', ad: 'Vejeteryan', ic: '🥦' }, { id: 'zincir', ad: 'Zincir', ic: '🍟' },
  { id: 'market', ad: 'Market', ic: '🛒' }, { id: 'it', ad: 'İtalyan', ic: '🇮🇹' },
  { id: 'jp', ad: 'Japon', ic: '🇯🇵' }, { id: 'mx', ad: 'Meksika', ic: '🇲🇽' },
  { id: 'cn', ad: 'Çin', ic: '🇨🇳' }, { id: 'us', ad: 'Amerikan', ic: '🇺🇸' },
  { id: 'kr', ad: 'Kore', ic: '🇰🇷' }, { id: 'th', ad: 'Tayland', ic: '🇹🇭' },
  { id: 'in', ad: 'Hint', ic: '🇮🇳' }, { id: 'me', ad: 'Ortadoğu', ic: '🌙' },
  { id: 'hm', ad: 'Keşifler', ic: '🔦' },
];
const MUTFAK = Object.fromEntries(MUTFAKLAR.map((m) => [m.id, m]));

const LIG_BILGI = {
  S: { kisa: 'Şampiyon', uzun: 'tok tutma şampiyonu, az kaloriyle uzun tokluk' },
  A: { kisa: 'Güçlü', uzun: 'güçlü doyurucu, güvenilir seçim' },
  B: { kisa: 'Orta', uzun: 'ortalama, idare eder' },
  C: { kisa: 'Zayıf', uzun: 'zayıf doyurucu, çabuk acıktırır' },
  D: { kisa: 'Boş kalori', uzun: 'boş kalori, yedin ama doymadın' },
};
const LIG_RENK = { S: '#1E7A4C', A: '#5A9135', B: '#C2961B', C: '#D06C28', D: '#BF3B38' };

function lig(p) {
  if (p >= 200) return 'S';
  if (p >= 150) return 'A';
  if (p >= 100) return 'B';
  if (p >= 70) return 'C';
  return 'D';
}

const TR_HARF = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u',
  Ç: 'c', Ğ: 'g', İ: 'i', I: 'i', Ö: 'o', Ş: 's', Ü: 'u', '&': ' ve ' };
function slugla(s) {
  return String(s)
    .replace(/[çğıöşüâîûÇĞİIÖŞÜ&]/g, (c) => TR_HARF[c])
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Tahmini tokluk süresi (saat). index.html'deki acikmaSuresi ile aynı formül; 1-5 saat, yarım saat adım.
function tokSaat(y) {
  if (y.tur === 'icecek' || y.sadece_malzeme) return null;
  let s = 1 + (y.doyuruculuk / 280) * 3.2 + (y.protein || 0) * 0.02 + (y.lif || 0) * 0.05;
  s = Math.max(1, Math.min(5, s));
  return Math.round(s * 2) / 2;
}
function saatYaz(s) { return String(s).replace('.', ','); }
// Meclis medyanı (dk) → "3,5 saat" / "45 dk"
function dkYaz(dk) {
  if (dk == null) return '';
  if (dk < 60) return `${Math.round(dk / 5) * 5} dk`;
  return `${saatYaz(Math.round((dk / 60) * 2) / 2)} saat`;
}
const HALK_ESIK = 3; // bu kadar kişi bildirmeden halkın saati gösterilmez (sitedeki RAPOR_ESIK ile aynı)

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function supabaseCek() {
  const kolonlar = 'id,ad,mutfak,kcal,doyuruculuk,protein,lif,yag,seker,tur,kaynak,sadece_malzeme,created_at,updated_at';
  const sonuc = [];
  for (let bas = 0; bas < 20000; bas += 1000) {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/yemekler?select=${kolonlar}&yayinda=eq.true&order=created_at.asc,id.asc`,
      { headers: { apikey: SUPABASE_KEY, Range: `${bas}-${bas + 999}` } }
    );
    if (!r.ok) throw new Error('Supabase ' + r.status);
    const parca = await r.json();
    sonuc.push(...parca);
    if (parca.length < 1000) break;
  }
  return sonuc;
}

// Meclis-i Mide: yiyenlerin bildirdiği saatlerin medyanı (girişli oy tam, girişsiz yarım ağırlık).
// Hata verirse sayfalar hesapla devam eder.
async function meclisCek() {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/meclis_ozet?select=yemek_id,saatli,medyan_dk&saatli=gte.${HALK_ESIK}`,
      { headers: { apikey: SUPABASE_KEY, Range: '0-4999' } });
    if (!r.ok) return [];
    return await r.json();
  } catch (e) { return []; }
}

// Ham satırları sayfa modeline çevirir: slug, sıra, lig.
function hazirla(satirlar, meclis = []) {
  const halk = new Map(meclis.map((m) => [m.yemek_id, m]));
  const yemekler = satirlar
    .filter((y) => !y.sadece_malzeme && y.kcal != null && y.doyuruculuk != null)
    .map((y) => ({ ...y, protein: y.protein || 0, lif: y.lif || 0, yag: y.yag || 0, seker: y.seker || 0 }));

  // slug: created_at sırasıyla; çakışan ada mutfak eki
  const kullanilan = new Set();
  const adIlk = new Map(); // aynı adlı yemeklerin ilki kanonik sayfadır (ör. iki mutfakta Chana masala)
  for (const y of yemekler) {
    let s = slugla(y.ad) || 'yemek';
    if (kullanilan.has(s)) s = `${s}-${y.mutfak}`;
    let n = 2;
    while (kullanilan.has(s)) s = `${slugla(y.ad)}-${n++}`;
    kullanilan.add(s);
    y.slug = s;
    y.gorsel = GORSELLER.has(s) ? `/img/yemek/${s}.webp` : null;
    const anahtar = y.ad.trim().toLocaleLowerCase('tr');
    if (adIlk.has(anahtar)) y.kanonikSlug = adIlk.get(anahtar); else adIlk.set(anahtar, s);
    y.lig = lig(y.doyuruculuk);
    y.saat = tokSaat(y);
    const h = halk.get(y.id);
    y.halkDk = h && h.medyan_dk != null ? Math.round(h.medyan_dk) : null;
    y.halkN = h ? h.saatli : 0;
  }
  // saat yüzdeliği: bu yemekten kısa tok tutanların oranı (içecekler hariç)
  const saatli = yemekler.filter((y) => y.saat != null).map((y) => y.saat);
  for (const y of yemekler) {
    if (y.saat == null) continue;
    y.saatYuzde = Math.round((saatli.filter((s) => s < y.saat).length / saatli.length) * 100);
  }

  const sirali = [...yemekler].sort((a, b) => b.doyuruculuk - a.doyuruculuk || a.kcal - b.kcal);
  sirali.forEach((y, i) => { y.sira = i + 1; });

  const slugIle = new Map(yemekler.map((y) => [y.slug, y]));
  return { yemekler, sirali, slugIle, toplam: yemekler.length };
}

let onbellek = null;
let onbellekZaman = 0;
async function veri() {
  if (onbellek && Date.now() - onbellekZaman < 10 * 60 * 1000) return onbellek;
  const [satirlar, meclis] = await Promise.all([supabaseCek(), meclisCek()]);
  onbellek = hazirla(satirlar, meclis);
  onbellekZaman = Date.now();
  return onbellek;
}

module.exports = { veri, hazirla, slugla, esc, lig, tokSaat, saatYaz, dkYaz, HALK_ESIK, MUTFAKLAR, MUTFAK, LIG_BILGI, LIG_RENK, SITE };
