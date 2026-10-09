#!/usr/bin/env python3
"""gorsel-ham/ içindeki resimleri siteye hazırlar.

- 4:3 kırpar, 1200x900'e küçültür, WebP olarak img/yemek/<slug>.webp'ye yazar (~80 KB)
- img/yemek/liste.json'u günceller; yemek sayfaları görseli buradan bilir
- Zaten işlenmiş ve ham dosyası değişmemiş resimlere dokunmaz
Gerekli: Pillow (pip install pillow)
"""
import json, os
from PIL import Image, ImageOps

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAM = os.path.join(KOK, 'gorsel-ham')
HEDEF = os.path.join(KOK, 'img', 'yemek')
LISTE = os.path.join(HEDEF, 'liste.json')
W, H = 1200, 900


def main():
    os.makedirs(HEDEF, exist_ok=True)
    gecerli = {x['slug'] for x in json.load(open(os.path.join(KOK, 'araclar', 'gorsel_listesi.json'), encoding='utf-8'))}
    yeni = guncel = 0
    for f in sorted(os.listdir(HAM)):
        slug, uz = os.path.splitext(f)
        if uz.lower() not in ('.jpg', '.jpeg', '.png', '.webp') or slug.startswith('_'):
            continue
        if slug not in gecerli:
            print('Listede olmayan dosya, atlandı:', f); continue
        kaynak = os.path.join(HAM, f)
        cikti = os.path.join(HEDEF, slug + '.webp')
        if os.path.exists(cikti) and os.path.getmtime(cikti) >= os.path.getmtime(kaynak):
            continue
        im = ImageOps.exif_transpose(Image.open(kaynak)).convert('RGB')
        im = ImageOps.fit(im, (W, H), Image.LANCZOS, centering=(0.5, 0.5))
        var_miydi = os.path.exists(cikti)
        im.save(cikti + '.tmp', 'WEBP', quality=78, method=6)
        os.replace(cikti + '.tmp', cikti)
        guncel += var_miydi; yeni += not var_miydi

    hepsi = sorted(os.path.splitext(f)[0] for f in os.listdir(HEDEF) if f.endswith('.webp'))
    with open(LISTE, 'w', encoding='utf-8') as f:
        json.dump(hepsi, f, ensure_ascii=False, indent=0)
    boyut = sum(os.path.getsize(os.path.join(HEDEF, s + '.webp')) for s in hepsi)
    print(f'{yeni} yeni, {guncel} güncellenen. Sitede toplam {len(hepsi)} görsel, {boyut/1e6:.1f} MB.')


if __name__ == '__main__':
    main()
