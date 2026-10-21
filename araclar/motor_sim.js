const { hedefHesapla } = require('../api/_hedef');
const { planUret } = require('../api/_motor');
const Y = require('./cikti/yemekler.json');
const kisiler = [
  ['80kg erkek ver', { boy: 180, kilo: 80, yas: 30, cinsiyet: 'erkek', aktivite: 'orta', hedef: 'ver', kalkis: '07:30', yatis: '23:30' }, {}],
  ['60kg kadin saglik', { boy: 165, kilo: 60, yas: 28, cinsiyet: 'kadin', aktivite: 'hafif', hedef: 'saglik', kalkis: '08:00', yatis: '23:00' }, {}],
  ['75kg vegan kas', { boy: 178, kilo: 75, yas: 25, cinsiyet: 'erkek', aktivite: 'yuksek', hedef: 'kas', kalkis: '07:00', yatis: '23:00' }, { diyet: 'vegan' }],
  ['95kg erkek ver 5 ogun', { boy: 185, kilo: 95, yas: 40, cinsiyet: 'erkek', aktivite: 'hafif', hedef: 'ver', kalkis: '06:00', yatis: '00:30', ogunSayisi: 5 }, {}],
  ['70kg kadin vejetaryen ver', { boy: 170, kilo: 70, yas: 35, cinsiyet: 'kadin', aktivite: 'orta', hedef: 'ver', kalkis: '07:00', yatis: '23:00' }, { diyet: 'vejetaryen' }],
  ['55kg kadin gluten+sut haric', { boy: 160, kilo: 55, yas: 30, cinsiyet: 'kadin', aktivite: 'hafif', hedef: 'saglik', kalkis: '08:00', yatis: '00:00' }, { alerjen: ['gluten', 'sut'] }],
];
const detay = process.argv[2];
for (const [ad, g, sec] of kisiler) {
  const h = hedefHesapla(g);
  const t0 = Date.now();
  const p = planUret(h, Y, { ...sec, tohum: ad });
  const ms = Date.now() - t0;
  let n = 0, tutan = 0, bos = 0; const eksik = {};
  for (const gun of p.gunler) for (const o of gun.ogunler) { n++; if (!o.secim) { bos++; eksik[o.ogun] = (eksik[o.ogun] || 0) + 1; } else tutan++; }
  console.log(`${ad}: ${h.gunluk.kcal} kcal ${h.gunluk.protein}p ${h.ogunSayisi} ogun | tutan ${tutan}/${n} | bos ${JSON.stringify(eksik)} | ${ms} ms`);
  if (detay === ad.split(' ')[0] || detay === 'hepsi') for (const gun of p.gunler.slice(0, 2)) {
    for (const o of gun.ogunler) console.log(`  G${gun.gun} ${o.ogun.padEnd(8)} hedef ${o.hedef.kcal}/${o.hedef.protein}p -> ` + (o.secim ? `${o.secim.toplam.kcal}/${o.secim.toplam.protein}p ${o.secim.toplam.tokSaat}sa: ` + o.secim.parcalar.map(x => `${x.ad} x${x.kat}`).join(' + ') : 'YOK'));
  }
}
// istatistik
console.log('---');
for (const [ad, g, sec] of kisiler) {
  const h = hedefHesapla(g); const p = planUret(h, Y, { ...sec, tohum: ad + 'x' });
  let kErr = 0, pOran = 0, n = 0, uc = 0; const taban = new Set(), ek = {}, mut = {};
  for (const gun of p.gunler) for (const o of gun.ogunler) if (o.secim) {
    n++; kErr += Math.abs(o.secim.toplam.kcal - o.hedef.kcal) / o.hedef.kcal; pOran += o.secim.toplam.protein / o.hedef.protein;
    if (o.secim.parcalar.length > 2) uc++;
    taban.add(o.secim.parcalar[0].id);
    for (const x of o.secim.parcalar) { if (x.rol === 'ek') ek[x.ad.slice(0, 18)] = (ek[x.ad.slice(0, 18)] || 0) + 1; }
  }
  for (const x of Y) if (taban.has(x.id)) mut[x.mutfak] = (mut[x.mutfak] || 0) + 1;
  console.log(`${ad}: kcal sapma %${(kErr / n * 100).toFixed(1)} | protein %${(pOran / n * 100).toFixed(0)} | farkli tabak ${taban.size}/${n} | 3 parcali ${uc} | ek ${JSON.stringify(ek)} | mutfak ${JSON.stringify(mut)}`);
}
