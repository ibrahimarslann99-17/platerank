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

  var ADIMLAR = [
    { k: 'hedef', soru: "What's your goal?", ciz: function () {
      return secenek('hedef', 'ver', 'Lose weight', 'A steady deficit with high protein') + secenek('hedef', 'saglik', 'Eat healthier', 'Same weight, better meals') + secenek('hedef', 'kas', 'Build muscle', 'A small surplus with more protein');
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
      return secenek('saglik', 'hamile', 'Pregnant or breastfeeding') + secenek('saglik', 'kronik', 'A chronic condition or regular medication', 'For example diabetes, kidney or heart disease') + secenek('saglik', 'yeme', 'An eating disorder, now or in the past') + secenek('saglik', 'yok', 'None of these');
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
    { k: 'kahvalti', soru: 'What do you usually eat for breakfast?', acik: "We'll show you how long it really keeps you full.", ciz: function () {
      return secenek('kahvalti', 'tost_recel', 'Toast and jam') + secenek('kahvalti', 'gevrek', 'Cereal with milk') + secenek('kahvalti', 'yumurta_tost', 'Eggs and toast') + secenek('kahvalti', 'bagel', 'Bagel with cream cheese') + secenek('kahvalti', 'hamur', 'Pastry or muffin') + secenek('kahvalti', 'yulaf', 'Oatmeal') + secenek('kahvalti', 'kahve', 'Just coffee') + secenek('kahvalti', 'atla', 'I skip it');
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
    if (ilk && a.giris) ilk.focus();
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
    var tek = t.parentElement.dataset.tek, cok = t.parentElement.dataset.cok;
    if (tek) { D[tek] = t.dataset.v === 'yok' ? null : t.dataset.v; return anketCiz(); }
    if (cok) { var i = D[cok].indexOf(t.dataset.v); if (i >= 0) D[cok].splice(i, 1); else D[cok].push(t.dataset.v); return anketCiz(); }
    if (t.dataset.k) { D[t.dataset.k] = t.dataset.v; setTimeout(ileri, 120); anketCiz(); }
  });
  anket.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); ileri(); } });

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
    var g = { dil: 'en', birim: D.birim, hedef: D.hedef, cinsiyet: D.cinsiyet, yas: D.yas, boy: D.boy, kilo: D.kilo, aktivite: D.aktivite, kalkis: D.kalkis, yatis: D.yatis, diyet: D.diyet || null, alerjen: D.alerjen, kahvalti: D.kahvalti, email: D.email, onay: true };
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
    if (k && k.tipik && ikinci) {
      var a = olc(ilk.saat), ogle = olc(ikinci.saat);
      var b = k.tipikSaat ? olc(ekle(ilk.saat, k.tipikSaat)) : a;
      if (b > a) tipik += '<i class="tipik" style="left:' + a + '%;width:' + (b - a) + '%"></i>';
      if (ogle > b) tipik += '<i class="ac" style="left:' + b + '%;width:' + (ogle - b) + '%"></i>';
    }
    return '<div class="tp-zaman">' +
      (tipik ? '<div class="sat"><span>Your usual morning</span><div class="ray">' + tipik + '</div></div>' : '') +
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
    return 'Your ' + (TIPIK_AD[k.tipik] || 'breakfast') + ' runs out around ' + bitis + '. Ours lasts until ' + ogle + '.';
  }

  function sonucCiz(id, s) {
    var on = s.onizleme;
    var ogunler = on && on.ogunler ? on.ogunler : [];
    var liste = ogunler.map(function (o) {
      return '<div class="tp-ogun"><div class="saat">' + saat12(o.saat) + '</div><div><div class="tp-parca"><span class="bos"></span><div class="ad">' + (OGUN[o.ogun] || 'Meal') + ' · Chosen dish<small>' + o.kcal + ' kcal · ' + o.protein + ' g protein</small></div></div></div></div>';
    }).join('');
    sonuc.innerHTML = '<div class="tp-kutu">' +
      '<p class="tp-acik" style="margin:0">Your daily targets</p>' +
      '<h2 class="tp-soru" style="margin-top:4px">' + esc(baslikCumlesi(on)) + '</h2>' +
      zamanCiz(on) +
      '<div class="tp-hedefler"><div><b>' + s.gunluk.kcal.toLocaleString('en-US') + '</b><span>kcal a day</span></div><div><b>' + s.gunluk.protein + ' g</b><span>protein</span></div><div><b>' + s.ogunSayisi + '</b><span>meals</span></div></div>' +
      '<p class="tp-acik">Fat ' + s.gunluk.yag + ' g · Carbs ' + s.gunluk.karbonhidrat + ' g · Fiber ' + s.gunluk.lif + ' g</p>' +
      '<div class="tp-kilit"><div class="bulanik">' + liste + '</div><div class="ust">7-day plan, meal by meal</div></div>' +
      '<button type="button" class="tp-cta" data-ode="' + id + '">Unlock my plan · $5/month</button>' +
      '<p class="tp-not">Cancel anytime · Refund within 14 days · Secure checkout by Polar</p>' +
      '<div class="tp-hata" role="alert"></div></div>';
    goster(sonuc);
  }

  sonuc.addEventListener('click', function (e) {
    var t = e.target.closest('[data-ode]'); if (!t) return;
    t.disabled = true; t.textContent = 'Opening checkout…';
    izle('tp_odeme');
    fetch('/api/plan?islem=odeme', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan_id: t.dataset.ode }) })
      .then(function (r) { return r.json(); })
      .then(function (s) {
        if (s.url) { location.href = s.url; return; }
        t.disabled = false; t.textContent = 'Unlock my plan · $5/month';
        $('.tp-hata', sonuc).textContent = s.hata === 'odeme_kapali' ? 'Checkout opens soon. Your targets are saved to this link.' : 'Couldn\u2019t open checkout. Try again.';
      })
      .catch(function () { t.disabled = false; t.textContent = 'Unlock my plan · $5/month'; $('.tp-hata', sonuc).textContent = 'Couldn\u2019t reach the server. Try again.'; });
  });

  // ---------- plan gorunumu ----------
  var KESIR = { 0.5: '½', 0.75: '¾', 1.25: '1¼', 1.5: '1½' };
  function porsiyon(p) {
    if (p.adet) return p.kat + (p.kat === 1 ? ' egg' : ' eggs');
    if (p.kat === 1) return p.porsiyon || '1 serving';
    var k = KESIR[p.kat] || String(p.kat);
    return p.porsiyon ? k + ' × ' + p.porsiyon : k + ' servings';
  }
  function parcaCiz(p) {
    var img = p.gorsel ? '<img src="/img/yemek/k/' + esc(p.slug) + '.webp" alt="" width="56" height="42" loading="lazy">' : '<span class="bos"></span>';
    return '<div class="tp-parca">' + img + '<div class="ad">' + esc(p.ad) + '<small>' + esc(porsiyon(p)) + ' · ' + p.kcal + ' kcal · ' + p.protein + ' g protein</small></div></div>';
  }
  var P = null, gun = 0, secili = {};
  function planCiz() {
    var g = P.gunler[gun];
    var sekme = P.gunler.map(function (x, i) { return '<button type="button" data-gun="' + i + '" class="' + (i === gun ? 'on' : '') + '">Day ' + (i + 1) + '</button>'; }).join('');
    var ogun = g.ogunler.map(function (o, i) {
      var anahtar = gun + ':' + i, sec = secili[anahtar] || 0;
      var secenekler = [o.secim].concat(o.alternatifler || []).filter(Boolean);
      var s = secenekler[sec % secenekler.length];
      if (!s) return '';
      return '<div class="tp-ogun"><div class="saat">' + saat12(o.saat) + '<small>' + (OGUN[o.ogun] || '') + '</small></div><div>' +
        s.parcalar.map(parcaCiz).join('') +
        '<div class="alt"><span>' + s.toplam.kcal + ' kcal · ' + s.toplam.protein + ' g protein · full ~' + saatYaz(s.toplam.tokSaat) + ' h</span>' +
        (secenekler.length > 1 ? '<button type="button" data-degis="' + anahtar + '">Swap (' + ((sec % secenekler.length) + 1) + '/' + secenekler.length + ')</button>' : '') + '</div></div></div>';
    }).join('');
    planEl.innerHTML = '<div class="tp-kutu"><p class="tp-acik" style="margin:0">Week ' + ((P.hafta || 0) + 1) + ' · ' + P.gunluk.kcal.toLocaleString('en-US') + ' kcal · ' + P.gunluk.protein + ' g protein a day</p>' +
      '<h2 class="tp-soru" style="margin-top:4px">Your Stay Full Plan</h2><div class="tp-gunler">' + sekme + '</div>' + ogun +
      '<div class="tp-toplam"><span>Day total</span><span>' + Math.round(g.toplam.kcal) + ' kcal · ' + Math.round(g.toplam.protein) + ' g protein</span></div></div>' +
      '<p class="tp-not">Bookmark this page to come back to your plan. A new week is built every 7 days.</p>';
    goster(planEl);
  }
  planEl.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.dataset.gun) { gun = Number(t.dataset.gun); return planCiz(); }
    if (t.dataset.degis) { secili[t.dataset.degis] = (secili[t.dataset.degis] || 0) + 1; return planCiz(); }
  });

  function planYukle(id, checkoutId) {
    var h = {}; var a = oku('pr_plan_' + id); if (a) h['x-plan-anahtar'] = a;
    var url = '/api/plan?id=' + encodeURIComponent(id) + (checkoutId ? '&checkout_id=' + encodeURIComponent(checkoutId) : '');
    planEl.innerHTML = '<div class="tp-kutu"><p>Loading your plan…</p></div>'; goster(planEl);
    fetch(url, { headers: h }).then(function (r) { return r.json(); }).then(function (s) {
      if (s.engel) return engelGoster(s.engel);
      if (s.anahtar) sakla('pr_plan_' + id, s.anahtar);
      if (checkoutId) history.replaceState(null, '', '/en/plan?id=' + id);
      if (s.kilitli === false && s.gunler) { P = s; gun = 0; izle('tp_plan_acildi'); return planCiz(); }
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
