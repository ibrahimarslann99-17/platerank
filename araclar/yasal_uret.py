# Yasal sayfalari (TR + EN) tek sablondan uretir. Metni degistirince yeniden calistir: python3 araclar/yasal_uret.py
import os
KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARIH = {'tr': '21 Ekim 2026', 'en': 'October 21, 2026'}
MAIL = 'iletisim@platerank.dev'
ALT = {
 'tr': [('/kosullar', 'Kullanım koşulları'), ('/gizlilik', 'Gizlilik'), ('/iade', 'İade ve iptal'), ('/', 'Ana sayfa')],
 'en': [('/en/terms', 'Terms'), ('/en/privacy', 'Privacy'), ('/en/refund', 'Refunds'), ('/en', 'Home')],
}
SABLON = '''<!doctype html>
<html lang="{dil}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{baslik} · PlateRank</title>
<meta name="description" content="{aciklama}">
<link rel="canonical" href="https://platerank.dev{yol}">
<link rel="alternate" hreflang="{dil2}" href="https://platerank.dev{karsi}">
<style>
  :root {{ --zemin:#E6EFE8; --yazi:#1F3A2B; --soluk:#4F6B5A; --vurgu:#2E5E3F; }}
  body {{ margin:0; background:var(--zemin); color:var(--yazi); font:16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }}
  main {{ max-width:680px; margin:0 auto; padding:40px 16px 64px; }}
  h1 {{ font-size:28px; margin:0 0 8px; }}
  h2 {{ font-size:18px; margin:28px 0 6px; }}
  .not {{ color:var(--soluk); font-size:14px; }}
  a {{ color:var(--vurgu); }}
  ul {{ padding-left:20px; }}
  li {{ margin:4px 0; }}
</style>
</head>
<body>
<main>
  <h1>{baslik}</h1>
  <p class="not">{guncel}: {tarih}</p>
{govde}
  <p class="not">{iletisim}: <a href="mailto:{mail}">{mail}</a> · {alt}</p>
</main>
</body>
</html>
'''

S = {}

S['kosullar'] = ('tr', '/kosullar', '/en/terms', 'Kullanım koşulları',
 'PlateRank ve Tok Plan aboneliğinin kullanım koşulları.', '''
  <p>Bu koşullar platerank.dev sitesini ve ücretli <strong>Tok Plan</strong> aboneliğini kullanman için geçerlidir. Siteyi kullanarak ya da abone olarak bu koşulları kabul etmiş olursun.</p>

  <h2>Hizmet</h2>
  <p>PlateRank yemeklerin ne kadar tok tuttuğunu puanlayan ücretsiz bir sitedir. Tok Plan, verdiğin bilgilere göre günlük kalori, protein, yağ, lif ve karbonhidrat hedefini, öğün sayısını, öğün bazında makro dağılımını ve haftalık yemek planını hesaplayan aylık bir aboneliktir.</p>

  <h2>Tıbbi tavsiye değildir</h2>
  <p>Puanlar ve planlar hesaplamadır, ölçüm değildir. Genel olarak sağlıklı yetişkinler için tasarlanmıştır ve doktor ya da diyetisyen tavsiyesinin yerini tutmaz. 18 yaşından küçüksen, hamileysen veya emziriyorsan, kronik bir hastalığın varsa ya da düzenli ilaç kullanıyorsan plan oluşturmadan önce doktoruna danış. Sistem bu durumlarda plan üretmez. Planı uygularken kendini kötü hissedersen bırak ve bir uzmana başvur.</p>

  <h2>Abonelik ve ödeme</h2>
  <ul>
    <li>Tok Plan aylık 5 ABD dolarıdır. Bulunduğun ülkeye göre vergi eklenebilir; ödeme ekranında son tutarı görürsün.</li>
    <li>Ödemeler, satıcı sıfatıyla (merchant of record) <a href="https://polar.sh">Polar</a> tarafından alınır ve faturalanır. Kart bilgilerin PlateRank'e ulaşmaz.</li>
    <li>Abonelik sen iptal edene kadar her ay otomatik yenilenir.</li>
    <li>İstediğin zaman, ödeme e-postandaki bağlantıdan, Polar müşteri portalından ya da bize yazarak iptal edebilirsin. İptalden sonra ödediğin dönemin sonuna kadar erişimin sürer.</li>
    <li>Fiyat değişirse en az 30 gün önce e-postayla haber veririz; yeni fiyat bir sonraki yenilemeden itibaren geçerli olur.</li>
    <li>İade koşulları için <a href="/iade">iade ve iptal</a> sayfasına bak.</li>
  </ul>

  <h2>Senin yükümlülüklerin</h2>
  <ul>
    <li>Formda doğru bilgi ver. Yanlış bilgiyle hesaplanan plandan sorumlu değiliz.</li>
    <li>Aboneliğini kişisel kullanım içindir; hesabını paylaşma, planları yeniden satma.</li>
    <li>Siteyi otomatik araçlarla aşırı yükleme, ücretli içeriğe yetkisiz erişmeye çalışma.</li>
  </ul>
  <p>Açık veri setinin kullanım koşulları ayrıdır: <a href="/lisans">veri lisansı</a>.</p>

  <h2>Sorumluluğun sınırı</h2>
  <p>Hizmet "olduğu gibi" sunulur. Kesintisiz veya hatasız çalışacağını garanti etmeyiz. Yürürlükteki hukukun izin verdiği ölçüde, hizmetle ilgili toplam sorumluluğumuz son 12 ayda bize ödediğin tutarla sınırlıdır. Bu sınır, kanunen sınırlanamayan haklarını etkilemez.</p>

  <h2>Sonlandırma</h2>
  <p>Bu koşulları ağır şekilde ihlal eden hesapları kapatabiliriz. Hizmeti tamamen durdurursak kalan dönemin ücretini iade ederiz.</p>

  <h2>Değişiklikler ve hukuk</h2>
  <p>Koşulları güncelleyebiliriz; önemli değişiklikleri abonelere e-postayla bildiririz. Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Tüketici olarak yaşadığın ülkenin zorunlu tüketici koruma kuralları saklıdır.</p>
''')

