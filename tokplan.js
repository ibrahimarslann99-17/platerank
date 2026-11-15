// Tok Plan (Stay Full Plan) istemci akisi: anket -> /api/plan -> sonuc ve odeme -> plan gorunumu.
// Hesap yok; tum hesap ve kapi sunucuda.
(function () {
  'use strict';
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var giris = $('#tp-giris'), anket = $('#tp-anket'), sonuc = $('#tp-sonuc'), planEl = $('#tp-plan');
  var ABD = /^en-US/i.test(navigator.language || '') || /^America\//.test((Intl.DateTimeFormat().resolvedOptions().timeZone || ''));
  var D = { dil: 'en', birim: ABD ? 'imperial' : 'metrik', alerjen: [], kalkis: '07:00', yatis: '23:00' };
  var adim = 0;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function goster(el) { [giris, anket, sonuc, planEl].forEach(function (x) { x.hidden = x !== el; }); window.scrollTo(0, 0); }
  function sakla(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function oku(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function izle(ad, veri) { try { window.va && window.va('event', { name: ad, data: veri || {} }); } catch (e) {} }

  // ---------- anket ----------
  function secenek(anahtar, deger, baslik, alt) {
    var on = D[anahtar] === deger ? ' on' : '';
    return '<button type="button" class="tp-sec' + on + '" data-k="' + anahtar + '" data-v="' + deger + '"><span>' + esc(baslik) + (alt ? '<small>' + esc(alt) + '</small>' : '') + '</span><span aria-hidden="true">›</span></button>';
  }
  function birimSec() {
    return '<div class="tp-birim" role="group" aria-label="Units"><button type="button" data-birim="imperial" class="' + (D.birim === 'imperial' ? 'on' : '') + '">ft, lb</button><button type="button" data-birim="metrik" class="' + (D.birim === 'metrik' ? 'on' : '') + '">cm, kg</button></div>';
  }

  // ---------- "normalde ne yersin": siteden yemek secimi ----------
  // Kullanicinin sectikleri planin sifir noktasidir (api/_motor.js aliskanlik). Metinler tek tabloda; Turkce sayfa satir satir cevirir.
  var A = {
    soru: 'What do you usually eat?',
    acik: 'Pick up to 3 foods per meal that you eat together. Your plan starts from these and suggests more filling swaps.',
    ogunKahvalti: 'Breakfast',
    ogunOgle: 'Lunch',
    ogunAksam: 'Dinner',
    ara: 'Search foods, e.g. oatmeal',
    atla: 'I skip breakfast',
    yok: 'No match. Try a shorter word.',
    yukleniyor: 'Loading foods…',
    bos: 'Leave a meal empty and we will pick it for you.'
  };
  var AL_OGUN = [['kahvalti', A.ogunKahvalti], ['ogle', A.ogunOgle], ['aksam', A.ogunAksam]];
  D.aliskanlik = { kahvalti: [], ogle: [], aksam: [] };
  var YEMEK = null, yemekIstendi = false;
  var HARF = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u', 'é': 'e', 'è': 'e', 'ê': 'e', 'ñ': 'n', 'á': 'a', 'í': 'i', 'ó': 'o', 'ú': 'u' };
  // Arama icin sade yazim: kucuk harf, Turkce ve aksanli harfler duz karsiligina, gerisi bosluk
  function sade(s) {
    return String(s).replace(/İ/g, 'i').toLowerCase().replace(/[^a-z0-9 ]/g, function (c) { return HARF[c] !== undefined ? HARF[c] : ' '; }).replace(/ +/g, ' ').trim();
  }
  function yemekYukle() {
    if (YEMEK || yemekIstendi) return; yemekIstendi = true;
    fetch('/api/plan?liste=' + D.dil).then(function (r) { return r.json(); }).then(function (l) {
      if (!Array.isArray(l)) { yemekIstendi = false; return; }
      YEMEK = l.map(function (x) { return { i: x[0], a: x[1], s: sade(x[1]) }; });
      var y = anket.querySelector('.tp-al-yuk'); if (y) y.parentNode.removeChild(y);
    }).catch(function () { yemekIstendi = false; });
  }
  function yemekAra(q, tip) {
    var k = sade(q).split(' ').filter(Boolean); if (!k.length || !YEMEK) return [];
    var secili = D.aliskanlik[tip].map(function (x) { return x.i; });
    var bulunan = YEMEK.filter(function (y) { return secili.indexOf(y.i) < 0 && k.every(function (w) { return y.s.indexOf(w) >= 0; }); });
    // Once aranan kelimeleri tam kelime olarak iceren ("peynir" icin "beyaz peynir", "peynirli" degil), sonra adla baslayan, sonra kisa ad
    var tam = function (y) { return k.every(function (w) { return (' ' + y.s + ' ').indexOf(' ' + w + ' ') >= 0; }) ? 1 : 0; };
    bulunan.sort(function (a, b) { return tam(b) - tam(a) || (b.s.indexOf(k[0]) === 0) - (a.s.indexOf(k[0]) === 0) || a.s.length - b.s.length; });
    return bulunan.slice(0, 6);
  }
  function aliskanlikCiz() {
    yemekYukle();
    return AL_OGUN.map(function (o) {
      var tip = o[0], sec = D.aliskanlik[tip], atla = tip === 'kahvalti' && D.kahvalti === 'atla';
      return '<div class="tp-al"><h3>' + o[1] + '</h3>' +
        (sec.length ? '<div class="tp-cips">' + sec.map(function (x) { return '<button type="button" class="on" data-cikar="' + tip + ':' + x.i + '">' + esc(x.a) + ' ×</button>'; }).join('') + '</div>' : '') +
        (sec.length < 3 && !atla ? '<div class="tp-alan"><input type="search" data-ara="' + tip + '" placeholder="' + A.ara + '" autocomplete="off" enterkeyhint="search"></div><div class="tp-al-son" data-sonuc="' + tip + '"></div>' : '') +
        (tip === 'kahvalti' && !sec.length ? '<div class="tp-cips"><button type="button" data-atla class="' + (atla ? 'on' : '') + '">' + A.atla + '</button></div>' : '') + '</div>';
    }).join('') + '<p class="tp-acik">' + (YEMEK ? '' : '<span class="tp-al-yuk">' + A.yukleniyor + ' </span>') + A.bos + '</p>';
  }
  function aliskanlikGonder() {
    var o = {};
    AL_OGUN.forEach(function (x) { if (D.aliskanlik[x[0]].length) o[x[0]] = D.aliskanlik[x[0]].map(function (y) { return y.i; }); });
    return o;
  }
  anket.addEventListener('input', function (e) {
    var tip = e.target.dataset && e.target.dataset.ara; if (!tip) return;
    var kutu = anket.querySelector('[data-sonuc="' + tip + '"]'); if (!kutu) return;
    var l = yemekAra(e.target.value, tip);
    kutu.innerHTML = l.length ? l.map(function (y) { return '<button type="button" data-ekle="' + tip + ':' + y.i + '">' + esc(y.a) + '</button>'; }).join('')
      : (YEMEK && sade(e.target.value).length >= 2 ? '<p class="tp-acik">' + A.yok + '</p>' : '');
  });

  var ADIMLAR = [
    { k: 'hedef', soru: "What's your goal?", ciz: function () {
      return secenek('hedef', 'ver', 'Lose weight', 'A steady deficit with high protein') + secenek('hedef', 'saglik', 'Eat healthier', 'Same weight, better meals') + secenek('hedef', 'kas', 'Build muscle', 'A small surplus with more protein') + secenek('hedef', 'igne', 'I\u2019m on a weight-loss shot', 'Ozempic, Wegovy, Mounjaro: small meals, protein first');
    } },
    { k: 'cinsiyet', soru: 'Your sex', acik: 'Used for your calorie estimate.', ciz: function () {
      return secenek('cinsiyet', 'kadin', 'Female') + secenek('cinsiyet', 'erkek', 'Male');
    } },
    { k: 'yas', soru: 'How old are you?', giris: true, ciz: function () {
      return '<div class="tp-alan"><input id="f-yas" type="number" inputmode="numeric" min="10" max="100" placeholder="34" value="' + (D.yas || '') + '"><span>years</span></div>';
    }, al: function () {
      var y = Number($('#f-yas').value);
      if (!(y >= 10 && y <= 100)) return 'Enter your age in years.';
      D.yas = y; return null;
    } },
    { k: 'saglik', soru: 'Does any of this apply to you?', acik: "We'll check this before building anything. Your answer isn't stored.", ciz: function () {
      var kronik = D.hedef === 'igne' ? secenek('saglik', 'kronik', 'Another condition or medication', 'Besides the shot: for example diabetes, kidney or heart disease') : secenek('saglik', 'kronik', 'A chronic condition or regular medication', 'For example diabetes, kidney or heart disease');
      return secenek('saglik', 'hamile', 'Pregnant or breastfeeding') + kronik + secenek('saglik', 'yeme', 'An eating disorder, now or in the past') + secenek('saglik', 'yok', 'None of these');
    } },
    { k: 'boy', soru: 'How tall are you?', giris: true, ciz: function () {
      var b = birimSec();
      if (D.birim === 'imperial') {
        var ft = D.boy ? Math.floor(D.boy / 30.48) : '', inc = D.boy ? Math.round((D.boy / 2.54) - ft * 12) : '';
        return b + '<div class="tp-alan"><input id="f-ft" type="number" inputmode="numeric" min="4" max="7" placeholder="5" value="' + ft + '"><span>ft</span><input id="f-in" type="number" inputmode="numeric" min="0" max="11" placeholder="10" value="' + inc + '"><span>in</span></div>';
      }
      return b + '<div class="tp-alan"><input id="f-cm" type="number" inputmode="numeric" min="120" max="230" placeholder="178" value="' + (D.boy || '') + '"><span>cm</span></div>';
    }, al: function () {
      var cm;
      if (D.birim === 'imperial') cm = (Number($('#f-ft').value) * 12 + Number($('#f-in').value || 0)) * 2.54;
      else cm = Number($('#f-cm').value);
      if (!(cm >= 120 && cm <= 230)) return 'Enter a height between 4 ft and 7 ft 6 in (120 to 230 cm).';
      D.boy = Math.round(cm); return null;
    } },
    { k: 'kilo', soru: 'How much do you weigh?', giris: true, ciz: function () {
      var b = birimSec();
      if (D.birim === 'imperial') return b + '<div class="tp-alan"><input id="f-lb" type="number" inputmode="decimal" min="66" max="660" placeholder="190" value="' + (D.kilo ? Math.round(D.kilo / 0.4536) : '') + '"><span>lb</span></div>';
      return b + '<div class="tp-alan"><input id="f-kg" type="number" inputmode="decimal" min="30" max="300" placeholder="86" value="' + (D.kilo || '') + '"><span>kg</span></div>';
    }, al: function () {
      var kg = D.birim === 'imperial' ? Number($('#f-lb').value) * 0.4536 : Number($('#f-kg').value);
      if (!(kg >= 30 && kg <= 300)) return 'Enter a weight between 66 and 660 lb (30 to 300 kg).';
      D.kilo = Math.round(kg * 10) / 10; return null;
    } },
    { k: 'aktivite', soru: 'How active is a normal week?', ciz: function () {
      return secenek('aktivite', 'hareketsiz', 'Mostly sitting', 'Desk job, little exercise') + secenek('aktivite', 'hafif', 'Lightly active', 'Walks, exercise 1 to 3 days') + secenek('aktivite', 'orta', 'Active', 'Exercise 3 to 5 days') + secenek('aktivite', 'yuksek', 'Very active', 'Hard training or a physical job');
    } },
    { k: 'saat', soru: 'When do you usually wake up and go to bed?', acik: 'Meal times are built around this.', giris: true, ciz: function () {
      return '<div class="tp-alan"><span>Wake</span><input id="f-kalkis" type="time" value="' + D.kalkis + '"></div><div class="tp-alan"><span>Bed</span><input id="f-yatis" type="time" value="' + D.yatis + '"></div>';
    }, al: function () {
      var k = $('#f-kalkis').value, y = $('#f-yatis').value;
      if (!/^\d\d:\d\d$/.test(k) || !/^\d\d:\d\d$/.test(y)) return 'Enter both times.';
      D.kalkis = k; D.yatis = y; return null;
    } },
    { k: 'diyet', soru: 'Any diet or allergies?', giris: true, ciz: function () {
      var d = D.diyet || 'yok';
      var cips = [['gluten', 'Gluten'], ['sut', 'Dairy'], ['yumurta', 'Eggs'], ['balik', 'Fish and seafood'], ['kuruyemis', 'Nuts'], ['soya', 'Soy'], ['baklagil', 'Beans and lentils']];
      return '<div class="tp-cips" data-tek="diyet">' + [['yok', 'No restriction'], ['vejetaryen', 'Vegetarian'], ['vegan', 'Vegan']].map(function (x) { return '<button type="button" data-v="' + x[0] + '" class="' + (d === x[0] ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>' +
        '<p class="tp-acik">Leave out</p><div class="tp-cips" data-cok="alerjen">' + cips.map(function (x) { return '<button type="button" data-v="' + x[0] + '" class="' + (D.alerjen.indexOf(x[0]) >= 0 ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>';
    }, al: function () { return null; } },
    { k: 'aliskanlik', soru: A.soru, acik: A.acik, giris: true, odakYok: true, ciz: function () { return aliskanlikCiz(); }, al: function () {
      izle('tp_aliskanlik', { ogun: Object.keys(aliskanlikGonder()).length });
      return null;
    } },
    { k: 'email', soru: 'Where should we send your plan?', giris: true, son: true, ciz: function () {
      return '<div class="tp-alan"><input id="f-email" type="email" autocomplete="email" placeholder="you@example.com" value="' + esc(D.email || '') + '"></div>' +
        '<label class="tp-onay"><input id="f-onay" type="checkbox"' + (D.onay ? ' checked' : '') + '><span>I agree that PlateRank uses my answers, including height and weight, to build my plan. <a href="/en/privacy" target="_blank">Privacy policy</a></span></label>';
    }, al: function () {
      var e = $('#f-email').value.trim();
      D.email = e; D.onay = $('#f-onay').checked; // hata gosterilip yeniden cizilince yazilan kaybolmasin
      if (!/^[^@\s"]+@[^@\s"]+\.[^@\s"]+$/.test(e)) return 'Enter a valid email.';
      if (!D.onay) return 'Tick the box to continue.';
      return null;
    } },
  ];

  function anketCiz(hata) {
    var a = ADIMLAR[adim];
    var oran = Math.round((adim / ADIMLAR.length) * 100);
    anket.innerHTML = '<div class="tp-ust"><button type="button" data-geri>' + (adim ? '‹ Back' : '‹ Home') + '</button><span>Step ' + (adim + 1) + ' of ' + ADIMLAR.length + '</span></div>' +
      '<div class="tp-ilerle"><i style="width:' + oran + '%"></i></div>' +
      '<h2 class="tp-soru">' + esc(a.soru) + '</h2>' + (a.acik ? '<p class="tp-acik">' + esc(a.acik) + '</p>' : '') +
      a.ciz() + '<div class="tp-hata" role="alert">' + (hata ? esc(hata) : '') + '</div>' +
      (a.giris ? '<button type="button" class="tp-cta" data-ileri>' + (a.son ? 'See my targets' : 'Continue') + '</button>' : '');
    var ilk = anket.querySelector('input');
    if (ilk && a.giris && !a.odakYok) ilk.focus();
  }

  function ileri() {
    var a = ADIMLAR[adim];
    if (a.al) { var h = a.al(); if (h) return anketCiz(h); }
    if (a.k === 'saglik' && D.saglik && D.saglik !== 'yok') return engelGoster('doktor');
    if (a.k === 'yas' && D.yas < 18) return engelGoster('yas');
    izle('tp_adim', { adim: a.k });
    if (a.son) return gonder();
    adim++; anketCiz();
  }

  anket.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.hasAttribute('data-geri')) { if (adim === 0) goster(giris); else { adim--; anketCiz(); } return; }
    if (t.hasAttribute('data-ileri')) return ileri();
    if (t.dataset.birim) {
      var a = ADIMLAR[adim]; if (a.al) a.al(); // girileni kaybetme
      D.birim = t.dataset.birim; return anketCiz();
    }
    if (t.dataset.ekle) {
      var ek = t.dataset.ekle.split(':'), bulunan = (YEMEK || []).filter(function (x) { return x.i === ek[1]; })[0];
      if (bulunan && D.aliskanlik[ek[0]].length < 3) { D.aliskanlik[ek[0]].push({ i: bulunan.i, a: bulunan.a }); if (ek[0] === 'kahvalti') D.kahvalti = null; }
      anketCiz();
      var sonraki = anket.querySelector('[data-ara="' + ek[0] + '"]'); if (sonraki) sonraki.focus();
      return;
    }
    if (t.dataset.cikar) {
      var ck = t.dataset.cikar.split(':');
      D.aliskanlik[ck[0]] = D.aliskanlik[ck[0]].filter(function (x) { return x.i !== ck[1]; });
      return anketCiz();
    }
    if (t.hasAttribute('data-atla')) { D.kahvalti = D.kahvalti === 'atla' ? null : 'atla'; return anketCiz(); }
    var tek = t.parentElement.dataset.tek, cok = t.parentElement.dataset.cok;
    if (tek) { D[tek] = t.dataset.v === 'yok' ? null : t.dataset.v; return anketCiz(); }
    if (cok) { var i = D[cok].indexOf(t.dataset.v); if (i >= 0) D[cok].splice(i, 1); else D[cok].push(t.dataset.v); return anketCiz(); }
    if (t.dataset.k) { D[t.dataset.k] = t.dataset.v; setTimeout(ileri, 120); anketCiz(); }
  });
  anket.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
    e.preventDefault();
    // Yemek aramasinda Enter ilk sonucu secer, adimi gecmez
    if (e.target.dataset.ara) { var ilkSonuc = anket.querySelector('[data-sonuc="' + e.target.dataset.ara + '"] [data-ekle]'); if (ilkSonuc) ilkSonuc.click(); return; }
    ileri();
  });

  function engelGoster(tur) {
    var m = {
      yas: ['This plan is for adults', "Growing bodies need more than a calorie target can capture. A doctor or school nurse can help you plan meals that fit you."],
      doktor: ['Talk to your doctor first', "With what you selected, a generic calorie and protein target could do more harm than good. A doctor or registered dietitian can set targets that fit your situation."],
      zayif: ['Weight loss isn\u2019t a good fit right now', 'Your weight is already below the healthy range for your height. Try "Eat healthier" instead, or talk to a doctor.'],
    }[tur];
    sonuc.innerHTML = '<div class="tp-kutu"><h2>' + esc(m[0]) + '</h2><p>' + esc(m[1]) + '</p><a class="tp-cta" href="/en">Browse foods by fullness</a></div>';
    izle('tp_engel', { tur: tur });
    goster(sonuc);
  }

  // ---------- sonuc ve odeme ----------
  var gonderiliyor = false;
  function gonder() {
    if (gonderiliyor) return; gonderiliyor = true;
    var btn = anket.querySelector('[data-ileri]'); if (btn) { btn.disabled = true; btn.textContent = 'Building your plan…'; }
    var g = { dil: 'en', birim: D.birim, hedef: D.hedef, cinsiyet: D.cinsiyet, yas: D.yas, boy: D.boy, kilo: D.kilo, aktivite: D.aktivite, kalkis: D.kalkis, yatis: D.yatis, diyet: D.diyet || null, alerjen: D.alerjen, kahvalti: D.kahvalti || null, aliskanlik: aliskanlikGonder(), email: D.email, onay: true };
    fetch('/api/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(g) })
      .then(function (r) { return r.json(); })
      .then(function (s) {
        gonderiliyor = false;
        if (s.engel) return engelGoster(s.engel);
        if (!s.plan_id) return anketCiz("Something went wrong. Try again in a moment.");
        sakla('pr_plan_son', s.plan_id);
        history.replaceState(null, '', '/en/plan?id=' + s.plan_id);
        izle('tp_sonuc');
        sonucCiz(s.plan_id, s);
      })
      .catch(function () { gonderiliyor = false; anketCiz("Couldn't reach the server. Check your connection and try again."); });
  }

  var OGUN = { kahvalti: 'Breakfast', ogle: 'Lunch', aksam: 'Dinner', ara: 'Snack', ara1: 'Snack', ara2: 'Snack' };
  var TIPIK_AD = { tost_recel: 'toast and jam', gevrek: 'cereal', yumurta_tost: 'eggs and toast', bagel: 'bagel', hamur: 'pastry', yulaf: 'oatmeal', kahve: 'coffee', simit: 'simit', serpme: 'breakfast spread' };
  function dk(s) { var p = s.split(':'); return Number(p[0]) * 60 + Number(p[1]); }
  function ekle(s, saat) { var t = (dk(s) + Math.round(saat * 60)) % 1440; t = Math.round(t / 15) * 15 % 1440; return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); }
  function saat12(s) { if (!s) return ''; var h = Number(s.slice(0, 2)), m = s.slice(3); var ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return h + (m === '00' ? '' : ':' + m) + ' ' + ap; }
  function saatYaz(x) { return (Math.round(x * 2) / 2).toString(); }

  // Gunluk zaman cizelgesi: tipik kahvalti satiri (varsa) + plan satiri. Uyanik saatler 0-100% olcekli.
  function zamanCiz(on) {
    if (!on || !on.ogunler || !on.ogunler.length) return '';
    var bas = dk(D.kalkis || '07:00'), son = dk(D.yatis || '23:00'); if (son <= bas) son += 1440;
    var olc = function (t) { var x = dk(t); if (x < bas - 60) x += 1440; return Math.max(0, Math.min(100, (x - bas) / (son - bas) * 100)); };
    var plan = '', tipik = '';
    on.ogunler.forEach(function (o, i) {
      if (!o.saat || !o.tokBitis) return;
      var a = olc(o.saat), b = olc(o.tokBitis); if (b < a) b = 100;
      plan += '<i class="tok" style="left:' + a + '%;width:' + Math.max(1, b - a) + '%"></i>';
      if (o.acDk > 0) { var c = Math.min(100, b + o.acDk / (son - bas) * 100); plan += '<i class="ac" style="left:' + b + '%;width:' + (c - b) + '%"></i>'; }
    });
    var k = on.kahvalti, ilk = on.ogunler[0], ikinci = on.ogunler[1];
    // Kullanici ne yedigini sectiyse: kendi ogunlerinin tok kaldigi sure, plandaki bir sonraki ogun saatine kadar ac
    var kendiGun = on.ogunler.some(function (o) { return o.tipikSaat != null; });
    if (kendiGun) {
      on.ogunler.forEach(function (o, i) {
        if (o.tipikSaat == null || !o.saat) return;
        var a = olc(o.saat), sinir = on.ogunler[i + 1] && on.ogunler[i + 1].saat ? olc(on.ogunler[i + 1].saat) : 100;
        var b = o.tipikSaat ? olc(ekle(o.saat, o.tipikSaat)) : a; if (b < a || b > sinir) b = sinir;
        if (b > a) tipik += '<i class="tipik" style="left:' + a + '%;width:' + (b - a) + '%"></i>';
        if (sinir > b) tipik += '<i class="ac" style="left:' + b + '%;width:' + (sinir - b) + '%"></i>';
      });
    } else if (k && k.tipik && ikinci) {
      var a = olc(ilk.saat), ogle = olc(ikinci.saat);
      var b = k.tipikSaat ? olc(ekle(ilk.saat, k.tipikSaat)) : a;
      if (b > a) tipik += '<i class="tipik" style="left:' + a + '%;width:' + (b - a) + '%"></i>';
      if (ogle > b) tipik += '<i class="ac" style="left:' + b + '%;width:' + (ogle - b) + '%"></i>';
    }
    return '<div class="tp-zaman">' +
      (tipik ? '<div class="sat">' + (kendiGun ? '<span>' + M.tipikGun + '</span>' : '<span>Your usual morning</span>') + '<div class="ray">' + tipik + '</div></div>' : '') +
      '<div class="sat"><span>Your plan</span><div class="ray">' + plan + '</div></div>' +
      '<div class="tp-eksen"><span>' + saat12(D.kalkis || '07:00') + '</span><span>' + saat12(D.yatis || '23:00') + '</span></div>' +
      '<p class="tp-not" style="text-align:left"><span style="display:inline-block;width:10px;height:10px;background:#2F8F5B;border-radius:2px"></span> full &nbsp; <span style="display:inline-block;width:10px;height:10px;background:#E9A79F;border-radius:2px"></span> hungry</p></div>';
  }

  function baslikCumlesi(on) {
    var k = on && on.kahvalti, ilk = on && on.ogunler && on.ogunler[0], ikinci = on && on.ogunler && on.ogunler[1];
    if (!k || !k.tipik || !ilk || !ikinci || k.planSaat == null) return 'Your plan is ready';
    var ogle = saat12(ikinci.saat);
    if (k.tipik === 'atla') return 'Skipping breakfast leaves a long gap. This one carries you to ' + ogle + '.';
    var bitis = saat12(ekle(ilk.saat, k.tipikSaat || 0));
    if (k.tipikSaat >= k.planSaat) return 'Your breakfast already holds up well. Here\u2019s the rest of your day.';
    if (k.tipik === 'kendi') return M.kendiBaslik(bitis, ogle);
    return 'Your ' + (TIPIK_AD[k.tipik] || 'breakfast') + ' runs out around ' + bitis + '. Ours lasts until ' + ogle + '.';
  }

  // Zayiflama ignesi (GLP-1) kullananlar icin: ACLM/ASN/OMA/TOS ortak tavsiyesi, 2025
  function igneNotu() {
    return '<ul class="tp-igne">' +
      '<li><b>Eat the protein first.</b> Appetite runs out fast on the shot; the protein on the plate is what protects your muscle.</li>' +
      '<li><b>Keep meals small and not greasy.</b> Big or fatty meals make nausea worse. That\u2019s why your day has 5 small meals.</li>' +
      '<li><b>Don\u2019t go too low.</b> Under about 1,200 kcal (women) or 1,800 kcal (men) a day, vitamin and mineral gaps get likely. Even with no appetite, try to reach your targets.</li>' +
      '<li><b>Drink through the day</b> and add fiber slowly; constipation is common.</li>' +
      '<li><b>Lift something 3 times a week.</b> Protein alone doesn\u2019t keep muscle; strength training does the rest.</li>' +
      '</ul><p class="tp-not" style="text-align:left">If the doctor who prescribed your shot gave you different targets, follow theirs.</p>';
  }

  function sonucCiz(id, s) {
    var on = s.onizleme;
    var ogunler = on && on.ogunler ? on.ogunler : [];
    var igne = !!s.igne;
    var liste = ogunler.map(function (o) {
      return '<div class="tp-ogun"><div class="saat">' + saat12(o.saat) + '</div><div><div class="tp-parca"><span class="bos"></span><div class="ad">' + (OGUN[o.ogun] || 'Meal') + ' · Chosen dish<small>' + o.kcal + ' kcal · ' + o.protein + ' g protein</small></div></div></div></div>';
    }).join('');
    sonuc.innerHTML = '<div class="tp-kutu">' +
      '<p class="tp-acik" style="margin:0">Your daily targets</p>' +
      '<h2 class="tp-soru" style="margin-top:4px">' + esc(igne ? 'Small meals every 3 to 4 hours, protein first' : baslikCumlesi(on)) + '</h2>' +
      (igne ? igneNotu() : zamanCiz(on)) +
      '<div class="tp-hedefler"><div><b>' + s.gunluk.kcal.toLocaleString('en-US') + '</b><span>kcal a day</span></div><div><b>' + s.gunluk.protein + ' g</b><span>protein</span></div><div><b>' + s.ogunSayisi + '</b><span>meals</span></div></div>' +
      '<p class="tp-acik">Fat ' + s.gunluk.yag + ' g · Carbs ' + s.gunluk.karbonhidrat + ' g · Fiber ' + s.gunluk.lif + ' g</p>' +
      '<div class="tp-kilit"><div class="bulanik">' + liste + '</div><div class="ust">7-day plan, meal by meal</div></div>' +
      '<button type="button" class="tp-cta" data-ode="' + id + '" data-donem="ay">Unlock my plan · $5/month</button>' +
      (s.yillik ? '<button type="button" class="tp-cta tp-cta-yil" data-ode="' + id + '" data-donem="yil">Yearly · $30 <small>($2.50/month)</small></button>' : '') +
      '<p class="tp-not">Cancel anytime · Refund within 14 days · Secure checkout by Polar</p>' +
      '<div class="tp-hata" role="alert"></div></div>';
    goster(sonuc);
  }

  sonuc.addEventListener('click', function (e) {
    var t = e.target.closest('[data-ode]'); if (!t) return;
    var donem = t.dataset.donem === 'yil' ? 'yil' : 'ay';
    var etiket = t.innerHTML;
    t.disabled = true; t.textContent = 'Opening checkout…';
    izle('tp_odeme', { donem: donem });
    fetch('/api/plan?islem=odeme', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan_id: t.dataset.ode, donem: donem }) })
      .then(function (r) { return r.json(); })
      .then(function (s) {
        if (s.url) { location.href = s.url; return; }
        t.disabled = false; t.innerHTML = etiket;
        $('.tp-hata', sonuc).textContent = s.hata === 'odeme_kapali' ? 'Checkout opens soon. Your targets are saved to this link.' : 'Couldn\u2019t open checkout. Try again.';
      })
      .catch(function () { t.disabled = false; t.innerHTML = etiket; $('.tp-hata', sonuc).textContent = 'Couldn\u2019t reach the server. Try again.'; });
  });

  // ---------- plan gorunumu ----------
  // Plan ici tarif, "bir pisir iki ye" etiketleri ve alisveris listesi metinleri tek tabloda durur;
  // Turkce sayfa (api/_tokplan_tr.js) bu satirlari tek tek cevirir.
  var M = {
    tabListe: 'Shopping list',
    tarifAc: 'How to make it',
    tarifKapat: 'Hide recipe',
    tarifSure: 'min',
    tarifOlcu: 'Makes',
    neLazim: 'What you need',
    nasil: 'Steps',
    artanEtiket: 'Leftovers from last night',
    ciftEtiket: 'Cook double: lunch tomorrow is the same dish',
    artanAyar: 'Cook once, eat twice',
    artanAcik: 'On',
    artanKapali: 'Off',
    artanNot: 'A dinner you cook comes back as lunch the next day when it fits your targets.',
    listeBaslik: 'Your shopping list',
    listeNot: 'Built from the meals picked for this week. Swap a meal and the list follows.',
    pisir: 'To cook',
    diger: 'Everything else',
    digerNot: 'Buy it ready, or cook it your own way.',
    buHafta: 'this week',
    birKat: 'One batch of the recipe covers it.',
    olcuNot: 'Amounts are for one batch.',
    kopyala: 'Copy list',
    kopyalandi: 'Copied',
    gunYaz: function (a) { return (a.length > 1 ? 'Days ' : 'Day ') + a.join(', '); },
    porsiyonYaz: function (k) { return k + (k === '1' ? ' serving' : ' servings'); },
    yumurtaYaz: function (n) { return n + (n === 1 ? ' egg' : ' eggs'); },
    tipikGun: 'Your usual day',
    kendiEtiket: 'Your usual, tuned to your targets',
    eksikEtiket: 'Your usual: short of your protein target',
    oneriEtiket: 'Suggestion',
    oneriFark: function (s) { return 'Suggestion: full about ' + s + ' h longer'; },
    kendiBaslik: function (a, b) { return 'Your usual breakfast runs out around ' + a + '. Tuned to your targets, it lasts until ' + b + '.'; },
    kismi: function (k) { return 'About ' + k + ' of the recipe is enough.'; },
    carp: function (k) { return 'Multiply the amounts by ' + k + '.'; }
  };

  var KESIR = { 0.5: '½', 0.75: '¾', 1.25: '1¼', 1.5: '1½' };
  function porsiyon(p) {
    if (p.adet) return p.kat + (p.kat === 1 ? ' egg' : ' eggs');
    if (p.kat === 1) return p.porsiyon || '1 serving';
    var k = KESIR[p.kat] || String(p.kat);
    return p.porsiyon ? k + ' × ' + p.porsiyon : k + ' servings';
  }
  // 2.25 -> "2¼": haftalik toplam porsiyon
  function ceyrek(x) {
    var tam = Math.floor(x + 1e-9), k = Math.round((x - tam) * 4);
    if (k === 4) { tam++; k = 0; }
    return ((tam ? String(tam) : '') + ['', '¼', '½', '¾'][k]) || '0';
  }

  var P = null, planId = null, gun = 0, secili = {}, isaret = {}, acikTarif = {};
  // Secilen alternatifler ve listede isaretlenenler bu cihazda, plan ve hafta basina saklanir
  function depo(on) { return on + planId + '_' + (P.hafta || 0); }
  function durumOku() {
    secili = {}; isaret = {}; acikTarif = {};
    try { secili = JSON.parse(oku(depo('pr_sec_')) || '{}') || {}; isaret = JSON.parse(oku(depo('pr_liste_')) || '{}') || {}; } catch (e) { secili = {}; isaret = {}; }
  }
  function durumYaz() { sakla(depo('pr_sec_'), JSON.stringify(secili)); sakla(depo('pr_liste_'), JSON.stringify(isaret)); }

  function secenekleri(o) { return [o.secim].concat(o.alternatifler || []).filter(Boolean); }
  // Ogunde gosterilen secenegin sirasi. Dunku aksam yemegi degistirildiyse ondan kalan ogle de ilk alternatife gecer.
  function sira(g, i) {
    var gg = P.gunler[g], o = gg && gg.ogunler[i]; if (!o) return 0;
    var n = secenekleri(o).length; if (!n) return 0;
    var k = secili[g + ':' + i];
    if (typeof k === 'number' && k >= 0) return k % n;
    if (o.artan && n > 1 && sira(o.artan.gun, o.artan.ogun) !== 0) return 1;
    return 0;
  }
  function artanMi(g, i) { var o = P.gunler[g].ogunler[i]; return !!(o.artan && sira(g, i) === 0 && sira(o.artan.gun, o.artan.ogun) === 0); }
  function ciftMi(g, i) { var o = P.gunler[g].ogunler[i]; return !!(o.cift && sira(g, i) === 0 && sira(o.cift.gun, o.cift.ogun) === 0); }

  function tarifCiz(t) {
    return '<div class="tp-tarif"><p class="tm">' + (t.sure ? '⏲ ' + t.sure + ' ' + M.tarifSure + ' · ' : '') + M.tarifOlcu + ' ' + esc(t.kisi || '') + '</p>' +
      '<h4>' + M.neLazim + '</h4><ul>' + t.malzemeler.map(function (m) { return '<li><span>' + esc(m.ad) + '</span><span>' + esc(m.miktar || '') + '</span></li>'; }).join('') + '</ul>' +
      '<h4>' + M.nasil + '</h4><ol>' + t.adimlar.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ol></div>';
  }
  function parcaCiz(p, anahtar) {
    var img = p.gorsel ? '<img src="/img/yemek/k/' + esc(p.slug) + '.webp" alt="" width="56" height="42" loading="lazy">' : '<span class="bos"></span>';
    var t = P.tarifler ? P.tarifler[p.id] : null, acik = !!(t && acikTarif[anahtar]);
    return '<div class="tp-parca">' + img + '<div class="ad">' + esc(p.ad) + '<small>' + esc(porsiyon(p)) + ' · ' + p.kcal + ' kcal · ' + p.protein + ' g protein</small>' +
      (t ? '<button type="button" class="tp-tarif-ac" data-tarif="' + anahtar + '" aria-expanded="' + acik + '">' + (acik ? M.tarifKapat : M.tarifAc) + '</button>' : '') + '</div></div>' +
      (acik ? tarifCiz(t) : '');
  }

  // ---------- alisveris listesi: o an secili ogunlerden ----------
  function listeTopla() {
    var harita = {}, dizi = [];
    P.gunler.forEach(function (g, gi) {
      g.ogunler.forEach(function (o, oi) {
        var s = secenekleri(o)[sira(gi, oi)]; if (!s) return;
        s.parcalar.forEach(function (p) {
          var k = harita[p.id];
          if (!k) { k = harita[p.id] = { p: p, kat: 0, gunler: [] }; dizi.push(k); }
          k.kat += p.kat;
          if (k.gunler.indexOf(gi + 1) < 0) k.gunler.push(gi + 1);
        });
      });
    });
    var T = P.tarifler || {};
    return {
      pisen: dizi.filter(function (k) { return T[k.p.id]; }).map(function (k) {
        // Tarif kac porsiyon cikariyor, haftada kac porsiyon lazim: oran ceyrege yukari yuvarlanir.
        // 4 kisilik tariften 1 porsiyon lazimsa "¼ kadari yeter", 6 lazimsa "1½ ile carp". Porsiyonu bilinmeyen tarifte sadece not.
        var t = T[k.p.id], cikan = t.porsiyon || 0, oran = cikan ? Math.ceil(k.kat / cikan * 4 - 1e-9) / 4 : 0, ipucu;
        if (!cikan) ipucu = M.olcuNot;
        else if (oran < 1) ipucu = M.kismi(ceyrek(oran));
        else if (oran === 1) ipucu = M.birKat;
        else ipucu = M.carp(ceyrek(oran));
        k.t = t;
        k.not = M.tarifOlcu + ' ' + (t.kisi || '') + '. ' + ipucu;
        return k;
      }),
      kalan: dizi.filter(function (k) { return !T[k.p.id]; })
    };
  }
  function miktarYaz(k) {
    if (k.p.adet) return M.yumurtaYaz(k.kat);
    if (k.p.porsiyon) return ceyrek(k.kat) + ' × ' + k.p.porsiyon;
    return M.porsiyonYaz(ceyrek(k.kat));
  }
  function listeCiz() {
    var L = listeTopla();
    var kutu = function (a) { return '<input type="checkbox" data-isaret="' + a + '"' + (isaret[a] ? ' checked' : '') + '>'; };
    var h = '<h3 class="tp-lb">' + M.listeBaslik + '</h3><p class="tp-acik">' + M.listeNot + '</p>';
    if (L.pisen.length) h += '<h4 class="tp-lg">' + M.pisir + '</h4>' + L.pisen.map(function (k) {
      var id = k.p.id.slice(0, 8);
      return '<div class="tp-ly"><b>' + esc(k.p.ad) + '</b><small>' + esc(miktarYaz(k)) + ' ' + M.buHafta + ' · ' + M.gunYaz(k.gunler) + '</small><small>' + esc(k.not) + '</small>' +
        k.t.malzemeler.map(function (m, i) { var a = 'm:' + id + ':' + i; return '<label class="tp-lm">' + kutu(a) + '<span>' + esc(m.ad) + '</span><span>' + esc(m.miktar || '') + '</span></label>'; }).join('') + '</div>';
    }).join('');
    if (L.kalan.length) h += '<h4 class="tp-lg">' + M.diger + '</h4><p class="tp-acik">' + M.digerNot + '</p><div class="tp-ly">' + L.kalan.map(function (k) {
      var a = 'd:' + k.p.id.slice(0, 8);
      return '<label class="tp-lm">' + kutu(a) + '<span>' + esc(k.p.ad) + '<small>' + M.gunYaz(k.gunler) + '</small></span><span>' + esc(miktarYaz(k)) + '</span></label>';
    }).join('') + '</div>';
    return h + '<button type="button" class="tp-kopya" data-kopyala>' + M.kopyala + '</button>';
  }
  function listeMetin() {
    var L = listeTopla(), s = [M.listeBaslik + ' · PlateRank', ''];
    if (L.pisen.length) {
      s.push(M.pisir + ':');
      L.pisen.forEach(function (k) {
        s.push(k.p.ad + ' (' + miktarYaz(k) + ' ' + M.buHafta + ', ' + M.gunYaz(k.gunler) + ')');
        s.push('  ' + k.not);
        k.t.malzemeler.forEach(function (m) { s.push('  - ' + m.ad + (m.miktar ? ': ' + m.miktar : '')); });
        s.push('');
      });
    }
    if (L.kalan.length) {
      s.push(M.diger + ':');
      L.kalan.forEach(function (k) { s.push('- ' + k.p.ad + ': ' + miktarYaz(k)); });
    }
    return s.join('\n').trim() + '\n';
  }
  function kopyala(btn) {
    var metin = listeMetin(), tamam = function () { btn.textContent = M.kopyalandi; setTimeout(function () { btn.textContent = M.kopyala; }, 1800); };
    var eski = function () {
      var ta = document.createElement('textarea'); ta.value = metin; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); tamam(); } catch (e) {}
      document.body.removeChild(ta);
    };
    izle('tp_liste_kopya');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(metin).then(tamam, eski); else eski();
  }

  function ayarCiz() {
    if (P.artan === undefined) return '';
    return '<div class="tp-ayar"><div><b>' + M.artanAyar + '</b><small>' + M.artanNot + '</small></div>' +
      '<div class="tp-birim" role="group" aria-label="' + M.artanAyar + '"><button type="button" data-artan="1" class="' + (P.artan ? 'on' : '') + '">' + M.artanAcik + '</button><button type="button" data-artan="0" class="' + (P.artan ? '' : 'on') + '">' + M.artanKapali + '</button></div></div>';
  }

  function planCiz() {
    var sekme = '<button type="button" data-gun="liste" class="' + (gun === 'liste' ? 'on' : '') + '">' + M.tabListe + '</button>' +
      P.gunler.map(function (x, i) { return '<button type="button" data-gun="' + i + '" class="' + (i === gun ? 'on' : '') + '">Day ' + (i + 1) + '</button>'; }).join('');
    var ic;
    if (gun === 'liste') ic = listeCiz();
    else {
      var g = P.gunler[gun], top = { kcal: 0, protein: 0 };
      ic = g.ogunler.map(function (o, i) {
        var anahtar = gun + ':' + i, sec = sira(gun, i);
        var secenekler = secenekleri(o);
        var s = secenekler[sec];
        if (!s) return '';
        top.kcal += s.toplam.kcal; top.protein += s.toplam.protein;
        var etiket = artanMi(gun, i) ? '<span class="tp-etiket artan">' + M.artanEtiket + '</span>' : ciftMi(gun, i) ? '<span class="tp-etiket cift">' + M.ciftEtiket + '</span>' : '';
        // Kullanicinin kendi tabagi ya da ona gore oneri: oneride kendi tabagina gore kac saat daha tok tuttugu yazar
        var kendiSec = secenekler.filter(function (x) { return x.kendi; })[0];
        if (s.kendi) etiket += '<span class="tp-etiket kendi">' + (s.eksik ? M.eksikEtiket : M.kendiEtiket) + '</span>';
        else if (kendiSec) {
          var fark = s.toplam.tokSaat - kendiSec.toplam.tokSaat;
          etiket += '<span class="tp-etiket oneri">' + (fark >= 0.5 && !P.igne ? M.oneriFark(saatYaz(fark)) : M.oneriEtiket) + '</span>';
        }
        return '<div class="tp-ogun"><div class="saat">' + saat12(o.saat) + '<small>' + (OGUN[o.ogun] || '') + '</small></div><div>' + etiket +
          s.parcalar.map(function (p, pi) { return parcaCiz(p, anahtar + ':' + pi); }).join('') +
          '<div class="alt"><span>' + s.toplam.kcal + ' kcal · ' + s.toplam.protein + ' g protein' + (P.igne ? '' : ' · full ~' + saatYaz(s.toplam.tokSaat) + ' h') + '</span>' +
          (secenekler.length > 1 ? '<button type="button" data-degis="' + anahtar + '">Swap (' + (sec + 1) + '/' + secenekler.length + ')</button>' : '') + '</div></div></div>';
      }).join('');
      ic += '<div class="tp-toplam"><span>Day total</span><span>' + Math.round(top.kcal) + ' kcal · ' + Math.round(top.protein) + ' g protein</span></div>';
    }
    planEl.innerHTML = '<div class="tp-kutu"><p class="tp-acik" style="margin:0">Week ' + ((P.hafta || 0) + 1) + ' · ' + P.gunluk.kcal.toLocaleString('en-US') + ' kcal · ' + P.gunluk.protein + ' g protein a day</p>' +
      '<h2 class="tp-soru" style="margin-top:4px">Your Stay Full Plan</h2>' + (P.igne ? '<p class="tp-acik">Small meals, protein first. Stop when you\u2019re full, but try not to skip a meal.</p>' : '') + '<div class="tp-gunler">' + sekme + '</div>' + ic + ayarCiz() + '</div>' +
      '<p class="tp-not">Bookmark this page to come back to your plan. A new week is built every 7 days.</p>';
    if (planEl.hidden) goster(planEl); // acikken yeniden cizim sayfayi basa sarmasin
  }
  planEl.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t || !P) return;
    if (t.dataset.gun) {
      gun = t.dataset.gun === 'liste' ? 'liste' : Number(t.dataset.gun);
      if (gun === 'liste') izle('tp_liste');
      return planCiz();
    }
    if (t.dataset.degis) {
      var p = t.dataset.degis.split(':'), o = P.gunler[p[0]].ogunler[p[1]];
      secili[t.dataset.degis] = (sira(Number(p[0]), Number(p[1])) + 1) % secenekleri(o).length;
      Object.keys(acikTarif).forEach(function (k) { if (k.indexOf(t.dataset.degis + ':') === 0) delete acikTarif[k]; });
      durumYaz(); return planCiz();
    }
    if (t.dataset.tarif) {
      acikTarif[t.dataset.tarif] = !acikTarif[t.dataset.tarif];
      if (acikTarif[t.dataset.tarif]) izle('tp_tarif');
      return planCiz();
    }
    if (t.dataset.artan) {
      if ((t.dataset.artan === '1') === !!P.artan) return;
      izle('tp_artan', { acik: t.dataset.artan });
      return planYukle(planId, null, t.dataset.artan);
    }
    if (t.hasAttribute('data-kopyala')) return kopyala(t);
  });
  planEl.addEventListener('change', function (e) {
    var a = e.target && e.target.dataset && e.target.dataset.isaret; if (!a || !P) return;
    if (e.target.checked) isaret[a] = 1; else delete isaret[a];
    durumYaz();
  });

  // artan: '0' | '1' verilirse "bir pisir iki ye" ayari degisir ve hafta yeniden kurulur
  function planYukle(id, checkoutId, artan) {
    var h = {}; var a = oku('pr_plan_' + id); if (a) h['x-plan-anahtar'] = a;
    var url = '/api/plan?id=' + encodeURIComponent(id) + (checkoutId ? '&checkout_id=' + encodeURIComponent(checkoutId) : '') + (artan ? '&artan=' + artan : '');
    planEl.innerHTML = '<div class="tp-kutu"><p>Loading your plan…</p></div>'; goster(planEl);
    fetch(url, { headers: h }).then(function (r) { return r.json(); }).then(function (s) {
      if (s.engel) return engelGoster(s.engel);
      if (s.anahtar) sakla('pr_plan_' + id, s.anahtar);
      if (checkoutId) history.replaceState(null, '', '/en/plan?id=' + id);
      if (s.kilitli === false && s.gunler) {
        P = s; planId = id;
        if (artan) { secili = {}; isaret = {}; durumYaz(); } else { gun = 0; izle('tp_plan_acildi'); }
        durumOku();
        return planCiz();
      }
      if (s.gunluk) return sonucCiz(id, s);
      goster(giris);
    }).catch(function () { planEl.innerHTML = '<div class="tp-kutu"><p>Couldn\u2019t load your plan. Refresh to try again.</p></div>'; });
  }

  // ---------- baslangic ----------
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-basla]')) { adim = 0; izle('tp_basla'); anketCiz(); goster(anket); }
  });
  var q = new URLSearchParams(location.search);
  var id = q.get('id');
  if (id && /^[0-9a-f-]{36}$/.test(id)) planYukle(id, q.get('checkout_id'));
})();
