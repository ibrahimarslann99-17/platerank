#!/usr/bin/env python3
"""Saat yarışı videoları (1080x1920, 30 fps). Efektler araclar/sesler.py'de sentezlenir;
müziği paylaşırken platform ekler.
Üstte bir yemek, altta diğeri; ortadaki bantta yazılar. Iki saat aynı anda sayar,
erken biten "ACIKTIN" olur, uzun süren "KAZANDI". Sonda sitede oylamaya çağrı.
Saatler index.html'deki acikmaSuresi ile aynı formülden gelir (tahmini).
Kullanım: python3 araclar/video_saat.py mercimek-smoothie   (VIDEOLAR sözlüğündeki anahtar)
Çıktı: Claude outputs/videolar/saat-<anahtar>.mp4
"""
import os, sys, math, subprocess, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sesler
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FD = '/usr/share/fonts/truetype/google-fonts/'
_fc = {}
def F(w, s):
    k = (w, s)
    if k not in _fc: _fc[k] = ImageFont.truetype(FD + f'Poppins-{w}.ttf', s)
    return _fc[k]

W, H, FPS = 1080, 1920, 30
UST, BANT0, BANT1 = 790, 790, 1120
PAPER = (230, 239, 232); FOREST = (14, 34, 23); LIME = (213, 236, 98); BEYAZ = (255, 255, 255)
KIRMIZI = (204, 62, 52); KOYU = (30, 54, 39); SOLUK = (176, 196, 182)

def tok_saat(d, p, l):
    s = 1 + (d / 280) * 3.2 + p * 0.02 + l * 0.05
    s = max(1, min(5, s)); return round(s * 2) / 2
def sy(x): return (str(int(x)) if x == int(x) else f'{x:.1f}').replace('.', ',')

# a = üstteki, b = alttaki yemek. d: doyuruculuk, p: protein, l: lif, s: şeker
VIDEOLAR = {
  'mercimek-smoothie': dict(
    a=dict(slug='smoothie-bowl', ad='SMOOTHIE BOWL', kisa='Smoothie bowl', kcal=330, d=150, p=10, l=7, s=26),
    b=dict(slug='mercimek-corbasi', ad='MERCİMEK ÇORBASI', kisa='Mercimek', kcal=150, d=250, p=9, l=6, s=2),
    soru=('Smoothie bowl mu,', 'mercimek mi?'),
    sonuc=('Mercimek {k} saat daha uzun,', 'yarıdan az kaloriyle.'),
    ek=[('Fit sandın.', None), ('Protein aynı.', 'Şeker 13 kat.')]),
  'kumpir-patates': dict(
    a=dict(slug='kumpir-orta-boy-karisik', ad='KUMPİR', kisa='Kumpir', kcal=650, d=58, p=14, l=7, s=4),
    b=dict(slug='haslanmis-patates', ad='HAŞLANMIŞ PATATES', kisa='Patates', kcal=160, d=280, p=3, l=4, s=1),
    soru=('Aynı patates.', 'Hangisi tok tutar?'),
    sonuc=('Haşlanmışı {k} saat daha uzun,', '4 kat az kaloriyle.'),
    ek=[('Suçlu patates değil.', None), ('Mayonez, kaşar,', 'tereyağı.')]),
}

def kalin_metin(d, xy, metin, font, dolgu, golge=None, anchor='la'):
    d.text(xy, metin, font=font, fill=dolgu, anchor=anchor)

def hap(d, x, y, metin, font, bg, fg, pad=(18, 10), r=None):
    w = d.textlength(metin, font=font); a = font.size
    r = r if r is not None else (a + 2 * pad[1]) // 2
    d.rounded_rectangle((x, y, x + w + 2 * pad[0], y + a + 2 * pad[1]), radius=r, fill=bg)
    d.text((x + pad[0], y + pad[1] + a * 0.5), metin, font=font, fill=fg, anchor='lm')
    return x + w + 2 * pad[0]

def ease(t): t = max(0, min(1, t)); return 1 - (1 - t) ** 3
def pop(t):  # 0→1 hafif taşmalı
    t = max(0, min(1, t)); return 1 + 0.12 * math.sin(t * math.pi) if t < 1 else 1