S['gizlilik'] = ('tr', '/gizlilik', '/en/privacy', 'Gizlilik politikası',
 'PlateRank ve Tok Plan için hangi verilerin neden toplandığı ve nasıl korunduğu.', '''
  <p>PlateRank bireysel olarak işletilen bir projedir ve bu metinde "biz" olarak anılır. Kişisel verilerin 6698 sayılı KVKK ve, Avrupa'daysan, GDPR kapsamında işlenir. Kısaca: yalnızca hizmet için gerekeni toplarız, veri satmayız, reklam takibi yapmayız.</p>

  <h2>Ne topluyoruz, neden</h2>
  <ul>
    <li><strong>Tok Plan formu:</strong> e-posta, yaş, cinsiyet, boy, kilo, aktivite düzeyi, hedef, kalkış ve yatış saati, öğün tercihi, tipik kahvaltın. Amaç planını hesaplamak ve sana ulaştırmak.</li>
    <li><strong>Sağlık kontrol soruları:</strong> hamilelik veya kronik hastalık sorularına verdiğin cevaplar yalnızca o anda planın uygun olup olmadığına karar vermek için kullanılır, <strong>kaydedilmez</strong>. 18 yaşından küçükler için plan oluşturulmaz ve kayıt tutulmaz.</li>
    <li><strong>Hesap:</strong> giriş için e-posta adresin ve oturum bilgisi.</li>
    <li><strong>Abonelik:</strong> Polar'dan gelen abonelik durumu, dönem sonu tarihi ve e-posta. Kart ve banka bilgileri yalnızca Polar'da işlenir.</li>
    <li><strong>Tokluk cevapları:</strong> bir yemeğin seni ne kadar tok tuttuğuna dair verdiğin cevaplar. Yemek puanlarını iyileştirmek için toplu olarak kullanılır.</li>
    <li><strong>Cihaz kimliği:</strong> oy verirken tarayıcında rastgele üretilen bir kimlik gönderilir; amacı aynı cihazdan tekrar eden oyları ayıklamaktır. Adınla veya e-postanla eşleştirilmez.</li>
    <li><strong>Tarayıcı depolama:</strong> favorilerin, menün ve ayarların tarayıcının yerel depolamasında tutulur, sunucuya gönderilmez.</li>
    <li><strong>Ziyaret istatistiği:</strong> Vercel Web Analytics ile çerezsiz, toplu sayfa görüntüleme sayıları.</li>
  </ul>

  <h2>Hukuki dayanak</h2>
  <p>Plan ve abonelik verileri sözleşmenin kurulması ve ifası için; boy, kilo gibi sağlıkla ilişkili bilgiler formda verdiğin açık rıza ile; güvenlik ve kötüye kullanımı önleme meşru menfaat kapsamında işlenir. Rızanı istediğin zaman geri alabilirsin; bu durumda planı hesaplayamayız.</p>

  <h2>Kimlerle paylaşıyoruz</h2>
  <p>Verilerini satmayız. Hizmeti çalıştırmak için şu hizmet sağlayıcılar adımıza veri işler:</p>
  <ul>
    <li><strong>Supabase:</strong> veritabanı ve giriş</li>
    <li><strong>Vercel:</strong> barındırma ve ziyaret istatistiği</li>
    <li><strong>Polar:</strong> ödeme, faturalama ve vergi</li>
  </ul>
  <p>Bu sağlayıcıların sunucuları Türkiye dışında (AB veya ABD) bulunabilir. Aktarım, hizmetin sunulması için gerekli olduğu ölçüde ve sağlayıcıların veri koruma taahhütleriyle yapılır. Kanunen zorunlu olmadıkça veriler başka kimseyle paylaşılmaz.</p>

  <h2>Ne kadar saklıyoruz</h2>
  <p>Plan verilerin aboneliğin sürdükçe saklanır. Aboneliğin bittikten 12 ay sonra, hiç abone olmadıysan planı oluşturduğun tarihten 12 ay sonra silinir. Silme talebinde 30 gün içinde sileriz. Fatura kayıtları yasal süre boyunca Polar'da tutulur.</p>

  <h2>Hakların</h2>
  <p>Verilerine erişme, düzeltme, silme, işlemeye itiraz etme ve verilerini taşınabilir biçimde alma hakkın var. Talebini e-postayla ilet, en geç 30 gün içinde cevaplarız. Cevabımızdan memnun kalmazsan Kişisel Verileri Koruma Kurulu'na veya yaşadığın ülkedeki veri koruma otoritesine başvurabilirsin.</p>

  <h2>Güvenlik</h2>
  <p>Bağlantılar şifrelidir. Veritabanında satır düzeyinde erişim kuralları açıktır; her kullanıcı yalnızca kendi planını görebilir.</p>

  <h2>Değişiklikler</h2>
  <p>Bu metni güncellersek tarihi değiştiririz; önemli değişiklikleri abonelere e-postayla bildiririz.</p>
''')

