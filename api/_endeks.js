// Tokluk Endeksi verisi: İstanbul'da 1 saat tok kalmanın fiyatı. Her ay yenilenir (yeni dönem = bu dosyanın yeni sürümü).
// Kural: her fiyatın yeri belli. Restoran kalemlerinde fiyat = kaynakların orta değeri (medyan), kodda hesaplanır.
// Evde/market kalemlerinde porsiyon fiyatı raf fiyatından çevrilir; çevirme "hesap" alanında açık yazılır.
// Tok tutma süresi buradan değil, canlı veriden (yemekler tablosu, porsiyon süresi) gelir.

const ENDEKS = {
  donem: 'Ekim 2026',
  tarih: '2026-10-19',
  tarihYazi: '19 Ekim 2026',
  sehir: 'İstanbul',
  ogGorsel: '/img/endeks/tokluk-endeksi-2026-10-og.png',   // paylaşım önizlemesi (1200×630)
  kareGorsel: '/img/endeks/tokluk-endeksi-2026-10.png',    // basın/sosyal medya görseli (1080×1350)
  restoranKaynak: 'Yemeksepeti, Kadıköy (Caferağa) teslimat adresi, indirimsiz liste fiyatı',
  marketKaynak: 'Migros Sanal Market raf fiyatı (kart indirimleri hariç)',
  disarida: ['Haşlanmış patates', 'Simit'], // (bilgi) tarifeli ya da evde
  cikanlar: 'Baklava endekse alınmadı: tatlıcılar porsiyonu dilim sayısı yazmadan ya da gramajla satıyor, porsiyonlar karşılaştırılamıyor.',
  kalemler: [
    // EVDE (market fiyatından porsiyon)
    { ad: 'Haşlanmış patates', grup: 'evde', fiyat: 9.18, hesap: '230 g çiğ patates (1 orta boy, ~160 kcal haşlanmış)', kaynak: [['Migros, dökme patates', '39,90 TL/kg']] },
    { ad: 'Haşlanmış yumurta', grup: 'evde', fiyat: 6.63, hesap: '1 adet; üç paketin adet fiyatının orta değeri', kaynak: [['Güres 30\'lu M', '5,66 TL/adet'], ['Keskinoğlu 15\'li L', '6,63 TL/adet'], ['Keskinoğlu 20\'li L', '8,44 TL/adet']] },
    { ad: 'Yulaf lapası (sütlü)', grup: 'evde', fiyat: 25.73, hesap: '40 g yulaf ezmesi (orta fiyat 211,90 TL/kg) + 150 ml tam yağlı süt (115 TL/L)', kaynak: [['M Life yulaf 500 g', '95 TL/kg'], ['Eti Lifalif yulaf 500 g', '211,90 TL/kg'], ['Yayla Onlife yulaf 350 g', '256,85 TL/kg'], ['Sek tam yağlı süt 1 L', '115 TL']] },
    { ad: 'Muz (1 orta)', grup: 'evde', fiyat: 26.45, hesap: '1 orta muz, kabuklu ~180 g', kaynak: [['Migros, ithal muz', '146,95 TL/kg']] },
    // MARKET ATIŞTIRMALIĞI
    { ad: 'Patates cipsi (1 paket 100g)', grup: 'market', fiyat: 51.6, hesap: '100 g karşılığı; üç paketin gram fiyatının orta değeri', kaynak: [['Lay\'s Klasik 125 g', '64,50 TL'], ['Lay\'s Klasik 160 g', '84,95 TL'], ['Migros sade cips 150 g', '47,50 TL']] },
    { ad: 'Sütlü çikolata (50g)', grup: 'market', fiyat: 58.3, hesap: '50 g karşılığı; üç ürünün gram fiyatının orta değeri', kaynak: [['Eti sütlü 60 g', '66,95 TL'], ['Torku sütlü 60 g', '69,95 TL'], ['Milka sütlü 80 g', '159,95 TL']] },
    { ad: 'Protein bar (45 g, küçük boy)', grup: 'market', kaynak: [['Fellas 45 g', 109.95], ['Bahs 45 g', 94.95], ['Züber 45 g', 119.95]] },
    // SOKAK
    { ad: 'Simit', grup: 'sokak', fiyat: 30, hesap: 'İstanbul fırın tarifesi; paket serviste 50-55 TL (Simit Sarayı 50, Nefis Sarıyer Börekçisi 55)', kaynak: [['İstanbul simit tarifesi, 26.09.2026 zammı (Evrensel)', 30]] },
    { ad: 'Poğaça (peynirli)', grup: 'sokak', kaynak: [['Rıhtım Kadıköy Börekçisi', 45], ['Nefis Sarıyer Börekçisi', 45], ['Meşhur Sarıyer Börekçisi', 50]] },
    { ad: 'Kaşarlı tost', grup: 'sokak', kaynak: [['Barış Büfe', 195], ['Tostçu Reis', 130], ['Suadiye Marmaris', 210], ['Bambi Cafe', 190]] },
    { ad: 'Ayvalık tostu', grup: 'sokak', kaynak: [['Barış Büfe', 435], ['Cadde Ayvalık Tostçusu', 410], ['Tostçu Reis', 350], ['Bambi Cafe', 390]] },
    { ad: 'Tavuk döner dürüm', grup: 'sokak', kaynak: [['1967 Tokat Döner', 380], ['Öncü Döner', 270], ['İsos Döner', 369.99], ['Maydonoz Döner', 340], ['Hey Döner', 295], ['Acıbadem Dürümcüsü', 400]] },
    { ad: 'Et döner dürüm (dana/kuzu)', grup: 'sokak', kaynak: [['1967 Tokat Döner', 740], ['İsos Döner', 549.99], ['Maydonoz Döner', 460], ['Hey Döner', 475], ['Acıbadem Dürümcüsü', 550]] },
    { ad: 'Tantuni dürüm', grup: 'sokak', kaynak: [['Tantuni Tan', 475], ['Ayla Tantuni', 470], ['Tantun Usta', 430]] },
    { ad: 'Tavuk şiş dürüm', grup: 'sokak', kaynak: [['Mersinli Ahmet Usta', 400], ['01 Sokak Lezzetleri', 550], ['Damla Pide & Kebap', 380], ['Abooov Kebap', 420]] },
    { ad: 'Lahmacun', grup: 'sokak', kaynak: [['Hacıoğlu', 150], ['Filfil Lahmacun', 231], ['Mersinli Ahmet Usta', 220], ['Hacıbaşar', 250], ['01 Sokak Lezzetleri', 290], ['Damla Pide & Kebap', 190]] },
    { ad: 'Kumpir (orta boy, karışık)', grup: 'sokak', kaynak: [['Fener Kumpir', 420], ['Vedat Usta', 550], ['Waffpir', 529]] },
    { ad: 'Midye dolma (6 adet)', grup: 'sokak', hesap: 'adet fiyatı × 6', kaynak: [['Midye Fabrikası', 150], ['Midyem', 180], ['Midye Galaksi', 210], ['Kokoniko', 120]] },
    { ad: 'Kokoreç (yarım ekmek)', grup: 'sokak', kaynak: [['Midye Fabrikası', 450], ['Muharrem Usta Kokoreç', 420], ['Lider Kokoreç', 600], ['Kokoniko', 490]] },
    { ad: 'Çiğ köfte (etsiz)', grup: 'sokak', hesap: 'standart dürüm', kaynak: [['Komagene', 120], ['Çiğ Köfteci Ömer Usta', 175], ['Oses', 150]] },
    { ad: 'Balık ekmek', grup: 'sokak', hesap: 'uskumru', kaynak: [['Balıkçı Yüksel Usta', 520], ['Bizim Balık', 350]] },
    { ad: 'Islak hamburger (1 adet)', grup: 'sokak', kaynak: [['Beyoğlu Islak Hamburger', 185], ['Kristal Büfe', 300], ['Ayvalık Ekspres', 145]] },
    { ad: 'Gözleme (patatesli)', grup: 'sokak', kaynak: [['Anadolu Gözleme', 300], ['Gözlemeköy', 400], ['Perihan Abla\'nın Kahvaltı Dükkanı', 450]] },
    { ad: 'Ispanaklı börek', grup: 'sokak', hesap: '1 porsiyon', kaynak: [['Meşhur Sarıyer Börekçisi', 270], ['Nefis Sarıyer Börekçisi', 260], ['Rıhtım Kadıköy Börekçisi', 260]] },
    // LOKANTA
    { ad: 'Mercimek çorbası', grup: 'lokanta', kaynak: [['Adile Sultan Ev Yemekleri', 155], ['Saray Ev Yemekleri', 120], ['Sevgi Lokantası', 190], ['HD İskender', 160], ['Damla Pide & Kebap', 140], ['Abooov Kebap', 160], ['Tencere Gurme', 180]] },
    { ad: 'Ezogelin çorbası', grup: 'lokanta', kaynak: [['Meral Ana Mutfak', 175.99], ['Adile Sultan Ev Yemekleri', 155], ['Tencere Gurme', 180], ['Suaş Ev Yemekleri', 200]] },
    { ad: 'Kuru fasulye', grup: 'lokanta', kaynak: [['Meral Ana Mutfak', 232.99], ['Saray Ev Yemekleri', 140], ['Sevgi Lokantası', 220], ['Tencere Gurme', 295], ['Suaş Ev Yemekleri', 270]] },
    { ad: 'Beyaz pilav', grup: 'lokanta', kaynak: [['Meral Ana Mutfak', 194.99], ['Saray Ev Yemekleri', 140], ['Tencere Gurme', 195], ['Suaş Ev Yemekleri', 200]] },
    { ad: 'Mantı (yoğurtlu)', grup: 'lokanta', kaynak: [['Adile Sultan Ev Yemekleri', 455], ['Sevgi Lokantası', 520], ['Sinop Gurme Mantı', 730]] },
    { ad: 'İskender', grup: 'lokanta', kaynak: [['1967 Tokat Döner', 895], ['Maydonoz Döner', 625], ['HD İskender', 565], ['Bursa İshakbey', 540], ['Baydöner', 580], ['Tarihi Mercan Dönercisi', 718], ['Ata Döner', 730]] },
    { ad: 'Menemen', grup: 'lokanta', kaynak: [['Perihan Abla\'nın Kahvaltı Dükkanı', 410], ['Kadıköy Saray Muhallebicisi', 440], ['Simit Sarayı', 315]] },
    { ad: 'Izgara köfte', grup: 'lokanta', kaynak: [['Adile Sultan Ev Yemekleri', 495], ['Saray Ev Yemekleri', 720], ['Köfteci Yusuf', 360], ['Köfteci Metin', 515]] },
    { ad: 'Karışık pide', grup: 'lokanta', kaynak: [['Hacıoğlu', 450], ['Tarihi Marmara Pide', 475], ['Mersinli Ahmet Usta', 525], ['Damla Pide & Kebap', 490]] },
    { ad: 'Sütlaç', grup: 'lokanta', kaynak: [['Kadıköy Saray Muhallebicisi', 325], ['Göreme Muhallebicisi', 350], ['Sütlaççı Murteza Efendi', 240]] },
    // ZİNCİR (fiyat şubeler arasında aynı; tek kaynak yeterli)
    { ad: 'Big Mac', grup: 'zincir', hesap: 'tek ürün, menü değil', kaynak: [['McDonald\'s (Yemeksepeti)', 440]] },
    { ad: 'Hamburger (McDonald\'s)', grup: 'zincir', hesap: 'tek ürün, menü değil', kaynak: [['McDonald\'s (Yemeksepeti)', 340]] },
  ],
};

const GRUP = { evde: 'Evde', sokak: 'Sokak', lokanta: 'Lokanta', zincir: 'Zincir', market: 'Market' };

function medyan(xs) {
  const s = [...xs].sort((a, b) => a - b), n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

// Canlı veriyle birleştirir: süre, lig, slug. Sıra: 1 saat tokluğun fiyatı, ucuzdan pahalıya.
function endeksKur(d, hamSaat) {
  const satirlar = [];
  for (const k of ENDEKS.kalemler) {
    const y = d.yemekler.find((x) => x.ad === k.ad);
    if (!y) continue;
    const s = hamSaat(y);
    if (s == null) continue;
    const sayilar = k.kaynak.map((x) => x[1]).filter((v) => typeof v === 'number');
    const fiyat = k.fiyat != null ? k.fiyat : medyan(sayilar);
    satirlar.push({ ...k, y, fiyat, saat: s, saatFiyat: fiyat / s, kaynakSayisi: k.kaynak.length });
  }
  satirlar.sort((a, b) => a.saatFiyat - b.saatFiyat);
  satirlar.forEach((r, i) => { r.sira = i + 1; });
  return satirlar;
}

module.exports = { ENDEKS, GRUP, endeksKur, medyan };