def rozet(deger, durum, ilerleme):
    """Saat rozeti: durum 'sayiyor' | 'kazandi' | 'acikti'. ilerleme 0..1 (6 saate göre)."""
    S = 300; im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    bg = {'sayiyor': BEYAZ, 'kazandi': LIME, 'acikti': KIRMIZI}[durum]
    fg = BEYAZ if durum == 'acikti' else FOREST
    d.ellipse((10, 10, S - 10, S - 10), fill=bg)
    iz = (220, 228, 222) if durum == 'sayiyor' else tuple(int(c * 0.85) for c in bg)
    d.arc((26, 26, S - 26, S - 26), 0, 360, fill=iz, width=14)
    if ilerleme > 0:
        d.arc((26, 26, S - 26, S - 26), -90, -90 + 360 * min(1, ilerleme), fill=FOREST if durum != 'acikti' else BEYAZ, width=14)
    d.text((S / 2, S / 2 - 14), deger, font=F('Bold', 92), fill=fg, anchor='mm')
    d.text((S / 2, S / 2 + 56), 'SAAT', font=F('Bold', 26), fill=fg, anchor='mm')
    return im

def damga(metin, renk, yazi):
    f = F('Bold', 64); tmp = ImageDraw.Draw(Image.new('RGB', (1, 1)))
    w = int(tmp.textlength(metin, font=f)) + 60
    im = Image.new('RGBA', (w, 110), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, w - 1, 109), radius=18, fill=renk)
    d.text((w / 2, 55), metin, font=f, fill=yazi, anchor='mm')
    return im.rotate(-6, expand=True, resample=Image.BICUBIC)

def bant_ciz(c, satir1, satir2, alfa=1.0):
    d = ImageDraw.Draw(c)
    d.rectangle((0, BANT0, W, BANT1), fill=FOREST)
    d.rectangle((0, BANT0, W, BANT0 + 5), fill=LIME); d.rectangle((0, BANT1 - 5, W, BANT1), fill=LIME)
    if alfa <= 0: return
    katman = Image.new('RGBA', (W, BANT1 - BANT0), (0, 0, 0, 0)); kd = ImageDraw.Draw(katman)
    f = F('Bold', 66); cy = (BANT1 - BANT0) / 2
    if satir2 is None:
        boy = 92 if len(satir1) < 16 else 70
        kd.text((W / 2, cy), satir1, font=F('Bold', boy), fill=LIME if len(satir1) < 16 else BEYAZ, anchor='mm')
    else:
        kd.text((W / 2, cy - 48), satir1, font=f, fill=BEYAZ, anchor='mm')
        w2 = kd.textlength(satir2, font=f)
        kd.rounded_rectangle((W / 2 - w2 / 2 - 22, cy + 6, W / 2 + w2 / 2 + 22, cy + 96), radius=16, fill=LIME)
        kd.text((W / 2, cy + 51), satir2, font=f, fill=FOREST, anchor='mm')
    if alfa < 1: katman.putalpha(katman.getchannel('A').point(lambda v: int(v * alfa)))
    c.paste(katman, (0, BANT0), katman)

class Yari:
    def __init__(s, y, ust, kutu):
        s.y = y; s.ust = ust; s.kutu = kutu  # kutu: (y0, y1)
        h = kutu[1] - kutu[0]
        foto = Image.open(os.path.join(KOK, 'img', 'yemek', y['slug'] + '.webp')).convert('RGB')
        s.foto = ImageOps.fit(foto, (W, h), Image.LANCZOS)
        s.karanlik = Image.blend(s.foto, Image.new('RGB', s.foto.size, (0, 0, 0)), 0.58).filter(ImageFilter.GaussianBlur(1.5))
        s.saat = tok_saat(y['d'], y['p'], y['l'])