S['iade'] = ('tr', '/iade', '/en/refund', 'İade ve iptal',
 'Tok Plan aboneliğinin iade ve iptal koşulları.', '''
  <p>Kısaca: memnun kalmazsan paranı geri veririz.</p>

  <h2>İade</h2>
  <ul>
    <li><strong>İlk ödeme:</strong> ödemeden sonraki 14 gün içinde iade isteyebilirsin. Gerekçe sormayız.</li>
    <li><strong>Yenileme ödemeleri:</strong> iptal etmeyi unuttuysan, yenilemeden sonraki 7 gün içinde yazarsan o ayın ücretini iade ederiz.</li>
    <li>Hizmet bizim kaynaklı bir sorun yüzünden çalışmadıysa, süreye bakmadan etkilenen dönemi iade ederiz.</li>
  </ul>

  <h2>Nasıl istenir</h2>
  <p>Ödemede kullandığın e-postadan <a href="mailto:iletisim@platerank.dev">iletisim@platerank.dev</a> adresine yaz. İade Polar üzerinden ödeme yaptığın karta ya da hesaba yapılır. Bankana göre hesabına geçmesi 5 ile 10 iş günü sürebilir.</p>

  <h2>İptal</h2>
  <p>İptal bir sonraki yenilemeyi durdurur, para iadesi değildir. Ödeme e-postandaki bağlantıdan, Polar müşteri portalından ya da bize yazarak istediğin zaman iptal edebilirsin. Ödediğin dönemin sonuna kadar planına erişmeye devam edersin.</p>

  <h2>Yasal hakların</h2>
  <p>Bu koşullar, yaşadığın ülkenin tüketici mevzuatından doğan haklarını kısıtlamaz.</p>
''')

