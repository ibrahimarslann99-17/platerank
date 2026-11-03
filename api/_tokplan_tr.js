// Türkçe Tok Plan (/tok-plan): İngilizce plan sayfasının (_tokplan_sayfa.js) ve istemcisinin (/tokplan.js)
// Türkçesi. Ayrı kod yazılmaz; İngilizce kaynak bu tabloyla çevrilir. İngilizce tarafta yeni bir metin
// eklenirse buraya da satır eklenir, eklenmezse Türkçe sayfada İngilizce kalır.

const fs = require('fs');
const path = require('path');
const { tokPlanSayfasi } = require('./_tokplan_sayfa.js');

function uygula(s, tablo, ad) {
  const eksik = [];
  for (const [a, b] of tablo) {
    if (!s.includes(a)) { eksik.push(a.slice(0, 60)); continue; }
    s = s.split(a).join(b);
  }
  if (eksik.length) console.warn('tok-plan tr (' + ad + '): bulunamayan parçalar', eksik);
  uygula.eksik = (uygula.eksik || []).concat(eksik);
  return s;
}

// ---------- istemci (/tokplan.js → /tok-plan.js) ----------
const JS = [
  ["var D = { dil: 'en',", "var D = { dil: 'tr',"],
  ["var g = { dil: 'en',", "var g = { dil: 'tr',"],
  ["'/en/plan?id='", "'/tok-plan?id='"],
  ["function saat12(s) { if (!s) return ''; var h = Number(s.slice(0, 2)), m = s.slice(3); var ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return h + (m === '00' ? '' : ':' + m) + ' ' + ap; }",
    "function saat12(s) { return s || ''; }"],
  ["toLocaleString('en-US')", "toLocaleString('tr-TR')"],
  ['aria-label="Units"', 'aria-label="Birim"'],
  ['href="/en/privacy"', 'href="/gizlilik"'],
  ['href="/en"', 'href="/"'],
  // anket
  ["soru: \"What's your goal?\"", "soru: 'Hedefin ne?'"],
  ["'Lose weight', 'A steady deficit with high protein'", "'Kilo vermek', 'Yüksek proteinle istikrarlı bir açık'"],
  ["'Eat healthier', 'Same weight, better meals'", "'Daha sağlıklı beslenmek', 'Aynı kilo, daha iyi öğünler'"],
  ["'Build muscle', 'A small surplus with more protein'", "'Kas yapmak', 'Daha çok proteinle küçük bir fazla'"],
  ["soru: 'Your sex', acik: 'Used for your calorie estimate.'", "soru: 'Cinsiyetin', acik: 'Kalori tahmininde kullanılır.'"],
  ["'kadin', 'Female'", "'kadin', 'Kadın'"],
  ["'erkek', 'Male'", "'erkek', 'Erkek'"],
  ["soru: 'How old are you?'", "soru: 'Kaç yaşındasın?'"],
  ['<span>years</span>', '<span>yaş</span>'],
  ["'Enter your age in years.'", "'Yaşını yaz.'"],
  ["soru: 'Does any of this apply to you?', acik: \"We'll check this before building anything. Your answer isn't stored.\"", "soru: 'Bunlardan biri sende var mı?', acik: 'Plan kurmadan önce bunu kontrol ediyoruz. Cevabın saklanmaz.'"],
  ["'Pregnant or breastfeeding'", "'Hamilelik ya da emzirme'"],
  ["'A chronic condition or regular medication', 'For example diabetes, kidney or heart disease'", "'Kronik bir hastalık ya da düzenli ilaç', 'Örneğin diyabet, böbrek ya da kalp hastalığı'"],
  ["'An eating disorder, now or in the past'", "'Şimdi ya da geçmişte bir yeme bozukluğu'"],
  ["'None of these'", "'Hiçbiri'"],
  ["soru: 'How tall are you?'", "soru: 'Boyun kaç?'"],
  ["'Enter a height between 4 ft and 7 ft 6 in (120 to 230 cm).'", "'120 ile 230 cm arasında bir boy yaz.'"],
  ["soru: 'How much do you weigh?'", "soru: 'Kaç kilosun?'"],
  ["'Enter a weight between 66 and 660 lb (30 to 300 kg).'", "'30 ile 300 kg arasında bir kilo yaz.'"],
  ["soru: 'How active is a normal week?'", "soru: 'Normal bir haftan ne kadar hareketli?'"],
  ["'Mostly sitting', 'Desk job, little exercise'", "'Çoğunlukla oturarak', 'Masa başı iş, az spor'"],
  ["'Lightly active', 'Walks, exercise 1 to 3 days'", "'Hafif hareketli', 'Yürüyüş, haftada 1-3 gün spor'"],
  ["'Active', 'Exercise 3 to 5 days'", "'Hareketli', 'Haftada 3-5 gün spor'"],
  ["'Very active', 'Hard training or a physical job'", "'Çok hareketli', 'Ağır antrenman ya da bedensel iş'"],
  ["soru: 'When do you usually wake up and go to bed?', acik: 'Meal times are built around this.'", "soru: 'Genelde kaçta kalkıp kaçta yatıyorsun?', acik: 'Öğün saatleri buna göre kurulur.'"],
  ['<span>Wake</span>', '<span>Kalkış</span>'],
  ['<span>Bed</span>', '<span>Yatış</span>'],
  ["'Enter both times.'", "'İki saati de yaz.'"],
  ["soru: 'Any diet or allergies?'", "soru: 'Diyetin ya da alerjin var mı?'"],
  ["['gluten', 'Gluten'], ['sut', 'Dairy'], ['yumurta', 'Eggs'], ['balik', 'Fish and seafood'], ['kuruyemis', 'Nuts'], ['soya', 'Soy'], ['baklagil', 'Beans and lentils']",
    "['gluten', 'Gluten'], ['sut', 'Süt ürünleri'], ['yumurta', 'Yumurta'], ['balik', 'Balık ve deniz ürünleri'], ['kuruyemis', 'Kuruyemiş'], ['soya', 'Soya'], ['baklagil', 'Baklagiller']"],
  ["[['yok', 'No restriction'], ['vejetaryen', 'Vegetarian'], ['vegan', 'Vegan']]", "[['yok', 'Kısıtlama yok'], ['vejetaryen', 'Vejetaryen'], ['vegan', 'Vegan']]"],
  ['<p class="tp-acik">Leave out</p>', '<p class="tp-acik">Çıkarılacaklar</p>'],
  ["soru: 'What do you usually eat for breakfast?', acik: \"We'll show you how long it really keeps you full.\"", "soru: 'Kahvaltıda genelde ne yersin?', acik: 'Seni gerçekte ne kadar tok tuttuğunu göstereceğiz.'"],
  ["secenek('kahvalti', 'tost_recel', 'Toast and jam') + secenek('kahvalti', 'gevrek', 'Cereal with milk') + secenek('kahvalti', 'yumurta_tost', 'Eggs and toast') + secenek('kahvalti', 'bagel', 'Bagel with cream cheese') + secenek('kahvalti', 'hamur', 'Pastry or muffin') + secenek('kahvalti', 'yulaf', 'Oatmeal') + secenek('kahvalti', 'kahve', 'Just coffee') + secenek('kahvalti', 'atla', 'I skip it')",
    "secenek('kahvalti', 'simit', 'Simit, peynir, çay') + secenek('kahvalti', 'serpme', 'Serpme kahvaltı') + secenek('kahvalti', 'yumurta_tost', 'Yumurta ve ekmek') + secenek('kahvalti', 'tost_recel', 'Ekmek ve reçel') + secenek('kahvalti', 'gevrek', 'Sütlü gevrek') + secenek('kahvalti', 'hamur', 'Poğaça ya da börek') + secenek('kahvalti', 'yulaf', 'Yulaf') + secenek('kahvalti', 'kahve', 'Sadece kahve') + secenek('kahvalti', 'atla', 'Kahvaltı yapmam')"],
  ["soru: 'Where should we send your plan?'", "soru: 'Planını nereye gönderelim?'"],
  ['placeholder="you@example.com"', 'placeholder="sen@ornek.com"'],
  ['<span>I agree that PlateRank uses my answers, including height and weight, to build my plan. <a href="/gizlilik" target="_blank">Privacy policy</a></span>', '<span>PlateRank’in planımı kurmak için boy ve kilo dahil cevaplarımı kullanmasını kabul ediyorum. <a href="/gizlilik" target="_blank">Gizlilik politikası</a></span>'],
  ["'Enter a valid email.'", "'Geçerli bir e-posta yaz.'"],
  ["'Tick the box to continue.'", "'Devam etmek için kutuyu işaretle.'"],
  ["(adim ? '‹ Back' : '‹ Home')", "(adim ? '‹ Geri' : '‹ Başa dön')"],
  ["<span>Step ' + (adim + 1) + ' of ' + ADIMLAR.length + '</span>", "<span>Adım ' + (adim + 1) + ' / ' + ADIMLAR.length + '</span>"],
  ["(a.son ? 'See my targets' : 'Continue')", "(a.son ? 'Hedeflerimi gör' : 'Devam')"],
  // engeller
  ["yas: ['This plan is for adults', \"Growing bodies need more than a calorie target can capture. A doctor or school nurse can help you plan meals that fit you.\"]",
    "yas: ['Bu plan yetişkinler için', 'Büyüyen bir vücudun ihtiyacı bir kalori hedefine sığmaz. Sana uygun öğünleri bir doktor ya da okul hemşiresi planlayabilir.']"],
  ["doktor: ['Talk to your doctor first', \"With what you selected, a generic calorie and protein target could do more harm than good. A doctor or registered dietitian can set targets that fit your situation.\"]",
    "doktor: ['Önce doktoruna danış', 'Seçtiğin durumda genel bir kalori ve protein hedefi faydadan çok zarar verebilir. Durumuna uygun hedefi bir doktor ya da diyetisyen belirlemeli.']"],
  ["zayif: ['Weight loss isn\\u2019t a good fit right now', 'Your weight is already below the healthy range for your height. Try \"Eat healthier\" instead, or talk to a doctor.']",
    "zayif: ['Şu an kilo vermek sana uygun değil', 'Kilon boyuna göre sağlıklı aralığın zaten altında. Bunun yerine “Daha sağlıklı beslenmek”i seç ya da bir doktora danış.']"],
  ['Browse foods by fullness</a>', 'Yemekleri tokluğa göre incele</a>'],
  // gönderim ve sonuç
  ["btn.textContent = 'Building your plan…';", "btn.textContent = 'Planın hazırlanıyor…';"],
  ['"Something went wrong. Try again in a moment."', "'Bir şeyler ters gitti. Birazdan tekrar dene.'"],
  ['"Couldn\'t reach the server. Check your connection and try again."', "'Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene.'"],
  ["var OGUN = { kahvalti: 'Breakfast', ogle: 'Lunch', aksam: 'Dinner', ara: 'Snack', ara1: 'Snack', ara2: 'Snack' };", "var OGUN = { kahvalti: 'Kahvaltı', ogle: 'Öğle', aksam: 'Akşam', ara: 'Ara öğün', ara1: 'Ara öğün', ara2: 'Ara öğün' };"],
  ["var TIPIK_AD = { tost_recel: 'toast and jam', gevrek: 'cereal', yumurta_tost: 'eggs and toast', bagel: 'bagel', hamur: 'pastry', yulaf: 'oatmeal', kahve: 'coffee', simit: 'simit', serpme: 'breakfast spread' };",
    "var TIPIK_AD = { tost_recel: 'ekmek-reçel', gevrek: 'gevrek', yumurta_tost: 'yumurta-ekmek', bagel: 'bagel', hamur: 'poğaça', yulaf: 'yulaf', kahve: 'kahve', simit: 'simit', serpme: 'serpme kahvaltı' };"],
  ['<span>Your usual morning</span>', '<span>Her zamanki sabahın</span>'],
  ['<span>Your plan</span>', '<span>Planın</span>'],
  ['</span> full &nbsp; <span', '</span> tok &nbsp; <span'],
  ['</span> hungry</p>', '</span> aç</p>'],
  ["return 'Your plan is ready';", "return 'Planın hazır';"],
  ["return 'Skipping breakfast leaves a long gap. This one carries you to ' + ogle + '.';", "return 'Kahvaltıyı atlamak uzun bir boşluk bırakıyor. Bu kahvaltı seni ' + ogle + ' saatine kadar taşır.';"],
  ["return 'Your breakfast already holds up well. Here\\u2019s the rest of your day.';", "return 'Kahvaltın zaten iyi dayanıyor. Günün geri kalanı burada.';"],
  ["return 'Your ' + (TIPIK_AD[k.tipik] || 'breakfast') + ' runs out around ' + bitis + '. Ours lasts until ' + ogle + '.';", "return 'Senin ' + (TIPIK_AD[k.tipik] || 'kahvaltın') + ' ' + bitis + ' civarı bitiyor. Bizimki seni ' + ogle + ' saatine kadar götürüyor.';"],
  ["(OGUN[o.ogun] || 'Meal') + ' · Chosen dish<small>'", "(OGUN[o.ogun] || 'Öğün') + ' · Seçilen yemek<small>'"],
  ['>Your daily targets</p>', '>Günlük hedeflerin</p>'],
  ['<span>kcal a day</span>', '<span>kcal / gün</span>'],
  ['<span>meals</span>', '<span>öğün</span>'],
  ["'<p class=\"tp-acik\">Fat ' + s.gunluk.yag + ' g · Carbs ' + s.gunluk.karbonhidrat + ' g · Fiber ' + s.gunluk.lif + ' g</p>'", "'<p class=\"tp-acik\">Yağ ' + s.gunluk.yag + ' g · Karbonhidrat ' + s.gunluk.karbonhidrat + ' g · Lif ' + s.gunluk.lif + ' g</p>'"],
  ['<div class="ust">7-day plan, meal by meal</div>', '<div class="ust">7 günlük plan, öğün öğün</div>'],
  ['>Unlock my plan · $5/month</button>', '>Planımı aç · aylık 5 $</button>'],
  ['>Yearly · $30 <small>($2.50/month)</small></button>', '>Yıllık · 30 $ <small>(aylık 2,5 $)</small></button>'],
  ['>Cancel anytime · Refund within 14 days · Secure checkout by Polar</p>', '>İstediğin zaman iptal · 14 gün içinde iade · Güvenli ödeme: Polar</p>'],
  ["t.textContent = 'Opening checkout…';", "t.textContent = 'Ödeme açılıyor…';"],
  ["'Checkout opens soon. Your targets are saved to this link.' : 'Couldn\\u2019t open checkout. Try again.'", "'Ödeme yakında açılıyor. Hedeflerin bu bağlantıda kayıtlı.' : 'Ödeme açılamadı. Tekrar dene.'"],
  ["$('.tp-hata', sonuc).textContent = 'Couldn\\u2019t reach the server. Try again.';", "$('.tp-hata', sonuc).textContent = 'Sunucuya ulaşılamadı. Tekrar dene.';"],
  // plan görünümü
  ["return p.kat + (p.kat === 1 ? ' egg' : ' eggs');", "return p.kat + ' yumurta';"],
  ["return p.porsiyon || '1 serving';", "return p.porsiyon || '1 porsiyon';"],
  ["return p.porsiyon ? k + ' × ' + p.porsiyon : k + ' servings';", "return p.porsiyon ? k + ' × ' + p.porsiyon : k + ' porsiyon';"],
  [">Day ' + (i + 1) + '</button>'", ">' + (i + 1) + '. gün</button>'"],
  ["' g protein · full ~' + saatYaz(s.toplam.tokSaat) + ' h</span>'", "' g protein · tok ~' + saatYaz(s.toplam.tokSaat) + ' sa</span>'"],
  [">Swap (' + ", ">Değiştir (' + "],
  ["'<div class=\"tp-kutu\"><p class=\"tp-acik\" style=\"margin:0\">Week ' + ((P.hafta || 0) + 1) + ' · ' + P.gunluk.kcal.toLocaleString('tr-TR') + ' kcal · ' + P.gunluk.protein + ' g protein a day</p>'",
    "'<div class=\"tp-kutu\"><p class=\"tp-acik\" style=\"margin:0\">' + ((P.hafta || 0) + 1) + '. hafta · günde ' + P.gunluk.kcal.toLocaleString('tr-TR') + ' kcal · ' + P.gunluk.protein + ' g protein</p>'"],
  ['>Your Stay Full Plan</h2>', '>Tok Planın</h2>'],
  ['<span>Day total</span>', '<span>Gün toplamı</span>'],
  ['>Bookmark this page to come back to your plan. A new week is built every 7 days.</p>', '>Planına dönmek için bu sayfayı yer imlerine ekle. Her 7 günde bir yeni hafta kurulur.</p>'],
  ['<p>Loading your plan…</p>', '<p>Planın yükleniyor…</p>'],
  ['<p>Couldn\\u2019t load your plan. Refresh to try again.</p>', '<p>Planın yüklenemedi. Sayfayı yenileyip tekrar dene.</p>'],
];