def yari_ciz(c, Y, durum, deger, rozet_olcek, kcal_alfa, etiket, damga_t):
    y0, y1 = Y.kutu; h = y1 - y0
    c.paste(Y.karanlik if durum == 'acikti' else Y.foto, (0, y0))
    d = ImageDraw.Draw(c)
    if durum == 'kazandi':
        for i in range(12): d.rectangle((i, y0 + i, W - 1 - i, y1 - 1 - i), outline=LIME)
    if Y.ust: hap(d, 36, y0 + 34, 'platerank.dev', F('Bold', 26), FOREST, LIME, pad=(16, 8))
    # ad + kcal
    ny = y1 - 96
    x = hap(d, 36, ny, Y.y['ad'], F('Bold', 36), LIME if durum == 'kazandi' else BEYAZ, FOREST, pad=(20, 12), r=12)
    if kcal_alfa > 0:
        hap(d, x + 14, ny, f"{Y.y['kcal']} kcal", F('Bold', 36), FOREST, BEYAZ, pad=(18, 12), r=12)
    if etiket:
        hap(d, 36, ny - 74, etiket, F('Bold', 30), LIME if durum == 'kazandi' else KIRMIZI,
            FOREST if durum == 'kazandi' else BEYAZ, pad=(16, 9), r=10)
    if rozet_olcek > 0:
        r = rozet(deger, durum, (float(deger.replace(',', '.')) / 6) if deger else 0)
        S = int(300 * rozet_olcek); r = r.resize((S, S), Image.LANCZOS)
        cx, cy = W - 210, y0 + h // 2 - 20
        c.paste(r, (cx - S // 2, cy - S // 2), r)
    if damga_t > 0:
        dm = damga('KAZANDI' if durum == 'kazandi' else 'ACIKTIM!', LIME if durum == 'kazandi' else KIRMIZI,
                   FOREST if durum == 'kazandi' else BEYAZ)
        k = pop(damga_t) * (0.6 + 0.4 * ease(damga_t * 3))
        dm = dm.resize((int(dm.width * k), int(dm.height * k)), Image.LANCZOS)
        c.paste(dm, (70, y0 + h // 2 - 120 - dm.height // 2), dm)

def son_kart(c, t):
    d = ImageDraw.Draw(c); d.rectangle((0, 0, W, H), fill=PAPER)
    a = ease(t * 2)
    f = F('Bold', 84)
    d.text((W / 2, 470), 'Hesap böyle diyor.', font=F('Bold', 58), fill=FOREST, anchor='mm')
    d.text((W / 2, 590), 'Sence kaç saat', font=f, fill=FOREST, anchor='mm')
    w = d.textlength('tutuyor?', font=f)
    d.rounded_rectangle((W / 2 - w / 2 - 26, 650, W / 2 + w / 2 + 26, 760), radius=20, fill=LIME)
    d.text((W / 2, 705), 'tutuyor?', font=f, fill=FOREST, anchor='mm')
    # sitedeki saat düğmeleri, biri dokunuluyor
    adlar = ['30 dk', '1 sa', '2 sa', '3 sa', '4 sa', '5 sa', '6+ sa']
    bw, bh, g = 132, 96, 12; x0 = (W - (len(adlar) * bw + (len(adlar) - 1) * g)) / 2; yb = 880
    secili = 4 if t > 0.45 else -1
    for i, ad in enumerate(adlar):
        x = x0 + i * (bw + g)
        on = i == secili
        d.rounded_rectangle((x, yb, x + bw, yb + bh), radius=18, fill=LIME if on else FOREST)
        d.text((x + bw / 2, yb + bh / 2), ad, font=F('Bold', 30), fill=FOREST if on else BEYAZ, anchor='mm')
    if secili >= 0:
        yesil = (30, 122, 76); fk = F('Bold', 40); tw = d.textlength('Kaydedildi', font=fk)
        cx = W / 2 - tw / 2 - 30; cy = yb + bh + 60
        d.line([(cx - 16, cy), (cx - 4, cy + 12), (cx + 18, cy - 14)], fill=yesil, width=8, joint='curve')
        d.text((W / 2 + 14, cy), 'Kaydedildi', font=fk, fill=yesil, anchor='mm')
    d.text((W / 2, 1190), 'Katılmıyorsan sitede söyle.', font=F('Bold', 52), fill=FOREST, anchor='mm')
    d.text((W / 2, 1260), 'Giriş yok, tek dokunuş.', font=F('Medium', 40), fill=(91, 107, 96), anchor='mm')
    w = d.textlength('platerank.dev', font=F('Bold', 76)) + 80
    d.rounded_rectangle((W / 2 - w / 2, 1360, W / 2 + w / 2, 1490), radius=28, fill=FOREST)
    d.text((W / 2, 1425), 'platerank.dev', font=F('Bold', 76), fill=LIME, anchor='mm')
    d.text((W / 2, 1560), 'Link profilde', font=F('Bold', 40), fill=FOREST, anchor='mm')

def uret(anahtar):
    V = VIDEOLAR[anahtar]
    A = Yari(V['a'], True, (0, UST)); B = Yari(V['b'], False, (BANT1, H))
    kaz, kay = (A, B) if A.saat > B.saat else (B, A)
    HIZ = 0.75                     # saniyede saat başına
    T_HOOK, T_SORU, T_SAAT0 = 1.8, 3.4, 3.8
    T_KAY = T_SAAT0 + kay.saat * HIZ
    T_KAZ = T_SAAT0 + kaz.saat * HIZ
    T_SONUC_BIT = T_KAZ + 2.4
    ekler = V['ek']; T_EK = 1.8
    T_SON = T_SONUC_BIT + T_EK * len(ekler)
    T_BITIS = T_SON + 4.6
    fark = sy(kaz.saat - kay.saat)
    cikti = os.path.join(KOK, 'Claude outputs', 'videolar', f'saat-{anahtar}.mp4')
    gecici = tempfile.mkdtemp(); goruntu = os.path.join(gecici, 'v.mp4'); ses = os.path.join(gecici, 'a.wav')
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                           '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
                           '-pix_fmt', 'yuv420p', goruntu], stdin=subprocess.PIPE)
    n = int(T_BITIS * FPS)
    for i in range(n):
        t = i / FPS
        c = Image.new('RGB', (W, H), FOREST)
        if t >= T_SON:
            son_kart(c, (t - T_SON) / 4.6)
        else:
            for Y in (A, B):
                if t < T_SAAT0 - 0.4:
                    durum, deger, olc = 'sayiyor', None, 0
                else:
                    v = max(0, min(Y.saat, (t - T_SAAT0) / HIZ))
                    bitti = t >= T_SAAT0 + Y.saat * HIZ
                    durum = ('kazandi' if Y is kaz else 'acikti') if (bitti and (Y is kay or t >= T_KAZ)) else 'sayiyor'
                    deger = sy(round(v * 2) / 2 if bitti else math.floor(v * 10) / 10)
                    olc = ease((t - (T_SAAT0 - 0.4)) / 0.35)
                bitis = T_KAY if Y is kay else T_KAZ
                damga_t = (t - bitis) / 0.5 if t >= bitis else 0
                etiket = None
                if t >= T_SONUC_BIT:
                    etiket = f"{Y.y['p']} g protein · {Y.y['s']} g şeker"
                yari_ciz(c, Y, durum, deger, olc, 1 if t >= T_HOOK else 0, etiket, damga_t)
            if t < T_HOOK: bant_ciz(c, 'Hangisi daha', 'uzun tok tutar?')
            elif t < T_SAAT0 - 0.4: bant_ciz(c, *V['soru'])
            elif t < T_KAY: bant_ciz(c, 'Tok tutma saati', 'başladı.')
            elif t < T_KAZ: bant_ciz(c, f"{kay.y['kisa']}", f"{sy(kay.saat)} saatte acıktırdı.")
            elif t < T_SONUC_BIT:
                s1, s2 = V['sonuc']; bant_ciz(c, s1.format(k=fark), s2)
            else:
                j = min(len(ekler) - 1, int((t - T_SONUC_BIT) / T_EK)); bant_ciz(c, *ekler[j])
        ff.stdin.write(c.tobytes())
    ff.stdin.close(); ff.wait()
    # ses çizelgesi: her bant değişiminde vuus, rozetler/etiketler pop, saat tıkırtısı yarım saatte bir
    ol = [(0.0, sesler.vuus(), 0.6), (T_HOOK, sesler.pop(), 0.7), (T_HOOK, sesler.vuus(), 0.5),
          (T_SAAT0 - 0.4, sesler.pop(), 0.9), (T_SAAT0 - 0.4, sesler.vuus(), 0.5)]
    k = 0
    while T_SAAT0 + k * HIZ / 2 < T_KAZ - 0.01:
        ol.append((T_SAAT0 + k * HIZ / 2, sesler.tik(k % 2 == 0), 0.8)); k += 1
    ol += [(T_KAY, sesler.gum(), 0.9), (T_KAY + 0.05, sesler.uzgun(), 0.8), (T_KAY, sesler.vuus(), 0.4),
           (T_KAZ, sesler.gum(), 0.9), (T_KAZ + 0.05, sesler.zafer(), 0.9), (T_KAZ, sesler.vuus(), 0.4),
           (T_SONUC_BIT, sesler.pop(), 0.7)]
    for j in range(len(ekler)): ol.append((T_SONUC_BIT + j * T_EK, sesler.vuus(), 0.5))
    ol += [(T_SON, sesler.vuus(0.4), 0.7), (T_SON + 0.45 * 4.6, sesler.tik(True), 1.0),
           (T_SON + 0.45 * 4.6 + 0.04, sesler.ding(), 0.8)]
    sesler.miks(ol, T_BITIS, ses)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', goruntu, '-i', ses, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
                    '-shortest', '-movflags', '+faststart', cikti], check=True)
    print(cikti, f'{T_BITIS:.1f} sn', f'kazanan {kaz.y["kisa"]} {kaz.saat} sa, kaybeden {kay.y["kisa"]} {kay.saat} sa')

if __name__ == '__main__':
    for k in (sys.argv[1:] or VIDEOLAR.keys()): uret(k)
