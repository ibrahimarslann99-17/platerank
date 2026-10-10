#!/usr/bin/env python3
"""Liste kapakları: PlateRank tasarımında 1200x630 paylaşım görseli + 600x315 kart görseli.
Girdi: araclar/liste_kapaklari.json (her listenin ilk 4 yemeği), img/yemek/<slug>.webp
Çıktı: img/liste/<slug>.jpg ve img/liste/k/<slug>.jpg
"""
import json, os
from PIL import Image, ImageDraw, ImageFont, ImageOps

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FD = '/usr/share/fonts/truetype/google-fonts/'
def F(w, s): return ImageFont.truetype(FD + f'Poppins-{w}.ttf', s)

PAPER = (230, 239, 232); FOREST = (14, 34, 23); TEAL = (31, 92, 59); LIME = (213, 236, 98)
MUTED = (91, 107, 96); BEYAZ = (255, 255, 255)
LIG = {'S': (30, 122, 76), 'A': (90, 145, 53), 'B': (194, 150, 27), 'C': (208, 108, 40), 'D': (191, 59, 56)}
W, H = 1200, 630


def yuvarlak(im, r):
    m = Image.new('L', im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, im.width - 1, im.height - 1), radius=r, fill=255)
    out = Image.new('RGBA', im.size); out.paste(im, (0, 0), m); return out


def sar(d, metin, font, genislik):
    satirlar, s = [], ''
    for k in metin.split():
        t = (s + ' ' + k).strip()
        if d.textlength(t, font=font) <= genislik: s = t
        else: satirlar.append(s); s = k
    if s: satirlar.append(s)
    return satirlar


def kapak(L):
    im = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(im)
    # sağ panel: 2x2 görsel
    X0, Y0, G, A = 618, 30, 12, 279
    resimli = [y for y in L['ilk'] if y['gorsel']]
    if resimli:
        for i, y in enumerate(L['ilk'][:4]):
            x, yy = X0 + (i % 2) * (A + G), Y0 + (i // 2) * (A + G)
            yol = os.path.join(KOK, 'img', 'yemek', y['slug'] + '.webp')
            if y['gorsel'] and os.path.exists(yol):
                foto = ImageOps.fit(Image.open(yol).convert('RGB'), (A, A), Image.LANCZOS)
            else:
                foto = Image.new('RGB', (A, A), (214, 227, 217))
                fd = ImageDraw.Draw(foto)
                for j, satir in enumerate(sar(fd, y['ad'], F('Bold', 26), A - 40)[:3]):
                    fd.text((A // 2, A // 2 - 30 + j * 34), satir, font=F('Bold', 26), fill=FOREST, anchor='mm')
            im.paste(yuvarlak(foto, 22), (x, yy), yuvarlak(foto, 22))
            d = ImageDraw.Draw(im)
            d.ellipse((x + 12, yy + 12, x + 56, yy + 56), fill=LIME)
            d.text((x + 34, yy + 35), str(i + 1), font=F('Bold', 26), fill=FOREST, anchor='mm')
            p = str(y['puan']); pw = d.textlength(p, font=F('Bold', 26)) + 26
            d.rounded_rectangle((x + 12, yy + A - 52, x + 12 + pw, yy + A - 14), radius=10, fill=LIG[y['lig']])
            d.text((x + 12 + pw / 2, yy + A - 32), p, font=F('Bold', 26), fill=BEYAZ, anchor='mm')
    else:
        d.rounded_rectangle((X0, Y0, W - 30, H - 30), radius=26, fill=FOREST)
        for i, y in enumerate(L['ilk'][:4]):
            yy = Y0 + 50 + i * 128
            d.text((X0 + 36, yy + 20), f'{i + 1}', font=F('Bold', 44), fill=LIME, anchor='lm')
            satir = sar(d, y['ad'], F('Bold', 30), 330)[:2]
            for j, s in enumerate(satir):
                d.text((X0 + 90, yy + 4 + j * 36), s, font=F('Bold', 30), fill=BEYAZ, anchor='lt')
            p = str(y['puan']); pw = d.textlength(p, font=F('Bold', 28)) + 26
            d.rounded_rectangle((W - 60 - pw, yy, W - 60, yy + 42), radius=10, fill=LIG[y['lig']])
            d.text((W - 60 - pw / 2, yy + 21), p, font=F('Bold', 28), fill=BEYAZ, anchor='mm')

    # sol: marka
    d.ellipse((50, 46, 98, 94), fill=(34, 122, 84), outline=(245, 245, 242), width=4)
    d.text((74, 71), 'S', font=F('Bold', 28), fill=BEYAZ, anchor='mm')
    d.text((112, 70), 'PlateRank', font=F('Bold', 34), fill=FOREST, anchor='lm')

    # başlık
    ana, _, alt = L['baslik'].partition(':')
    boy = 64
    while True:
        f = F('Bold', boy); satirlar = sar(d, ana, f, 520)
        if len(satirlar) <= 3 or boy <= 40: break
        boy -= 4
    y0 = 150
    for i, s in enumerate(satirlar):
        d.text((50, y0 + i * int(boy * 1.12)), s, font=f, fill=FOREST, anchor='lt')
    y1 = y0 + len(satirlar) * int(boy * 1.12) + 10
    if alt.strip():
        for i, s in enumerate(sar(d, alt.strip(), F('Medium', 30), 520)[:2]):
            d.text((50, y1 + i * 38), s, font=F('Medium', 30), fill=TEAL, anchor='lt')
        y1 += 38 * min(2, len(sar(d, alt.strip(), F('Medium', 30), 520))) + 6
    etiket = f"{L['adet']} yemek · doyuruculuk sırası"
    ew = d.textlength(etiket, font=F('Bold', 26)) + 40
    d.rounded_rectangle((50, y1 + 14, 50 + ew, y1 + 64), radius=25, fill=LIME)
    d.text((50 + ew / 2, y1 + 39), etiket, font=F('Bold', 26), fill=FOREST, anchor='mm')
    d.text((50, H - 56), 'platerank.dev/liste', font=F('Medium', 26), fill=MUTED, anchor='lt')
    return im


def main():
    listeler = json.load(open(os.path.join(KOK, 'araclar', 'liste_kapaklari.json'), encoding='utf-8'))
    os.makedirs(os.path.join(KOK, 'img', 'liste', 'k'), exist_ok=True)
    for L in listeler:
        im = kapak(L)
        im.save(os.path.join(KOK, 'img', 'liste', L['slug'] + '.jpg'), 'JPEG', quality=84, optimize=True, progressive=True)
        im.resize((600, 315), Image.LANCZOS).save(os.path.join(KOK, 'img', 'liste', 'k', L['slug'] + '.jpg'), 'JPEG', quality=82, optimize=True)
    print(len(listeler), 'kapak yazıldı')


if __name__ == '__main__':
    main()
