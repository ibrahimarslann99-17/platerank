// "Bugün": ne yedim günlüğü (eski Menüm'ün yerine). index.html'deki ana betikten sonra yüklenir ve onun
// global değişkenlerini kullanır (sb, currentUser, TUM, render, toast, buzz, esc, tabanSaat, verimKatsayi, trNorm, modAc).
// - Herkese açık: yemek ekleme, otomatik öğün, öğün tokluk hesabı, tok/aç çizgisi, günün toplamı.
// - Sadece üyelere: "acıktın mı" sorusu (cevap Meclis'e gider) ve geçmiş günler. Üyede kayıtlar sunucudadır.
// Öğün tokluğu Tok Plan motoruyla aynı eğri: tabanSaat(katı kalori) × verimKatsayi(kalori ağırlıklı puan).
// İçeceklerin kalorisi süreye eklenmez (sitenin kuralı: içilen kalori tok tutmaz) ama puanları ortalamaya girer.
(function(){
  'use strict';
  var EN = window.PR_DIL === 'en';
  var T = EN ? {
    sekme: 'Today', bos: 'Nothing logged today. Search for what you ate, or tap + on any food.', ara: 'What did you eat? Search a food…',
    son: 'You ate lately', ekle: 'Add', eklendi: 'Added to today', cikti: 'Removed', kahvalti: 'Breakfast', ogle: 'Lunch', ara_ogun: 'Snack', aksam: 'Dinner', gece: 'Late snack',
    tok: 'full', ac: 'hungry', simdi: 'now', toplam: 'Today', kcal: 'kcal', protein: 'g protein', seker: 'g sugar', ogun: 'meals',
    sa: 'h', dk: 'min', sure: 'keeps you full ~', hesapYok: 'drinks only, no fullness time',
    kisa: 'cut this meal by ~', uzun: 'stretched this meal by ~', soruBas: 'After ', soruOrta: ', were you hungry around ', soruSon: '?',
    evet: 'Yes', once: 'Earlier', degil: 'Not hungry, it was just time', saatSor: 'Around what time did you get hungry?', kaydet: 'Save',
    kaydedildi: 'Saved', meclise: 'Saved · sent to the Stomach Senate', girisSoru: 'Sign in to record how long this meal really kept you full.', girisYap: 'Sign in',
    girisUyari: 'Your log is only on this device. Without signing in it may be deleted after a week.', gecmis: 'Past days', gecmisUye: 'Sign in to see your past days.',
    menuTasi: function(n){ return 'Your old menu has ' + n + ' foods. Add them to today?'; }, gerekYok: 'No thanks', kopya: 'Copy as text', kart: 'Download as card',
    kopyalandi: 'Copied ✓', kopyalanamadi: 'Couldn’t copy', hazirlaniyor: 'Getting ready…', kartHata: 'Couldn’t create the card, try again', kartIndi: 'Card downloaded ✓',
    sil: 'Remove', bugune: 'Back to today', yukleniyor: 'Loading the food list…', saat: 'Time', baslik: 'PlateRank · Today', toplamYazi: 'Total', l: '&l=en', dosya: 'platerank-today.png'
  } : {
    sekme: 'Bugün', bos: 'Bugün henüz bir şey eklemedin. Yediğini ara ya da herhangi bir yemeğin yanındaki + işaretine dokun.', ara: 'Ne yedin? Yemek ara…',
    son: 'Son yediklerin', ekle: 'Ekle', eklendi: 'Bugüne eklendi', cikti: 'Çıkarıldı', kahvalti: 'Kahvaltı', ogle: 'Öğle yemeği', ara_ogun: 'Ara öğün', aksam: 'Akşam yemeği', gece: 'Gece atıştırması',
    tok: 'tok', ac: 'aç', simdi: 'şimdi', toplam: 'Bugün', kcal: 'kcal', protein: 'g protein', seker: 'g şeker', ogun: 'öğün',
    sa: 'sa', dk: 'dk', sure: 'tok tutar ~', hesapYok: 'sadece içecek, tokluk süresi yok',
    kisa: 'bu öğünü ~', uzun: 'bu öğünü ~', soruBas: '', soruOrta: ' sonrası ', soruSon: ' civarı mı acıktın?',
    evet: 'Evet', once: 'Daha önce', degil: 'Aç değildim, saati geldi', saatSor: 'Saat kaç civarı acıktın?', kaydet: 'Kaydet',
    kaydedildi: 'Kaydedildi', meclise: 'Kaydedildi · Meclis-i Mide’ye de gitti', girisSoru: 'Bu öğünün seni gerçekte ne kadar tuttuğunu kaydetmek için giriş yap.', girisYap: 'Giriş yap',
    girisUyari: 'Kayıtların sadece bu cihazda. Giriş yapmazsan bir hafta sonra silinebilir.', gecmis: 'Geçmiş günler', gecmisUye: 'Geçmiş günlerini görmek için giriş yap.',
    menuTasi: function(n){ return 'Eski menünde ' + n + ' yemek var. Bugüne ekleyeyim mi?'; }, gerekYok: 'Gerek yok', kopya: 'Metin olarak kopyala', kart: 'Kart olarak indir',
    kopyalandi: 'Kopyalandı ✓', kopyalanamadi: 'Kopyalanamadı', hazirlaniyor: 'Hazırlanıyor…', kartHata: 'Kart oluşturulamadı, tekrar dene', kartIndi: 'Kart indirildi ✓',
    sil: 'Çıkar', bugune: 'Bugüne dön', yukleniyor: 'Yemek listesi yükleniyor…', saat: 'Saat', baslik: 'PlateRank · Bugün', toplamYazi: 'Toplam', l: '', dosya: 'platerank-bugun.png'
  };

  var ANAHTAR = 'pr_gunluk_v1', TOK_ANAHTAR = 'pr_ogun_tokluk_v1', TASI_ANAHTAR = 'pr_menu_tasindi';
  var AYNI_OGUN_DK = 90;          // bu kadar dakika içinde eklenenler aynı öğün
  var SORU_MIN_DK = 60, SORU_MAX_DK = 480;   // "acıktın mı" yalnızca bu aralıktaki iki öğün için sorulur
  var BASKIN = 0.7;               // Meclis'e gidecek yemek öğün kalorisinin en az bu kadarı olmalı

  function oku(k, v){ try{ var x = JSON.parse(localStorage.getItem(k) || 'null'); return x == null ? v : x; }catch(e){ return v; } }
  function yaz(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  function uuid(){ if(window.crypto && crypto.randomUUID) return crypto.randomUUID(); return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){ var r = Math.random()*16|0; return (c === 'x' ? r : (r&3|8)).toString(16); }); }
  function gunAnahtari(d){ d = new Date(d); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
  function hhmm(d){ d = new Date(d); return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0'); }
  // Türkçe saat eki: 14:57'ye, 14:30'a, 15:00'e / 14:57'den, 14:40'tan
  var EK_E = { 0:'a', 1:'e', 2:'ye', 3:'e', 4:'e', 5:'e', 6:'ya', 7:'ye', 8:'e', 9:'a', 10:'a', 20:'ye', 30:'a', 40:'a', 50:'ye' };
  var EK_DEN = { 0:'dan', 1:'den', 2:'den', 3:'ten', 4:'ten', 5:'ten', 6:'dan', 7:'den', 8:'den', 9:'dan', 10:'dan', 20:'den', 30:'dan', 40:'tan', 50:'den' };
  function saatEk(d, tablo){ d = new Date(d); var m = d.getMinutes(), n = m === 0 ? d.getHours() : m; var k = n === 0 ? 0 : (n % 10 ? n % 10 : n % 100 >= 10 ? (n % 100) - (n % 100) % 10 : 10); return hhmm(d) + '’' + (tablo[k] || tablo[n % 10] || 'e'); }
  function dkFark(a, b){ return Math.round((new Date(b) - new Date(a)) / 60000); }
  function yarim(x){ return Math.round(x*2)/2; }
  function sayi(x){ return EN ? String(x) : String(x).replace('.', ','); }

  // ---------- durum ----------
  var kayit = oku(ANAHTAR, []);          // [{id, ogun_id, yemek_id, porsiyon, yendi}]
  var tokluk = oku(TOK_ANAHTAR, {});     // ogun_id -> {aclik, sure_dk}
  var uyeYuklendi = null;                // yüklenen üyenin id'si
  var secGun = null;                     // geçmiş gün görüntülenirken 'YYYY-AA-GG'
  var aramaMetni = '', onceSoru = null;  // onceSoru: "daha önce" seçilince saat sorulan öğün
  function lokalKaydet(){
    var sinir = Date.now() - 60*864e5;   // cihazda en fazla 60 gün
    kayit = kayit.filter(function(x){ return new Date(x.yendi).getTime() >= sinir; });
    if(!currentUser){ yaz(ANAHTAR, kayit); yaz(TOK_ANAHTAR, tokluk); }
  }

  // ---------- üye senkronu ----------
  async function uyeYukle(){
    var u = currentUser; if(!u || uyeYuklendi === u.id) return;
    uyeYuklendi = u.id;
    var bas = new Date(Date.now() - 30*864e5).toISOString();
    // girişten önce bu cihazda tutulan son iki günün kayıtları hesaba geçer
    var lokal = oku(ANAHTAR, []).filter(function(x){ return Date.now() - new Date(x.yendi).getTime() < 2*864e5; });
    var r = await Promise.all([
      sb.from('gunluk').select('id,ogun_id,yemek_id,porsiyon,yendi').eq('user_id', u.id).gte('yendi', bas).order('yendi'),
      sb.from('ogun_tokluk').select('ogun_id,aclik,sure_dk').eq('user_id', u.id).gte('baslangic', bas)
    ]);
    var db = (r[0].data || []).map(function(x){ return { id: x.id, ogun_id: x.ogun_id, yemek_id: x.yemek_id, porsiyon: Number(x.porsiyon), yendi: x.yendi }; });
    var var_ = new Set(db.map(function(x){ return x.id; }));
    var yeni = lokal.filter(function(x){ return !var_.has(x.id); });
    if(yeni.length){
      var g = await sb.from('gunluk').insert(yeni.map(function(x){ return { id: x.id, ogun_id: x.ogun_id, yemek_id: x.yemek_id, porsiyon: x.porsiyon, yendi: x.yendi }; }));
      if(!g.error){ db = db.concat(yeni); try{ localStorage.removeItem(ANAHTAR); }catch(e){} }
    }
    kayit = db.sort(function(a, b){ return new Date(a.yendi) - new Date(b.yendi); });
    tokluk = {};
    (r[1].data || []).forEach(function(x){ tokluk[x.ogun_id] = { aclik: x.aclik, sure_dk: x.sure_dk }; });
    if(currentMode === 'menu') render();
  }
  function uyeEkle(x){ if(currentUser) sb.from('gunluk').insert({ id: x.id, ogun_id: x.ogun_id, yemek_id: x.yemek_id, porsiyon: x.porsiyon, yendi: x.yendi }).then(function(r){ if(r.error) console.error('gunluk', r.error); }); }
  function uyeGuncelle(x){ if(currentUser) sb.from('gunluk').update({ porsiyon: x.porsiyon, yendi: x.yendi }).eq('id', x.id).then(function(r){ if(r.error) console.error('gunluk', r.error); }); }
  function uyeSil(id){ if(currentUser) sb.from('gunluk').delete().eq('id', id).then(function(r){ if(r.error) console.error('gunluk', r.error); }); }

  // ---------- veri ----------
  function yemek(id){
    if(TUM) return TUM.find(function(f){ return f.id === id; }) || null;
    tumYemekYukle();
    try{ var l = Object.values(foodCache || {}); for(var i = 0; i < l.length; i++){ var f = (l[i] || []).find && l[i].find(function(y){ return y.id === id; }); if(f) return f; } }catch(e){}
    return (typeof mYemek === 'function' && mYemek(id)) || null;
  }
  function gununKayitlari(gun){ return kayit.filter(function(x){ return gunAnahtari(x.yendi) === gun; }).sort(function(a, b){ return new Date(a.yendi) - new Date(b.yendi); }); }
  function ogunler(gun){
    var m = new Map();
    // Bu dilde karşılığı olmayan yemekler (ör. İngilizce sitede Zincir/Market) gösterilmez; boş öğün de çıkmaz
    gununKayitlari(gun).filter(function(x){ return !TUM || yemek(x.yemek_id); }).forEach(function(x){ if(!m.has(x.ogun_id)) m.set(x.ogun_id, []); m.get(x.ogun_id).push(x); });
    return Array.from(m.entries()).map(function(e){ return { id: e[0], kalemler: e[1], bas: e[1][0].yendi }; }).sort(function(a, b){ return new Date(a.bas) - new Date(b.bas); });
  }
  function ogunAdi(bas){ var h = new Date(bas).getHours(); return h >= 5 && h < 11 ? T.kahvalti : h < 15 ? T.ogle : h < 18 ? T.ara_ogun : h < 23 ? T.aksam : T.gece; }

  // Öğün hesabı. haric: süresi hesaplanırken çıkarılacak kalem id'si (içecek etkisi için)
  function hesap(kalemler, haric){
    var kT = 0, kS = 0, pK = 0, prot = 0, sek = 0;
    kalemler.forEach(function(x){
      if(x.id === haric) return;
      var f = yemek(x.yemek_id); if(!f) return;
      var k = (f.kcal || 0) * x.porsiyon;
      kT += k; prot += (f.protein || 0) * x.porsiyon; sek += (f.seker || 0) * x.porsiyon;
      pK += k * (f.doyuruculuk || 0);
      if(f.tur !== 'icecek') kS += k;
    });
    var puan = kT ? pK / kT : 0;
    var sure = kS >= 50 ? Math.max(0.5, Math.min(6, tabanSaat(kS) * verimKatsayi(puan))) : null;
    return { kcal: Math.round(kT), protein: Math.round(prot), seker: Math.round(sek), puan: Math.round(puan), sure: sure };
  }
  function iceceEtkileri(o){
    var h = hesap(o.kalemler); if(h.sure == null) return [];
    return o.kalemler.map(function(x){
      var f = yemek(x.yemek_id); if(!f || f.tur !== 'icecek' || f.kcal * x.porsiyon < 40) return null;
      var hs = hesap(o.kalemler, x.id); if(hs.sure == null) return null;
      var fark = Math.round((h.sure - hs.sure) * 60);
      return Math.abs(fark) >= 10 ? { ad: f.ad, dk: fark } : null;
    }).filter(Boolean);
  }

  // ---------- ekleme ----------
  function ekle(fid, porsiyon, zaman){
    var simdi = zaman ? new Date(zaman) : new Date();
    var bugun = gununKayitlari(gunAnahtari(simdi));
    var son = bugun.length ? bugun[bugun.length - 1] : null;
    var ogun_id = son && Math.abs(dkFark(son.yendi, simdi)) <= AYNI_OGUN_DK ? son.ogun_id : uuid();
    var x = { id: uuid(), ogun_id: ogun_id, yemek_id: fid, porsiyon: porsiyon || 1, yendi: simdi.toISOString() };
    kayit.push(x); lokalKaydet(); uyeEkle(x);
    return x;
  }
  window.bgBugunIdleri = function(){ return gununKayitlari(gunAnahtari(new Date())).map(function(x){ return x.yemek_id; }); };

  // ---------- "acıktın mı" sorusu ----------
  // Bugünün öğünlerinde cevapsız ilk öğün; bir sonraki öğün SORU_MIN-SORU_MAX dakika içinde olmalı.
  function bekleyenSoru(gun){
    var l = ogunler(gun);
    for(var i = 0; i < l.length - 1; i++){
      var a = l[i], b = l[i+1], fark = dkFark(a.bas, b.bas);
      if(tokluk[a.id] || fark < SORU_MIN_DK || fark > SORU_MAX_DK) continue;
      if(hesap(a.kalemler).sure == null) continue;
      return { ogun: a, sonraki: b };
    }
    return null;
  }
  async function cevapla(s, aclik, saatMetni){
    var sure = null;
    if(aclik === 'evet') sure = dkFark(s.ogun.bas, s.sonraki.bas);
    if(aclik === 'once'){
      var p = (saatMetni || '').split(':'); var t = new Date(s.ogun.bas); t.setHours(Number(p[0]), Number(p[1]), 0, 0);
      sure = dkFark(s.ogun.bas, t);
      if(!(sure >= 30 && sure <= dkFark(s.ogun.bas, s.sonraki.bas))) { toast(T.saatSor); return; }
    }
    if(sure != null) sure = Math.max(30, Math.min(720, sure));
    tokluk[s.ogun.id] = { aclik: aclik, sure_dk: sure }; onceSoru = null;
    if(!currentUser){ lokalKaydet(); render(); return; }
    var h = hesap(s.ogun.kalemler);
    var r = await sb.from('ogun_tokluk').upsert({ ogun_id: s.ogun.id, baslangic: s.ogun.bas, sure_dk: sure, aclik: aclik, toplam_kcal: h.kcal,
      kalemler: s.ogun.kalemler.map(function(x){ return { yemek_id: x.yemek_id, porsiyon: x.porsiyon }; }) });
    if(r.error){ console.error('ogun_tokluk', r.error); toast(T.kaydedildi); render(); return; }
    // Meclis'e yalnızca öğünün baskın yemeği gider: tek porsiyon, içecek değil, öğün kalorisinin en az %70'i
    var meclis = false;
    if(sure != null){
      var baskin = s.ogun.kalemler.filter(function(x){ var f = yemek(x.yemek_id); return f && x.porsiyon === 1 && f.tur !== 'icecek' && !f.sadece_malzeme && f.kcal >= BASKIN * h.kcal; })[0];
      if(baskin){
        var o = await sb.from('oylar').insert({ yemek_id: baskin.yemek_id, saat_dk: Math.min(360, sure), kaynak: 'gunluk', ogun_id: s.ogun.id });
        if(o.error) console.error('oylar', o.error); else meclis = true;
      }
    }
    toast(meclis ? T.meclise : T.kaydedildi); render();
  }

  // ---------- çizim ----------
  function cizgi(gun, l, mini){
    var BAS = 6*60, SON = 24*60, gen = SON - BAS;
    var pos = function(d){ var t = new Date(d); var m = t.getHours()*60 + t.getMinutes(); return Math.max(0, Math.min(100, (m - BAS) / gen * 100)); };
    var bugun = gun === gunAnahtari(new Date());
    var html = '', satir = '', simdi = new Date();
    l.forEach(function(o, i){
      var h = hesap(o.kalemler); if(h.sure == null) return;
      var cevap = tokluk[o.id];
      var bitis = new Date(new Date(o.bas).getTime() + (cevap && cevap.sure_dk ? cevap.sure_dk : h.sure*60) * 60000);
      var a = pos(o.bas), b = pos(bitis);
      var durum = '';
      if(bugun && !l[i+1]) durum = simdi < bitis ? (EN ? ' · hungry again around ' + hhmm(bitis) : ' · ~' + hhmm(bitis) + ' gibi acıkırsın') : (EN ? ' · hungry since ' + hhmm(bitis) : ' · ' + saatEk(bitis, EK_DEN) + ' beri açsın');
      satir += '<li><b>' + esc(ogunAdi(o.bas)) + '</b> ' + hhmm(o.bas) + ' → ' + (EN ? 'full until ~' + hhmm(bitis) : '~' + saatEk(bitis, EK_E) + ' kadar tok') + durum + '</li>';
      html += '<i class="bg-tok" style="left:' + a + '%;width:' + Math.max(1, b - a) + '%"></i>';
      var sonraki = l[i+1] ? new Date(l[i+1].bas) : (bugun ? new Date() : null);
      if(sonraki && sonraki > bitis){ var c = pos(sonraki); html += '<i class="bg-ac" style="left:' + b + '%;width:' + Math.max(0, c - b) + '%"></i>'; }
    });
    if(bugun) html += '<i class="bg-simdi" style="left:' + pos(new Date()) + '%"></i>';
    return '<div class="bg-cizgi"><div class="bg-ray">' + html + '</div><div class="bg-eksen"><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>' +
      (mini ? '' : '<div class="bg-lej"><span><i class="bg-tok"></i>' + T.tok + '</span><span><i class="bg-ac"></i>' + T.ac + '</span></div>' + (satir ? '<ul class="bg-saatler">' + satir + '</ul>' : '')) + '</div>';
  }
  function soruHtml(s){
    if(!currentUser) return '<div class="card bg-soru"><p>' + esc(T.girisSoru) + '</p><button class="btn" data-bggiris>' + T.girisYap + '</button></div>';
    var ad = ogunAdi(s.ogun.bas).toLocaleLowerCase(EN ? 'en' : 'tr');
    var soru = EN ? T.soruBas + ad + T.soruOrta + hhmm(s.sonraki.bas) + T.soruSon : ogunAdi(s.ogun.bas) + T.soruOrta + hhmm(s.sonraki.bas) + T.soruSon;
    if(onceSoru === s.ogun.id){
      var ort = new Date((new Date(s.ogun.bas).getTime() + new Date(s.sonraki.bas).getTime()) / 2);
      return '<div class="card bg-soru"><p>' + esc(T.saatSor) + '</p><div class="bg-satir"><input type="time" id="bg-once-saat" value="' + hhmm(ort) + '"><button class="btn" data-bgcevap="once">' + T.kaydet + '</button></div></div>';
    }
    return '<div class="card bg-soru"><p>' + esc(soru) + '</p><div class="bg-satir"><button class="btn" data-bgcevap="evet">' + T.evet + '</button><button class="btn ikincil" data-bgcevap="oncesor">' + T.once + '</button><button class="link-btn" data-bgcevap="degil">' + T.degil + '</button></div></div>';
  }
  function kalemHtml(x){
    var f = yemek(x.yemek_id); if(!f) return '';
    return '<div class="bg-kalem"><span class="bg-ad">' + esc(f.ad) + '<small>' + Math.round(f.kcal * x.porsiyon) + ' kcal' + (f.protein != null ? ' · ' + Math.round(f.protein * x.porsiyon) + ' ' + T.protein : '') + '</small></span>' +
      '<span class="bo-adim bg-adim"><button data-bgeksi="' + x.id + '" aria-label="−">−</button><b>' + sayi(x.porsiyon) + '</b><button data-bgarti="' + x.id + '" aria-label="+">+</button></span><button class="bg-sil" data-bgsil="' + x.id + '" aria-label="' + T.sil + '">×</button></div>';
  }
  function ogunHtml(o){
    var h = hesap(o.kalemler), cevap = tokluk[o.id];
    var sureYazi = h.sure == null ? T.hesapYok : T.sure + sayi(yarim(h.sure)) + ' ' + T.sa;
    if(cevap && cevap.sure_dk) sureYazi += ' · ' + (EN ? 'you: ' : 'sen: ') + sayi(yarim(cevap.sure_dk/60)) + ' ' + T.sa;
    var etk = iceceEtkileri(o).map(function(e){
      return '<p class="bg-etki ' + (e.dk < 0 ? 'kotu' : 'iyi') + '">' + esc(e.ad) + ' ' + (EN ? (e.dk < 0 ? T.kisa : T.uzun) + Math.abs(e.dk) + ' ' + T.dk : T.kisa + Math.abs(e.dk) + ' ' + T.dk + (e.dk < 0 ? ' kısalttı' : ' uzattı')) + '</p>';
    }).join('');
    return '<div class="card bg-ogun"><div class="bg-ust"><b>' + ogunAdi(o.bas) + '</b><input type="time" class="bg-saat" data-bgsaat="' + o.id + '" value="' + hhmm(o.bas) + '" aria-label="' + T.saat + '"></div>' +
      o.kalemler.map(kalemHtml).join('') +
      '<div class="bg-alt"><span>' + h.kcal + ' kcal · ' + h.protein + ' ' + T.protein + '</span><span>' + sureYazi + '</span></div>' + etk + '</div>';
  }
  function aramaHtml(){
    var s = trNorm(aramaMetni.trim());
    var son = [];
    if(!s){
      var say = {}; kayit.filter(function(x){ return Date.now() - new Date(x.yendi).getTime() < 14*864e5; }).forEach(function(x){ say[x.yemek_id] = (say[x.yemek_id] || 0) + 1; });
      son = Object.keys(say).sort(function(a, b){ return say[b] - say[a]; }).slice(0, 8).map(yemek).filter(Boolean);
      return son.length ? '<div class="bg-cips"><span>' + T.son + '</span>' + son.map(function(f){ return '<button data-bgekle="' + f.id + '">+ ' + esc(f.ad) + '</button>'; }).join('') + '</div>' : '';
    }
    if(!TUM) return '<p class="note">' + T.yukleniyor + '</p>';
    // Kelime başında eşleşen önce ("kola" yazınca çikolata değil kola gelsin)
    var sira = function(f){ var n = trNorm(f.ad), i = n.indexOf(s); return i < 0 ? -1 : (i === 0 ? 0 : (/[^a-z0-9]/.test(n.charAt(i-1)) ? 1 : 2)); };
    var bul = TUM.filter(function(f){ return sira(f) >= 0; })
      .sort(function(a, b){ return sira(a) - sira(b) || trNorm(a.ad).length - trNorm(b.ad).length; }).slice(0, 8);
    return '<div class="m-sonuc bg-sonuc">' + bul.map(function(f){ return '<button class="m-sn" data-bgekle="' + f.id + '"><span class="ad">' + esc(f.ad) + '<small>' + f.kcal + ' kcal</small></span><span class="lg" style="color:var(--teal)">+</span></button>'; }).join('') + '</div>';
  }
  function gecmisHtml(){
    if(!currentUser) return '<p class="note">' + T.gecmisUye + '</p>';
    var gunler = {}; kayit.forEach(function(x){ var g = gunAnahtari(x.yendi); if(g !== gunAnahtari(new Date())) gunler[g] = (gunler[g] || 0) + 1; });
    var l = Object.keys(gunler).sort().reverse().slice(0, 14);
    if(!l.length) return '';
    return '<div class="section-title">' + T.gecmis + '</div><div class="bg-gunler">' + l.map(function(g){
      var k = gununKayitlari(g).reduce(function(s, x){ var f = yemek(x.yemek_id); return s + (f ? f.kcal * x.porsiyon : 0); }, 0);
      return '<button data-bggun="' + g + '" class="' + (g === secGun ? 'on' : '') + '">' + g.slice(8) + '.' + g.slice(5, 7) + '<small>' + Math.round(k) + ' kcal</small></button>';
    }).join('') + '</div>';
  }

  window.renderBugun = function(){
    if(currentUser && uyeYuklendi !== currentUser.id) uyeYukle();
    if(!currentUser) uyeYuklendi = null;
    if(!TUM){ tumYemekYukle(); return '<div class="card bos">' + T.yukleniyor + '</div>'; }
    var gun = secGun || gunAnahtari(new Date());
    var l = ogunler(gun), h = '';
    var tum = { kcal: 0, protein: 0, seker: 0 };
    l.forEach(function(o){ var x = hesap(o.kalemler); tum.kcal += x.kcal; tum.protein += x.protein; tum.seker += x.seker; });
    if(!secGun){
      h += '<div class="card bg-ekle"><input type="search" id="bg-ara" autocomplete="off" placeholder="' + esc(T.ara) + '" value="' + esc(aramaMetni) + '"><div id="bg-arama">' + aramaHtml() + '</div></div>';
      var eski = []; try{ eski = (currentUser && acctMenuIds) ? acctMenuIds.slice() : JSON.parse(localStorage.getItem('pr_menu') || '[]'); }catch(e){}
      var tasindi = false; try{ tasindi = !!localStorage.getItem(TASI_ANAHTAR); }catch(e){}
      if(eski.length && !tasindi) h += '<div class="card bg-soru"><p>' + esc(T.menuTasi(eski.length)) + '</p><div class="bg-satir"><button class="btn" data-bgtasi="1">' + T.ekle + '</button><button class="link-btn" data-bgtasi="0">' + T.gerekYok + '</button></div></div>';
    } else {
      h += '<button class="link-btn" data-bggun="">← ' + T.bugune + '</button>';
    }
    var s = !secGun ? bekleyenSoru(gun) : null;
    if(s) h += soruHtml(s);
    if(!l.length){ h += '<div class="card bos">' + T.bos + '</div>'; return h + gecmisHtml(); }
    h += '<div class="menuozet"><div class="mo-baslik">' + (secGun ? secGun.slice(8) + '.' + secGun.slice(5, 7) : T.toplam) + '</div>' + cizgi(gun, l) +
      '<div class="mo-grid"><div><b>' + tum.kcal + '</b> ' + T.kcal + '</div><div><b>' + tum.protein + '</b> ' + T.protein + '</div><div><b>' + tum.seker + '</b> ' + T.seker + '</div><div><b>' + l.length + '</b> ' + T.ogun + '</div></div>' +
      '<div class="pshare"><button class="btn ikincil" id="bg-kopya">' + T.kopya + '</button><button class="btn" id="bg-kart">' + T.kart + '</button></div></div>';
    h += l.map(ogunHtml).join('');
    var ogunSay = new Set(kayit.map(function(x){ return x.ogun_id; })).size;
    if(!currentUser && ogunSay >= 3) h += '<div class="card bg-soru"><p>' + esc(T.girisUyari) + '</p><button class="btn" data-bggiris>' + T.girisYap + '</button></div>';
    return h + gecmisHtml();
  };

  // ---------- olaylar ----------
  window.bgBagla = function(){
    if(currentMode !== 'menu') return;
    var a = document.getElementById('bg-ara');
    if(a){
      a.oninput = function(){ aramaMetni = a.value; var el = document.getElementById('bg-arama'); if(el) el.innerHTML = aramaHtml(); };
      a.onkeydown = function(e){ if(e.key === 'Escape'){ aramaMetni = ''; a.value = ''; a.oninput(); } };
    }
    var kok = document.getElementById('content');
    if(!kok || kok.dataset.bg) return;
    kok.dataset.bg = '1';
    kok.addEventListener('click', async function(e){
      if(currentMode !== 'menu' || !e.target.closest) return;
      var t;
      if((t = e.target.closest('[data-bgekle]'))){ window.bgEkle(t.dataset.bgekle); aramaMetni = ''; render(); return; }
      if((t = e.target.closest('[data-bgsil]'))){ var id = t.dataset.bgsil; kayit = kayit.filter(function(x){ return x.id !== id; }); lokalKaydet(); uyeSil(id); buzz(6); render(); return; }
      if((t = e.target.closest('[data-bgarti],[data-bgeksi]'))){
        var pid = t.dataset.bgarti || t.dataset.bgeksi, x = kayit.find(function(k){ return k.id === pid; }); if(!x) return;
        x.porsiyon = t.dataset.bgarti ? Math.min(10, x.porsiyon + (x.porsiyon < 1 ? 0.5 : 1)) : Math.max(0.5, x.porsiyon - (x.porsiyon <= 1 ? 0.5 : 1));
        lokalKaydet(); uyeGuncelle(x); buzz(6); render(); return;
      }
      if((t = e.target.closest('[data-bgcevap]'))){
        var gun = secGun || gunAnahtari(new Date()), s = bekleyenSoru(gun); if(!s) return;
        var c = t.dataset.bgcevap;
        if(c === 'oncesor'){ onceSoru = s.ogun.id; render(); return; }
        var saat = c === 'once' ? (document.getElementById('bg-once-saat') || {}).value : null;
        buzz(10); cevapla(s, c, saat); return;
      }
      if((t = e.target.closest('[data-bggiris]'))){ modAc('bilgi'); return; }
      if((t = e.target.closest('[data-bggun]'))){ secGun = t.dataset.bggun || null; render(); window.scrollTo({ top: 0 }); return; }
      if((t = e.target.closest('[data-bgtasi]'))){
        try{ localStorage.setItem(TASI_ANAHTAR, '1'); }catch(er){}
        if(t.dataset.bgtasi === '1'){
          var eski = []; try{ eski = (currentUser && acctMenuIds) ? acctMenuIds.slice() : JSON.parse(localStorage.getItem('pr_menu') || '[]'); }catch(er){}
          var zaman = new Date(); eski.forEach(function(fid){ ekle(fid, 1, zaman); });
        }
        render(); return;
      }
      if(e.target.id === 'bg-kopya'){
        var gun2 = secGun || gunAnahtari(new Date());
        var metin = T.baslik + '\n' + ogunler(gun2).map(function(o){ var hh = hesap(o.kalemler); return ogunAdi(o.bas) + ' ' + hhmm(o.bas) + ' (' + hh.kcal + ' kcal)\n' + o.kalemler.map(function(x){ var f = yemek(x.yemek_id); return f ? '- ' + f.ad + (x.porsiyon !== 1 ? ' ×' + sayi(x.porsiyon) : '') : ''; }).filter(Boolean).join('\n'); }).join('\n\n') + '\n\nplaterank.dev' + (EN ? '/en' : '');
        try{ await navigator.clipboard.writeText(metin); toast(T.kopyalandi); }catch(er){ toast(T.kopyalanamadi); }
        return;
      }
      if(e.target.id === 'bg-kart'){
        var b = e.target, eskiYazi = b.textContent; b.disabled = true; b.textContent = T.hazirlaniyor;
        try{
          var gun3 = secGun || gunAnahtari(new Date());
          var items = gununKayitlari(gun3).map(function(x){ var f = yemek(x.yemek_id); return f ? { a: f.ad, k: Math.round(f.kcal * x.porsiyon), p: f.protein != null ? Math.round(f.protein * x.porsiyon) : null } : null; }).filter(Boolean).slice(0, 6);
          var b64 = btoa(unescape(encodeURIComponent(JSON.stringify(items))));
          var res = await fetch('/api/menu-card?i=' + encodeURIComponent(b64) + T.l); if(!res.ok) throw new Error('kart');
          var url = URL.createObjectURL(await res.blob()); var l = document.createElement('a'); l.href = url; l.download = T.dosya;
          document.body.appendChild(l); l.click(); l.remove(); setTimeout(function(){ URL.revokeObjectURL(url); }, 4000); toast(T.kartIndi);
        }catch(er){ toast(T.kartHata); }
        b.disabled = false; b.textContent = eskiYazi; return;
      }
    });
    kok.addEventListener('change', function(e){
      if(currentMode !== 'menu' || !e.target.dataset || !e.target.dataset.bgsaat) return;
      var oid = e.target.dataset.bgsaat, p = (e.target.value || '').split(':'); if(p.length < 2) return;
      kayit.forEach(function(x){ if(x.ogun_id !== oid) return; var d = new Date(x.yendi); d.setHours(Number(p[0]), Number(p[1]), 0, 0); x.yendi = d.toISOString(); uyeGuncelle(x); });
      lokalKaydet(); render();
    });
  };

  // ---------- stil ----------
  var st = document.createElement('style');
  st.textContent = '.bg-ekle input{width:100%;font:inherit;font-size:16px;padding:12px 16px;border-radius:999px;border:2px solid var(--line,#D2D1C4);background:var(--card,#fff);color:inherit;outline:none}' +
    '.bg-cips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;align-items:center}.bg-cips span{font-size:12px;color:var(--ink-muted,#6B7079);width:100%}.bg-cips button{border:1.5px solid var(--line,#D2D1C4);background:var(--card,#fff);border-radius:999px;padding:6px 12px;font:inherit;font-size:14px;cursor:pointer;color:inherit}' +
    '.bg-sonuc{margin-top:8px}.bg-soru p{margin:0 0 10px}.bg-satir{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.bg-satir input{font:inherit;font-size:16px;padding:8px 10px;border-radius:12px;border:1.5px solid var(--line,#D2D1C4)}' +
    '.bg-cizgi{margin:12px 0 6px}.bg-ray{position:relative;height:16px;border-radius:8px;background:var(--line,#E4E4DC);overflow:hidden}.bg-ray i{position:absolute;top:0;bottom:0}.bg-tok{background:#2F8F5B}.bg-ac{background:#E9A79F}.bg-simdi{width:2px;background:var(--ink,#15171B)}' +
    '.bg-eksen{display:flex;justify-content:space-between;font-size:11px;color:var(--ink-muted,#6B7079);margin-top:4px}.bg-lej{display:flex;gap:14px;font-size:12px;color:var(--ink-muted,#6B7079);margin-top:4px}.bg-lej i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px;vertical-align:-1px}.bg-saatler{list-style:none;margin:10px 0 0;padding:0;font-size:14px;line-height:1.6}.bg-saatler b{font-weight:600}' +
    '.bg-ogun .bg-ust{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}.bg-ogun .bg-ust b{font-size:16px}.bg-saat{font:inherit;font-size:14px;border:1px solid var(--line,#D2D1C4);border-radius:10px;padding:4px 8px;background:transparent;color:inherit}' +
    '.bg-kalem{display:flex;align-items:center;gap:8px;padding:8px 0;border-top:1px solid var(--line,#E4E4DC)}.bg-ad{flex:1;min-width:0}.bg-ad small{display:block;font-size:12px;color:var(--ink-muted,#6B7079)}' +
    '.bg-pors,.bg-sil{border:1px solid var(--line,#D2D1C4);background:transparent;border-radius:999px;min-width:38px;height:32px;font:inherit;font-size:14px;cursor:pointer;color:inherit}.bg-sil{min-width:32px}' +
    '.bg-alt{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:13px;color:var(--ink-muted,#6B7079);border-top:1px solid var(--line,#E4E4DC);padding-top:8px;margin-top:2px}' +
    '.bg-etki{margin:8px 0 0;font-size:13px;font-weight:600}.bg-etki.kotu{color:#B3261E}.bg-etki.iyi{color:#2F8F5B}' +
    '.bg-gunler{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}.bg-gunler button{flex:0 0 auto;border:1.5px solid var(--line,#D2D1C4);background:var(--card,#fff);border-radius:14px;padding:8px 12px;font:inherit;font-size:14px;cursor:pointer;color:inherit;text-align:center}.bg-gunler button.on{border-color:var(--teal,#227A54)}.bg-gunler small{display:block;font-size:11px;color:var(--ink-muted,#6B7079)}';
  document.head.appendChild(st);
  // =========================================================
  // Meclis "Tokluk bildir": tek yemek yerine öğün. Yemek seçilir, yanına başkaları eklenir,
  // her birinin porsiyonu girilir (3 porsiyon lahmacun = 3 adet), soru öğünün tamamı için sorulur.
  // index.html'deki bildirim kartı bu fonksiyonlara devreder (bildirim / bildirimSonuc global'leri).
  // - Tek yemek + 1 porsiyon: eski yol (saatKaydet), girişsiz de çalışır.
  // - Birden çok yemek ya da porsiyon 1 değilse: öğün bildirimi, sadece üyeler (ogun_tokluk);
  //   öğünün baskın yemeği (tek porsiyon, kalorinin %70'i+) ayrıca Meclis'e o yemeğin saati olarak gider.
  // =========================================================
  var M = EN ? {
    ust: 'Report fullness · meal', soru: 'How long did this meal keep you full?', yanina: 'Add something else from the meal…',
    porsiyon: 'servings', hesap: 'The math says ~', bildir: 'Report', vazgec: 'Cancel', girisGerek: 'Reporting a full meal is for members. No password: we email you a code.',
    rozet: 'Badges', rozetAlt: 'optional · 2 max · for ', sen: 'You', halk: 'Crowd', hesapK: 'Math', kaydedildi: 'Saved ✓', baska: 'Report another meal', duzelt: 'Edit',
    saatSec: 'First pick how many hours it kept you full', katiYok: 'Add at least one food that isn’t a drink', gonderiliyor: 'Sending…', hata: 'Couldn’t save, try again in a moment'
  } : {
    ust: 'Tokluk bildir · öğün', soru: 'Bu öğün seni kaç saat tok tuttu?', yanina: 'Yanında başka ne vardı? Ekle…',
    porsiyon: 'porsiyon', hesap: 'Hesap ~', bildir: 'Bildir', vazgec: 'Vazgeç', girisGerek: 'Öğün bildirmek üyelere açık. Şifre yok, e-postana kod gelir.',
    rozet: 'Rozet', rozetAlt: 'isteğe bağlı · en fazla 2 · ', sen: 'Sen', halk: 'Halk', hesapK: 'Hesap', kaydedildi: 'Kaydedildi ✓', baska: 'Başka öğün bildir', duzelt: 'Düzelt',
    saatSec: 'Önce kaç saat tok tuttuğunu seç', katiYok: 'İçecek dışında en az bir yemek ekle', gonderiliyor: 'Gönderiliyor…', hata: 'Kaydedilemedi, birazdan tekrar dene'
  };
  var oAra = '';
  function oYemek(id){ return (typeof mYemek === 'function' && mYemek(id)) || yemek(id); }
  function oKalemler(){ return (bildirim && bildirim.kalemler) || []; }
  function oHesap(){
    var kT = 0, kS = 0, pK = 0, prot = 0;
    oKalemler().forEach(function(x){
      var f = oYemek(x.id); if(!f) return;
      var k = (f.kcal || 0) * x.p; kT += k; prot += (f.protein || 0) * x.p; pK += k * (f.doyuruculuk || 0);
      if(f.tur !== 'icecek') kS += k;
    });
    var puan = kT ? pK / kT : 0;
    return { kcal: Math.round(kT), protein: Math.round(prot), sure: kS >= 50 ? Math.max(0.5, Math.min(6, tabanSaat(kS) * verimKatsayi(puan))) : null };
  }
  function oBaskin(){
    var h = oHesap(), l = oKalemler();
    return l.filter(function(k){ var f = oYemek(k.id); return f && k.p === 1 && f.tur !== 'icecek' && !f.sadece_malzeme && f.kcal >= BASKIN * h.kcal; })[0] || null;
  }
  function oTek(){ var l = oKalemler(); return l.length === 1 && l[0].p === 1; }

  // Kartı aç ya da açık karta yemek ekle
  window.bgOyAc = function(id){
    var f = oYemek(id); if(!f) return false;
    if(!(bildirim && bildirim.kalemler) && (f.tur === 'icecek' || f.sadece_malzeme)) return false;
    if(typeof mYemekKaydet === 'function') mYemekKaydet([f]);
    if(bildirim && bildirim.kalemler){
      var var_ = bildirim.kalemler.find(function(k){ return k.id === id; });
      if(var_) var_.p = Math.min(10, var_.p + 1); else bildirim.kalemler.push({ id: id, p: 1 });
    } else {
      var eskiDk = benimBildirim.get(id), si = eskiDk != null ? SAAT_ADIM.indexOf(eskiDk) : -1;
      bildirim = { id: id, kalemler: [{ id: id, p: 1 }], saat: si >= 0 ? si : null, rozet: (benimRozet.get(id) || []).slice() };
    }
    oAra = ''; mArama = ''; mSonuclar = null; bildirimSonuc = null;
    if(currentMode !== 'comm'){ currentMode = 'comm'; selectedFood = null; }
    render();
    requestAnimationFrame(function(){ var k = document.getElementById('bk'); if(k) k.scrollIntoView({ behavior: azHareket() ? 'auto' : 'smooth', block: 'center' }); });
    return true;
  };

  function oAramaHtml(){
    var s = trNorm(oAra.trim()); if(s.length < 2) return '';
    if(!TUM){ tumYemekYukle(); return ''; }
    var sira = function(f){ var n = trNorm(f.ad), i = n.indexOf(s); return i < 0 ? -1 : (i === 0 ? 0 : (/[^a-z0-9]/.test(n.charAt(i-1)) ? 1 : 2)); };
    var bul = TUM.filter(function(f){ return sira(f) >= 0; }).sort(function(a, b){ return sira(a) - sira(b) || trNorm(a.ad).length - trNorm(b.ad).length; }).slice(0, 6);
    return bul.map(function(f){ return '<button class="m-sn" data-boekle="' + f.id + '"><span class="ad">' + esc(f.ad) + '<small>' + f.kcal + ' kcal</small></span><span class="lg" style="color:var(--teal)">+</span></button>'; }).join('');
  }

  window.bgOgunFormHtml = function(){
    var l = oKalemler(), h = oHesap(), si = bildirim.saat, b = oBaskin() || l[0];
    var bf = b ? oYemek(b.id) : null;
    var kalem = l.map(function(k){
      var f = oYemek(k.id); if(!f) return '';
      return '<div class="bo-kalem"><span class="bo-ad">' + esc(f.ad) + '<small>' + Math.round(f.kcal * k.p) + ' kcal</small></span>' +
        '<span class="bo-adim"><button data-boeksi="' + k.id + '" aria-label="−">−</button><b>' + sayi(k.p) + '</b><button data-boarti="' + k.id + '" aria-label="+">+</button></span>' +
        '<button class="bo-sil" data-bosil="' + k.id + '" aria-label="×">×</button></div>';
    }).join('');
    var rozet = currentUser && bf ? '<div class="bk-soru">' + M.rozet + ' <span>' + M.rozetAlt + esc(bf.ad) + '</span></div><div class="bk-rz">' + ELLE_ROZET.map(function(k){
      var on = bildirim.rozet.indexOf(k) >= 0;
      return '<button class="' + (on ? 'on' : '') + '" data-bkr="' + k + '" aria-pressed="' + on + '">' + rozetSvg(k, 26) + '<span>' + ROZETLER[k].ad + '</span><small>' + esc(ROZETLER[k].acik) + '</small></button>';
    }).join('') + '</div>' : '';
    var uyeGerek = !currentUser && !oTek();
    return '<div class="bk" id="bk"><div class="bk-ust">' + M.ust + '</div>' + kalem +
      '<div class="m-ara bo-ara"><input type="text" id="bo-ara" autocomplete="off" placeholder="' + esc(M.yanina) + '" value="' + esc(oAra) + '"><div class="m-sonuc" id="bo-sonuc">' + oAramaHtml() + '</div></div>' +
      '<div class="bk-meta">' + h.kcal + ' kcal · ' + h.protein + ' ' + T.protein + (h.sure != null ? ' · ' + M.hesap + sayi(yarim(h.sure)) + ' ' + T.sa : '') + '</div>' +
      '<div class="bk-soru">' + M.soru + '</div>' +
      '<div class="bk-saat">' + SAAT_AD.map(function(a, i){ return '<button class="' + (si === i ? 'on' : '') + '" data-bos="' + i + '" aria-pressed="' + (si === i) + '">' + a + '</button>'; }).join('') + '</div>' +
      rozet +
      (uyeGerek ? '<div class="bk-teklif"><p class="bk-p">' + esc(M.girisGerek) + '</p>' + girisFormHtml('m') + '</div>' : '') +
      '<div class="bk-btns">' + (uyeGerek ? '' : '<button class="btn" id="bo-bildir"' + (si == null ? ' aria-disabled="true"' : '') + '>' + M.bildir + '</button>') + '<button class="link-btn" id="bo-vazgec">' + M.vazgec + '</button></div></div>';
  };

  window.bgOgunSonucHtml = function(){
    var s = bildirimSonuc;
    var hal = '';
    if(s.yemek){ var o = meclis.ozet.get(s.yemek); hal = '<span>' + M.halk + (o && o.medyan_dk != null ? '<b>' + saatYaz(o.medyan_dk) + '</b>' : '<b>?</b>') + '</span>'; }
    return '<div class="bk" id="bk"><div class="bk-ust">' + M.kaydedildi + '</div><div class="bk-ad">' + esc(s.adlar) + '</div>' +
      '<div class="bk-sat"><span>' + M.sen + '<b>' + saatYaz(s.saat_dk) + '</b></span>' + hal + (s.hesap != null ? '<span>' + M.hesapK + '<b>~' + sayi(yarim(s.hesap)) + ' ' + T.sa + '</b></span>' : '') + '</div>' +
      '<div class="bk-btns"><button class="btn" id="bo-baska">' + M.baska + '</button></div></div>';
  };

  async function oGonder(btn){
    if(!bildirim || !votingOpen) return;
    if(bildirim.saat == null){ toast(M.saatSec); buzz([10,40,10]); var k = document.querySelector('#bk .bk-saat'); if(k){ k.classList.remove('uyar'); void k.offsetWidth; k.classList.add('uyar'); } return; }
    var h = oHesap(); if(h.sure == null){ toast(M.katiYok); return; }
    var dk = SAAT_ADIM[bildirim.saat], l = oKalemler().slice(), rozetler = bildirim.rozet.slice();
    if(btn){ btn.disabled = true; btn.textContent = M.gonderiliyor; }
    var b = oBaskin(), hedef = b ? b.id : null, oTekMi = oTek();
    // eski yol: tek yemek, tek porsiyon
    if(oTekMi){
      if(!(await saatKaydet(l[0].id, dk))){ if(btn){ btn.disabled = false; btn.textContent = M.bildir; } return; }
      hedef = l[0].id;
    } else {
      if(!currentUser) return;
      var oid = uuid();
      var r = await sb.from('ogun_tokluk').insert({ ogun_id: oid, baslangic: new Date(Date.now() - dk*60000).toISOString(), sure_dk: dk, aclik: 'evet', toplam_kcal: h.kcal,
        kalemler: l.map(function(k){ return { yemek_id: k.id, porsiyon: k.p }; }) });
      if(r.error){ console.error('ogun_tokluk', r.error); toast(M.hata); if(btn){ btn.disabled = false; btn.textContent = M.bildir; } return; }
      if(hedef){ var o = await sb.from('oylar').insert({ yemek_id: hedef, saat_dk: dk, ogun_id: oid }); if(o.error) console.error('oylar', o.error); else benimBildirim.set(hedef, dk); }
    }
    // rozetler: baskın (ya da ilk) yemeğe
    var ry = hedef || l[0].id;
    if(currentUser){
      var eski = benimRozet.get(ry) || [];
      var degis = eski.filter(function(k){ return rozetler.indexOf(k) < 0; }).map(function(k){ return { rozet: k, aktif: false }; })
        .concat(rozetler.filter(function(k){ return eski.indexOf(k) < 0; }).map(function(k){ return { rozet: k, aktif: true }; }));
      for(var i = 0; i < degis.length; i++){ var e2 = await sb.from('rozet_oylar').insert({ yemek_id: ry, rozet: degis[i].rozet, aktif: degis[i].aktif }); if(e2.error) console.error('rozet', e2.error); }
      if(rozetler.length) benimRozet.set(ry, rozetler); else benimRozet.delete(ry);
    }
    bildirimSonuc = oTekMi ? { id: hedef, saat_dk: dk } : { ogun: true, yemek: hedef, saat_dk: dk, hesap: h.sure, adlar: l.map(function(k){ var f = oYemek(k.id); return f ? (k.p !== 1 ? sayi(k.p) + '× ' : '') + f.ad : ''; }).filter(Boolean).join(' + ') };
    bildirim = null;
    buzz([14,40,22]);
    await meclisYukle(true);
    requestAnimationFrame(function(){ var k = document.getElementById('bk'); if(k) k.scrollIntoView({ behavior: azHareket() ? 'auto' : 'smooth', block: 'center' }); });
  }

  window.bgOgunBagla = function(){
    if(currentMode !== 'comm' || !bildirim || !bildirim.kalemler) return;
    var kok = document.getElementById('bk'); if(!kok) return;
    var a = document.getElementById('bo-ara');
    if(a) a.oninput = function(){ oAra = a.value; var el = document.getElementById('bo-sonuc'); if(el) el.innerHTML = oAramaHtml(); };
    kok.onclick = async function(e){
      var t = e.target.closest ? e.target.closest('button') : null; if(!t) return;
      var x;
      if(t.dataset.boekle){ e.stopPropagation(); buzz(8); window.bgOyAc(t.dataset.boekle); return; }
      if((x = t.dataset.boarti || t.dataset.boeksi)){
        var k = bildirim.kalemler.find(function(y){ return y.id === x; }); if(!k) return;
        k.p = t.dataset.boarti ? Math.min(10, k.p + (k.p < 1 ? 0.5 : 1)) : Math.max(0.5, k.p - (k.p <= 1 ? 0.5 : 1));
        buzz(6); render(); return;
      }
      if(t.dataset.bosil){
        bildirim.kalemler = bildirim.kalemler.filter(function(y){ return y.id !== t.dataset.bosil; });
        if(!bildirim.kalemler.length) bildirim = null; else bildirim.id = bildirim.kalemler[0].id;
        buzz(6); render(); return;
      }
      if(t.dataset.bos != null){
        bildirim.saat = Number(t.dataset.bos); buzz(8);
        kok.querySelectorAll('[data-bos]').forEach(function(y){ var on = y === t; y.classList.toggle('on', on); y.setAttribute('aria-pressed', on); });
        var g = document.getElementById('bo-bildir'); if(g) g.removeAttribute('aria-disabled'); return;
      }
      if(t.id === 'bo-bildir'){ oGonder(t); return; }
      if(t.id === 'bo-vazgec'){ bildirim = null; oAra = ''; render(); return; }
    };
  };
  document.addEventListener('click', function(e){
    var t = e.target.closest && e.target.closest('#bo-baska'); if(!t) return;
    bildirimSonuc = null; bildirim = null; render();
    requestAnimationFrame(function(){ var q2 = document.getElementById('mq'); if(q2){ q2.scrollIntoView({ block: 'center' }); q2.focus(); } });
  });
  var st2 = document.createElement('style');
  st2.textContent = '.bo-kalem{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.14)}.bo-ad{flex:1;min-width:0;font-weight:600}.bo-ad small{display:block;font-weight:400;opacity:.75;font-size:12px}' +
    '.bo-adim{display:inline-flex;align-items:center;gap:6px}.bo-adim button,.bo-sil{width:32px;height:32px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:inherit;font:inherit;font-size:16px;cursor:pointer}.bo-adim b{min-width:26px;text-align:center}' +
    '.bo-ara{margin:10px 0 6px}.bo-ara input{width:100%}';
  document.head.appendChild(st2);


  // =========================================================
  // Dış kapılar: ana sayfa kartı (Bugün'e en az bir kez ekleyene), Ne yesem'de "Bunu yedim",
  // eklemede "~16:05'e kadar toksun" bildirimi.
  // =========================================================
  var K = EN ? {
    eklendi: 'added', toksun: 'Full until ~', gor: 'See Today →', yedim: 'I ate this', tamam: '✓ Added',
    ust: 'TODAY', neYedin: 'What did you eat?', bosAlt: 'Add it and we’ll tell you how long you’ll stay full.', ara: '🔍 eggs, oatmeal, burger…',
    ekle: '+ What did you eat? Add…', daha: ' left', ac: 'Probably hungry by now', acAlt: 'hungry since ', bugunden: 'from Today ✓',
    yesemUst: function(k){ return 'So far today: <b>' + k + ' kcal</b>'; },
    yesemAcik: function(gk, al, ka){ return 'You need about ' + gk + ' kcal a day. From what you added to Today, you’ve had ' + al + ' kcal, which leaves ' + ka + ' kcal for the rest of the day. A portion that fits your hunger right now is around this.'; }
  } : {
    eklendi: 'eklendi', toksun: '', gor: 'Bugün’de gör →', yedim: 'Bunu yedim', tamam: '✓ Eklendi',
    ust: 'BUGÜN', neYedin: 'Ne yedin?', bosAlt: 'Ekle, ne zamana kadar tok kalacağını söyleyelim.', ara: '🔍 menemen, simit, lahmacun…',
    ekle: '+ Ne yedin? Ekle…', daha: ' daha', ac: 'Acıkmış olmalısın', acAlt: '', bugunden: 'Bugün’den ✓',
    yesemUst: function(k){ return 'Bugün şimdiye kadar <b>' + k + ' kcal</b> yedin'; },
    yesemAcik: function(gk, al, ka){ return 'Günlük ihtiyacın ' + gk + ' kcal. Bugün’e girdiklerine göre şimdiye kadar ' + al + ' kcal almışsın; günün kalanına ' + ka + ' kcal kalıyor. Şu anki açlığına uygun porsiyon bu civarda.'; }
  };
  function ogunSonu(o){
    var h = hesap(o.kalemler); if(h.sure == null) return null;
    var c = tokluk[o.id];
    return new Date(new Date(o.bas).getTime() + (c && c.sure_dk ? c.sure_dk : h.sure * 60) * 60000);
  }
  function tokYazi(b){ return EN ? K.toksun + hhmm(b) : '~' + saatEk(b, EK_E) + ' kadar toksun'; }
  function kalanYazi(dk){ var s = Math.floor(dk / 60), d = dk % 60; return (s ? s + ' ' + T.sa + ' ' : '') + d + ' ' + T.dk + K.daha; }

  // zengin bildirim: başlık + alt satır + "Bugün'de gör"
  var bt = document.createElement('div'); bt.id = 'bg-toast'; bt.setAttribute('role', 'status');
  document.body.appendChild(bt);
  var btZaman = null;
  function bgToast(baslik, alt){
    var git = currentMode !== 'menu';
    bt.innerHTML = '<div><b>' + esc(baslik) + '</b>' + (alt ? esc(alt) : '') + '</div>' + (git ? '<button type="button" data-bggit>' + K.gor + '</button>' : '');
    bt.classList.add('goster'); clearTimeout(btZaman);
    btZaman = setTimeout(function(){ bt.classList.remove('goster'); }, 4500);
  }
  bt.addEventListener('click', function(e){
    if(!e.target.closest('[data-bggit]')) return;
    bt.classList.remove('goster'); buzz(8); if(typeof modAc === 'function') modAc('menu');
  });

  window.bgEkle = function(fid){
    secGun = null;
    var x = ekle(fid), f = yemek(fid);
    buzz(8);
    var o = ogunler(gunAnahtari(x.yendi)).filter(function(y){ return y.id === x.ogun_id; })[0];
    var b = o ? ogunSonu(o) : null;
    bgToast(f ? f.ad + ' ' + K.eklendi : T.eklendi, b ? tokYazi(b) : '');
    return x;
  };
  window.bgSil = function(fid){
    var l = gununKayitlari(gunAnahtari(new Date())).filter(function(x){ return x.yemek_id === fid; });
    var x = l[l.length - 1]; if(!x) return;
    kayit = kayit.filter(function(k){ return k.id !== x.id; }); lokalKaydet(); uyeSil(x.id); buzz(6);
    bgToast(T.cikti, '');
  };

  // Ne yesem
  window.bgBugunKcal = function(){
    var l = gununKayitlari(gunAnahtari(new Date())); if(!l.length) return null;
    return Math.round(l.reduce(function(s, x){ var f = yemek(x.yemek_id); return s + (f ? (f.kcal || 0) * x.porsiyon : 0); }, 0));
  };
  window.bgYesemUst = function(k){ return '<div class="bgden"><span>' + K.yesemUst(k) + '</span><small>' + K.bugunden + '</small></div>'; };
  window.bgYesemAciklama = function(gk, al, ka){ return K.yesemAcik(gk, al, ka); };
  window.bgYedimBtn = function(id){
    var on = window.bgBugunIdleri().indexOf(id) >= 0;
    return '<button type="button" class="yedim' + (on ? ' on' : '') + '" data-yedim="' + id + '">' + (on ? K.tamam : K.yedim) + '</button>';
  };
  document.addEventListener('click', function(e){
    var t = e.target.closest && e.target.closest('[data-yedim]'); if(!t) return;
    e.stopPropagation();
    var id = t.dataset.yedim, on = t.classList.contains('on');
    if(on) window.bgSil(id); else window.bgEkle(id);
    t.classList.toggle('on', !on); t.textContent = on ? K.yedim : K.tamam;
    var r = t.closest('.oner'); if(r) r.classList.toggle('secili', !on);
  }, true);

  // Ana sayfa kartı: sadece Bugün'e daha önce bir şey eklemiş olana
  window.bgAnaKartHtml = function(){
    if(!kayit.length) return '';
    if(!TUM){ tumYemekYukle(); return ''; }
    var simdi = new Date(), gun = gunAnahtari(simdi), l = ogunler(gun);
    var gunAd = simdi.toLocaleDateString(EN ? 'en-US' : 'tr-TR', { weekday: 'long' });
    if(!l.length){
      var say = {}; kayit.filter(function(x){ return Date.now() - new Date(x.yendi).getTime() < 14*864e5; }).forEach(function(x){ say[x.yemek_id] = (say[x.yemek_id] || 0) + 1; });
      var son = Object.keys(say).sort(function(a, b){ return say[b] - say[a]; }).slice(0, 4).map(yemek).filter(Boolean);
      return '<div class="bga" id="bga"><div class="bga-ust">' + K.ust + '<span>' + esc(gunAd) + '</span></div>' +
        '<div class="bga-b">' + K.neYedin + '</div><p class="bga-alt">' + K.bosAlt + '</p>' +
        '<button type="button" class="bga-ara" data-seg="menu">' + K.ara + '</button>' +
        (son.length ? '<div class="bga-cips">' + son.map(function(f){ return '<button type="button" data-bgekle="' + f.id + '">+ ' + esc(f.ad) + '</button>'; }).join('') + '</div>' : '') + '</div>';
    }
    var o = l[l.length - 1], h = hesap(o.kalemler), b = ogunSonu(o);
    var top = l.reduce(function(s, y){ var hh = hesap(y.kalemler); s.k += hh.kcal; s.p += hh.protein; return s; }, { k: 0, p: 0 });
    var baslik, alt;
    if(b && simdi < b){
      baslik = EN ? 'Full until <em>~' + hhmm(b) + '</em>' : '~' + saatEk(b, EK_E) + ' kadar <em>toksun</em>';
      alt = kalanYazi(Math.round((b - simdi) / 60000)) + ' · ' + esc(ogunAdi(o.bas).toLocaleLowerCase(EN ? 'en' : 'tr')) + ' ' + hhmm(o.bas);
    } else if(b){
      baslik = K.ac;
      alt = EN ? K.acAlt + hhmm(b) : saatEk(b, EK_DEN) + ' beri açsın';
    } else {
      baslik = esc(ogunAdi(o.bas)) + ' ' + hhmm(o.bas); alt = T.hesapYok;
    }
    var adlar = o.kalemler.map(function(x){ var f = yemek(x.yemek_id); return f ? esc(f.ad) + (x.porsiyon !== 1 ? ' ×' + sayi(x.porsiyon) : '') : ''; }).filter(Boolean).join(' + ');
    return '<div class="bga" id="bga"><div class="bga-ust">' + K.ust + '<span>' + top.k + ' kcal · ' + top.p + ' ' + T.protein + '</span></div>' +
      '<div class="bga-b">' + baslik + '</div><div class="bga-alt">' + alt + '</div>' + cizgi(gun, l, true) +
      '<div class="bga-kalem"><span>' + adlar + '</span><span>' + h.kcal + ' kcal</span></div>' +
      '<button type="button" class="bga-ara" data-seg="menu">' + K.ekle + '</button></div>';
  };
  document.addEventListener('click', function(e){
    var t = e.target.closest && e.target.closest('#bga [data-bgekle]'); if(!t) return;
    e.stopPropagation(); window.bgEkle(t.dataset.bgekle); render();
  }, true);

  var st3 = document.createElement('style');
  st3.textContent =
    '#bg-toast{position:fixed;left:50%;bottom:calc(100px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(30px);width:calc(100% - 32px);max-width:420px;background:var(--forest,#0E2217);color:#fff;border-radius:18px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px;box-shadow:0 10px 30px rgba(0,0,0,.25);font-size:13px;line-height:1.35;opacity:0;pointer-events:none;transition:transform .25s ease,opacity .2s ease;z-index:60}' +
    '#bg-toast.goster{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto}#bg-toast b{display:block;font-size:14.5px}' +
    '#bg-toast button{background:none;border:none;color:var(--lime,#D5EC62);font:inherit;font-weight:700;white-space:nowrap;cursor:pointer;padding:6px 0}' +
    '.yedim{flex:0 0 auto;border:1.5px solid var(--teal,#1F5C3B);color:var(--teal-dark,#15432A);background:#fff;border-radius:999px;font:inherit;font-size:12px;font-weight:700;padding:7px 11px;cursor:pointer;white-space:nowrap}' +
    '.yedim.on{background:var(--teal,#1F5C3B);color:#fff}.oner.secili{background:var(--teal-wash,#E1EEE4);margin:0 -14px;padding-left:14px;padding-right:14px}' +
    '.bgden{display:flex;justify-content:space-between;align-items:center;gap:8px;background:var(--teal-wash,#E1EEE4);border-radius:12px;padding:10px 12px;margin-bottom:12px;font-size:13px}.bgden b{color:var(--teal-dark,#15432A)}.bgden small{font-size:11px;font-weight:600;color:var(--teal,#1F5C3B);white-space:nowrap}' +
    '.bga{max-width:520px;margin:14px auto 0;background:var(--card,#fff);border-radius:var(--r-md,24px);padding:16px 16px 14px;box-shadow:var(--shadow,0 6px 20px rgba(0,0,0,.08));text-align:left}' +
    '.bga-ust{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:10.5px;font-weight:700;letter-spacing:.16em;color:var(--teal,#1F5C3B)}.bga-ust span{letter-spacing:0;font-weight:500;font-size:12px;color:var(--ink-muted,#5B6B60)}' +
    '.bga-b{font-family:"Bricolage Grotesque",sans-serif;font-weight:800;font-size:23px;line-height:1.2;color:var(--ink,#0F1A13);margin:8px 0 2px}.bga-b em{font-style:normal;color:var(--teal,#1F5C3B)}' +
    '.bga-alt{font-size:13px;color:var(--ink-muted,#5B6B60);margin:0}.bga .bg-cizgi{margin:12px 0 2px}' +
    '.bga-kalem{display:flex;justify-content:space-between;gap:10px;font-size:13px;margin-top:10px;padding-top:10px;border-top:1px solid var(--line,#D6E3D9)}.bga-kalem span:last-child{color:var(--ink-muted,#5B6B60);white-space:nowrap}' +
    '.bga-ara{display:block;width:100%;margin-top:12px;border:1.5px solid var(--line-strong,#C4D4C8);background:transparent;border-radius:999px;padding:11px 14px;font:inherit;font-size:14px;color:var(--ink-muted,#5B6B60);text-align:left;cursor:pointer}' +
    '.bga-cips{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.bga-cips button{border:1.5px solid var(--line-strong,#C4D4C8);background:transparent;border-radius:999px;padding:6px 11px;font:inherit;font-size:13px;color:var(--ink,#0F1A13);cursor:pointer}';
  document.head.appendChild(st3);


})();
