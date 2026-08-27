# PlateRank — Yol Haritası

Bu dosya, sitede yapılacakların listesi. Bitenler işaretlenir, yeni fikirler alta eklenir.

---

## Şu an ayakta olanlar

- Canlı adres: platerank.dev
- 7 mutfak, 162 yemek, hepsinde kalori + doyuruculuk + protein/lif/yağ/şeker
- Üç sıralama modu: Bilim (otomatik skor), Halk (topluluk oyu), Çelişki (ikisinin farkı)
- Protein hesaplayıcı: kilo × durum katsayısı, mutfağa göre örnek tabaklar, verimlilik listesi
- Öneri Sahnesi: topluluk önerir, 5 ateş oyu alan otomatik yayına girer
- Yönetici paneli (/admin.html): silme, gizleme, skor düzeltme, acil anahtar
- Küfür filtresi, cihaz başına tek oy, veritabanı uyandırma ekranı

---

## Sıradaki iş: yemek sayısını artırmak

**Sorun:** 162 yemek az. Mutfak başına ~23 yemek düşüyor; insanlar aradıklarını bulamayınca siteye güvenmiyor. Hedef: mutfak başına 40+, toplam 300 civarı.

**Öncelik sırası (etkisi en yüksek olandan):**

1. **Türk mutfağı derinleştirme** — En çok ziyaretçi buradan gelecek, en zengin mutfak ama sadece 33 yemek var.
   Eksikler: bölgesel yemekler (kısır, mıhlama, çiğ börek, testi kebabı, hamsili pilav), ev yemekleri (türlü, musakka, dolma çeşitleri, ıspanak yemeği), çorbalar (tarhana, işkembe, düğün çorbası), tatlılar (kazandibi, aşure, revani).

2. **Kahvaltı kategorisi** — Hiç yok. Oysa günün en çok sorgulanan öğünü.
   Menemen var ama: simit, poğaça, sucuklu yumurta, kaymak-bal, zeytin-peynir tabağı, omlet çeşitleri, tost, kaşarlı sandviç.

3. **Atıştırmalık ve market ürünleri** — Sitenin en çok işe yarayacağı yer burası; çünkü asıl "tatlı tuzak"lar burada.
   Cips, kraker, bisküvi, çikolata, protein bar, granola bar, kuruyemiş karışımı, meyve suyu, gazlı içecek, enerji içeceği.

4. **Zincir/fast food** — İnsanlar "Big Mac kaç kalori" diye arıyor.
   Burger zincirleri, tavuk zincirleri, pizza zincirleri, kahve zinciri içecekleri (frappe'ler şeker şokunda dip yapar, öğretici olur).

5. **Vejetaryen/vegan sütun** — Şu an bitkisel seçenek dağınık.
   Falafel, humus, mercimek köftesi, nohut salatası, tofu yemekleri, bitkisel sütler, vegan burger.

6. **Yeni mutfaklar** — Talep gelirse: Hint (v1'de çıkarılmıştı), Kore, Tayland, Yunan, Fransız, Orta Doğu.

**Nasıl eklenir:**
- Toplu ekleme: Supabase SQL editöründen `insert into yemekler (mutfak,ad,kcal,doyuruculuk,protein,lif,yag,seker) values (...)`
- Tek tek: Öneri Sahnesi'nden topluluk önerir, 5 oyla otomatik girer (bu yolla gelenlerin skoru varsayılan 100 olur, panelden düzeltilmeli)
- Değerler USDA/TürKomp ortalamalarına dayanmalı; uydurma değer girme, sitenin tek sermayesi güvenilirlik

---

## SIRADAKİ BÜYÜK FİKİR: "Ne atıştırsam?" (mom testinden çıktı)

**Gözlem:** Test eden kişi "atıştırmak istiyorum, ne atıştırabilirim diye arayacağım" dedi. Site şu an sadece *ne aradığını bilenlere* hizmet ediyor. Oysa insanların çoğu ürün adı aramaz, **soru sorar**: "ne yesem?", "canım bir şey çekti ama ne?"

**Neden önemli:** Sitenin asıl vaadi zaten bu — "cips yerine leblebi ye, aynı hissi al, yarı pişmanlık." Ama bu vaat şu an sadece veriye bakmayı bilen kişiye ulaşıyor. Öneri motoru bunu herkese açar.

**Nasıl çalışacak:**

1. Ana ekranda görünür bir düğme: **"Ne atıştırsam?"**
2. İki soru, tek ekran (uzun form değil, iki tık):
   - *Canın ne çekiyor?* → Tuzlu · Tatlı · Fark etmez
   - *Ne kadar?* → Hafif (150 kcal altı) · Normal (150–300) · Doyurucu (300+)
3. Sonuç: kritere uyan, **doyuruculuk skoru en yüksek 5 seçenek**. Her birinin yanında kaç saat tok tuttuğu ve şeker şoku hızı.
4. Altında sitenin imzası olacak bölüm: **"Bunun yerine"** — seçilen kritere uyan en kötü seçenekle en iyi seçeneği yan yana koyar.
   Örnek: *"Cips (540 kcal, 1,5 saat) yerine leblebi (190 kcal, 3,5 saat) — üçte bir kalori, iki kat tokluk."*

**Teknik notlar:**
- Yeni veri gerekmez; `tur` (atistirmalik/tatli/icecek), `kcal`, `doyuruculuk` ve `seker` kolonları yeterli.
- Tuzlu/tatlı ayrımı şeker değerinden türetilebilir (şeker ≥ 10 g → tatlı). Kesinlik gerekirse ileride `tat` kolonu eklenir.
- Öğün genişletmesi: aynı mantık "ne yesem?" (ana yemek), "kahvaltıda ne yapsam?" için de çalışır. Önce atıştırmalıkla test edilmeli.

**Bağlı fikir — arama kutusuna örnek sorular:** Arama kutusunun altına tıklanabilir öneriler: "az kalorili atıştırmalık", "tok tutan kahvaltı", "şekersiz tatlı". Ne arayacağını bilmeyene yol gösterir.

---

## Diğer fikirler (sırasız)

- **Mutfak Defteri (changelog)** — tarihli, samimi güncelleme notları. Sitenin yaşadığını gösterir.
- **Editörün Notu** — panelden seçili yemeklere tek cümlelik kişisel yorum eklenmesi.
- **Öğün planlayıcı** — protein hedefini gün içine dağıtan basit plan (kahvaltı/öğle/akşam).
- **Karşılaştırma ekranı** — iki yemeği yan yana koyup farkı gösterme.
- **Arama kutusu** — 300 yemeğe çıkınca zorunlu hale gelecek.
- **Kişisel takip** — "bugün ne yedim" listesi, protein hedefine ne kadar kaldığı (localStorage, üyelik gerekmez).
- **Paylaşılabilir sonuç görseli** — "Benim protein hedefim 135 g" kartı, sosyal medya için.

---

## Bilinen kısıtlar / dikkat

- **Supabase ücretsiz plan:** site bir hafta ziyaretçi almazsa veritabanı uykuya geçer. Uyandırma ekranı var ama ilk ziyaretçi 30-60 sn bekler. Düzenli trafik bunu çözer.
- **Öneri eşiği 5 oy:** küçük kitlede yüksek, viral olursa düşük. Site büyürse eşik yükseltilmeli.
- **Besin değerleri tahmindir:** porsiyon bazlı, ±%30 sapabilir. Sitede bu açıkça yazıyor, yazmaya devam etmeli.
- **Alan adı yenilemesi:** platerank.dev, yıllık ~13 $. Otomatik yenileme açık olmalı, yoksa alan adı düşer.
