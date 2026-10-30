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

// Tok tutma süresi (saat). İki ayrı sayı (index.html'deki acikmaSuresi / ayniKaloriSuresi ile aynı):
//   saat     : 1 porsiyonun tahmini süresi = enerji tabanı × verim. Büyük porsiyon daha uzun tutar.
//   ayniSaat : aynı 300 kaloride süre. Yemekleri adil karşılaştırmak için (PlateRank'in asıl iddiası: kalori başına tokluk).
// taban(kcal) = 0,8 + 2,7 × (kcal ÷ 500)^0,65 → ortalama verimde 100 kcal ≈ 1,7 sa, 300 kcal ≈ 2,7 sa, 600 kcal ≈ 3,9 sa
// verim(puan) = √(puan ÷ 150), 0,6 ile 1,5 arasında. Protein, lif ve hacim zaten puanın içinde; ayrıca eklenmez.
// Varsayım: mide karışık bir öğünü kabaca dakikada birkaç kalori hızla boşaltır, yani süre önce porsiyonun enerjisine bağlı.
// Verim ağırlığı (karekök) en belirsiz parça; Meclis'e gelen gerçek bildirimlerle kalibre edilecek.
const AYNI_KCAL = 300;
function tabanSaat(kcal) { return 0.8 + 2.7 * Math.pow(Math.max(kcal, 1) / 500, 0.65); }
function verimKatsayi(puan) { return Math.max(0.6, Math.min(1.5, Math.sqrt(Math.max(puan, 1) / 150))); }
const yarimSaat = (s) => Math.round(s * 2) / 2;
function sureVar(y) { return !(y.tur === 'icecek' || y.sadece_malzeme || y.kcal == null || y.doyuruculuk == null); }
function tokSaat(y) {
  if (!sureVar(y)) return null;
  return yarimSaat(Math.max(0.5, Math.min(6, tabanSaat(y.kcal) * verimKatsayi(y.doyuruculuk))));
}
// Yuvarlanmamış porsiyon süresi: Tokluk Endeksi gibi bölme yapan hesaplarda yarım saat yuvarlaması sıralamayı bozmasın.
function hamSaat(y) {
  if (!sureVar(y)) return null;
  return Math.max(0.5, Math.min(6, tabanSaat(y.kcal) * verimKatsayi(y.doyuruculuk)));
}
function ayniSaat(y) {
  if (!sureVar(y)) return null;
  return yarimSaat(tabanSaat(AYNI_KCAL) * verimKatsayi(y.doyuruculuk));
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
    y.ayniSaat = ayniSaat(y);
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

// İçecek sayfaları için: aynı kaloriye denk gelen, porsiyonu en uzun tok tutan yiyecek (tatlı, market ve vejetaryen-protein sekmesi hariç: tanıdık yemek önerilsin).
const SICAK_KCAL = 100;   // bu kalorinin üstündeki içecek "tok tutmadan giden kalori" diye vurgulanır
// İçecek sınıfı: 'sicak' = kalorili ve proteini düşük (kola, meyve suyu, frappe), 'protein' = kalorili ama proteinli
// (süt, shake: biraz tutar ama ne kadar, güvenilir veri yok), 'hafif' = kalorisi düşük.
function siviTur(y) {
  if (y.kcal < SICAK_KCAL) return 'hafif';
  return ((y.protein || 0) * 4) / y.kcal >= 0.15 ? 'protein' : 'sicak';
}
function kaloriKarsiligi(liste, kcal) {
  let en = null;
  for (const g of liste) {
    if (g.saat == null || g.tur === 'tatli' || g.mutfak === 'market' || g.mutfak === 'veg' || g.kanonik || g.kanonikSlug) continue;
    if (g.kcal < kcal * 0.85 || g.kcal > kcal * 1.1) continue;
    if (!en || g.saat > en.saat || (g.saat === en.saat && g.kcal < en.kcal)) en = g;
  }
  return en;
}

// Bulunamayan slug için en yakın yayındaki slug: yeniden adlandırma ("hamburger" → "hamburger-restoran-tipi")
// ya da ek düşmesi ("pilav-2" → "pilav"). Eşleşme yoksa null; sayfa o zaman 404 döner.
function yakinSlug(s, slugIle) {
  if (!s || s.length < 4) return null;
  let en = null, fark = Infinity;
  for (const k of slugIle.keys()) {
    if (k.length < 4) continue;
    if (k.startsWith(s + '-') || s.startsWith(k + '-')) {
      const f = Math.abs(k.length - s.length);
      if (f < fark || (f === fark && k < en)) { en = k; fark = f; }
    }
  }
  return en;
}

module.exports = { yakinSlug, hamSaat, kaloriKarsiligi, siviTur, SICAK_KCAL, veri, hazirla, slugla, esc, lig, tokSaat, ayniSaat, AYNI_KCAL, saatYaz, dkYaz, HALK_ESIK, MUTFAKLAR, MUTFAK, LIG_BILGI, LIG_RENK, SITE };
