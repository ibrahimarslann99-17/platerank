#!/usr/bin/env python3
"""Yeni mutfak partisi icin USDA FoodData Central (FNDDS) verisi ceker.

Kullanim (repo kokunde):
    python3 araclar/yeni_mutfak_liste.py      # listeyi JSON'a yazar
    python3 araclar/usda_cek.py               # USDA'dan ceker, inceleme dosyalarini yazar

Anahtar: USDA_API_KEY ortam degiskeni ya da repo kokundeki .env dosyasi (USDA_API_KEY=...).
.env git'e girmez (.gitignore). Anahtar hicbir dosyaya yazilmaz.

Cikti:
    araclar/cikti/usda_inceleme.csv   -> gozle kontrol: eslesme, makrolar, dogrulama, alerjen uyarilari
    araclar/cikti/usda_sonuc.json     -> ekleme adimi icin ham veri
Sadece standart kutuphane kullanir. Yarida kesilirse kaldigi yerden devam eder (onbellek).
"""

import csv, json, os, re, sys, time, urllib.parse, urllib.request

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARAC = os.path.join(KOK, 'araclar')
CIKTI = os.path.join(ARAC, 'cikti')
ONBELLEK = os.path.join(CIKTI, 'usda_onbellek.json')
API = 'https://api.nal.usda.gov/fdc/v1'

# FDC besin numaralari (100 g basina)
N = {'kcal': '208', 'protein': '203', 'yag': '204', 'karb': '205', 'lif': '291', 'seker': '269'}

# FNDDS malzeme adlarinda alerjen ipuclari (kelime siniriyla aranir)
IPUCU = {
    'et': r'beef|pork|chicken|turkey|lamb|mutton|goat|bacon|ham|sausage|veal|duck|meat',
    'balik': r'fish|shrimp|prawn|clam|salmon|tuna|crab|anchov\w*|mackerel|squid|oyster|mussel|seafood|cod|tilapia',
    'sut': r'milk|cheese|butter|cream|yogurt|ghee|whey|paneer',
    'yumurta': r'eggs?',
    'gluten': r'wheat|flour|bread|pasta|noodles?|barley|rye|couscous|bulgur|semolina|soy sauce|tortilla, flour|croissant|biscuit',
    'kuruyemis': r'almonds?|cashews?|peanuts?|walnuts?|pecans?|pistachios?|pine nuts?|hazelnuts?|peanut butter',
    'soya': r'soy\w*|tofu|edamame|miso',
    'baklagil': r'(?<!green )(?<!string )(?<!snap )beans?(?! sprouts)(?!, (green|snap|string))|lentils?|chickpeas?|garbanzo|split peas|peanuts?|dal',
}


def anahtar():
    k = os.environ.get('USDA_API_KEY')
    if k:
        return k.strip()
    env = os.path.join(KOK, '.env')
    if os.path.exists(env):
        for satir in open(env, encoding='utf-8'):
            if satir.strip().startswith('USDA_API_KEY='):
                return satir.split('=', 1)[1].strip().strip('"\'')
    sys.exit('USDA_API_KEY yok. Repo kokunde .env dosyasina USDA_API_KEY=... yaz ya da ortam degiskeni olarak ver.')


