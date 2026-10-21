#!/usr/bin/env python3
"""USDA sonucu + tarif hesabi -> eklenecek 200 satir (puan, alerjen, diyet, kaynak dahil).

Girdi: araclar/cikti/usda_sonuc.json, araclar/cikti/tarif_sonuc.json, araclar/cikti/mevcut.json (sitedeki yemekler)
Cikti: araclar/cikti/parti.json  (ekleme icin) ve ekrana inceleme tablosu.

Puan: regresyon (platerank-veri katsayilari) + ayni turdeki en yakin 7 mevcut yemegin regresyon sapmasi medyani.
Yani her yeni yemek, sitedeki benzer yemeklerin gercek puanlarina gore kalibre edilir (capa yontemi, otomatik).
"""
import json, os, re, statistics

ARAC = os.path.dirname(os.path.abspath(__file__))
C = os.path.join(ARAC, 'cikti')

# USDA eslesmesi zayif gorunse de dogru olan kalemler (elle kontrol edildi)
ZAYIF_KABUL = {
    'Biscuits and gravy', 'Yaban mersinli muffin', 'Meyveli yulaf lapası (suyla)', 'Eggs Benedict',
    'Yumuşak pretzel', 'Sebzeli biryani', 'Jjimdak', 'Huevos a la mexicana', 'Tamagoyaki',
}
# Ad duzeltmeleri (USDA degeri isimle uyussun)
AD_DEGIS = {
    'Waffle (şuruplu, 2 adet)': ('Waffle (sade, 2 adet)', 'Waffles, plain (2)'),
    'Sloppy joe': ('Sloppy joe (ekmeksiz)', 'Sloppy joe (no bun)'),
    'Yumurtalı peynirli biscuit': ('Bacon, yumurta ve peynirli biscuit', 'Bacon, egg and cheese biscuit'),
    'Gumbo (tavuk ve sosisli)': ('Gumbo (pilavlı)', 'Gumbo with rice'),
}
SEBEP_ALERJEN = {'et', 'balik'}
SUT_YUMURTA = {'sut', 'yumurta'}


def reg(k, p, y, l, s):
    return 159.65 - 0.2704 * k + 3.8921 * p + 8.8695 * min(l, 6) - 0.9682 * y - 1.0398 * s


def ozellik(k, p, y, l, s):
    k = max(k, 1)
    return (k / 300, p * 4 / k * 3, y * 9 / k * 2, l / k * 100, s * 4 / k * 2)


def puanla(yeni, mevcut):
    k, p, y, l, s = (yeni[a] for a in ('kcal', 'protein', 'yag', 'lif', 'seker'))
    f = ozellik(k, p, y, l, s)
    ayni = [m for m in mevcut if m['tur'] == yeni['tur']] or mevcut
    ayni.sort(key=lambda m: sum((a - b) ** 2 for a, b in zip(f, m['f'])))
    yakin = ayni[:7]
    duzelt = statistics.median(m['sapma'] for m in yakin)
    return max(1, min(500, round(reg(k, p, y, l, s) + duzelt))), [m['ad'] for m in yakin[:3]]


def main():
    liste = json.load(open(os.path.join(ARAC, 'yeni_mutfak_liste.json'), encoding='utf-8'))
    usda = {x['ad']: x for x in json.load(open(os.path.join(C, 'usda_sonuc.json'), encoding='utf-8'))}
    tarif = json.load(open(os.path.join(C, 'tarif_sonuc.json'), encoding='utf-8'))
    mevcut = []
    for ad, mf, tur, k, p, y, l, s, d, kay in json.load(open(os.path.join(C, 'mevcut.json'), encoding='utf-8')):
        mevcut.append({'ad': ad, 'tur': tur, 'f': ozellik(k, p, y, l, s), 'sapma': d - reg(k, p, y, l, s)})

    parti, sorun = [], []
    for y in liste:
        ad = y['ad']
        al = set(y['alerjenler'])
        if ad in tarif:
            t = tarif[ad]
            v = {a: t[a] for a in ('kcal', 'protein', 'yag', 'lif', 'seker')}
            g, kaynak, nereden = t['porsiyon_g'], None, 'tarif'
        else:
            u = usda.get(ad)
            if not u or u.get('durum') == 'eslesme yok':
                sorun.append((ad, 'eslesme yok')); continue
            if u['durum'] in ('zayif eslesme', 'eslesme yok') and ad not in ZAYIF_KABUL:
                sorun.append((ad, f"zayif: {u.get('fdc_aciklama')}")); continue
            p, b = u['porsiyon'], u['besin_100g']
            v = {'kcal': p['kcal'], 'protein': p['protein'], 'yag': p['yag'], 'lif': p.get('lif', 0), 'seker': p.get('seker', 0)}
            g = u['porsiyon_g']
            al |= set(u.get('alerjen_uyari') or [])
            kaynak = (f"USDA FDC:{u['fdc_id']} ({u['fdc_aciklama']}, FNDDS; porsiyon {g} g; 100 g referans: "
                      f"{b.get('kcal', 0):.0f}kcal/{b.get('protein', 0):.3g}p/{b.get('lif', 0):.3g}lif/{b.get('yag', 0):.3g}yag/{b.get('seker', 0):.3g}seker)")
            nereden = 'usda'
        diyet = set(y['diyet'])
        if al & SEBEP_ALERJEN:
            diyet = set()
        if al & SUT_YUMURTA:
            diyet.discard('vegan')
        satir = {
            'mutfak': y['mutfak'], 'tur': y['tur'],
            'ad': AD_DEGIS.get(ad, (ad,))[0], 'ad_en': AD_DEGIS[ad][1] if ad in AD_DEGIS else y['ad_en'],
            'kcal': round(v['kcal']), 'protein': round(v['protein']), 'yag': round(v['yag']),
            'lif': round(v['lif']), 'seker': round(v['seker']), 'porsiyon_g': round(g),
            'alerjenler': sorted(al), 'diyet': sorted(diyet), 'kaynak': kaynak, 'nereden': nereden,
        }
        satir['doyuruculuk'], satir['capalar'] = puanla({**v, 'tur': y['tur']}, mevcut)
        parti.append(satir)

    json.dump(parti, open(os.path.join(C, 'parti.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for s in parti:
        print(f"{s['mutfak']}|{s['tur'][:5]}|{s['ad'][:36]:36}|{s['porsiyon_g']:4}g|{s['kcal']:4}|P{s['protein']:3}|Y{s['yag']:3}|L{s['lif']:2}|S{s['seker']:3}|{s['doyuruculuk']:3}|{s['nereden'][:1]}|{','.join(s['alerjenler'])}|{'/'.join(s['diyet'])}|~ {'; '.join(c[:22] for c in s['capalar'])}")
    print(f'\n{len(parti)} hazir, {len(sorun)} sorunlu')
    for a, n in sorun:
        print('  SORUN', a, '->', n)


if __name__ == '__main__':
    main()
