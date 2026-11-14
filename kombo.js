// Kombolar: birlikte yenen yemeklerin halkın bildirdiği tokluk saati.
// 1) Satır içi bildirim kartına "Yanında bir şey yedin mi?" ekler: yan eklenirse saat kombo olarak kaydolur.
// 2) Meclis-i Mide'de "En iyi tok tutan kombolar" listesi; "Ben de yedim" öğün formunu kombo dolu açar.
// index.html'deki ana betikten (ve bugun.js'ten) sonra yüklenir; global değişkenlerini kullanır.
// Kimlik ikili sistemle: girişsiz bildirim yarım, üye bildirimi tam sayılır (sunucu: kombo_ozet).
(function(){
  'use strict';
  var EN = window.PR_DIL === 'en';
  var T = EN ? {
    soru: 'Did you eat anything with it?', hayir: 'No, just this', evet: 'Yes, add',
    ara: 'What else was there? Search…', komboSoru: 'Tap how long this combo kept you full.',
    hesap: 'math ~', kaydedildi: 'Combo saved: ', sen: 'You said', halk: 'Crowd', kisi: 'people', kisi1: 'person',
    halkYok: 'no crowd hour yet', komboOtur: function(n){ return n + ' more to settle the crowd hour'; },
    baslik: 'Most filling combos', alt: 'Foods eaten together and how long people say they stayed full. Report yours from any food row (“did you eat anything with it?”) or here.',
    verim: 'Per calorie', uzun: 'Longest', azVeri: 'little data', benDe: 'I ate this too', gir: '+ Report your combo',
    bos: 'No combos yet. Pick a food, add what you ate with it, and the first combo is yours.',
    yuzde: function(x){ return '~' + x + ' h at the same 300 kcal'; },
    yendi: 'beat the math', altinda: 'short of the math', daha: function(n){ return n + ' more combos'; },
    girGuide: 'Pick your main food, then add what you ate with it', sinir: 'You hit today’s report limit, back tomorrow',
    hata: 'Couldn’t save, try again in a moment', yuk: 'Loading combos…', maks: 'Up to 4 sides', sa: 'h', kcal: 'kcal',
    komboHalk: 'Combo crowd'
  } : {
    soru: 'Yanında bir şey yedin mi?', hayir: 'Hayır, tek başına', evet: 'Evet, ekle',
    ara: 'Başka ne vardı? Ara…', komboSoru: 'Bu kombo seni kaç saat tuttu? Saate dokun.',
    hesap: 'hesap ~', kaydedildi: 'Kombo kaydedildi: ', sen: 'Sen', halk: 'Halk', kisi: 'kişi', kisi1: 'kişi',
    halkYok: 'halkın saati henüz oturmadı', komboOtur: function(n){ return n + ' kişi daha bildirince halkın saati oturur'; },
    baslik: 'En iyi tok tutan kombolar', alt: 'Birlikte yenen yemekler ve yiyenlerin bildirdiği tokluk. Kendi kombonu herhangi bir yemeğin satırından ("yanında bir şey yedin mi?") ya da buradan gir.',
    verim: 'Kalorisine göre', uzun: 'En uzun tutan', azVeri: 'az veri', benDe: 'Ben de yedim', gir: '+ Kombonu gir',
    bos: 'Henüz kombo yok. Bir yemek seç, yanında ne yediğini ekle; ilk kombo senin olsun.',
    yuzde: function(x){ return 'aynı 300 kaloride ~' + x + ' sa'; },
    yendi: 'hesabı yendi', altinda: 'hesabın altında', daha: function(n){ return n + ' kombo daha'; },
    girGuide: 'Önce ana yemeğini seç, sonra yanındakileri ekle', sinir: 'Bugünlük bildirim sınırına geldin, yarın devam',
    hata: 'Kaydedilemedi, birazdan tekrar dene', yuk: 'Kombolar yükleniyor…', maks: 'En fazla 4 yan', sa: 'sa', kcal: 'kcal',
    komboHalk: 'Kombo halkı'
  };
  var MAKS_YAN = 4;
  var ESIK = typeof RAPOR_ESIK === 'number' ? RAPOR_ESIK : 3;
  // Hızlı yan önerileri (yemek id'leri): ekmek, ayran, kola, beyaz pilav, çoban salata, cacık, şekerli çay, patates kızartması
  var ONERI = ['c2e5b400-f089-4182-a938-6e1b315a0b72', '66fedddb-6270-4f57-91ab-79ff34e7c09f', '7bb5d723-0676-41e2-90d3-2e1d6ae2b3e8',
    'c021ab43-3e2e-4235-9e21-2570beec9cd4', '72fb94d2-ce6d-4772-bca3-ecb60a53f986', '92a990ac-dbf7-4347-bd6d-0a7da4d0dc16',
    '111b0d79-e3f4-426b-99fd-325f764b7816', '0f233459-e8d0-44cb-b306-7b9f1c77a027'];

  // ---------- durum (render'ı aşar, DOM'da tutulmaz) ----------
  var yan = new Map();        // yemek_id -> { acik: bool, ids: [yan yemek id], ara: '' }
  var son = new Map();        // yemek_id -> { anahtar, adlar, dk }  (bu oturumda satırdan girilen son kombo)
  var kb = { ozet: [], harita: new Map(), yuklendi: false, yukleniyor: null, sira: 'verim', n: 10 };
  var yerel = new Map();      // kombo listesi ve öneriler için çekilen yemekler

  function sayi(x){ return EN ? String(x) : String(x).replace('.', ','); }
  function yarim(x){ return Math.round(x * 2) / 2; }
  function kisa(ad){ return String(ad || '').replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim(); }
  function bul(id){
    var f = (typeof mYemek === 'function' && mYemek(id)) || yerel.get(id);
    if(!f && typeof TUM !== 'undefined' && TUM){ f = TUM.find(function(x){ return x.id === id; }) || null; if(f) yerel.set(id, f); }
    return f || null;
  }
  async function getir(ids){
    var eksik = ids.filter(function(id){ return !bul(id); });
    for(var i = 0; i < eksik.length; i += 100){
      var r = await sb.from('yemekler').select(YEMEK_ALAN).in('id', eksik.slice(i, i + 100));
      (r.data || []).forEach(function(f){ yerel.set(f.id, f); });
    }
  }
  function anahtar(kalemler){
    var m = new Map();
    kalemler.forEach(function(k){ m.set(k.yemek_id, Math.min(10, Math.max(0.5, Math.round(((m.get(k.yemek_id) || 0) + k.porsiyon) * 2) / 2))); });
    return Array.from(m.keys()).sort().map(function(id){ return id + 'x' + m.get(id); }).join(',');
  }
  // Öğün tokluk motoru (bugun.js ile aynı): katı kalori × kalori ağırlıklı puan; içecek kalorisi süreye girmez
  function hesap(kalemler){
    var kT = 0, kS = 0, pK = 0, eksik = false;
    kalemler.forEach(function(k){
      var f = bul(k.yemek_id); if(!f){ eksik = true; return; }
      var c = (f.kcal || 0) * k.porsiyon; kT += c; pK += c * (f.doyuruculuk || 0);
      if(f.tur !== 'icecek') kS += c;
    });
    var puan = kT ? pK / kT : 0;
    return { eksik: eksik, kcal: Math.round(kT), kati: kS, sure: kS >= 50 ? Math.max(0.5, Math.min(6, tabanSaat(kS) * verimKatsayi(puan))) : null };
  }
  function adlar(kalemler){
    return kalemler.map(function(k){ var f = bul(k.yemek_id); return f ? (k.porsiyon !== 1 ? sayi(k.porsiyon) + '× ' : '') + kisa(f.ad) : null; });
  }

  // ---------- veri ----------
  async function yukle(force){
    if(kb.yukleniyor) return kb.yukleniyor;
    if(kb.yuklendi && !force) return;
    kb.yukleniyor = (async function(){
      try{
        var r = await sb.from('kombo_ozet').select('anahtar,kalemler,kisi,uyeli,medyan_dk,son').order('son', { ascending: false }).limit(500);
        if(r.error) throw r.error;
        var l = r.data || [];
        var ids = {}; l.forEach(function(o){ (o.kalemler || []).forEach(function(k){ ids[k.yemek_id] = 1; }); });
        await getir(Object.keys(ids));
        kb.ozet = l; kb.harita = new Map(l.map(function(o){ return [o.anahtar, o]; }));
        kb.yuklendi = true;
      }catch(e){ console.error('kombo verisi alınamadı', e); }
      kb.yukleniyor = null;
    })();
    await kb.yukleniyor;
    if(typeof meclisTazele === 'function') meclisTazele();
  }
  window.kbOzet = function(a){ return a ? kb.harita.get(a) || null : null; };
  window.kbYenile = function(){ kb.yuklendi = false; return yukle(true); };

  async function kaydet(kalemler, dk, kaynak){
    var kayit = { kalemler: kalemler, saat_dk: Math.min(360, dk), kaynak: kaynak };
    if(!currentUser) kayit.cihaz = 'd:' + deviceId();
    var r = await sb.from('kombolar').insert(kayit);
    if(r.error){
      console.error('kombolar', r.error);
      toast(/gunluk_sinir/.test(r.error.message || '') ? T.sinir : T.hata);
      return null;
    }
    kb.yuklendi = false;
    return anahtar(kalemler);
  }
  window.kbKaydet = kaydet;

  // ---------- 1) satır içi kart: yanında bir şey yedin mi? ----------
  function durum(id){ var d = yan.get(id); if(!d){ d = { acik: false, ids: [], ara: '' }; yan.set(id, d); } return d; }
  function oneriler(id, d){
    return ONERI.filter(function(x){ return x !== id && d.ids.indexOf(x) < 0 && bul(x); }).slice(0, 6);
  }
  function aramaSonuc(id, d){
    var s = trNorm((d.ara || '').trim()); if(s.length < 2) return '';
    if(typeof TUM === 'undefined' || !TUM){ tumYemekYukle(); return ''; }
    var sira = function(f){ var n = trNorm(f.ad), i = n.indexOf(s); return i < 0 ? -1 : (i === 0 ? 0 : (/[^a-z0-9]/.test(n.charAt(i - 1)) ? 1 : 2)); };
    return TUM.filter(function(f){ return f.id !== id && d.ids.indexOf(f.id) < 0 && sira(f) >= 0; })
      .sort(function(a, b){ return sira(a) - sira(b) || trNorm(a.ad).length - trNorm(b.ad).length; }).slice(0, 5)
      .map(function(f){ return '<button type="button" class="kb-sn" data-kbek="' + f.id + '" data-kbid="' + id + '"><span>' + esc(f.ad) + '</span><small>' + f.kcal + ' ' + T.kcal + '</small><b>+</b></button>'; }).join('');
  }
  window.kbYanHtml = function(id){
    var d = durum(id);
    var h = '<div class="kb-yan" data-kby="' + id + '"><div class="kb-soru">' + T.soru + '</div>' +
      '<div class="kb-sec"><button type="button" class="' + (d.acik ? '' : 'on') + '" data-kbhayir="' + id + '" aria-pressed="' + !d.acik + '">' + T.hayir + '</button>' +
      '<button type="button" class="' + (d.acik ? 'on' : '') + '" data-kbevet="' + id + '" aria-pressed="' + d.acik + '">' + T.evet + '</button></div>';
    if(d.acik){
      if(!kb.oneriIstendi && ONERI.some(function(x){ return !bul(x); })){ kb.oneriIstendi = true; getir(ONERI).then(function(){ kartTazele(id); }); }
      var ciple = d.ids.map(function(x){ var f = bul(x); return f ? '<button type="button" class="kb-cip on" data-kbsil="' + x + '" data-kbid="' + id + '">' + esc(kisa(f.ad)) + ' <b>×</b></button>' : ''; }).join('');
      var oner = d.ids.length < MAKS_YAN ? oneriler(id, d).map(function(x){ return '<button type="button" class="kb-cip" data-kbek="' + x + '" data-kbid="' + id + '">+ ' + esc(kisa(bul(x).ad)) + '</button>'; }).join('') : '';
      h += '<div class="kb-cipler">' + ciple + oner + '</div>';
      if(d.ids.length < MAKS_YAN) h += '<div class="kb-ara"><input type="text" autocomplete="off" enterkeyhint="search" data-kbara="' + id + '" placeholder="' + esc(T.ara) + '" value="' + esc(d.ara) + '"><div class="kb-sonuc" data-kbsonuc="' + id + '">' + aramaSonuc(id, d) + '</div></div>';
      else h += '<div class="kb-not">' + T.maks + '</div>';
      if(d.ids.length){
        var kal = [{ yemek_id: id, porsiyon: 1 }].concat(d.ids.map(function(x){ return { yemek_id: x, porsiyon: 1 }; }));
        var hs = hesap(kal);
        h += '<div class="kb-ozet"><b>' + esc(adlar(kal).filter(Boolean).join(' + ')) + '</b> · ' + hs.kcal + ' ' + T.kcal +
          (hs.sure != null ? ' · ' + T.hesap + sayi(yarim(hs.sure)) + ' ' + T.sa : '') + '<br>' + T.komboSoru + '</div>';
      }
    }
    return h + '</div>';
  };
  // Kartın üst satırı: bu oturumda bu yemekten girilen son kombo
  window.kbDurum = function(id){
    var s = son.get(id); if(!s) return null;
    var o = kb.harita.get(s.anahtar);
    var halk = o && o.kisi >= ESIK && o.medyan_dk != null ? T.halk + ' <b>' + saatYaz(o.medyan_dk) + '</b> (' + o.kisi + ' ' + T.kisi + ')'
      : (o ? T.komboOtur(Math.max(1, ESIK - o.kisi)) : T.halkYok);
    return '✓ ' + esc(s.adlar) + ': ' + T.sen.toLowerCase() + ' <b>' + saatYaz(s.dk) + '</b> · ' + halk;
  };
  window.kbTemizle = function(id){ son.delete(id); var d = yan.get(id); if(d){ d.ids = []; d.acik = false; d.ara = ''; } };

  function kartTazele(id){
    var el = document.querySelector('.hb[data-hb="' + id + '"]');
    if(el && typeof hizliBildirHtml === 'function') el.outerHTML = hizliBildirHtml(id);
  }
  // hizliBildir bunu önce çağırır: yan eklenmişse saati kombo olarak kaydeder ve true döner
  var mesgul = false;
  window.kbBildir = function(id, i, btn){
    var d = yan.get(id);
    if(!d || !d.acik || !d.ids.length) return false;
    if(mesgul) return true;
    mesgul = true; buzz(8);
    var kutu = btn && btn.closest('.hb'); if(kutu) kutu.classList.add('gonder');
    var dk = SAAT_ADIM[i];
    var kal = [{ yemek_id: id, porsiyon: 1 }].concat(d.ids.map(function(x){ return { yemek_id: x, porsiyon: 1 }; }));
    (async function(){
      var a = await kaydet(kal, dk, 'satir');
      if(a){
        // Ana yemek öğünün baskın kalemiyse (kalorinin %70'i+) saati ayrıca o yemeğe de gider (bugun.js ile aynı kural)
        var hs = hesap(kal), f = bul(id);
        if(f && !hs.eksik && f.kcal >= 0.7 * hs.kcal) await saatKaydet(id, dk);
        son.set(id, { anahtar: a, adlar: adlar(kal).filter(Boolean).join(' + '), dk: dk });
        d.ids = []; d.acik = false; d.ara = '';
        await yukle(true);
        buzz([14, 40, 22]); toast(T.kaydedildi + saatYaz(dk));
      }
      mesgul = false;
      var g = document.querySelector('.hb[data-hb="' + id + '"]');
      if(g){ g.classList.remove('gonder'); if(a) kartTazele(id); }
    })();
    return true;
  };

  // .hb içindeki tıklamaları index.html yakalama aşamasında durduruyor; aynı düğümde yakalama dinleyicisi yine çalışır
  document.addEventListener('click', function(e){
    var t = e.target.closest && e.target.closest('[data-kbhayir],[data-kbevet],[data-kbek],[data-kbsil]');
    if(!t) return;
    e.preventDefault(); e.stopPropagation();
    var id = t.dataset.kbhayir || t.dataset.kbevet || t.dataset.kbid, d = durum(id);
    if(t.dataset.kbhayir){ d.acik = false; d.ids = []; d.ara = ''; }
    else if(t.dataset.kbevet){ d.acik = true; if(typeof TUM === 'undefined' || !TUM) tumYemekYukle(); }
    else if(t.dataset.kbek){ if(d.ids.length < MAKS_YAN && d.ids.indexOf(t.dataset.kbek) < 0) d.ids.push(t.dataset.kbek); d.ara = ''; }
    else if(t.dataset.kbsil){ d.ids = d.ids.filter(function(x){ return x !== t.dataset.kbsil; }); }
    buzz(6); kartTazele(id);
    if(t.dataset.kbevet){ var a = document.querySelector('[data-kbara="' + id + '"]'); if(a && !('ontouchstart' in window)) a.focus(); }
  }, true);
  document.addEventListener('input', function(e){
    var a = e.target; if(!a || !a.dataset || !a.dataset.kbara) return;
    var id = a.dataset.kbara, d = durum(id); d.ara = a.value;
    var el = document.querySelector('[data-kbsonuc="' + id + '"]'); if(el) el.innerHTML = aramaSonuc(id, d);
  });
  document.addEventListener('keydown', function(e){
    var a = e.target; if(!a || !a.dataset || !a.dataset.kbara || e.key !== 'Enter') return;
    e.preventDefault(); var ilk = document.querySelector('[data-kbsonuc="' + a.dataset.kbara + '"] [data-kbek]'); if(ilk) ilk.click();
  });

  // ---------- 2) Meclis: en iyi tok tutan kombolar ----------
  function satirlar(){
    var l = [];
    kb.ozet.forEach(function(o){
      var kal = (o.kalemler || []).map(function(k){ return { yemek_id: k.yemek_id, porsiyon: Number(k.porsiyon) }; });
      var hs = hesap(kal); if(hs.eksik || o.medyan_dk == null || hs.kati < 50) return;
      var h = o.medyan_dk / 60;
      // aynı 300 kalori karşılığı: sitenin eğrisiyle ölçeklenir (doğrusal değil)
      var v = h * tabanSaat(300) / tabanSaat(hs.kati);
      l.push({ o: o, kal: kal, hs: hs, h: h, v: v, dolu: o.kisi >= ESIK });
    });
    var anah = kb.sira === 'uzun' ? 'h' : 'v';
    return l.sort(function(a, b){ return (b.dolu - a.dolu) || (b[anah] - a[anah]) || (b.o.kisi - a.o.kisi); });
  }
  window.kbListeHtml = function(){
    var h = '<div class="section-title" id="m-kombolar">' + T.baslik + '</div><p class="note">' + T.alt + '</p>';
    if(!kb.yuklendi){ yukle(); return h + (typeof skeleton === 'function' ? skeleton(3) : '<div class="card"><p class="m-bosnot">' + T.yuk + '</p></div>'); }
    var l = satirlar();
    var gir = '<button type="button" class="btn ikincil kb-gir" data-kbgir>' + T.gir + '</button>';
    if(!l.length) return h + '<div class="card"><p class="m-bosnot">' + T.bos + '</p>' + gir + '</div>';
    h += '<div class="kb-sira" role="tablist">' + ['verim', 'uzun'].map(function(s){
      return '<button type="button" role="tab" class="' + (kb.sira === s ? 'on' : '') + '" aria-selected="' + (kb.sira === s) + '" data-kbsira="' + s + '">' + T[s] + '</button>';
    }).join('') + '</div><div class="card mliste kb-liste">';
    l.slice(0, kb.n).forEach(function(x, i){
      var t = x.hs.sure, fark = t != null ? x.h - t : 0;
      var kavga = x.dolu && t != null && Math.abs(fark) >= 1 ? '<span class="kb-kavga ' + (fark > 0 ? 'iyi' : 'kotu') + '">' + (fark > 0 ? T.yendi : T.altinda) + '</span>' : '';
      var alt = [x.hs.kcal + ' ' + T.kcal, x.o.kisi + ' ' + (x.o.kisi === 1 ? T.kisi1 : T.kisi)];
      if(!x.dolu) alt.push(T.azVeri);
      if(t != null) alt.push(T.hesap + sayi(yarim(t)) + ' ' + T.sa);
      h += '<div class="kb-satir" style="--i:' + Math.min(i, 12) + '">' +
        '<span class="kb-no">' + (i + 1) + '</span>' +
        '<div class="kb-orta"><div class="kb-adlar">' + esc(adlar(x.kal).join(' + ')) + kavga + '</div>' +
        '<small>' + alt.join(' · ') + '</small>' +
        '<small class="kb-v">' + T.yuzde(sayi(yarim(x.v))) + '</small></div>' +
        '<div class="kb-sag"><span class="mr-saat' + (x.dolu ? '' : ' az') + '">' + saatYaz(x.o.medyan_dk) + '</span>' +
        (votingOpen ? '<button type="button" class="link-btn" data-kbben="' + esc(x.o.anahtar) + '">' + T.benDe + '</button>' : '') + '</div></div>';
    });
    h += '</div>';
    if(l.length > kb.n) h += '<button type="button" class="link-btn m-daha" data-kbdaha>' + T.daha(l.length - kb.n) + '</button>';
    return h + (votingOpen ? gir : '');
  };
  function formAc(kal){
    if(!votingOpen) return;
    var ilk = kal.filter(function(k){ var f = bul(k.yemek_id); return f && f.tur !== 'icecek' && !f.sadece_malzeme; })[0] || kal[0];
    var fl = kal.map(function(k){ return bul(k.yemek_id); }).filter(Boolean);
    if(typeof mYemekKaydet === 'function') mYemekKaydet(fl);
    bildirim = { id: ilk.yemek_id, kalemler: kal.map(function(k){ return { id: k.yemek_id, p: k.porsiyon }; }), saat: null, rozet: [] };
    bildirimSonuc = null; mArama = ''; mSonuclar = null;
    render();
    requestAnimationFrame(function(){ var k = document.getElementById('bk'); if(k) k.scrollIntoView({ behavior: azHareket() ? 'auto' : 'smooth', block: 'center' }); });
  }
  document.addEventListener('click', function(e){
    if(!e.target.closest) return;
    var t = e.target.closest('[data-kbsira],[data-kbben],[data-kbgir],[data-kbdaha]');
    if(!t) return;
    buzz(6);
    if(t.dataset.kbsira){ kb.sira = t.dataset.kbsira; render(); return; }
    if(t.hasAttribute('data-kbdaha')){ kb.n += 20; render(); return; }
    if(t.dataset.kbben){ var o = kb.harita.get(t.dataset.kbben); if(o) formAc(o.kalemler.map(function(k){ return { yemek_id: k.yemek_id, porsiyon: Number(k.porsiyon) }; })); return; }
    if(t.hasAttribute('data-kbgir')){
      bildirim = null; bildirimSonuc = null; render();
      requestAnimationFrame(function(){ var q = document.getElementById('mq'); if(q){ q.scrollIntoView({ behavior: azHareket() ? 'auto' : 'smooth', block: 'center' }); q.focus(); } toast(T.girGuide); });
    }
  });

  // Derin bağlantı: /?kombolar → Meclis açılır, kombo listesine iner
  if(/[?&]kombolar\b/.test(location.search)){
    history.replaceState(null, '', location.pathname);
    setTimeout(async function(){
      if(typeof modAc === 'function') await modAc('comm');
      await yukle(true);
      var el = document.getElementById('m-kombolar'); if(el) el.scrollIntoView({ block: 'start' });
    }, 400);
  }

  var st = document.createElement('style');
  st.textContent =
    '.kb-yan{margin:0 0 10px;padding:0 0 10px;border-bottom:1px solid rgba(255,255,255,.14)}' +
    '.kb-soru{font-size:13px;font-weight:600;color:rgba(255,255,255,.9);margin-bottom:7px}' +
    '.kb-sec{display:flex;gap:6px}.kb-sec button{flex:1;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:8px 10px;font:inherit;font-size:13px;font-weight:600;cursor:pointer}' +
    '.kb-sec button.on{background:var(--lime);border-color:var(--lime);color:var(--forest)}' +
    '.kb-cipler{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}.kb-cip{border:1px dashed rgba(255,255,255,.35);background:transparent;color:#fff;border-radius:999px;padding:6px 11px;font:inherit;font-size:12.5px;cursor:pointer}' +
    '.kb-cip.on{border-style:solid;border-color:var(--lime);background:rgba(220,255,120,.14)}.kb-cip b{margin-left:2px;opacity:.8}' +
    '.kb-ara{margin-top:8px}.kb-ara input{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;border-radius:12px;padding:9px 12px;font:inherit;font-size:14px}.kb-ara input::placeholder{color:rgba(255,255,255,.55)}' +
    '.kb-sonuc:empty{display:none}.kb-sonuc{margin-top:6px;border-radius:12px;overflow:hidden;background:rgba(255,255,255,.06)}' +
    '.kb-sn{display:flex;align-items:center;gap:8px;width:100%;border:none;border-bottom:1px solid rgba(255,255,255,.08);background:none;color:#fff;padding:9px 12px;font:inherit;font-size:13.5px;text-align:left;cursor:pointer}.kb-sn span{flex:1}.kb-sn small{opacity:.6}.kb-sn b{color:var(--lime)}' +
    '.kb-ozet{margin-top:9px;font-size:12.5px;line-height:1.5;color:rgba(255,255,255,.8)}.kb-ozet b{color:#fff}.kb-not{margin-top:8px;font-size:12px;opacity:.7}' +
    '.kb-sira{display:flex;gap:6px;margin:0 0 10px}.kb-sira button{border:1px solid var(--line-strong,#D2D1C4);background:var(--card,#fff);color:inherit;border-radius:999px;padding:7px 13px;font:inherit;font-size:13px;font-weight:600;cursor:pointer}.kb-sira button.on{background:var(--forest);border-color:var(--forest);color:#fff}' +
    '.kb-satir{display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px dashed var(--line);animation:fadeUp .3s ease both;animation-delay:calc(var(--i,0)*35ms)}.kb-satir:last-child{border-bottom:none}' +
    '.kb-no{flex:0 0 22px;font-family:"Bricolage Grotesque",sans-serif;font-weight:800;font-size:15px;color:var(--teal);text-align:center}' +
    '.kb-orta{flex:1;min-width:0}.kb-adlar{font-weight:600;font-size:14.5px;line-height:1.35}.kb-orta small{display:block;font-size:12px;color:var(--ink-muted);margin-top:2px}.kb-orta small.kb-v{color:var(--teal-dark,#1d5c40)}' +
    '.kb-kavga{display:inline-block;margin-left:6px;font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:999px;vertical-align:2px}.kb-kavga.iyi{background:rgba(47,143,91,.14);color:#2F8F5B}.kb-kavga.kotu{background:rgba(179,38,30,.1);color:#B3261E}' +
    '.kb-sag{display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex:0 0 auto}.kb-sag .link-btn{font-size:12px}' +
    '.kb-gir{display:block;margin:10px 0 4px}';
  document.head.appendChild(st);
})();
