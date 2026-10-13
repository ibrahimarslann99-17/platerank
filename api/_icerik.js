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
  },
  "kunefe": {
    "giris": "Künefe tatlılar arasında en ağır olanlardan: bir porsiyon 450 kalori civarında ve D liginde. Peynir 10 gram protein getiriyor ama tel kadayıfın tereyağı ve üstüne dökülen şerbet bunu fazlasıyla bastırıyor. Sıcak ve doyurucu hissettirir, ama bu his kalorisinin karşılığı kadar uzun sürmez.",
    "porsiyon": "Bazı yerlerde künefe iki kişilik bir tavada geliyor; tek başına bitirmek kalori hesabını ikiye katlar. Üstüne eklenen dondurma ya da kaymak ayrıca kalori demek.",
    "dahaTok": [
      "Bir tavayı ikiye böl; tadı için yarısı yetiyor.",
      "Üstüne dondurma ya da kaymak ekletme.",
      "Ağır bir yemekten sonra değil, hafif bir öğünün tatlısı olarak düşün."
    ],
    "sss": [
      {
        "s": "Künefe kaç kalori, diyette yenir mi?",
        "c": "Bir porsiyon 450 kalori civarında. Diyette ancak ara sıra ve paylaşarak yenir; tokluk vermediği için öğünün yerine geçmez."
      },
      {
        "s": "Künefe mi baklava mı daha hafif?",
        "c": "İkisi de D liginde. Küçük bir tabak baklava 330 kalori, bir porsiyon künefe 450; az yemek istersen baklava daha hafif."
      }
    ]
  },
  "izgara-tavuk-gogsu": {
    "giris": "Izgara tavuk göğsü, kalori başına en çok protein veren yemeklerden: 165 kaloriye 31 gram protein. Yağı az, karbonhidratı yok; tokluğu neredeyse tamamen proteinden geliyor. Bu yüzden S liginde ve diyet yapanların değişmez tabağı.",
    "porsiyon": "Derisiz göğüs ile derili but arasında ciddi fark var; derisi ve yağı kaloriyi yükseltiyor. Marine sosu da önemli: ballı ya da tereyağlı soslar tabağa fark edilmeden kalori ekliyor.",
    "dahaTok": [
      "Yanına bol salata ya da ızgara sebze: hacim ekler, kalori eklemez.",
      "Pilav yerine bulgur pilavı ya da haşlanmış patates: aynı tok, daha az kalori.",
      "Kuru gelmesin diye yoğurtlu sos kullan; mayonez yerine yoğurt."
    ],
    "sss": [
      {
        "s": "Tavuk göğsü tek başına tok tutar mı?",
        "c": "Proteini sayesinde iyi tutar ama hacmi küçük. Yanına salata ya da sebze eklenince hem tabak büyür hem tokluk uzar."
      },
      {
        "s": "Tavuk göğsü diyette neden bu kadar önerilir?",
        "c": "Az kaloride çok protein veriyor ve protein en tok tutan besin. 165 kaloriye 31 gram protein veren çok az yemek var."
      }
    ]
  },
  "iskender": {
    "giris": "İskender kalorisine göre zayıf tok tutan bir yemek: bir porsiyon 550 kalori civarında ve C liginde. Döner etinin proteini güçlü (28 gram) ama altındaki tereyağına batırılmış pide ve üstüne dökülen eritilmiş tereyağı kaloriyi şişiriyor.",
    "porsiyon": "Kalorinin belirleyicisi tereyağı ve pide miktarı. 'Az tereyağlı' istemek ya da pideyi yarıya indirmek tabağı belirgin şekilde hafifletir. Bir buçuk porsiyon iskender bambaşka bir hesap.",
    "dahaTok": [
      "Tereyağını masada ayrı istemek: ne kadar döküleceğine sen karar verirsin.",
      "Pidenin yarısını bırak; asıl tokluk etten ve yoğurttan geliyor.",
      "Yanına kola yerine ayran: S liginde ve kalorisi düşük."
    ],
    "sss": [
      {
        "s": "İskender diyette yenir mi?",
        "c": "Klasik hâliyle ağır. Az tereyağı ve yarım pideyle yenirse daha makul bir öğün olur; proteini zaten iyi."
      },
      {
        "s": "İskender mi döner dürüm mü daha tok tutar?",
        "c": "Et döner dürüm (480 kalori, B ligi) iskenderden (550 kalori, C ligi) biraz daha iyi; fark tereyağında."
      }
    ]
  },
  "cacik": {
    "giris": "Cacık S liginde, çünkü neredeyse tamamen yoğurt, su ve salatalıktan oluşuyor. Bir kase 90 kalori civarında; yoğurdun proteini ve salatalığın hacmi az kaloriyle mideyi dolduruyor. Yemeğin yanında, yemeğin kalorisini düşürmenin en kolay yolu.",
    "porsiyon": "Süzme yoğurtla yapılan koyu cacık daha proteinli, sulandırılmış cacık daha hafif. Üstüne gezdirilen zeytinyağı kaloriyi artırıyor ama tokluğu çok değiştirmiyor.",
    "dahaTok": [
      "Süzme yoğurtla yap: protein artar.",
      "Salatalığı bol tut; hacmi o veriyor.",
      "Pilavın ya da ekmeğin bir kısmının yerine cacık koy."
    ],
    "sss": [
      {
        "s": "Cacık diyette yenir mi?",
        "c": "Evet, en iyi yan yemeklerden biri. Az kalorili, proteinli ve hacimli; ağır bir ana yemeğin yanında tabağı dengeliyor."
      },
      {
        "s": "Cacık mı ayran mı?",
        "c": "İkisi de S liginde ve yoğurt bazlı. Cacık salatalık sayesinde daha hacimli, ayran daha hafif; yemeğe göre seç."
      }
    ]
  },
  "serpme-kahvalti-tabagi-kisi-basi": {
    "giris": "Serpme kahvaltı keyif için harika ama tok tutma hesabında D liginde. Kişi başı 850 kalori civarında; peynirler, sucuk, kızartmalar, börek, bal-kaymak ve sınırsız ekmek bir araya gelince kalori çok hızlı birikiyor. Tokluk ise bu kaloriyle orantılı artmıyor.",
    "porsiyon": "Masadaki her şeyden biraz almak, tek bir şeyden çok almaktan daha çok kalori ettiriyor. En büyük kalemler genelde ekmek, kızartmalar ve bal-kaymak; yumurta, peynir ve sebzeler tabağın en verimli kısmı.",
    "dahaTok": [
      "Tabağını yumurta, peynir, domates, salatalık ve zeytinle kur.",
      "Kızartmaları ve börekleri tadımlık bırak.",
      "Ekmeği sayarak ye; çay da şekersiz."
    ],
    "sss": [
      {
        "s": "Serpme kahvaltı kaç kalori?",
        "c": "Kişi başı 850 kalori civarında, ama ne kadar yediğine göre kolayca 1000'i geçebilir. En büyük kalemler ekmek, kızartmalar ve bal-kaymak."
      },
      {
        "s": "Serpme kahvaltıdan sonra neden çabuk acıkılıyor?",
        "c": "Kalorinin büyük kısmı yağdan ve hızlı sindirilen karbonhidrattan geliyor. Yumurta ve peynirden gelen protein çok kalorinin içinde azınlıkta kalıyor."
      }
    ]
  },
  "yayla-corbasi": {
    "giris": "Yayla çorbası S liginde: bir kase 120 kalori civarında ve yoğurt bazlı. Yoğurdun proteini ve çorbanın sulu yapısı az kaloriyle mideyi dolduruyor. İçindeki pirinç miktarı az olduğu için hafif ama yine de doyurucu bir çorba.",
    "porsiyon": "Üstüne gezdirilen naneli tereyağı kaloriyi artırıyor; evde azaltmak çorbanın puanını korur. Daha çok pirinç konduğunda çorba koyulaşır ve kalorisi yükselir.",
    "dahaTok": [
      "Yanına haşlanmış yumurta ya da bir parça peynir: protein tamamlanır.",
      "Naneli yağı bir tatlı kaşığıyla sınırla.",
      "Ekmek yerine çorbayı ikinci kase yap; daha az kaloriyle daha çok tokluk."
    ],
    "sss": [
      {
        "s": "Yayla çorbası diyette içilir mi?",
        "c": "Evet. Yoğurt bazlı, düşük kalorili ve tok tutan bir çorba; yağ ve ekmek miktarına dikkat etmek yeterli."
      },
      {
        "s": "Yayla mı mercimek çorbası mı daha tok tutar?",
        "c": "Mercimek çorbası (250 puan) biraz önde, çünkü daha çok lif veriyor. Yayla çorbası (245 puan) daha düşük kalorili."
      }
    ]
  },
  "manti-yogurtlu": {
    "giris": "Mantı B liginde: bir porsiyon 450 kalori civarında. Kıyma ve yoğurt 18 gram protein getiriyor, ama hamurun ve üstüne dökülen tereyağlı sosun kalorisi yüksek. Ortalama tok tutan, keyifli ama hafif olmayan bir yemek.",
    "porsiyon": "Kalorinin değişkeni sos: bol tereyağı ya da salçalı yağ kaloriyi hızla artırıyor. Ev mantısı ile hazır mantı arasında hamur kalınlığı ve iç oranı da fark yaratıyor.",
    "dahaTok": [
      "Yoğurdu bol, tereyağlı sosu az iste.",
      "Yanına salata: hamurun yanında hacim sağlar.",
      "Porsiyonu küçük tutup yanına cacık ya da çorba ekle."
    ],
    "sss": [
      {
        "s": "Mantı diyette yenir mi?",
        "c": "Ara sıra ve küçük porsiyonla. Yoğurdu bol, yağı az yaptırırsan proteini iyi bir öğün olur."
      },
      {
        "s": "Mantı neden çabuk acıktırır?",
        "c": "Kalorinin büyük kısmı hamur ve yağdan geliyor; protein bu kalorinin içinde görece az kalıyor."
      }
    ]
  },
  "sucuklu-yumurta": {
    "giris": "Sucuklu yumurta A liginde, yani beklenenden iyi: 380 kalori civarında ve 22 gram protein. Yumurtanın ve sucuğun proteini tokluğu uzatıyor. Kalorinin kalanı sucuğun yağından geliyor; bu yüzden sade yumurtadan daha ağır.",
    "porsiyon": "Sucuğun miktarı her şeyi değiştiriyor: birkaç dilim daha eklemek kaloriyi hızla artırıyor. Tavaya ayrıca yağ koymaya gerek yok, sucuk kendi yağını bırakıyor.",
    "dahaTok": [
      "Tavaya yağ ekleme; sucuğun yağı yetiyor.",
      "Sucuğu birkaç dilimle sınırla, yumurtayı üçe çıkar.",
      "Yanına domates, salatalık, biber: kalorisiz hacim."
    ],
    "sss": [
      {
        "s": "Sucuklu yumurta diyette yenir mi?",
        "c": "Ölçülü olursa evet. Proteini yüksek ve tok tutuyor; sucuğu az, yumurtayı çok tutmak yeterli."
      },
      {
        "s": "Sucuklu yumurta mı menemen mi daha tok tutar?",
        "c": "İkisi de A liginde. Menemen daha düşük kalorili (220), sucuklu yumurta daha proteinli (22 g); kalori sayıyorsan menemen."
      }
    ]
  },
  "islak-hamburger-1-adet": {
    "giris": "Islak hamburger B liginde: bir tane 330 kalori civarında. Küçük ve yumuşak olduğu için tek başına doyurmuyor; asıl hesap kaç tane yendiğinde. İki ya da üç ıslak hamburger fast-food menüsünü rahatça geçiyor.",
    "porsiyon": "Sosa batırılmış yumuşak ekmek kalorinin önemli kısmı. Köftenin boyutu dükkândan dükkâna değişiyor.",
    "dahaTok": [
      "Bir taneyle başla, yanına ayran al.",
      "İkinci yerine küçük bir salata ya da çorba.",
      "Gece geç saatte değil, öğün saatinde ye; tek başına hafif bir ara öğün gibi."
    ],
    "sss": [
      {
        "s": "Islak hamburger kaç kalori?",
        "c": "Bir tane 330 kalori civarında. Genelde iki üç tane yendiği için toplam 660 ile 1000 kalori arasına çıkıyor."
      },
      {
        "s": "Islak hamburger mi normal hamburger mi?",
        "c": "Kalori başına ikisi yakın. Islak hamburger küçük olduğu için tanesi hafif, ama tek taneyle kalmak zor."
      }
    ]
  },
  "nohut-yemegi": {
    "giris": "Nohut yemeği A liginde: bir porsiyon 270 kalori civarında, 13 gram protein ve 9 gram lif. Baklagiller tokluk için en verimli yiyeceklerden; lif sindirimi yavaşlatıyor, protein tokluğu uzatıyor.",
    "porsiyon": "Etli nohut etsizinden ağır, ama proteini de daha yüksek. Asıl kalori farkı yanındaki pilavdan geliyor: bir porsiyon pirinç pilavı 260 kalori civarında ekliyor.",
    "dahaTok": [
      "Pilav yerine bulgur pilavı ya da yarım porsiyon pilav.",
      "Yanına turşu ve cacık: kalori eklemeden tabak büyür.",
      "Etsiz pişirsen bile proteini nohut sağlıyor."
    ],
    "sss": [
      {
        "s": "Nohut yemeği diyette yenir mi?",
        "c": "Evet. Lifi ve proteini yüksek, uzun tok tutan bir yemek; pilav miktarına dikkat etmek yeterli."
      },
      {
        "s": "Nohut mu kuru fasulye mi daha tok tutar?",
        "c": "Kuru fasulye biraz önde (228 ve 180 puan): daha az kaloride daha çok lif veriyor. İkisi de çok iyi seçenek."
      }
    ]
  },
  "tavuk-doner-durum": {
    "giris": "Tavuk döner dürüm C liginde: 450 kalori civarında. Tavuğun proteini iyi (25 gram) ama lavaş, soslar ve döner yağı kaloriyi yükseltiyor. Hızlı yenen ve çabuk biten bir öğün.",
    "porsiyon": "Sosların payı büyük: mayonezli ve 'özel' soslar kaloriyi belirgin artırıyor. İçine patates kızartması konulan dürümler ayrı bir kalori sınıfı.",
    "dahaTok": [
      "Sosu az ya da yoğurtlu iste, patates koydurma.",
      "Bol domates, marul ve soğan: hacim artar.",
      "Yanına ayran; menü yerine tek dürüm."
    ],
    "sss": [
      {
        "s": "Tavuk döner diyette yenir mi?",
        "c": "Sossuz ve patatessiz yaptırırsan makul bir öğün. Daha tok bir seçenek istiyorsan tavuk şiş dürüm (380 kalori, B ligi) daha iyi."
      },
      {
        "s": "Tavuk döner mi et döner mi?",
        "c": "Beklenenin aksine et döner dürüm (B ligi) tavuk döner dürümden (C ligi) bir tık önde; fark yağ ve sos miktarında."
      }
    ]
  },
  "haslanmis-patates": {
    "giris": "Haşlanmış patates PlateRank'in en üst sıralarında: 160 kaloriye 280 puan. Patates çoğunlukla su ve nişastadan oluşuyor; hacmi büyük, kalorisi düşük. Kalori başına tokluk konusunda pek az yiyecek onu geçebiliyor.",
    "porsiyon": "Patatesi tok tutan haşlanmış hâli. Kızartınca, püre yapıp tereyağı ve süt ekleyince ya da kumpire dönüşünce kalori katlanıyor; aynı patates C ve D liglerine düşüyor.",
    "dahaTok": [
      "Kabuğuyla haşla: lif artar.",
      "Üstüne tereyağı yerine yoğurt, dereotu ve pul biber.",
      "Yanına yumurta ya da ton balığı: protein ekleyince tam öğün olur."
    ],
    "sss": [
      {
        "s": "Patates kilo aldırır mı?",
        "c": "Haşlanmış patates kalori başına en tok tutan yiyeceklerden. Kilo aldıran patatesin kendisi değil, kızartma yağı, tereyağı ve soslar."
      },
      {
        "s": "Patates mi pilav mı daha tok tutar?",
        "c": "Haşlanmış patates çok önde: 160 kaloride 280 puan; beyaz pilav 260 kaloride 120 puan."
      }
    ]
  },
  "kasarli-tost": {
    "giris": "Kaşarlı tost B liginde: 400 kalori civarında ve 20 gram protein. Kaşarın proteini tokluğa iyi katkı yapıyor ama ekmeğin ve tereyağının kalorisi de az değil. Ortalama, pratik bir öğün.",
    "porsiyon": "Tost ekmeğinin dışına sürülen tereyağı ve kaşarın miktarı kaloriyi belirliyor. Karışık tost (sucuk ekli) daha ağır.",
    "dahaTok": [
      "Tam buğday ekmeğiyle yaptır: lif ekler.",
      "Dışına tereyağı sürdürme.",
      "Yanına domates, salatalık ve ayran."
    ],
    "sss": [
      {
        "s": "Kaşarlı tost diyette yenir mi?",
        "c": "Evet, makul bir öğün. Tam buğday ekmek ve az yağla yaptırırsan daha da iyi."
      },
      {
        "s": "Kaşarlı tost mu simit mi daha tok tutar?",
        "c": "Kaşarlı tost (B ligi) simitten (C ligi) iyi; kaşarın proteini fark yaratıyor."
      }
    ]
  },
  "sutlac": {
    "giris": "Sütlaç tatlılar arasında görece iyi ama yine de C liginde: bir kase 220 kalori civarında. Sütün proteini ve pirincin hacmi tokluğa biraz katkı yapıyor; şeker ise bunu sınırlıyor.",
    "porsiyon": "Fırın sütlaç ile tencere sütlacı arasında kalori farkı az; fark şeker ve porsiyonda. Üstüne serpilen tarçın kalori eklemez, fındık ekler.",
    "dahaTok": [
      "Yemekten sonra küçük bir kase: tatlı ihtiyacını kapatır.",
      "Üstüne fındık yerine tarçın.",
      "Şerbetli tatlı yerine tercih edersen daha az kaloriyle tatlını yemiş olursun."
    ],
    "sss": [
      {
        "s": "Sütlaç diyette yenir mi?",
        "c": "Tatlılar arasında daha hafif seçeneklerden. Küçük bir kase, ara sıra, diyeti bozmaz."
      },
      {
        "s": "Sütlaç mı baklava mı?",
        "c": "Sütlaç (220 kalori, C ligi) baklavadan (330 kalori, D ligi) hem daha hafif hem daha tok tutuyor."
      }
    ]
  },
  "adana-kebap": {
    "giris": "Adana kebap B liginde: 400 kalori civarında ve 28 gram protein. Kıymanın yağı kaloriyi yükseltiyor ama protein iyi; asıl hesabı yanındaki lavaş, pilav ve közlenmiş sebzeler belirliyor.",
    "porsiyon": "Porsiyon ve yağ oranı kebapçıya göre değişiyor. Altına serilen yağ emmiş lavaş tabağın gizli kalorisi.",
    "dahaTok": [
      "Lavaşı yeme ya da yarıya indir.",
      "Pilav yerine közlenmiş sebze ve soğan salatası.",
      "Yanına ayran: S liginde, kebabın ağırlığını dengeler."
    ],
    "sss": [
      {
        "s": "Adana kebap diyette yenir mi?",
        "c": "Proteini yüksek, lavaşsız ve pilavsız yenirse makul bir öğün. Kaloriyi asıl yanındakiler büyütüyor."
      },
      {
        "s": "Adana mı şiş kebap mı daha tok tutar?",
        "c": "Şiş kebap (280 kalori, A ligi) önde; daha yağsız et, daha az kaloride benzer protein."
      }
    ]
  },
  "tarhana-corbasi": {
    "giris": "Tarhana çorbası S liginde: bir kase 150 kalori civarında. Yoğurt, un ve sebzelerin fermente karışımı; sulu yapısı mideyi az kaloriyle dolduruyor.",
    "porsiyon": "Tereyağıyla kavrulan tarhana daha ağır olur. Koyu kıvamlı tarhana sulu olandan daha kalorili.",
    "dahaTok": [
      "Yanına yoğurt ya da haşlanmış yumurta: protein artar.",
      "Tereyağını azalt; tarhananın lezzeti kendinden.",
      "Ekmeği bir dilimle sınırla."
    ],
    "sss": [
      {
        "s": "Tarhana çorbası diyette içilir mi?",
        "c": "Evet. Düşük kalorili ve tok tutan bir çorba. Proteini mercimek çorbasından düşük; yanına yoğurt eklemek iyi gelir."
      },
      {
        "s": "Tarhana mı mercimek mi?",
        "c": "Mercimek çorbası (250 puan) tarhanadan (240) biraz önde, çünkü daha proteinli ve lifli."
      }
    ]
  },
  "karisik-pide": {
    "giris": "Karışık pide D liginde: 650 kalori civarında. Kıyma, sucuk, kaşar ve yumurta 28 gram protein getiriyor ama hamurun ve yağın kalorisi bunu çok aşıyor. Bir pide çoğu zaman tek kişilik değil, iki kişilik bir öğün.",
    "porsiyon": "Pidenin boyu ve kenarına sürülen tereyağı kaloriyi büyük ölçüde değiştiriyor. Üstüne kırılan yumurta protein ekliyor ama pideyi hafifletmiyor.",
    "dahaTok": [
      "Bir pideyi iki kişi paylaş.",
      "Yanına çoban salata ve ayran.",
      "Kenar hamurunu bırak; içi asıl kısım."
    ],
    "sss": [
      {
        "s": "Pide diyette yenir mi?",
        "c": "Tek kişi bütün pide ağır gelir. Paylaşarak ve salatayla yenirse daha makul."
      },
      {
        "s": "Pide mi lahmacun mu?",
        "c": "Lahmacun (280 kalori, B ligi) karışık pideden (650 kalori, D ligi) çok daha iyi bir tokluk-kalori dengesi veriyor."
      }
    ]
  },
  "kisir": {
    "giris": "Kısır A liginde: bir porsiyon 230 kalori civarında ve 6 gram lif. Bulgurun lifi, maydanoz ve domatesin hacmi tokluğa iyi katkı yapıyor. Hafif ama tok tutan bir meze ya da öğle yemeği.",
    "porsiyon": "Zeytinyağı ve nar ekşisi miktarı kaloriyi belirliyor; bol yağlı kısır daha ağır. İnce bulgur ile yapılıyor, bulgur oranı arttıkça kalori artar.",
    "dahaTok": [
      "Yeşilliği bol, bulguru dengeli tut.",
      "Yağı azalt, lezzeti nar ekşisi ve limonla ver.",
      "Marul yaprağına sararak ye: hacim artar."
    ],
    "sss": [
      {
        "s": "Kısır diyette yenir mi?",
        "c": "Evet. Lifli ve hacimli bir yemek; zeytinyağı miktarına dikkat etmek yeterli."
      },
      {
        "s": "Kısır tek başına öğün olur mu?",
        "c": "Hafif bir öğle yemeği olur. Proteini düşük; yanına yoğurt ya da haşlanmış yumurta eklemek tokluğu uzatır."
      }
    ]
  },
  "balik-ekmek": {
    "giris": "Balık ekmek B liginde: 420 kalori civarında ve 26 gram protein. Balığın proteini iyi; kalorinin büyük kısmı yarım ekmekten ve ızgara yağından geliyor.",
    "porsiyon": "Ekmeğin boyu fark yaratıyor. Uskumru yağlı bir balık; kalorinin bir kısmı da ondan geliyor ama bu yağ tokluğa katkı yapıyor.",
    "dahaTok": [
      "İçine bol soğan, marul ve domates.",
      "Yanına turşu suyu ya da ayran.",
      "Ekmeğin bir kısmını bırak; asıl tokluk balıktan."
    ],
    "sss": [
      {
        "s": "Balık ekmek diyette yenir mi?",
        "c": "Evet, proteinli bir öğün. Ekmeğin miktarını azaltırsan daha hafif olur."
      },
      {
        "s": "Balık ekmek mi döner mi?",
        "c": "Balık ekmek (B ligi) tavuk döner dürümden (C ligi) daha iyi tokluk veriyor."
      }
    ]
  },
  "pogaca-peynirli": {
    "giris": "Peynirli poğaça C liginde: 330 kalori civarında. Hamurdaki yağ ve beyaz unun kalorisi yüksek; peynirin proteini bunu dengelemeye yetmiyor. Pratik ama çabuk biten bir kahvaltılık.",
    "porsiyon": "Poğaçanın boyu ve hamurundaki margarin/tereyağı oranı fırına göre değişiyor. Açma ve simit de benzer ligde.",
    "dahaTok": [
      "Yanına haşlanmış yumurta ya da peynir.",
      "İki poğaça yerine bir poğaça ve meyve.",
      "Çayı şekersiz iç."
    ],
    "sss": [
      {
        "s": "Poğaça diyette yenir mi?",
        "c": "Tek başına pek uygun değil; yağı yüksek, tok tutması zayıf. Yanına protein eklenirse daha dengeli."
      },
      {
        "s": "Poğaça mı simit mi?",
        "c": "İkisi de C liginde ve birbirine yakın. Poğaçada daha çok yağ, simitte daha çok un var."
      }
    ]
  },
  "midye-dolma-6-adet": {
    "giris": "Altı midye dolma 280 kalori civarında ve B liginde. Midyenin proteini az değil ama dolmanın büyük kısmı baharatlı pirinç. Sokakta 'bir tane daha' demek kolay; asıl hesap kaçta durduğunda.",
    "porsiyon": "Midyenin boyu ve içindeki pilav miktarı satıcıya göre değişiyor. Limon kaloriyi değiştirmiyor.",
    "dahaTok": [
      "Sayarak ye: altı tanede dur.",
      "Yanına ayran ya da bir salata.",
      "Gece atıştırması yerine akşam yemeğinin parçası yap."
    ],
    "sss": [
      {
        "s": "Midye dolma kaç kalori?",
        "c": "Altı tane 280 kalori civarında. On tane yendiğinde 450 kaloriyi geçiyor."
      },
      {
        "s": "Midye dolma tok tutar mı?",
        "c": "Ortalama (B ligi). İçindeki pilav hızlı sindiriliyor; yanına protein eklemek tokluğu uzatır."
      }
    ]
  },
  "yulaf-lapasi-sutlu": {
    "giris": "Sütlü yulaf lapası S liginde: bir kase 250 kalori civarında, 11 gram protein ve 5 gram lif. Yulafın çözünür lifi sindirimi yavaşlatıyor, süt protein ekliyor. Sabahı öğleye kadar götüren kahvaltıların başında.",
    "porsiyon": "Üstüne eklenen bal, reçel ya da çikolata kaloriyi hızla artırıyor. Meyve ve tarçın daha iyi seçenek.",
    "dahaTok": [
      "Üstüne muz ya da elma: hacim ve lif.",
      "Bir kaşık fıstık ezmesi ya da yoğurt: protein ve tokluk.",
      "Bal yerine tarçın."
    ],
    "sss": [
      {
        "s": "Yulaf lapası tok tutar mı?",
        "c": "Çok iyi tutar, S liginde. Lifi sindirimi yavaşlatıyor, sütü protein ekliyor."
      },
      {
        "s": "Yulaf lapası mı mısır gevreği mi?",
        "c": "Yulaf lapası (230 puan) mısır gevreğinden (90 puan) çok önde; gevrek hızlı sindiriliyor."
      }
    ]
  },
  "karniyarik": {
    "giris": "Karnıyarık B liginde: 320 kalori civarında. Patlıcan hacim veriyor ama kızartılırken çok yağ emiyor; kalorinin büyük kısmı bu yağdan geliyor. Kıymanın proteini sınırlı.",
    "porsiyon": "Patlıcanı kızartmak yerine fırında közlemek kaloriyi belirgin düşürür. Yanındaki pilav ayrıca 260 kalori civarında ekliyor.",
    "dahaTok": [
      "Patlıcanı kızartma, fırında pişir.",
      "Pilav yerine yoğurt ya da cacık.",
      "Kıymayı bol, yağı az tut."
    ],
    "sss": [
      {
        "s": "Karnıyarık diyette yenir mi?",
        "c": "Kızartılmış hâli yağlı. Fırında patlıcanla yapılırsa çok daha hafif bir yemek olur."
      },
      {
        "s": "Karnıyarık mı imam bayıldı mı?",
        "c": "Karnıyarık (B ligi) imam bayıldıdan (B ligi, 280 kalori) biraz daha tok tutuyor; kıyması protein ekliyor."
      }
    ]
  },
  "trilece-1-dilim": {
    "giris": "Trileçe C liginde: bir dilim 280 kalori civarında. Üç sütlü şerbet ve karamel şeker yükü getiriyor; hafif görünse de tok tutmuyor.",
    "porsiyon": "Dilimin boyu fark yaratıyor. Üstündeki karamel sos kaloriyi artırıyor.",
    "dahaTok": [
      "Yemekten sonra küçük bir dilim.",
      "Yanına şekersiz çay ya da kahve.",
      "Paylaş."
    ],
    "sss": [
      {
        "s": "Trileçe kaç kalori?",
        "c": "Bir dilim 280 kalori civarında; büyük dilimlerde daha fazla."
      },
      {
        "s": "Trileçe mi sütlaç mı daha hafif?",
        "c": "Sütlaç (220 kalori) trileçeden biraz daha hafif; ikisi de C liginde."
      }
    ]
  },
  "cig-kofte-etsiz": {
    "giris": "Etsiz çiğ köfte A liginde: bir porsiyon 280 kalori civarında ve 8 gram lif. İnce bulgur lif getiriyor; marul ve limonla dürüm yapıldığında hacim de artıyor.",
    "porsiyon": "Dürüm lavaşı kaloriyi artırıyor; marul yaprağına sarmak en hafif yol. Nar ekşisi ve sos az kalori ekliyor.",
    "dahaTok": [
      "Lavaş yerine marul yaprağına sar.",
      "Yanına ayran.",
      "Bol yeşillik ve turşu iste."
    ],
    "sss": [
      {
        "s": "Çiğ köfte diyette yenir mi?",
        "c": "Evet, lifli ve görece hafif. Lavaşı azaltmak yeterli."
      },
      {
        "s": "Çiğ köfte dürüm kaç kalori?",
        "c": "Porsiyon 280 kalori civarında; lavaşla dürüm yapılınca daha fazla."
      }
    ]
  },
  "humus-1-porsiyon": {
    "giris": "Humus A liginde: bir porsiyon 220 kalori civarında, 7 gram protein ve 6 gram lif. Nohutun lifi ve proteini tokluğa iyi katkı yapıyor; tahin ve zeytinyağı kaloriyi yükseltiyor.",
    "porsiyon": "Üstüne bolca dökülen zeytinyağı kaloriyi artırıyor. Pita ekmeğiyle yemek kaloriyi ikiye katlayabiliyor.",
    "dahaTok": [
      "Ekmek yerine havuç, salatalık ve biberle ye.",
      "Zeytinyağını az iste.",
      "Yanına ızgara tavuk: tam bir öğün olur."
    ],
    "sss": [
      {
        "s": "Humus diyette yenir mi?",
        "c": "Evet. Lifli ve proteinli; ekmek yerine sebzeyle yenirse çok iyi bir ara öğün."
      },
      {
        "s": "Humus tok tutar mı?",
        "c": "İyi tutar (A ligi). Nohutun lifi ve proteini sindirimi yavaşlatıyor."
      }
    ]
  },
  "tantuni-durum": {
    "giris": "Tantuni dürüm B liginde: 420 kalori civarında ve 22 gram protein. Etin proteini iyi; lavaş ve pişirme yağı kaloriyi artırıyor.",
    "porsiyon": "Lavaşın boyu ve tavadaki yağ miktarı dükkâna göre değişiyor. Yarım ekmek arası tantuni daha ağır olabilir.",
    "dahaTok": [
      "Bol domates, maydanoz ve soğan.",
      "Yanına ayran.",
      "İkinci dürüm yerine salata."
    ],
    "sss": [
      {
        "s": "Tantuni diyette yenir mi?",
        "c": "Proteini yüksek; tek dürüm ve ayranla makul bir öğün."
      },
      {
        "s": "Tantuni mi döner mi?",
        "c": "Tantuni (B ligi) tavuk döner dürümden (C ligi) daha iyi tokluk veriyor."
      }
    ]
  },
  "mercimek-koftesi-6-adet": {
    "giris": "Mercimek köftesi A liginde: altı tane 250 kalori civarında, 10 gram protein ve 8 gram lif. Kırmızı mercimek ve bulgur birlikte uzun süren bir tokluk sağlıyor.",
    "porsiyon": "Zeytinyağı ve salça miktarı kaloriyi belirliyor. Marul yaprağına sararak yemek hacmi artırıyor.",
    "dahaTok": [
      "Marul yaprağına sar, limon sık.",
      "Yanına ayran ya da yoğurt.",
      "Öğün yapacaksan yanına çoban salata."
    ],
    "sss": [
      {
        "s": "Mercimek köftesi diyette yenir mi?",
        "c": "Evet. Lifli, proteinli ve görece düşük kalorili."
      },
      {
        "s": "Mercimek köftesi tok tutar mı?",
        "c": "İyi tutar (A ligi). Mercimeğin proteini ve bulgurun lifi birlikte çalışıyor."
      }
    ]
  },
  "kumru": {
    "giris": "Kumru B liginde: 480 kalori civarında. Sucuk, kaşar ve salamın proteini var, ama ekmeğin ve şarküterinin kalorisi yüksek.",
    "porsiyon": "Ekmeğin boyu ve içerik miktarı kaloriyi belirliyor. Yarım kumru tam kumrudan çok daha hafif.",
    "dahaTok": [
      "Yarım kumru ve salata.",
      "Yanına ayran.",
      "Ekstra kaşar ekletme."
    ],
    "sss": [
      {
        "s": "Kumru kaç kalori?",
        "c": "Bir kumru 480 kalori civarında."
      },
      {
        "s": "Kumru mu tost mu?",
        "c": "Kaşarlı tost (400 kalori, B ligi) kumrudan biraz daha hafif."
      }
    ]
  },
  "iskembe-corbasi": {
    "giris": "İşkembe çorbası S liginde: bir kase 180 kalori civarında ve 14 gram protein. Çorbalar arasında en proteinlilerden; işkembe ve et suyu tokluğu uzatıyor.",
    "porsiyon": "Terbiyesinde kullanılan yumurta ve un, üstüne dökülen yağ kaloriyi değiştiriyor. Sarımsaklı sirke kalori eklemiyor.",
    "dahaTok": [
      "Yağı az iste.",
      "Ekmeği bir dilimle sınırla.",
      "Sabah ya da gece, ana öğün yerine geçebilir."
    ],
    "sss": [
      {
        "s": "İşkembe çorbası tok tutar mı?",
        "c": "Çok iyi tutar (S ligi). Proteini çorbalar arasında yüksek."
      },
      {
        "s": "İşkembe çorbası diyette içilir mi?",
        "c": "Evet; düşük kalorili ve proteinli. Yağ miktarına dikkat etmek yeterli."
      }
    ]
  },
  "su-boregi": {
    "giris": "Su böreği C liginde: bir porsiyon 350 kalori civarında. Peynirin proteini var ama tereyağlı yufka katları kaloriyi yükseltiyor.",
    "porsiyon": "Tereyağı miktarı ve dilim büyüklüğü fırına göre değişiyor.",
    "dahaTok": [
      "Küçük dilim ve yanına salata.",
      "Yanına ayran ya da yoğurt.",
      "Kahvaltıda yumurtayla birlikte."
    ],
    "sss": [
      {
        "s": "Su böreği diyette yenir mi?",
        "c": "Tereyağı yüzünden ağır; küçük porsiyonla ara sıra."
      },
      {
        "s": "Su böreği mi ıspanaklı börek mi?",
        "c": "Ispanaklı börek (B ligi, 310 kalori) su böreğinden (C ligi) biraz daha iyi."
      }
    ]
  },
  "cilbir-2-yumurta": {
    "giris": "Çılbır A liginde: 300 kalori civarında ve 16 gram protein. Yumurta ve yoğurt birlikte iyi bir protein kaynağı; tereyağlı sos kaloriyi yükseltiyor.",
    "porsiyon": "Üstüne dökülen pul biberli tereyağı kalorinin önemli kısmı.",
    "dahaTok": [
      "Tereyağını az kullan.",
      "Süzme yoğurt: protein artar.",
      "Ekmeği bir dilimle sınırla."
    ],
    "sss": [
      {
        "s": "Çılbır diyette yenir mi?",
        "c": "Evet, az tereyağıyla iyi bir protein kahvaltısı."
      },
      {
        "s": "Çılbır mı menemen mi?",
        "c": "Menemen (220 kalori) daha hafif; çılbır (300) daha proteinli. İkisi de A liginde."
      }
    ]
  },
  "et-doner-durum-dana-kuzu": {
    "giris": "Et döner dürüm B liginde: 480 kalori civarında ve 24 gram protein. Etin proteini iyi; lavaş ve döner yağı kaloriyi yükseltiyor.",
    "porsiyon": "Sos ve patates eklemeleri kaloriyi belirgin artırıyor.",
    "dahaTok": [
      "Sossuz, patatessiz.",
      "Bol yeşillik ve domates.",
      "Ayranla."
    ],
    "sss": [
      {
        "s": "Et döner diyette yenir mi?",
        "c": "Sossuz ve patatessiz tek dürüm makul bir öğün."
      },
      {
        "s": "Et döner mi iskender mi?",
        "c": "Et döner dürüm (B ligi) iskenderden (C ligi) daha iyi; iskenderin tereyağı fark yaratıyor."
      }
    ]
  },
  "ayran": {
    "giris": "Ayran PlateRank'in en verimli içeceği: bir bardak 65 kalori ve S liginde. Yoğurdun proteini ve suyun hacmi az kaloriyle mideyi dolduruyor. Kola ya da meyve suyunun yerine geçtiğinde öğünün kalorisini fark edilir şekilde düşürüyor.",
    "porsiyon": "Şişe ayranlar genelde 200-300 ml arası; köpüklü yayık ayranı daha sulu olabilir. Tuz kalori eklemez.",
    "dahaTok": [
      "Her döner, pide ya da kebabın yanına kola yerine ayran.",
      "Süzme yoğurttan yapılmış daha koyu ayran: daha çok protein.",
      "Ara öğünde tek başına da iş görüyor."
    ],
    "sss": [
      {
        "s": "Ayran tok tutar mı?",
        "c": "İçecekler arasında en iyisi (S ligi). Proteini ve hacmi az kaloriyle tokluk veriyor."
      },
      {
        "s": "Ayran mı kola mı?",
        "c": "Ayran açık ara: 65 kalori ve S ligi; kola 155 kalori ve D ligi."
      }
    ]
  },
  "gozleme-patatesli": {
    "giris": "Patatesli gözleme B liginde: 320 kalori civarında. Hamur ve tereyağı kalorinin büyük kısmı; patatesin hacmi yardımcı oluyor ama protein düşük.",
    "porsiyon": "Sacda sürülen tereyağı kaloriyi artırıyor. Peynirli ya da kıymalı gözleme daha proteinli.",
    "dahaTok": [
      "Peynirli gözleme seç: protein artar.",
      "Yanına ayran.",
      "Tereyağını az sürdür."
    ],
    "sss": [
      {
        "s": "Gözleme diyette yenir mi?",
        "c": "Ara sıra; yanına ayran ve salatayla."
      },
      {
        "s": "Gözleme tok tutar mı?",
        "c": "Ortalama (B ligi). Hamur hızlı sindiriliyor; protein ekleyince tokluk uzar."
      }
    ]
  },
  "izgara-kofte": {
    "giris": "Izgara köfte A liginde: 350 kalori civarında ve 26 gram protein. Kıymanın proteini tokluğu uzatıyor; ızgarada yağının bir kısmı da akıyor.",
    "porsiyon": "Yanındaki pilav ve ekmek tabağın kalorisini ikiye katlayabiliyor. Piyaz ise iyi bir eşlikçi (A ligi).",
    "dahaTok": [
      "Pilav yerine piyaz ya da salata.",
      "Ekmeği yarıya indir.",
      "Ayranla."
    ],
    "sss": [
      {
        "s": "Köfte diyette yenir mi?",
        "c": "Evet, ızgara köfte proteinli. Asıl dikkat edilecek yer pilav ve ekmek."
      },
      {
        "s": "Köfte mi tavuk mu?",
        "c": "Izgara tavuk göğsü (S ligi) köfteden (A ligi) önde; daha az kaloride daha çok protein."
      }
    ]
  },
  "profiterol-1-porsiyon": {
    "giris": "Profiterol D liginde: bir porsiyon 380 kalori civarında. Krema dolgusu ve çikolata sosu yoğun kalori; protein ve lif yok denecek kadar az.",
    "porsiyon": "Sos miktarı ve top sayısı kaloriyi belirliyor.",
    "dahaTok": [
      "Paylaş.",
      "Yemekten sonra küçük porsiyon.",
      "Sütlü tatlı istiyorsan sütlaç daha hafif."
    ],
    "sss": [
      {
        "s": "Profiterol kaç kalori?",
        "c": "Bir porsiyon 380 kalori civarında."
      },
      {
        "s": "Profiterol diyette yenir mi?",
        "c": "Ara sıra ve paylaşarak. Tokluk vermediği için öğün yerine geçmez."
      }
    ]
  },
  "tavuklu-pilav-sokak-1-porsiyon": {
    "giris": "Sokak tavuklu pilavı B liginde: 480 kalori civarında ve 26 gram protein. Tavuk iyi bir protein kaynağı; tereyağlı pilav ise kaloriyi yukarı çekiyor.",
    "porsiyon": "Pilavın miktarı ve üstüne eklenen nohut fark yaratıyor; nohut lif ve protein ekliyor.",
    "dahaTok": [
      "Nohutlu iste: lif ve protein artar.",
      "Yanına ayran ve turşu.",
      "Pilavı az, tavuğu çok iste."
    ],
    "sss": [
      {
        "s": "Tavuklu pilav diyette yenir mi?",
        "c": "Proteini iyi; pilav miktarına dikkat edilirse makul."
      },
      {
        "s": "Tavuklu pilav mı döner mi?",
        "c": "Tavuklu pilav (B ligi) tavuk döner dürümden (C ligi) daha iyi."
      }
    ]
  },
  "ayvalik-tostu": {
    "giris": "Ayvalık tostu C liginde: 520 kalori civarında. Sucuk, salam, kaşar ve soslar 20 gram protein getiriyor ama kalori çok daha hızlı birikiyor.",
    "porsiyon": "Ekmeğin boyu ve içine eklenen ketçap-mayonez kaloriyi artırıyor.",
    "dahaTok": [
      "Sossuz yaptır.",
      "Yarısını paylaş.",
      "Yanına ayran ve salata."
    ],
    "sss": [
      {
        "s": "Ayvalık tostu kaç kalori?",
        "c": "520 kalori civarında; soslar eklenince daha fazla."
      },
      {
        "s": "Ayvalık tostu mu kaşarlı tost mu?",
        "c": "Kaşarlı tost (400 kalori, B ligi) daha hafif ve daha iyi tok tutuyor."
      }
    ]
  },
  "muz-1-orta": {
    "giris": "Bir orta boy muz 105 kalori civarında ve A liginde. Hacmi ve lifi atıştırmalık olarak iyi bir tokluk veriyor; şekeri olsa da lifiyle birlikte geliyor.",
    "porsiyon": "Muzun olgunluğu tokluğu biraz değiştiriyor; az olgun muz daha yavaş sindiriliyor.",
    "dahaTok": [
      "Yanına bir avuç fındık ya da yoğurt.",
      "Yulaf lapasının üstüne.",
      "Antrenman öncesi pratik bir enerji."
    ],
    "sss": [
      {
        "s": "Muz tok tutar mı?",
        "c": "İyi tutar (A ligi). Lifi ve hacmi sayesinde atıştırmalık olarak işe yarıyor."
      },
      {
        "s": "Muz mu elma mı?",
        "c": "Elma (95 kalori, S ligi) muzdan biraz önde; daha sulu ve hacimli."
      }
    ]
  },
  "mihlama": {
    "giris": "Mıhlama B liginde: 420 kalori civarında. Mısır unu, tereyağı ve uzayan peynir; peynirin proteini var ama yağ yükü yüksek.",
    "porsiyon": "Tereyağı ve peynir miktarı kaloriyi belirliyor; bol tereyağlı hâli daha ağır.",
    "dahaTok": [
      "Paylaşarak ye.",
      "Yanına domates ve salatalık.",
      "Ekmek ekleme; mıhlama zaten doyurucu."
    ],
    "sss": [
      {
        "s": "Mıhlama diyette yenir mi?",
        "c": "Ağır bir kahvaltı; ara sıra ve paylaşarak."
      },
      {
        "s": "Mıhlama kaç kalori?",
        "c": "420 kalori civarında; tereyağı arttıkça daha fazla."
      }
    ]
  },
  "san-sebastian-cheesecake-1-dilim": {
    "giris": "San Sebastian cheesecake D liginde: bir dilim 420 kalori civarında. Krem peynir ve krema yoğun kalori; proteini var ama tokluk vermiyor.",
    "porsiyon": "Dilim boyu kafeye göre çok değişiyor; büyük dilimler 500 kaloriyi geçebilir.",
    "dahaTok": [
      "Paylaş.",
      "Yanına şekersiz kahve.",
      "Ağır bir yemeğin arkasından değil."
    ],
    "sss": [
      {
        "s": "San Sebastian kaç kalori?",
        "c": "Bir dilim 420 kalori civarında."
      },
      {
        "s": "San Sebastian diyette yenir mi?",
        "c": "Ara sıra ve paylaşarak; tokluk için değil, tadı için."
      }
    ]
  },
  "icli-kofte-2-adet": {
    "giris": "İki içli köfte 340 kalori civarında ve B liginde. Bulgur kabuğu ve kıymalı iç protein getiriyor; kızartılmış hâli kaloriyi artırıyor.",
    "porsiyon": "Haşlanmış içli köfte kızartılmış olandan daha hafif.",
    "dahaTok": [
      "Haşlanmışını seç.",
      "Yanına yoğurt ve salata.",
      "İki tanede dur."
    ],
    "sss": [
      {
        "s": "İçli köfte kaç kalori?",
        "c": "İki tane 340 kalori civarında; haşlanmışı daha hafif."
      },
      {
        "s": "İçli köfte tok tutar mı?",
        "c": "Ortalama (B ligi)."
      }
    ]
  },
  "pilav-ustu-tavuk": {
    "giris": "Pilav üstü tavuk B liginde: 520 kalori civarında ve 32 gram protein. Proteini çok iyi; pilav kaloriyi yükseltiyor.",
    "porsiyon": "Pilav miktarı belirleyici. Bulgur pilavıyla yapılırsa daha iyi tok tutar.",
    "dahaTok": [
      "Pilavı yarıya indir.",
      "Yanına salata ve ayran.",
      "Bulgur pilavı tercih et."
    ],
    "sss": [
      {
        "s": "Pilav üstü tavuk diyette yenir mi?",
        "c": "Proteini yüksek; pilav miktarına dikkat edilirse iyi bir öğün."
      },
      {
        "s": "Pilav üstü tavuk tok tutar mı?",
        "c": "İyi tutar; 32 gram protein. B liginde olmasının sebebi pilavın kalorisi."
      }
    ]
  },
  "acma": {
    "giris": "Açma C liginde: 280 kalori civarında. Yağlı ve yumuşak hamur hızlı sindiriliyor; proteini düşük.",
    "porsiyon": "Açmanın boyu ve içindeki yağ fırına göre değişiyor.",
    "dahaTok": [
      "Yanına peynir ya da yumurta.",
      "Tek açma, yanına domates.",
      "Çayı şekersiz iç."
    ],
    "sss": [
      {
        "s": "Açma kaç kalori?",
        "c": "Bir açma 280 kalori civarında."
      },
      {
        "s": "Açma mı simit mi?",
        "c": "İkisi de C liginde ve birbirine yakın; açma daha yağlı."
      }
    ]
  },
  "tavuklu-sezar-salata": {
    "giris": "Tavuklu sezar salata A liginde: 420 kalori civarında ve 32 gram protein. Tavuğun proteini ve marulun hacmi iyi bir tokluk veriyor; sezar sosu ve kruton kaloriyi yükseltiyor.",
    "porsiyon": "Sosun miktarı belirleyici: bol sezar sosu salatayı bir hamburgerin kalorisine yaklaştırabilir.",
    "dahaTok": [
      "Sosu yanında iste, az kullan.",
      "Krutonu azalt.",
      "Tavuğu bol iste."
    ],
    "sss": [
      {
        "s": "Sezar salata diyette yenir mi?",
        "c": "Sosu az olursa evet; proteini yüksek."
      },
      {
        "s": "Sezar salata tok tutar mı?",
        "c": "İyi tutar (A ligi); tavuğun proteini sayesinde."
      }
    ]
  },
  "kiymali-pide": {
    "giris": "Kıymalı pide D liginde: 600 kalori civarında. Kıymanın proteini var ama hamur kalorinin büyük kısmı.",
    "porsiyon": "Pidenin boyu ve tereyağı belirleyici.",
    "dahaTok": [
      "Paylaş.",
      "Yanına salata ve ayran.",
      "Lahmacunla değiştir: daha az kaloride daha iyi tokluk."
    ],
    "sss": [
      {
        "s": "Kıymalı pide kaç kalori?",
        "c": "600 kalori civarında."
      },
      {
        "s": "Pide mi lahmacun mu?",
        "c": "Lahmacun (280 kalori, B ligi) çok daha iyi."
      }
    ]
  },
  "mercimek-salatasi": {
    "giris": "Mercimek salatası A liginde: 220 kalori civarında, 11 gram protein ve 9 gram lif. Yeşil mercimeğin proteini ve lifi tok tutuyor; sebzeler hacim katıyor.",
    "porsiyon": "Zeytinyağı miktarı kaloriyi belirliyor.",
    "dahaTok": [
      "Yağı azalt, limon ve sirkeyle tatlandır.",
      "Yanına yoğurt.",
      "Öğle yemeği olarak tek başına yeter."
    ],
    "sss": [
      {
        "s": "Mercimek salatası diyette yenir mi?",
        "c": "Evet; lifli ve proteinli."
      },
      {
        "s": "Mercimek salatası tok tutar mı?",
        "c": "İyi tutar (A ligi)."
      }
    ]
  }
};