// ---------- sayfa ----------
const SAYFA = [
  ['<h1>A meal plan built around staying full</h1>', '<h1>Tok kalma üstüne kurulmuş bir yemek planı</h1>'],
  ['<p class="alt">Tell us how your day runs. We build a week of meals timed so each one carries you to the next, picked from 760 foods ranked by how long they keep you full.</p>', '<p class="alt">Günün nasıl geçtiğini anlat. Ne kadar tok tuttuklarına göre sıralanmış 760 yemekten, her öğün seni bir sonrakine taşıyacak şekilde zamanlanmış bir haftalık plan kuralım.</p>'],
  ['<li>Calorie and protein targets for every meal, not just the day</li>', '<li>Sadece gün için değil, her öğün için kalori ve protein hedefi</li>'],
  ['<li>Meal times matched to when you wake up and go to bed</li>', '<li>Kalkış ve yatış saatine göre ayarlanmış öğün saatleri</li>'],
  ['<li>Vegan, vegetarian and allergy filters</li>', '<li>Vegan, vejetaryen ve alerji filtreleri</li>'],
  ['<li>A new plan every week, with two swaps for every meal</li>', '<li>Her hafta yeni plan, her öğün için iki alternatif</li>'],
  ['data-basla>Build my plan</button>', 'data-basla>Planımı kur</button>'],
  ['<p class="tp-not">Your daily targets are free. The full plan is $5/month or $30/year, cancel anytime.</p>', '<p class="tp-not">Günlük hedeflerin ücretsiz. Tam plan aylık 5 $ ya da yıllık 30 $, istediğin zaman iptal.</p>'],
  ['<h2>How it works</h2>', '<h2>Nasıl çalışıyor?</h2>'],
  ['<div>Answer 11 short questions: your goal, body, schedule, diet and what you usually eat for breakfast.</div>', '<div>11 kısa soruyu cevapla: hedefin, vücudun, günün, beslenmen ve kahvaltıda genelde ne yediğin.</div>'],
  ['<div>See your daily calories and protein, and how long your current breakfast actually keeps you full.</div>', '<div>Günlük kalori ve proteinini, şu anki kahvaltının seni gerçekte ne kadar tok tuttuğunu gör.</div>'],
  ['<div>Unlock a 7-day plan: what to eat, how much and when, with the hours each meal keeps you full.</div>', '<div>7 günlük planı aç: ne, ne kadar ve ne zaman yiyeceğin, her öğünün seni kaç saat tok tuttuğuyla birlikte.</div>'],
  ['<h2>Questions</h2>', '<h2>Sorular</h2>'],
  ["<summary>How do you know how long a meal keeps me full?</summary><p>Every food on PlateRank has a fullness score built from its protein, fiber, fat, sugar and calories. A meal's hours come from its total calories and that score. It's an estimate, not a measurement. <a href=\"/en/method\">Read the method</a>.</p>",
    '<summary>Bir öğünün beni ne kadar tok tuttuğunu nereden biliyorsunuz?</summary><p>PlateRank’teki her yemeğin protein, lif, yağ, şeker ve kaloriden hesaplanan bir tokluk puanı var. Öğünün saati, toplam kalorisinden ve bu puandan gelir. Bu bir tahmin, ölçüm değil. <a href="/yontem">Yöntemi oku</a>.</p>'],
  ["<summary>Is this medical advice?</summary><p>No. Plans are for generally healthy adults. If you're under 18, pregnant or breastfeeding, have a chronic condition or take regular medication, talk to your doctor first. The plan builder won't create a plan in those cases.</p>",
    '<summary>Bu tıbbi tavsiye mi?</summary><p>Hayır. Planlar genel olarak sağlıklı yetişkinler içindir. 18 yaşından küçüksen, hamileysen ya da emziriyorsan, kronik bir hastalığın varsa ya da düzenli ilaç kullanıyorsan önce doktoruna danış. Bu durumlarda plan kurulmaz.</p>'],
  ["<summary>What if I don't like a meal?</summary><p>Every meal comes with two swaps that hit the same calories and protein.</p>", '<summary>Bir öğünü sevmezsem?</summary><p>Her öğünün aynı kalori ve proteini tutturan iki alternatifi var.</p>'],
  ['<summary>Can I cancel?</summary><p>Anytime, from the link in your payment email. Your first payment is refundable within 14 days. <a href="/en/refund">Refund policy</a>.</p>', '<summary>İptal edebilir miyim?</summary><p>İstediğin zaman, ödeme e-postandaki bağlantıdan. İlk ödemen 14 gün içinde iade edilir. <a href="/iade">İade koşulları</a>.</p>'],
  ['<p class="tp-not"><a href="/en/terms">Terms</a> · <a href="/en/privacy">Privacy</a> · <a href="/en/refund">Refunds</a></p>', '<p class="tp-not"><a href="/kosullar">Kullanım koşulları</a> · <a href="/gizlilik">Gizlilik</a> · <a href="/iade">İade ve iptal</a></p>'],
  ['<script src="/tokplan.js" defer></script>', '<script src="/tok-plan.js" defer></script>'],
];

