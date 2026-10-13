// Yemek sayfalarına özel elle yazılmış içerik. Anahtar: /yemek/<slug>.
// Şablondan gelen rakamların yanına her yemeğe özgü açıklama, porsiyon notu,
// daha tok tutma önerileri ve sık sorulan sorular ekler (Google'ın "ince içerik" sayması için).
// Kural: buradaki rakamlar sitedeki besin değerleriyle aynı olmalı; tahmin edilen değer yazılmaz.
module.exports = {
  "mercimek-corbasi": {
    giris: "Mercimek çorbası listenin en verimli yemeklerinden biri ve sebebi basit: bir kasenin büyük kısmı su, yani mideyi az kaloriyle dolduruyor. Kırmızı mercimeğin proteini ve lifi de bu tokluğu saatlere yayıyor. Bir kase yaklaşık 150 kalori; aynı kalori yarım simide denk geliyor.",
    porsiyon: "Lokanta çorbası evdekinden farklı olabilir. Tereyağı, un ve üstüne gezdirilen kızgın yağ kaloriyi yukarı çeker; bir yemek kaşığı tereyağı tek başına yaklaşık 100 kalori. Yanındaki ekmek de hesaba girer: iki dilim beyaz ekmek çorbanın kalorisini ikiye katlar ama tokluğa aynı oranda katkı yapmaz.",
    dahaTok: [
      "Ekmeği bir dilime indir, yanına yoğurt ya da cacık al: protein artar, kalori düşer.",
      "Üstüne yağ yerine limon ve pul biber: lezzet kalır, kalori eklenmez.",
      "Öğün yerine içeceksen yanına haşlanmış yumurta ya da bir salata ekle; çorba tek başına hafif kalabilir."
    ],
    sss: [
      { s: "Mercimek çorbası diyette içilir mi?", c: "Evet. Kalorisi düşük, proteini ve lifi yüksek olduğu için diyetin en güvenli çorbalarından biri. Kaloriyi şişiren çorbanın kendisi değil, yanındaki yağ ve ekmek." },
      { s: "Mercimek çorbası akşam yemeği yerine geçer mi?", c: "Tek başına hafif bir akşam yemeği olur. Daha uzun tok tutması için yanına yoğurt, yumurta ya da salata eklemek yeterli." }
    ]
  },
  "kumpir-orta-boy-karisik": {
    giris: "Kumpirin temeli aslında çok tok tutan bir yiyecek: haşlanmış patates PlateRank'in en üst sıralarında. Sorun içine girenlerde. Tereyağı ve kaşarla ezilen patatesin üstüne mayonezli salatalar, sosis ve turşu eklenince orta boy bir kumpir 650 kaloriye çıkıyor, tokluk ise aynı oranda artmıyor. Bu yüzden sade patates S liginde, kumpir D liginde.",
    porsiyon: "Kalorinin büyük kısmı mayonezli salatalardan geliyor, tereyağı ve kaşar ikinci sırada. Mısır, bezelye, turşu ve zeytin görece masum seçenekler. Büyük boy kumpir bir öğün değil, iki kişilik bir tabak gibi düşünülmeli.",
    dahaTok: [
      "Mayonezli salataları atla; mısır, bezelye, turşu ve közlenmiş biberle doldur.",
      "Kaşarı ve tereyağını yarıya indirmesini iste.",
      "Yanına kola yerine ayran al: kalorisi düşük, üstelik protein ekliyor."
    ],
    sss: [
      { s: "Kumpir diyette yenir mi?", c: "Klasik hâliyle pek değil; orta boy bir kumpir günlük ihtiyacın neredeyse üçte biri. Mayonezli salatasız ve az kaşarlı yaptırırsan kalori ciddi düşer." },
      { s: "Patates tok tutuyorsa kumpir neden tutmuyor?", c: "Patatesin kendisi su ve nişastadan oluşuyor; hacmi büyük, kalorisi düşük. Kumpirde eklenen yağ ve mayonez hacmi neredeyse hiç büyütmeden kaloriyi katlıyor." }
    ]
  },
  "menemen": {
    giris: "Menemen kahvaltının en dengeli seçeneklerinden. Yumurtanın proteini, domates ve biberin hacmiyle birleşince 220 kalori civarında, öğleye kadar götürebilen bir tabak çıkıyor. A liginde olmasının sebebi bu denge.",
    porsiyon: "Menemenin kalorisini asıl belirleyen yağ: tavaya giren her yemek kaşığı tereyağı ya da zeytinyağı yaklaşık 100-120 kalori ekliyor. Peynirli ya da sucuklu menemen ayrı bir yemek gibi düşünülmeli; sucuk proteinden çok yağ getiriyor.",
    dahaTok: [
      "Yağı bir tatlı kaşığına indir; domatesin suyu pişirmeye yetiyor.",
      "İki yerine üç yumurtayla yap: protein artar, tokluk uzar.",
      "Ekmeği bir dilimle sınırla; asıl tokluk yumurtadan geliyor."
    ],
    sss: [
      { s: "Menemen diyette yenir mi?", c: "Evet, az yağla yapıldığında iyi bir diyet kahvaltısı. Kaloriyi asıl ekmek ve yağ belirliyor." },
      { s: "Menemen mi haşlanmış yumurta mı daha tok tutar?", c: "Kalori başına ikisi de A liginde ve birbirine yakın. Menemen sebzenin hacmiyle tabakta daha büyük duruyor; haşlanmış yumurta daha az kaloriyle saf protein veriyor." }
    ]
  },
  "baklava": {
    giris: "Baklava kalori başına en az tok tutan tatlılardan. Şerbet hızlı emilen şeker, tereyağı ve fıstık yoğun yağ demek. Küçük bir tabak 330 kalori civarında ama hacmi az, proteini düşük. Kan şekeri hızlı yükselip hızlı düştüğü için baklavadan sonra çabuk acıkmak sürpriz değil.",
    porsiyon: "Fıstıklı, cevizli ya da kaymaklı baklava arasında fark var ama hepsi aynı ligde kalıyor; belirleyici olan şerbet ve yağ. Az şerbetli kuru baklava biraz daha hafif.",
    dahaTok: [
      "Aç karnına değil, yemekten sonra ye: şeker iniş çıkışı daha küçük olur.",
      "Yanına sade Türk kahvesi ya da çay; üstüne şekerli içecek ekleme.",
      "Bir iki dilimde bırak; baklava tokluk için değil tadı için yenen bir tatlı."
    ],
    sss: [
      { s: "Baklava diyette yenir mi?", c: "Ara sıra ve az miktarda. Tokluk vermediği için öğün yerine geçmez; diyette bir 'tatlı hakkı' olarak düşünmek daha doğru." },
      { s: "Hangi tatlı daha tok tutar?", c: "Sütlü tatlılar şerbetlilerden biraz daha iyi, ama tatlılar arasında belirgin biçimde tok tutan yok. PlateRank'te tatlıların çoğu C ve D liginde." }
    ]
  },
  "lahmacun": {
    giris: "Bir lahmacun yaklaşık 280 kalori ve B liginde, yani kalorisine göre ortalama tok tutuyor. İnce hamur fazla yer kaplamıyor, kıymanın proteini de sınırlı. Asıl mesele tek lahmacunda kalınmaması: iki tane ve bir ayranla öğün 600 kaloriyi geçiyor.",
    porsiyon: "Hamurun kalınlığı ve kıymanın miktarı fırından fırına değişiyor; dükkândaki büyük boy lahmacun evdekinden ağır olabilir. Üstüne konan yeşillik ve limon kaloriyi değiştirmiyor, hacmi artırıyor.",
    dahaTok: [
      "İçine bol maydanoz, marul ve soğan sar: aynı kaloriyle tabak büyür.",
      "İkinci lahmacun yerine çoban salata ya da cacık al.",
      "Ayranla ye: kalorisi düşük ve PlateRank'te S liginde."
    ],
    sss: [
      { s: "Lahmacun diyette yenir mi?", c: "Bir tane, bol salatayla yenirse evet. Kalorisi bir döner dürümden az; ama iki taneye çıkınca dürümü geçiyor." },
      { s: "Lahmacun mu pide mi daha tok tutar?", c: "Lahmacun. Kıymalı pide 600 kalori ve D liginde; bir lahmacun yarısından az kaloriyle daha iyi bir tokluk veriyor." }
    ]
  },
  "haslanmis-yumurta": {
    giris: "Haşlanmış yumurta kalori başına en verimli protein kaynaklarından. Bir yumurta 78 kalori ve 6 gram protein; karbonhidratı neredeyse yok. A liginde, çünkü proteini güçlü ama tek başına hacmi küçük.",
    porsiyon: "Kayısı kıvamı ile katı haşlama arasında kalori farkı yok. Fark yağla pişen hâllerinde çıkıyor: sahanda ya da omlet olarak pişen yumurta, yağ ve peynir oranında kalori kazanıyor.",
    dahaTok: [
      "Bir değil iki yumurta: 160 kalori civarında, öğleye kadar götürmeye daha yakın.",
      "Yanına domates, salatalık ve yeşillik: hacim ekler, kalori eklemez.",
      "Beyaz ekmek yerine tam buğday ekmeğiyle: lif tokluğu uzatır."
    ],
    sss: [
      { s: "Haşlanmış yumurta diyette yenir mi?", c: "Evet, diyetin en kullanışlı yiyeceklerinden. Az kalorili, proteinli ve taşınabilir; ara öğün olarak da işe yarıyor." },
      { s: "Haşlanmış yumurta mı omlet mi daha tok tutar?", c: "Yumurta sayısı aynıysa tokluk yakın, fark kaloride. Omlete giren yağ ve peynir kaloriyi artırıyor; haşlanmış yumurta daha hafif." }
    ]
  },
  "simit": {
    giris: "Simit en pratik kahvaltılardan ama tok tutma konusunda zayıf. 300 kalori civarında ve büyük kısmı beyaz undan gelen karbonhidrat. Protein ve lifi az olduğu için çabuk sindiriliyor; simitle başlayan sabah çoğu zaman öğleden önce bir atıştırmalığa dönüyor. Bu yüzden C liginde.",
    porsiyon: "Simidin boyu ve pekmezli kabuğu fırına göre değişiyor; büyük bir simit 300 kaloriyi rahatça geçebilir. Susam kaloriye biraz ekliyor ama tokluğu değiştirmiyor.",
    dahaTok: [
      "Yanına beyaz peynir ya da haşlanmış yumurta ekle: protein simidin eksiğini kapatıyor.",
      "Domates, salatalık ve ayran: kalorisi düşük, hacmi yüksek eşlikçiler.",
      "Bütün simit yerine yarım simit, peynir ve domates: daha dengeli bir kahvaltı."
    ],
    sss: [
      { s: "Simit diyette yenir mi?", c: "Yenir ama tek başına değil. Yanına peynir ya da yumurta gibi bir protein eklenince daha dengeli ve daha uzun tok tutan bir öğün olur." },
      { s: "Simit mi poğaça mı daha tok tutar?", c: "Kalori başına ikisi de C liginde ve birbirine yakın; poğaçada daha çok yağ var. Tokluk için ikisi de tek başına zayıf." }
    ]
  },
  "kuru-fasulye": {
    giris: "Kuru fasulye S liginde ve bunu çok az yemek bu kadar ucuza yapıyor. Bir porsiyon 230 kalori civarında; içinde 14 gram protein ve 10 gram lif bir arada. Lif sindirimi yavaşlatıyor, protein tokluğu uzatıyor, fasulyenin hacmi de mideyi dolduruyor.",
    porsiyon: "Kavurmalı ya da pastırmalı kuru fasulye etsiz hâlinden belirgin şekilde ağır. Asıl fark yanındaki pilavda: bir porsiyon pirinç pilavı tabağa 260 kalori civarında daha ekliyor.",
    dahaTok: [
      "Pilavı yarım porsiyona indir ya da bulgur pilavıyla değiştir.",
      "Yanına turşu, soğan ve cacık: kalori eklemeden tabağı büyütür.",
      "Etsiz pişirmekten çekinme; proteini fasulye zaten veriyor."
    ],
    sss: [
      { s: "Kuru fasulye diyette yenir mi?", c: "Evet, en iyi seçeneklerden biri. Dikkat edilecek yer pilav ve ekmek; fasulyenin kendisi düşük kalorili ve çok tok tutuyor." },
      { s: "Kuru fasulye mi nohut mu daha tok tutar?", c: "İkisi de çok iyi. PlateRank'te kuru fasulye 228, nohut yemeği 180 puan; kuru fasulye öne geçiyor çünkü daha az kaloride daha çok lif veriyor." }
    ]
  },
  "kokorec-yarim-ekmek": {
    giris: "Kokoreç sanıldığı kadar kötü çıkmıyor: yarım ekmek 450 kalori civarında ve B liginde. Bunu sağlayan protein; sakatat 24 grama yakın protein getiriyor. Kaloriyi şişiren ise yağ ve ekmek.",
    porsiyon: "Yarım ile çeyrek arasında fark büyük; çeyrek ekmek kaloriyi kabaca yarıya indiriyor. Bazı yerlerde ekmek kokoreçin yağında kızartılıyor, bu da kaloriyi yukarı çekiyor.",
    dahaTok: [
      "Çeyrek ekmek al, yanına ayran: protein yerinde kalır, kalori düşer.",
      "Domates, biber ve kekiği bol iste: hacim artar.",
      "İkinci porsiyon yerine bir salata; tokluk için ikinci yarıma gerek yok."
    ],
    sss: [
      { s: "Kokoreç diyette yenir mi?", c: "Ara sıra. Proteini iyi ama yağı yüksek; çeyrek ekmek ve ayranla makul bir öğün olur." },
      { s: "Kokoreç mi midye mi daha tok tutar?", c: "Kalori başına ikisi de B liginde. Altı midye dolma 280 kalori, yarım ekmek kokoreç 450; az yemek istersen midye, uzun tok kalmak istersen kokoreçin proteini daha güçlü." }
    ]
  },
  "ezogelin-corbasi": {
    giris: "Ezogelin, mercimek çorbasının bulgurlu kuzeni ve o da S liginde. Bir kase 140 kalori civarında. Kırmızı mercimek protein, bulgur lif getiriyor; çorbanın sulu yapısı mideyi doldururken kaloriyi düşük tutuyor.",
    porsiyon: "Lokantada üstüne gezdirilen naneli tereyağı kaloriyi artırıyor; evde yağı azaltmak çorbanın puanını korur. Mercimek çorbasına göre daha tanecikli olduğu için tabakta daha doyurucu hissettirebilir.",
    dahaTok: [
      "Yanına yoğurt: protein artar, ekşiliği çorbayla iyi gider.",
      "Ekmeği bir dilimle sınırla; bulgur tahıl kısmını zaten karşılıyor.",
      "Öğün yapacaksan yanına haşlanmış yumurta ya da salata."
    ],
    sss: [
      { s: "Ezogelin mi mercimek çorbası mı daha tok tutar?", c: "Neredeyse aynı: PlateRank'te mercimek çorbası 250, ezogelin 245 puan. Mercimekte biraz daha protein ve lif var, ezogelin biraz daha düşük kalorili." },
      { s: "Ezogelin diyette içilir mi?", c: "Evet. Düşük kalorili ve tok tutan bir çorba; yağ ve ekmek miktarına dikkat etmek yeterli." }
    ]
  }
};
