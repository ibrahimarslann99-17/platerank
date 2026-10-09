#!/usr/bin/env python3
"""PlateRank yemek görsellerini Gemini API ile üretir.

Kendi bilgisayarında, repo klasöründe çalıştır:
    python3 araclar/gorsel_uret.py            # deneme: sıradaki 10 yemek
    python3 araclar/gorsel_uret.py --adet 50  # sıradaki 50 yemek
    python3 araclar/gorsel_uret.py --hepsi    # kalan hepsi (önce maliyeti gösterip onay ister)

API anahtarı ekranda görünmeden sorulur (ya da GEMINI_API_KEY ortam değişkeninden okunur).
Anahtar hiçbir dosyaya yazılmaz. Resimler gorsel-ham/ klasörüne iner; zaten olanlar atlanır.
Sadece Python'un kendi kütüphanesini kullanır, kurulum gerekmez.
"""
import argparse, base64, getpass, json, os, re, sys, time, urllib.error, urllib.request

MODEL = 'gemini-nano-banana-2.1'
RESIM_BASI_DOLAR = 0.05            # gerçekleşen: ~419 resim ~21 dolarlık krediyi bitirdi
KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LISTE = os.path.join(KOK, 'araclar', 'gorsel_listesi.json')
HAM = os.path.join(KOK, 'gorsel-ham')
API = 'https://generativelanguage.googleapis.com/v1beta'