def getir(yol, params, key, govde=None):
    """GET (govde yoksa) ya da JSON POST. 4xx hatalarinda USDA'nin aciklamasini dondurur, betigi durdurmaz."""
    url = f'{API}/{yol}?{urllib.parse.urlencode(dict(params, api_key=key))}'
    for deneme in range(4):
        try:
            if govde is None:
                req = urllib.request.Request(url)
            else:
                req = urllib.request.Request(url, data=json.dumps(govde).encode(), method='POST',
                                             headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            mesaj = e.read().decode(errors='replace')[:300]
            if e.code == 429:
                bekle = 60 * (deneme + 1)
                print(f'  limit doldu, {bekle} sn bekleniyor...')
                time.sleep(bekle)
                continue
            if e.code in (401, 403):
                sys.exit(f'USDA anahtari reddedildi ({e.code}). .env icindeki USDA_API_KEY degerini kontrol et.')
            if e.code >= 500 and deneme < 3:
                time.sleep(5)
                continue
            print(f'  USDA {e.code}: {mesaj}')
            return None
        except urllib.error.URLError:
            time.sleep(5)
    raise RuntimeError(f'USDA cevap vermedi: {yol}')


def kelimeler(s):
    return set(re.findall(r'[a-z]+', s.lower())) - {'with', 'and', 'or', 'the', 'a', 'of', 'ns', 'as', 'to', 'made', 'from', 'in'}


def benzerlik(arama, aciklama):
    a, b = kelimeler(arama), kelimeler(aciklama)
    if not a:
        return 0.0
    return round(len(a & b) / len(a | b) * 0.5 + len(a & b) / len(a) * 0.5, 2)


def besinler(food):
    d = {}
    for n in food.get('foodNutrients', []):
        no = str(n.get('nutrientNumber') or (n.get('nutrient') or {}).get('number') or '')
        deger = n.get('value', n.get('amount'))
        for ad, kod in N.items():
            if no == kod and deger is not None:
                d[ad] = float(deger)
    return d


def dogrula(m):
    if not all(k in m for k in ('kcal', 'protein', 'yag', 'karb', 'lif')):
        return 'eksik besin'
    hesap = 4 * m['protein'] + 9 * m['yag'] + 4 * m['karb'] - 2 * m['lif']
    if m['kcal'] <= 0 or abs(hesap - m['kcal']) / m['kcal'] > 0.08:
        return f'kalori tutmuyor (beyan {m["kcal"]:.0f}, hesap {hesap:.0f})'
    if m.get('seker') is not None and m['seker'] > m['karb'] + 0.5:
        return 'seker > karbonhidrat'
    return 'ok'


def regresyon_puani(p):
    # platerank-veri: tam tablo regresyonu (R2 0,715), porsiyon degerleriyle; lif 6 g'da sinirli.
    # Sadece baslangic onerisi: son puan cevredeki capa yemeklere gore elle verilir.
    v = (159.65 - 0.2704 * p['kcal'] + 3.8921 * p['protein'] + 8.8695 * min(p['lif'], 6)
         - 0.9682 * p['yag'] - 1.0398 * (p.get('seker') or 0))
    return max(1, min(500, round(v)))


def alerjen_uyari(beklenen, malzemeler):
    metin = ' | '.join(malzemeler).lower()
    eksik = []
    for al, desen in IPUCU.items():
        if al not in beklenen and re.search(rf'\b({desen})\b', metin):
            eksik.append(al)
    return eksik


def main():
    key = anahtar()
    os.makedirs(CIKTI, exist_ok=True)
    liste = json.load(open(os.path.join(ARAC, 'yeni_mutfak_liste.json'), encoding='utf-8'))
    # Ikinci tur: elle duzeltilmis arama terimleri / porsiyonlar. Duzeltilen kalemde USDA'nin kendi siralamasi kullanilir.
    dz_yol = os.path.join(ARAC, 'usda_duzeltme.json')
    duzeltme = json.load(open(dz_yol, encoding='utf-8')) if os.path.exists(dz_yol) else {}
    for y in liste:
        d = duzeltme.get(y['ad'])
        if d:
            y.update(d)
            y['_duzeltildi'] = 'arama' in d
    onb = json.load(open(ONBELLEK, encoding='utf-8')) if os.path.exists(ONBELLEK) else {}

    sonuc = []
    for i, y in enumerate(liste, 1):
        k = y['ad'] if not y.get('_duzeltildi') else f"{y['ad']}|{y['arama']}"
        if k not in onb:
            print(f'[{i}/{len(liste)}] {y["ad"]}  <-  "{y["arama"]}"')
            ara = getir('foods/search', {}, key,
                        govde={'query': y['arama'], 'dataType': ['Survey (FNDDS)'], 'pageSize': 8}) or {}
            adaylar = sorted(
                ({'fdc_id': f['fdcId'], 'aciklama': f['description'], 'benzerlik': benzerlik(y['arama'], f['description']),
                  'besin_100g': besinler(f)} for f in ara.get('foods', [])),
                key=lambda a: 0 if y.get('_duzeltildi') else -a['benzerlik'])
            detay = getir(f'food/{adaylar[0]["fdc_id"]}', {}, key) if adaylar else None
            malzemeler = [m.get('ingredientDescription') or m.get('foodDescription') or ''
                          for m in (detay or {}).get('inputFoods', [])]
            onb[k] = {'adaylar': adaylar[:3], 'malzemeler': malzemeler}
            json.dump(onb, open(ONBELLEK, 'w', encoding='utf-8'), ensure_ascii=False)
            time.sleep(0.4)

        kayit = onb[k]
        en = kayit['adaylar'][0] if kayit['adaylar'] else None
        satir = {a: b for a, b in y.items() if not a.startswith('_')}
        if not en:
            satir.update(durum='eslesme yok')
            sonuc.append(satir)
            continue
        oran = y['porsiyon_g'] / 100
        porsiyon = {ad: round(v * oran, 1) for ad, v in en['besin_100g'].items()}
        satir.update(
            fdc_id=en['fdc_id'], fdc_aciklama=en['aciklama'], benzerlik=en['benzerlik'],
            besin_100g=en['besin_100g'], porsiyon=porsiyon,
            dogrulama=dogrula(en['besin_100g']),
            alerjen_uyari=alerjen_uyari(set(y['alerjenler']), kayit['malzemeler']),
            malzemeler=kayit['malzemeler'],
            alternatifler=[f'{a["fdc_id"]}: {a["aciklama"]}' for a in kayit['adaylar'][1:]],
            durum='duzeltildi' if y.get('_duzeltildi') else ('zayif eslesme' if en['benzerlik'] < 0.5 else 'eslesti'),
        )
        if satir['dogrulama'] == 'ok':
            satir['puan_onerisi'] = regresyon_puani(porsiyon)
        sonuc.append(satir)

    json.dump(sonuc, open(os.path.join(CIKTI, 'usda_sonuc.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    alanlar = ['mutfak', 'tur', 'ad', 'porsiyon_g', 'durum', 'benzerlik', 'fdc_id', 'fdc_aciklama',
               'kcal', 'protein', 'yag', 'karb', 'lif', 'seker', 'dogrulama', 'puan_onerisi',
               'alerjenler', 'alerjen_uyari', 'alternatifler']
    with open(os.path.join(CIKTI, 'usda_inceleme.csv'), 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.DictWriter(f, alanlar, extrasaction='ignore')
        w.writeheader()
        for s in sonuc:
            r = dict(s, **(s.get('porsiyon') or {}))
            for a in ('alerjenler', 'alerjen_uyari', 'alternatifler'):
                r[a] = ', '.join(s.get(a) or []) if isinstance(s.get(a), list) else s.get(a, '')
            w.writerow(r)

    from collections import Counter
    print('\nDurum:', dict(Counter(s['durum'] for s in sonuc)))
    print('Dogrulama:', dict(Counter(s.get('dogrulama', '-') if s.get('dogrulama') in (None, 'ok') else 'hatali' for s in sonuc)))
    print('Alerjen uyarisi olan:', sum(1 for s in sonuc if s.get('alerjen_uyari')))
    print('Dosyalar: araclar/cikti/usda_inceleme.csv, araclar/cikti/usda_sonuc.json')


if __name__ == '__main__':
    main()