// en.js'in sayfa() kabuğu: dil, bağlantılar, başlık ve alt bilgi
const KABUK = [
  ['<html lang="en">', '<html lang="tr">'],
  ['<meta property="og:locale" content="en_US">', '<meta property="og:locale" content="tr_TR">'],
  ['<a class="logo" href="/en">', '<a class="logo" href="/">'],
  ['<a class="btn" href="/en/food">All foods</a></header>', '<a class="btn" href="/yemek">Tüm yemekler</a></header>'],
  [`<footer><a href="/en/food">All foods</a> · <a href="/en/method">Method</a> · <a href="/en">PlateRank home</a> · <a href="/" hreflang="tr" lang="tr" onclick="document.cookie='pr_dil=tr;path=/;max-age=31536000'">Türkçe</a> · iletisim@platerank.dev</footer>`,
    `<footer><a href="/yemek">Tüm yemekler</a> · <a href="/yontem">Yöntem</a> · <a href="/">PlateRank ana sayfa</a> · <a href="/en/plan" hreflang="en" lang="en" onclick="document.cookie='pr_dil=en;path=/;max-age=31536000'">English</a> · iletisim@platerank.dev</footer>`],
];

let jsOnbellek = null;
function tokJsTr() {
  if (!jsOnbellek) jsOnbellek = uygula(fs.readFileSync(path.join(__dirname, '..', 'tokplan.js'), 'utf8'), JS, 'js');
  return jsOnbellek;
}

function tokPlanSayfasiTr() {
  const t = tokPlanSayfasi();
  return {
    baslik: 'Tok Plan: seni tok tutan haftalık yemek planı | PlateRank',
    aciklama: 'Her öğün için kalori ve protein hedefi olan, gününe göre zamanlanmış, her öğünün seni bir sonrakine kadar tok tuttuğu kişisel haftalık yemek planı. Günlük hedefler ücretsiz, tam plan aylık 5 $ ya da yıllık 30 $.',
    kanonik: 'https://platerank.dev/tok-plan',
    css: t.css,
    govde: uygula(t.govde, SAYFA, 'sayfa'),
  };
}

function kabukTr(html) { return uygula(html, KABUK, 'kabuk'); }

module.exports = { tokJsTr, tokPlanSayfasiTr, kabukTr, _eksik: () => uygula.eksik || [] };