def istek(url, govde, anahtar):
    req = urllib.request.Request(url, data=json.dumps(govde).encode(), method='POST',
                                 headers={'x-goog-api-key': anahtar, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.loads(r.read().decode())


def resim_bul(o):
    """Yanıtın içinde base64 resmi arar (generateContent ve Interactions biçimlerinin ikisi de)."""
    if isinstance(o, dict):
        for k in ('inlineData', 'inline_data'):
            v = o.get(k)
            if isinstance(v, dict) and isinstance(v.get('data'), str):
                return v['data'], v.get('mimeType') or v.get('mime_type') or 'image/png'
        if o.get('type') == 'image' and isinstance(o.get('data'), str):
            return o['data'], o.get('mime_type') or o.get('mimeType') or 'image/png'
        for v in o.values():
            r = resim_bul(v)
            if r: return r
    elif isinstance(o, list):
        for v in o:
            r = resim_bul(v)
            if r: return r
    return None


def govde_gc(prompt):
    return {'contents': [{'parts': [{'text': prompt}]}],
            'generationConfig': {'responseModalities': ['IMAGE'],
                                 'imageConfig': {'aspectRatio': '4:3', 'imageSize': '1K'}}}


def govde_ia(prompt):
    return {'model': MODEL, 'input': [{'type': 'text', 'text': prompt}],
            'response_format': {'type': 'image', 'mime_type': 'image/jpeg', 'aspect_ratio': '4:3', 'image_size': '1K'}}


YOL = {'gc': (lambda: f'{API}/models/{MODEL}:generateContent', govde_gc),
       'ia': (lambda: f'{API}/interactions', govde_ia)}


def uret(prompt, anahtar, yol):
    url, govde = YOL[yol]
    bekle = 5
    for deneme in range(4):
        try:
            return resim_bul(istek(url(), govde(prompt), anahtar)), None
        except urllib.error.HTTPError as e:
            mesaj = e.read().decode(errors='replace')[:900]
            if e.code in (429, 500, 502, 503, 504) and deneme < 3:
                print(f'   {e.code}, {bekle} sn bekleyip tekrar deniyorum')
                time.sleep(bekle); bekle *= 2
                continue
            return None, f'HTTP {e.code}: {mesaj}'
        except Exception as e:
            if deneme < 3:
                time.sleep(bekle); bekle *= 2
                continue
            return None, str(e)
    return None, 'tekrar denemeler tükendi'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--adet', type=int, default=10)
    ap.add_argument('--hepsi', action='store_true')
    a = ap.parse_args()

    liste = json.load(open(LISTE, encoding='utf-8'))
    os.makedirs(HAM, exist_ok=True)
    var = {os.path.splitext(f)[0] for f in os.listdir(HAM)}
    kalan = [x for x in liste if x['slug'] not in var]
    sec = kalan if a.hepsi else kalan[:a.adet]
    if not sec:
        print('Üretilecek yemek kalmadı.'); return

    tahmin = len(sec) * RESIM_BASI_DOLAR
    print(f'{len(sec)} resim üretilecek (kalan toplam {len(kalan)}). Tahmini maliyet: {tahmin:.2f} dolar.')
    if a.hepsi or len(sec) > 50:
        if input('Devam edeyim mi? (e/h): ').strip().lower() != 'e':
            print('Vazgeçildi.'); return

    anahtar = os.environ.get('GEMINI_API_KEY') or getpass.getpass('Gemini API anahtarı (yapıştır, ekranda görünmez, sonra Enter): ')
    # Terminal yapıştırırken görünmez işaretler (ESC[200~ ... ESC[201~), boşluk ve tırnak ekleyebiliyor: temizle
    anahtar = re.sub(r'\x1b\[20[01]~', '', anahtar)
    anahtar = re.sub(r'[^A-Za-z0-9_.\-]', '', anahtar)
    if len(anahtar) < 20:
        print(f'Anahtar okunamadı ({len(anahtar)} karakter). Tekrar çalıştırıp yapıştır.'); return
    print(f'Anahtar okundu: {anahtar[:4]}… ({len(anahtar)} karakter)')

    yol, basarili, hatalar = 'gc', 0, []
    for i, x in enumerate(sec, 1):
        print(f'[{i}/{len(sec)}] {x["ad"]}')
        sonuc, hata = uret(x['prompt'], anahtar, yol)
        if hata and i == 1 and yol == 'gc' and ('400' in hata or '404' in hata):
            print('   İlk biçim kabul edilmedi, diğer API biçimine geçiyorum')
            yol = 'ia'
            sonuc, hata = uret(x['prompt'], anahtar, yol)
        if hata and ('401' in hata or '403' in hata):
            print('   Yetki hatası: anahtar ya da faturalandırma sorunu. Duruyorum.\n   ' + hata); break
        if hata and '402' in hata:
            print('   Kredi bitti (402). Duruyorum; AI Studio > Billing üzerinden kredi ekleyip aynı komutla devam et.'); break
        if not sonuc:
            print('   Hata: ' + (hata or 'yanıtta resim yok')); hatalar.append((x['slug'], hata or 'resim yok'))
            if len(hatalar) >= 5 and basarili == 0:
                print('Üst üste hata, duruyorum.'); break
            continue
        veri, mime = sonuc
        uzanti = '.jpg' if 'jpeg' in mime or 'jpg' in mime else '.png' if 'png' in mime else '.webp'
        gecici = os.path.join(HAM, x['slug'] + uzanti + '.tmp')
        with open(gecici, 'wb') as f:
            f.write(base64.b64decode(veri))
        os.replace(gecici, os.path.join(HAM, x['slug'] + uzanti))
        basarili += 1
        time.sleep(1)

    if hatalar:
        with open(os.path.join(HAM, '_hatalar.txt'), 'a', encoding='utf-8') as f:
            for s, h in hatalar: f.write(f'{s}\t{h}\n')
    print(f'\nBitti: {basarili} resim indi, {len(hatalar)} hata. Harcanan tahmini: {basarili * RESIM_BASI_DOLAR:.2f} dolar.')
    print('Resimler: gorsel-ham/ klasöründe. Sıradaki adım: Claude\'a "üretti" de.')


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('\nDurduruldu. İnen resimler yerinde; tekrar çalıştırınca kaldığı yerden devam eder.')