S['en-terms'] = ('en', '/en/terms', '/kosullar', 'Terms of service',
 'Terms of use for PlateRank and the Stay Full Plan subscription.', '''
  <p>These terms apply to your use of platerank.dev and the paid <strong>Stay Full Plan</strong> subscription. By using the site or subscribing you agree to them.</p>

  <h2>The service</h2>
  <p>PlateRank is a free site that scores how filling foods are. The Stay Full Plan is a monthly subscription that uses the details you provide to calculate your daily calorie, protein, fat, fiber and carbohydrate targets, your number of meals, a per-meal macro split and a weekly meal plan.</p>

  <h2>Not medical advice</h2>
  <p>Scores and plans are calculations, not measurements. They are designed for generally healthy adults and do not replace advice from a doctor or dietitian. If you are under 18, pregnant or breastfeeding, have a chronic condition or take regular medication, talk to your doctor before creating a plan. The system does not generate plans in these cases. If you feel unwell while following a plan, stop and see a professional.</p>

  <h2>Subscription and payment</h2>
  <ul>
    <li>The Stay Full Plan costs USD 5 per month. Tax may be added depending on your country; you will see the final amount at checkout.</li>
    <li>Payments are collected and invoiced by <a href="https://polar.sh">Polar</a> as merchant of record. Your card details never reach PlateRank.</li>
    <li>The subscription renews automatically every month until you cancel.</li>
    <li>You can cancel at any time via the link in your payment email, the Polar customer portal, or by emailing us. After cancelling you keep access until the end of the period you paid for.</li>
    <li>If the price changes we will email you at least 30 days in advance; the new price applies from the next renewal.</li>
    <li>See <a href="/en/refund">refunds and cancellation</a> for refund terms.</li>
  </ul>

  <h2>Your obligations</h2>
  <ul>
    <li>Provide accurate information. We are not responsible for plans calculated from incorrect data.</li>
    <li>Your subscription is for personal use; do not share your account or resell plans.</li>
    <li>Do not overload the site with automated tools or try to access paid content without authorization.</li>
  </ul>
  <p>The open dataset has its own terms: <a href="/lisans">data license</a>.</p>

  <h2>Limitation of liability</h2>
  <p>The service is provided "as is". We do not guarantee that it will be uninterrupted or error-free. To the extent permitted by applicable law, our total liability related to the service is limited to the amount you paid us in the last 12 months. This does not affect rights that cannot be limited by law.</p>

  <h2>Termination</h2>
  <p>We may close accounts that seriously breach these terms. If we shut the service down entirely, we will refund the unused part of your current period.</p>

  <h2>Changes and governing law</h2>
  <p>We may update these terms and will email subscribers about material changes. These terms are governed by the laws of the Republic of Türkiye. Mandatory consumer protection rules of your country of residence still apply.</p>
''')

