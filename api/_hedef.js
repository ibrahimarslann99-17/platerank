// Tok Plan: gunluk hedef ve ogun haritasi hesabi.
// Saf fonksiyonlar, veritabanina dokunmaz. Sadece sunucuda calisir (api/plan.js).

const AKTIVITE = { hareketsiz: 1.2, hafif: 1.375, orta: 1.55, yuksek: 1.725 };

const PROFIL = {
  ver:    { kcalCarpan: 0.82, proteinGkg: 1.8, yagOran: 0.28, proteinTavan: 0.30 },
  saglik: { kcalCarpan: 1.00, proteinGkg: 1.2, yagOran: 0.30, proteinTavan: 0.30 },
  kas:    { kcalCarpan: 1.07, proteinGkg: 2.0, yagOran: 0.27, proteinTavan: 0.35 },
  // Zayiflama ignesi (GLP-1: Ozempic, Wegovy, Mounjaro). Kaynak: ACLM/ASN/OMA/TOS ortak tavsiyesi, 2025
  // (Mozaffarian ve ark., AJCN 122:344-367). Ilac acigi zaten yaratiyor; risk az yemek ve kas kaybi.
  // Protein 1,2-1,6 g/kg araliginin ortasi, gunluk 80-120 g; yag dusuk (bulanti, mide bosalmasi yavas).
  igne:   { kcalCarpan: 0.80, proteinGkg: 1.5, yagOran: 0.25, proteinTavan: 0.35, proteinUst: 120 },
};

const TABAN_KCAL = { kadin: 1200, erkek: 1500 };
// Ignede taban daha yuksek: tavsiye kadinda 1200, erkekte 1800 kcal altini vitamin/mineral eksikligi riski sayiyor.
const TABAN_KCAL_IGNE = { kadin: 1200, erkek: 1800 };
const LIF_PER_1000 = 14;

// Ogun dagilimi: kcal payi ve protein payi (ana ogunlerde protein esit)
const DAGILIM = {
  3: [
    { ad: 'kahvalti', kcal: 0.30, protein: 1 / 3 },
    { ad: 'ogle',     kcal: 0.35, protein: 1 / 3 },
    { ad: 'aksam',    kcal: 0.35, protein: 1 / 3 },
  ],
  4: [
    { ad: 'kahvalti', kcal: 0.25, protein: 0.29 },
    { ad: 'ogle',     kcal: 0.30, protein: 0.29 },
    { ad: 'ara',      kcal: 0.10, protein: 0.13 },
    { ad: 'aksam',    kcal: 0.35, protein: 0.29 },
  ],
  5: [
    { ad: 'kahvalti', kcal: 0.22, protein: 0.25 },
    { ad: 'ara1',     kcal: 0.09, protein: 0.12 },
    { ad: 'ogle',     kcal: 0.28, protein: 0.25 },
    { ad: 'ara2',     kcal: 0.09, protein: 0.13 },
    { ad: 'aksam',    kcal: 0.32, protein: 0.25 },
  ],
};
// Ignede kucuk ve sik ogun (3-4 saatte bir): kalori ve protein ogunlere esite yakin dagilir.
const DAGILIM_IGNE = [
  { ad: 'kahvalti', kcal: 0.21, protein: 0.21 },
  { ad: 'ara1',     kcal: 0.16, protein: 0.18 },
  { ad: 'ogle',     kcal: 0.24, protein: 0.21 },
  { ad: 'ara2',     kcal: 0.15, protein: 0.18 },
  { ad: 'aksam',    kcal: 0.24, protein: 0.22 },
];

function guvenlikKontrolu(g) {
  if (g.yas < 18) return { engel: 'yas' };
  if (g.hamile || g.kronikHastalik) return { engel: 'doktor' };
  const bki = g.kilo / (g.boy / 100) ** 2;
  if (bki < 18.5 && (g.hedef === 'ver' || g.hedef === 'igne')) return { engel: 'zayif' };
  return null;
}

function uyanikSaat(kalkis, yatis) {
  const [kh, km] = kalkis.split(':').map(Number);
  const [yh, ym] = yatis.split(':').map(Number);
  let fark = (yh * 60 + ym) - (kh * 60 + km);
  if (fark <= 0) fark += 24 * 60;
  return fark / 60;
}

// Gecici kural: ana ogun ~4 saat tok tutar. Gercek tok tutma verisiyle motor bunu inceltecek.
function onerilenOgunSayisi(uyanik) {
  if (uyanik <= 13) return 3;
  if (uyanik <= 17) return 4;
  return 5;
}

function hedefHesapla(g) {
  const engel = guvenlikKontrolu(g);
  if (engel) return engel;

  const p = PROFIL[g.hedef];
  const igne = g.hedef === 'igne';
  const boyM = g.boy / 100;
  const bki = g.kilo / boyM ** 2;

  const bmr = 10 * g.kilo + 6.25 * g.boy - 5 * g.yas + (g.cinsiyet === 'erkek' ? 5 : -161);
  const ihtiyac = bmr * AKTIVITE[g.aktivite];
  const kcal = Math.max((igne ? TABAN_KCAL_IGNE : TABAN_KCAL)[g.cinsiyet], ihtiyac * p.kcalCarpan);

  // BKI 25 ustundeyse protein, boy icin BKI 25'e denk gelen kiloya gore
  const referansKilo = bki > 25 ? 25 * boyM ** 2 : g.kilo;
  const gkg = igne ? Math.min(1.6, p.proteinGkg + (g.yas >= 65 ? 0.1 : 0)) : p.proteinGkg + (g.yas >= 50 ? 0.2 : 0);
  let protein = Math.min(gkg * referansKilo, (kcal * p.proteinTavan) / 4);
  if (p.proteinUst) protein = Math.min(protein, p.proteinUst);

  const yag = (kcal * p.yagOran) / 9;
  const lif = (kcal / 1000) * LIF_PER_1000;
  const karbonhidrat = Math.max(0, (kcal - protein * 4 - yag * 9 + lif * 2) / 4);

  const uyanik = uyanikSaat(g.kalkis, g.yatis);
  const oneri = igne ? 5 : onerilenOgunSayisi(uyanik);
  const ogunSayisi = igne ? 5 : (DAGILIM[g.ogunSayisi] ? g.ogunSayisi : oneri);

  const ogunler = (igne ? DAGILIM_IGNE : DAGILIM[ogunSayisi]).map(o => ({
    ogun: o.ad,
    kcal: Math.round(kcal * o.kcal),
    protein: Math.round(protein * o.protein),
    yag: Math.round(yag * o.kcal),
    lif: Math.round(lif * o.kcal),
    karbonhidrat: Math.round(karbonhidrat * o.kcal),
  }));

  return {
    gunluk: {
      kcal: Math.round(kcal),
      protein: Math.round(protein),
      yag: Math.round(yag),
      lif: Math.round(lif),
      karbonhidrat: Math.round(karbonhidrat),
    },
    uyanikSaat: Math.round(uyanik * 10) / 10,
    onerilenOgunSayisi: oneri,
    ogunSayisi,
    kullaniciOneriyiDegistirdi: ogunSayisi !== oneri,
    ogunler,
    ...(igne ? { igne: true } : {}),
  };
}
module.exports = { hedefHesapla, guvenlikKontrolu, onerilenOgunSayisi };