S['en-privacy'] = ('en', '/en/privacy', '/gizlilik', 'Privacy policy',
 'What data PlateRank and the Stay Full Plan collect, why, and how it is protected.', '''
  <p>PlateRank is operated by an individual and is referred to as "we" in this policy. Personal data is processed under Turkish data protection law (KVKK) and, if you are in Europe, the GDPR. In short: we collect only what the service needs, we do not sell data and we do not run ad tracking.</p>

  <h2>What we collect and why</h2>
  <ul>
    <li><strong>Plan form:</strong> email, age, sex, height, weight, activity level, goal, wake and sleep times, meal preference and your typical breakfast. Used to calculate and deliver your plan.</li>
    <li><strong>Health screening questions:</strong> your answers about pregnancy or chronic conditions are used only at that moment to decide whether a plan is appropriate and are <strong>not stored</strong>. No plan is created and nothing is stored for people under 18.</li>
    <li><strong>Account:</strong> your email address and session data for sign-in.</li>
    <li><strong>Subscription:</strong> subscription status, period end date and email received from Polar. Card and bank details are processed only by Polar.</li>
    <li><strong>Fullness answers:</strong> your answers about how long a food kept you full. Used in aggregate to improve food scores.</li>
    <li><strong>Device ID:</strong> when you vote, a random ID generated in your browser is sent so repeat votes from the same device can be filtered. It is not linked to your name or email.</li>
    <li><strong>Browser storage:</strong> your favorites, menu and settings are kept in your browser's local storage and are not sent to our servers.</li>
    <li><strong>Visit statistics:</strong> cookieless, aggregate page view counts via Vercel Web Analytics.</li>
  </ul>

  <h2>Legal basis</h2>
  <p>Plan and subscription data are processed to enter into and perform our contract with you; health-related details such as height and weight are processed with the explicit consent you give in the form; security and abuse prevention rely on legitimate interest. You can withdraw consent at any time, in which case we cannot calculate your plan.</p>

  <h2>Who we share it with</h2>
  <p>We do not sell your data. These providers process data on our behalf to run the service:</p>
  <ul>
    <li><strong>Supabase:</strong> database and sign-in</li>
    <li><strong>Vercel:</strong> hosting and visit statistics</li>
    <li><strong>Polar:</strong> payments, invoicing and tax</li>
  </ul>
  <p>Their servers may be located outside Türkiye (in the EU or US). Transfers happen only as needed to provide the service and under the providers' data protection commitments. We do not share data with anyone else unless required by law.</p>

  <h2>How long we keep it</h2>
  <p>Plan data is kept while your subscription is active and deleted 12 months after it ends, or 12 months after you created the plan if you never subscribed. If you ask us to delete it, we do so within 30 days. Invoice records are kept by Polar for the legally required period.</p>

  <h2>Your rights</h2>
  <p>You have the right to access, correct and delete your data, to object to processing and to receive your data in a portable format. Email your request and we will reply within 30 days. If you are not satisfied with our answer, you can complain to the Turkish Personal Data Protection Authority or the data protection authority in your country.</p>

  <h2>Security</h2>
  <p>Connections are encrypted. Row-level access rules are enabled in the database, so each user can see only their own plan.</p>

  <h2>Changes</h2>
  <p>If we update this policy we will change the date above and email subscribers about material changes.</p>
''')

S['en-refund'] = ('en', '/en/refund', '/iade', 'Refunds and cancellation',
 'Refund and cancellation terms for the Stay Full Plan subscription.', '''
  <p>In short: if you are not happy, you get your money back.</p>

  <h2>Refunds</h2>
  <ul>
    <li><strong>First payment:</strong> you can request a refund within 14 days of paying. No questions asked.</li>
    <li><strong>Renewals:</strong> if you forgot to cancel, write to us within 7 days of the renewal and we will refund that month.</li>
    <li>If the service did not work because of a problem on our side, we refund the affected period regardless of timing.</li>
  </ul>

  <h2>How to request one</h2>
  <p>Email <a href="mailto:iletisim@platerank.dev">iletisim@platerank.dev</a> from the address you paid with. Refunds are issued through Polar to your original payment method and may take 5 to 10 business days to appear, depending on your bank.</p>

  <h2>Cancellation</h2>
  <p>Cancelling stops the next renewal; it is not a refund. You can cancel at any time via the link in your payment email, the Polar customer portal, or by emailing us. You keep access to your plan until the end of the period you paid for.</p>

  <h2>Statutory rights</h2>
  <p>These terms do not limit any rights you have under the consumer laws of your country.</p>
''')

for ad, (dil, yol, karsi, baslik, aciklama, govde) in S.items():
    alt = ' · '.join(f'<a href="{u}">{t}</a>' for u, t in ALT[dil] if u != yol)
    html = SABLON.format(dil=dil, dil2='en' if dil == 'tr' else 'tr', yol=yol, karsi=karsi, baslik=baslik,
        aciklama=aciklama, guncel='Son güncelleme' if dil == 'tr' else 'Last updated', tarih=TARIH[dil],
        govde=govde.rstrip(), iletisim='İletişim' if dil == 'tr' else 'Contact', mail=MAIL, alt=alt)
    open(os.path.join(KOK, ad + '.html'), 'w', encoding='utf-8').write(html)
    print(ad + '.html', len(html))
