#!/usr/bin/env python3
"""PlateRank tanıtım Reels'i (1080x1920, 30 fps): sitenin özelliklerini sırayla gösterir.
Sahneler ayrı dosyalara kodlanır, concat ile birleşir, ses sonra eklenir. Müzik yok (platformda eklenir).
Efektler araclar/sesler.py ile sentezlenir. Sayılar sitenin kendi formüllerinden (index.html acikmaSuresi,
ayniKaloriSuresi, P_DURUM, satietyToTier) ve yemekler tablosundan.
Kullanım: python3 araclar/video_tanitim.py [sahne_adi ...]   (boşsa hepsi)
Çıktı: Claude outputs/videolar/platerank-12-tanitim.mp4
"""
import os, sys, math, subprocess, shutil
from concurrent.futures import ProcessPoolExecutor
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

BURASI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BURASI)
import sesler

KOK = os.environ.get('PLATERANK_KOK', os.path.dirname(BURASI))
FONT_DIR = os.environ.get('PLATERANK_FONT', os.path.join(KOK, 'araclar', 'fontlar'))
CIKTI = os.environ.get('PLATERANK_CIKTI', os.path.join(KOK, 'Claude outputs', 'videolar', 'platerank-12-tanitim.mp4'))
GECICI = os.environ.get('PLATERANK_GECICI', '/tmp/pr_tanitim')

W, H, FPS = 1080, 1920, 30
PAPER = (230, 239, 232); CARD = (255, 255, 255); LINE = (214, 227, 217); INK = (15, 26, 19)
MUTED = (91, 107, 96); TEAL = (31, 92, 59); FOREST = (14, 34, 23); LIME = (213, 236, 98)
BEYAZ = (255, 255, 255); KIRMIZI = (204, 62, 52); WASH = (225, 238, 228)
LIG = {'S': (30, 122, 76), 'A': (90, 145, 53), 'B': (194, 150, 27), 'C': (208, 108, 40), 'D': (191, 59, 56)}
LIG_KISA = {'S': 'Şampiyon', 'A': 'Güçlü', 'B': 'Orta', 'C': 'Zayıf', 'D': 'Boş kalori'}

_fc = {}
def B(s, w=800):  # başlık: Bricolage Grotesque
    k = ('B', w, s)
    if k not in _fc: _fc[k] = ImageFont.truetype(os.path.join(FONT_DIR, f'Bricolage-{w}.ttf'), s)
    return _fc[k]
def F(s, w=700):  # arayüz: Figtree
    k = ('F', w, s)
    if k not in _fc: _fc[k] = ImageFont.truetype(os.path.join(FONT_DIR, f'Figtree-{w}.ttf'), s)
    return _fc[k]

# ---------- sitenin formülleri ----------
def taban(k): return 0.8 + 2.7 * (max(k, 1) / 500) ** 0.65
def verim(d): return max(0.6, min(1.5, (max(d, 1) / 150) ** 0.5))
def acikma(k, d): return round(max(0.5, min(6, taban(k) * verim(d))) * 2) / 2
def ayni_kalori(d): return round(taban(300) * verim(d) * 2) / 2
def lig(d): return 'S' if d >= 200 else 'A' if d >= 150 else 'B' if d >= 100 else 'C' if d >= 70 else 'D'
def sy(x): return (str(int(x)) if x == int(x) else f'{x:.1f}').replace('.', ',')

# yemekler tablosundan (17.11.2026)
Y = {
  'kunefe': dict(ad='Künefe', kcal=450, d=58), 'kuru-fasulye': dict(ad='Kuru fasulye', kcal=230, d=228, p=14),
  'mercimek-corbasi': dict(ad='Mercimek çorbası', kcal=150, d=250), 'menemen': dict(ad='Menemen', kcal=220, d=190),
  'lahmacun': dict(ad='Lahmacun', kcal=280, d=115), 'simit': dict(ad='Simit', kcal=300, d=85),
  'baklava-2-dilim': dict(ad='Baklava (2 dilim)', kcal=330, d=50),
  'tavuk-gogsu-pismis-izgara-150-g': dict(ad='Izgara tavuk göğsü', kcal=226, d=241, p=46),
  'beyaz-fasulye-salatasi-zeytinyagli': dict(ad='Beyaz fasulye salatası', kcal=260, d=204, p=12),
  'izgara-kofte': dict(ad='Izgara köfte', kcal=350, d=150),
  'tarhana-corbasi': dict(ad='Tarhana çorbası', kcal=150, d=240),
}

# ---------- çizim yardımcıları ----------
def clamp(t): return max(0.0, min(1.0, t))
def eo(t): t = clamp(t); return 1 - (1 - t) ** 3
def back(t):
    t = clamp(t); c = 1.7
    return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2

_foto = {}
def foto(slug, w, h, yuvarlak=0):
    k = (slug, w, h, yuvarlak)
    if k not in _foto:
        im = Image.open(os.path.join(KOK, 'img', 'yemek', slug + '.webp')).convert('RGB')
        im = ImageOps.fit(im, (w, h), Image.LANCZOS).convert('RGBA')
        if yuvarlak:
            m = Image.new('L', (w * 3, h * 3), 0)
            ImageDraw.Draw(m).rounded_rectangle((0, 0, w * 3 - 1, h * 3 - 1), radius=yuvarlak * 3, fill=255)
            im.putalpha(m.resize((w, h), Image.LANCZOS))
        _foto[k] = im
    return _foto[k]

def koy(c, im, x, y, alfa=1.0):
    """RGBA parçayı alfa ile yapıştır."""
    if alfa <= 0: return
    if alfa < 1:
        im = im.copy(); a = im.getchannel('A').point(lambda v: int(v * alfa)); im.putalpha(a)
    c.paste(im, (int(x), int(y)), im)

def katman(w, h): im = Image.new('RGBA', (int(w), int(h)), (0, 0, 0, 0)); return im, ImageDraw.Draw(im)

def yazi(c, xy, s, font, renk, alfa=1.0, anchor='la'):
    if alfa <= 0: return
    if alfa >= 1:
        ImageDraw.Draw(c).text(xy, s, font=font, fill=renk, anchor=anchor); return
    d0 = ImageDraw.Draw(c); x0, y0, x1, y1 = d0.textbbox(xy, s, font=font, anchor=anchor)
    im, d = katman(x1 - x0 + 4, y1 - y0 + 4)
    d.text((xy[0] - x0 + 2, xy[1] - y0 + 2), s, font=font, fill=renk, anchor=anchor)
    koy(c, im, x0 - 2, y0 - 2, alfa)

def hap(d, x, y, s, font, bg, fg, pad=(22, 12), r=None, cizgi=None):
    w = d.textlength(s, font=font); a = font.size
    r = r if r is not None else (a + 2 * pad[1]) // 2
    d.rounded_rectangle((x, y, x + w + 2 * pad[0], y + a + 2 * pad[1]), radius=r, fill=bg, outline=cizgi, width=3 if cizgi else 0)
    d.text((x + pad[0], y + pad[1] + a * 0.55), s, font=font, fill=fg, anchor='lm')
    return x + w + 2 * pad[0]

def saat_ikon(d, cx, cy, r, renk, w=4):
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=renk, width=w)
    d.line([(cx, cy), (cx, cy - r * 0.55)], fill=renk, width=w)
    d.line([(cx, cy), (cx + r * 0.45, cy + r * 0.1)], fill=renk, width=w)

def tik_ikon(d, cx, cy, s, renk, w=8):
    d.line([(cx - s, cy), (cx - s * 0.3, cy + s * 0.7), (cx + s, cy - s * 0.8)], fill=renk, width=w, joint='curve')

def dokunus(c, x, y, t):
    """Parmak dokunuşu: genişleyen halka. t: dokunuştan beri geçen saniye."""
    if t < 0 or t > 0.5: return
    k = t / 0.5; r = 30 + 60 * eo(k)
    im, d = katman(2 * r + 10, 2 * r + 10)
    d.ellipse((5, 5, 5 + 2 * r, 5 + 2 * r), outline=(255, 255, 255, 255), width=8)
    d.ellipse((5 + r - 22, 5 + r - 22, 5 + r + 22, 5 + r + 22), fill=(255, 255, 255, 140))
    koy(c, im, x - r - 5, y - r - 5, 1 - k)

def golge_kart(c, x0, y0, x1, y1, r=44, renk=PAPER):
    sh, d = katman(x1 - x0 + 80, y1 - y0 + 80)
    d.rounded_rectangle((40, 50, 40 + x1 - x0, 50 + y1 - y0), radius=r, fill=(0, 0, 0, 120))
    sh = sh.filter(ImageFilter.GaussianBlur(18)); koy(c, sh, x0 - 40, y0 - 40)
    ImageDraw.Draw(c).rounded_rectangle((x0, y0, x1, y1), radius=r, fill=renk)

# kart alanı: Instagram arayüzünden uzak (sağ %15 ve alt %20 boş kalır)
KX0, KX1, KY0, KY1 = 64, 904, 640, 1490

def baslik(c, t, etiket, s1, s2):
    """Üst başlık bloğu: küçük etiket hapı + iki satır. t sahnenin saniyesi."""
    a = eo(t / 0.35)
    im, d = katman(600, 70); hap(d, 0, 0, etiket, F(30, 800), LIME, FOREST, pad=(20, 10))
    koy(c, im, 80, 262 + 20 * (1 - a), a)
    for i, (s, renk) in enumerate(((s1, BEYAZ), (s2, LIME))):
        a2 = eo((t - 0.12 - 0.1 * i) / 0.4); f = B(76)
        while ImageDraw.Draw(c).textlength(s, font=f) > 820: f = B(f.size - 4)
        yazi(c, (80, 350 + 96 * i + 26 * (1 - a2)), s, f, renk, a2)

def bitis_karart(c, t, sure, bg=FOREST):
    k = (t - (sure - 0.22)) / 0.22
    if k > 0: return Image.blend(c, Image.new('RGB', (W, H), bg), clamp(k))
    return c

def kart_giris(t, gecikme=0.15):
    a = eo((t - gecikme) / 0.45); return a, int(70 * (1 - a))

# ================= SAHNE 1: kanca (saat yarışı) =================
UST, BANT0, BANT1 = 760, 760, 1090

def rozet(deger, durum, ilerleme):
    S = 300; im, d = katman(S, S)
    bg = {'sayiyor': BEYAZ, 'kazandi': LIME, 'acikti': KIRMIZI}[durum]
    fg = BEYAZ if durum == 'acikti' else FOREST
    d.ellipse((10, 10, S - 10, S - 10), fill=bg)
    iz = (220, 228, 222) if durum == 'sayiyor' else tuple(int(v * 0.85) for v in bg)
    d.arc((26, 26, S - 26, S - 26), 0, 360, fill=iz, width=14)
    if ilerleme > 0:
        d.arc((26, 26, S - 26, S - 26), -90, -90 + 360 * min(1, ilerleme), fill=FOREST if durum != 'acikti' else BEYAZ, width=14)
    d.text((S / 2, S / 2 - 14), deger, font=F(92, 800), fill=fg, anchor='mm')
    d.text((S / 2, S / 2 + 56), 'SAAT', font=F(26, 800), fill=fg, anchor='mm')
    return im

def damga(metin, renk, yazi_r):
    f = F(64, 800); w = int(ImageDraw.Draw(Image.new('RGB', (1, 1))).textlength(metin, font=f)) + 60
    im, d = katman(w, 110); d.rounded_rectangle((0, 0, w - 1, 109), radius=18, fill=renk)
    d.text((w / 2, 55), metin, font=f, fill=yazi_r, anchor='mm')
    return im.rotate(-6, expand=True, resample=Image.BICUBIC)

def bant(c, s1, s2, a=1.0):
    d = ImageDraw.Draw(c)
    d.rectangle((0, BANT0, W, BANT1), fill=FOREST)
    d.rectangle((0, BANT0, W, BANT0 + 5), fill=LIME); d.rectangle((0, BANT1 - 5, W, BANT1), fill=LIME)
    cy = (BANT0 + BANT1) / 2; f = B(70)
    yazi(c, (W / 2, cy - 50), s1, f, BEYAZ, a, 'mm')
    w2 = d.textlength(s2, font=f)
    im, k = katman(w2 + 48, 96); k.rounded_rectangle((0, 0, w2 + 47, 95), radius=18, fill=LIME)
    k.text((24 + w2 / 2, 47), s2, font=f, fill=FOREST, anchor='mm')
    koy(c, im, W / 2 - w2 / 2 - 24, cy + 4, a)

class Yari:
    def __init__(s, slug, ust):
        s.y = Y[slug]; s.ust = ust
        s.kutu = (0, UST) if ust else (BANT1, H)
        h = s.kutu[1] - s.kutu[0]
        s.foto = foto(slug, W, h).convert('RGB')
        s.karanlik = Image.blend(s.foto, Image.new('RGB', s.foto.size, (0, 0, 0)), 0.58)
        s.saat = ayni_kalori(s.y['d'])
        # Instagram: üst başlık ve alt yazı bölgesinden uzak dur
        s.cy = s.kutu[0] + (430 if ust else 330)

def sahne_kanca(t, sure):
    A = Yari('kunefe', True); Bf = Yari('kuru-fasulye', False)
    T0, HIZ = 0.6, 0.65
    c = Image.new('RGB', (W, H), FOREST)
    for Yr in (A, Bf):
        bitis = T0 + Yr.saat * HIZ; bitti = t >= bitis
        kazanan = Yr is Bf
        durum = ('kazandi' if kazanan else 'acikti') if bitti else 'sayiyor'
        c.paste(Yr.karanlik if durum == 'acikti' else Yr.foto, (0, Yr.kutu[0]))
        d = ImageDraw.Draw(c)
        if durum == 'kazandi':
            for i in range(12): d.rectangle((i, Yr.kutu[0] + i, W - 1 - i, Yr.kutu[1] - 1 - i), outline=LIME)
        # ad + kalori: üstte kutunun altına yakın, altta kutunun üstüne yakın
        ny = Yr.kutu[1] - 110 if Yr.ust else Yr.kutu[0] + 44
        x = hap(d, 56, ny, Yr.y['ad'].upper(), F(40, 800), LIME if durum == 'kazandi' else BEYAZ, FOREST, pad=(22, 13), r=14)
        hap(d, x + 14, ny, '300 kcal', F(40, 800), FOREST, BEYAZ, pad=(20, 13), r=14)
        v = max(0, min(Yr.saat, (t - T0) / HIZ))
        deger = sy(Yr.saat if bitti else math.floor(v * 10) / 10)
        r = rozet(deger, durum, v / 6)
        koy(c, r, W / 2 + 150 - 150, Yr.cy - 150)
        if bitti:
            dt = t - bitis
            dm = damga('KAZANDI' if kazanan else 'ACIKTIM!', LIME if kazanan else KIRMIZI, FOREST if kazanan else BEYAZ)
            k = back(dt / 0.35)
            dm = dm.resize((max(1, int(dm.width * k)), max(1, int(dm.height * k))), Image.LANCZOS)
            koy(c, dm, 70, Yr.cy - 40 - dm.height // 2)
    if t < A.saat * HIZ + T0: bant(c, 'Aynı 300 kalori.', 'Hangisi tok tutar?')
    elif t < Bf.saat * HIZ + T0: bant(c, 'Künefe', '1,5 saatte acıktırdı.')
    else: bant(c, 'Kuru fasulye 3,5 saat.', 'Aynı kalori, 2 saat fark.')
    return c

def ses_kanca(sure):
    T0, HIZ = 0.6, 0.65; ka, kf = ayni_kalori(58), ayni_kalori(228)
    ol = [(0.0, sesler.vuus(), 0.5)]
    k = 0
    while T0 + k * HIZ / 2 < T0 + kf * HIZ - 0.01:
        ol.append((T0 + k * HIZ / 2, sesler.tik(k % 2 == 0), 0.8)); k += 1
    ol += [(T0 + ka * HIZ, sesler.gum(), 0.9), (T0 + ka * HIZ + 0.05, sesler.uzgun(), 0.8),
           (T0 + kf * HIZ, sesler.gum(), 0.9), (T0 + kf * HIZ + 0.05, sesler.zafer(), 0.9)]
    return ol

# ================= SAHNE 2: marka =================
def sahne_marka(t, sure):
    c = Image.new('RGB', (W, H), FOREST); d = ImageDraw.Draw(c)
    a1 = eo(t / 0.35); yazi(c, (W / 2, 560 + 30 * (1 - a1)), 'Kalori sayan çok,', B(84), BEYAZ, a1, 'mm')
    a2 = eo((t - 0.35) / 0.35)
    f = B(84); s = 'tokluk soran yok.'; w = d.textlength(s, font=f)
    im, k = katman(w + 56, 116); k.rounded_rectangle((0, 0, w + 55, 115), radius=22, fill=LIME)
    k.text((28 + w / 2, 58), s, font=f, fill=FOREST, anchor='mm')
    koy(c, im, W / 2 - w / 2 - 28, 625 + 30 * (1 - a2), a2)
    a3 = eo((t - 1.25) / 0.45)
    if a3 > 0:
        k3 = 0.85 + 0.15 * back((t - 1.25) / 0.45)
        im, k = katman(900, 520)
        k.text((450, 150), 'Plate', font=B(250), fill=BEYAZ, anchor='mm')
        k.text((450, 380), 'Rank', font=B(250), fill=BEYAZ, anchor='mm')
        im = im.resize((int(900 * k3), int(520 * k3)), Image.LANCZOS)
        koy(c, im, W / 2 - im.width / 2, 1090 - im.height / 2 + 30 * (1 - a3), a3)
    a4 = eo((t - 1.8) / 0.35)
    im, k = katman(900, 80)
    x = hap(k, 0, 0, '846 yemek', F(36, 800), LIME, FOREST, pad=(24, 12))
    x = hap(k, x + 14, 0, '15 mutfak', F(36, 800), (38, 66, 48), BEYAZ, pad=(24, 12))
    hap(k, x + 14, 0, 'tokluk hesabı', F(36, 800), (38, 66, 48), BEYAZ, pad=(24, 12))
    bb = im.getbbox() or (0, 0, 1, 1)
    koy(c, im, W / 2 - (bb[2]) / 2, 1390 + 20 * (1 - a4), a4)
    return bitis_karart(c, t, sure)

def ses_marka(sure):
    return [(0.0, sesler.vuus(), 0.6), (0.35, sesler.pop(), 0.7), (1.25, sesler.gum(), 0.8),
            (1.3, sesler.vuus(0.35), 0.4), (1.8, sesler.pop(), 0.6)]

# ================= SAHNE 3: ligler =================
LIG_SATIR = ['mercimek-corbasi', 'menemen', 'lahmacun', 'simit', 'baklava-2-dilim']

def satir_lig(c, x0, y, w, slug, a, vurgu=False):
    yv = Y[slug]; L = lig(yv['d']); h = 140
    im, d = katman(w, h)
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius=26, fill=CARD, outline=LIME if vurgu else LINE, width=6 if vurgu else 2)
    d.rounded_rectangle((0, 0, 118, h - 1), radius=26, fill=LIG[L]); d.rectangle((90, 0, 118, h - 1), fill=LIG[L])
    d.text((59, 58), L, font=B(72), fill=BEYAZ, anchor='mm')
    d.text((59, 110), LIG_KISA[L].upper(), font=F(15 if L == 'D' else 17, 800), fill=BEYAZ, anchor='mm')
    ph = foto(slug, 92, 92, 46); im.paste(ph, (136, 24), ph)
    d.text((248, 50), yv['ad'], font=F(38, 800), fill=INK, anchor='lm')
    oran = min(1, yv['d'] / 300)
    d.rounded_rectangle((248, 90, 248 + 290, 104), radius=7, fill=WASH)
    d.rounded_rectangle((248, 90, 248 + max(14, int(290 * oran)), 104), radius=7, fill=LIG[L])
    sa = sy(ayni_kalori(yv['d']))
    fs = F(52, 800); tw = d.textlength(sa, font=fs)
    d.text((w - 70, 62), sa, font=fs, fill=LIG[L], anchor='rm')
    d.text((w - 26, 66), 'sa', font=F(30, 800), fill=LIG[L], anchor='rm')
    saat_ikon(d, w - 70 - tw - 26, 62, 15, LIG[L], 4)
    koy(c, im, x0 + 60 * (1 - a), y, a)

def sahne_lig(t, sure):
    c = Image.new('RGB', (W, H), FOREST)
    baslik(c, t, '01 · LİGLER', 'Her yemek tokluğuna göre', "S'den D'ye bir ligde.")
    a, dy = kart_giris(t)
    if a > 0:
        golge_kart(c, KX0, KY0 + dy, KX1, KY1 + dy)
        d = ImageDraw.Draw(c)
        yazi(c, (KX0 + 40, KY0 + 58 + dy), '300 kalorisi kaç saat tok tutar?', F(32, 800), INK, a, 'lm')
        for i, slug in enumerate(LIG_SATIR):
            ai = eo((t - 0.55 - 0.22 * i) / 0.35)
            vurgu = i == 0 and t > 2.6
            satir_lig(c, KX0 + 24, KY0 + 106 + i * 146 + dy, KX1 - KX0 - 48, slug, ai, vurgu)
    return bitis_karart(c, t, sure)

def ses_lig(sure):
    ol = [(0.0, sesler.vuus(), 0.5), (0.15, sesler.vuus(0.35), 0.4)]
    ol += [(0.55 + 0.22 * i, sesler.pop(), 0.55) for i in range(5)]
    ol += [(2.6, sesler.ding(), 0.6)]
    return ol

# ================= SAHNE 4: ne yesem =================
SONUC = ['kuru-fasulye', 'tavuk-gogsu-pismis-izgara-150-g', 'beyaz-fasulye-salatasi-zeytinyagli']
T_ACLIK, T_TAT = 1.15, 1.85

def chip_sira(c, x, y, adlar, secili, a, h=78, f=None):
    f = f or F(32, 700); im, d = katman(KX1 - KX0, h + 4); xx = 0; konum = []
    for i, ad in enumerate(adlar):
        on = i == secili
        w = d.textlength(ad, font=f) + 56
        d.rounded_rectangle((xx, 0, xx + w, h), radius=h // 2, fill=FOREST if on else CARD, outline=FOREST if on else (196, 212, 200), width=3)
        d.text((xx + w / 2, h / 2), ad, font=f, fill=LIME if on else INK, anchor='mm')
        konum.append((x + xx + w / 2, y + h / 2)); xx += w + 14
    koy(c, im, x, y, a)
    return konum

def sahne_yesem(t, sure):
    c = Image.new('RGB', (W, H), FOREST)
    baslik(c, t, '02 · NE YESEM?', 'Açlığını söyle,', 'en uzun tutanı bul.')
    a, dy = kart_giris(t)
    if a > 0:
        golge_kart(c, KX0, KY0 + dy, KX1, KY1 + dy)
        x = KX0 + 40
        yazi(c, (x, KY0 + 55 + dy), 'Şu an ne kadar açsın?', F(34, 800), INK, a, 'lm')
        k1 = chip_sira(c, x, KY0 + 90 + dy, ['Az açım', 'Orta', 'Çok açım'], 2 if t >= T_ACLIK else 1, a)
        yazi(c, (x, KY0 + 215 + dy), 'Canın ne çekiyor?', F(34, 800), INK, a, 'lm')
        k2 = chip_sira(c, x, KY0 + 250 + dy, ['Fark etmez', 'Tuzlu', 'Tatlı'], 1 if t >= T_TAT else 0, a)
        dokunus(c, *k1[2], t - T_ACLIK); dokunus(c, *k2[1], t - T_TAT)
        ah = eo((t - 2.3) / 0.3)
        d = ImageDraw.Draw(c)
        if ah > 0:
            d.line([(x, KY0 + 370), (KX1 - 40, KY0 + 370)], fill=LINE, width=3)
            yazi(c, (x, KY0 + 415), 'En uzun tok tutanlar', F(30, 800), TEAL, ah, 'lm')
        for i, slug in enumerate(SONUC):
            ai = eo((t - 2.45 - 0.2 * i) / 0.35)
            if ai <= 0: continue
            yv = Y[slug]; L = lig(yv['d']); w = KX1 - KX0 - 80
            im, k = katman(w, 122)
            k.rounded_rectangle((0, 0, w - 1, 121), radius=24, fill=CARD, outline=LINE, width=2)
            ph = foto(slug, 92, 92, 22); im.paste(ph, (15, 15), ph)
            k.text((128, 42), yv['ad'], font=F(34, 800), fill=INK, anchor='lm')
            k.text((128, 86), f"{yv['kcal']} kcal", font=F(28, 700), fill=MUTED, anchor='lm')
            hap(k, 262, 67, f"{yv['p']} g protein", F(26, 800), WASH, TEAL, pad=(16, 7))
            k.rounded_rectangle((w - 92, 27, w - 24, 95), radius=16, fill=LIG[L])
            k.text((w - 58, 61), L, font=B(48), fill=BEYAZ, anchor='mm')
            koy(c, im, x + 50 * (1 - ai), KY0 + 450 + i * 134, ai)
    return bitis_karart(c, t, sure)

def ses_yesem(sure):
    ol = [(0.0, sesler.vuus(), 0.5), (0.15, sesler.vuus(0.35), 0.4),
          (T_ACLIK, sesler.tik(True), 1.0), (T_TAT, sesler.tik(True), 1.0), (2.3, sesler.vuus(0.25), 0.4)]
    ol += [(2.45 + 0.2 * i, sesler.pop(), 0.55) for i in range(3)]
    return ol

# ================= SAHNE 5: protein =================
P_KILO, P_BOY, P_K = 75, 180, 1.5          # P_DURUM 'spor' katsayısı
P_HEDEF = math.floor(P_KILO * P_K + 0.5)   # JS Math.round gibi: 113 g
VKI = P_KILO / (P_BOY / 100) ** 2          # 23,1
T_SAY0, T_SAY1, T_VKI = 1.25, 2.55, 2.85

def sahne_protein(t, sure):
    c = Image.new('RGB', (W, H), FOREST)
    baslik(c, t, '03 · PROTEİN', 'Günde kaç gram protein', 'lazım? Hesapla.')
    a, dy = kart_giris(t)
    if a > 0:
        golge_kart(c, KX0, KY0 + dy, KX1, KY1 + dy)
        x = KX0 + 40; d = ImageDraw.Draw(c)
        for i, (lab, val) in enumerate((('Kilo', f'{P_KILO} kg'), ('Boy', f'{P_BOY} cm'), ('Yaş', '30'))):
            bx = x + i * 260; w = 240
            im, k = katman(w, 120)
            k.rounded_rectangle((0, 0, w - 1, 119), radius=22, fill=CARD, outline=LINE, width=2)
            k.text((22, 32), lab, font=F(26, 700), fill=MUTED, anchor='lm')
            k.text((22, 82), val, font=F(40, 800), fill=INK, anchor='lm')
            koy(c, im, bx, KY0 + 40 + dy, a)
        im, k = katman(KX1 - KX0 - 80, 80)
        k.rounded_rectangle((0, 0, KX1 - KX0 - 81, 79), radius=40, fill=FOREST)
        k.text((40, 40), 'Düzenli spor yapıyorum', font=F(32, 800), fill=LIME, anchor='lm')
        koy(c, im, x, KY0 + 190 + dy, a)
        # sonuç kutusu
        ar = eo((t - 0.95) / 0.35)
        if ar > 0:
            ry0 = KY0 + 300; ry1 = ry0 + 330
            im, k = katman(KX1 - KX0 - 80, ry1 - ry0)
            k.rounded_rectangle((0, 0, im.width - 1, im.height - 1), radius=32, fill=FOREST)
            k.text((im.width / 2, 58), 'Günlük protein hedefin', font=F(32, 700), fill=(176, 196, 182), anchor='mm')
            v = int(round(P_HEDEF * eo((t - T_SAY0) / (T_SAY1 - T_SAY0)))) if t > T_SAY0 else 0
            sayi = str(v); fs = B(190)
            sw = k.textlength(sayi, font=fs); gw = k.textlength(' g', font=B(90))
            sx = im.width / 2 - (sw + gw) / 2
            k.text((sx, 205), sayi, font=fs, fill=LIME, anchor='lm')
            k.text((sx + sw, 228), ' g', font=B(90), fill=LIME, anchor='lm')
            k.text((im.width / 2, 296), f'{P_KILO} kg × {sy(P_K)} g', font=F(28, 700), fill=(176, 196, 182), anchor='mm')
            koy(c, im, x, ry0 + 40 * (1 - ar), ar)
        # VKİ cetveli
        av = eo((t - T_VKI) / 0.35)
        if av > 0:
            vy = KY0 + 680; w = KX1 - KX0 - 80
            im, k = katman(w, 150)
            k.text((0, 22), 'VKİ', font=F(30, 800), fill=INK, anchor='lm')
            k.text((70, 22), sy(round(VKI, 1)) + ' · Normal', font=F(30, 800), fill=TEAL, anchor='lm')
            # 15–35 aralığı, sınırlar 18,5 / 25 / 30
            def px(v): return int((v - 15) / 20 * (w - 1))
            for (v0, v1, renk) in ((15, 18.5, (127, 166, 196)), (18.5, 25, LIG['S']), (25, 30, LIG['B']), (30, 35, LIG['D'])):
                k.rectangle((px(v0), 62, px(v1), 92), fill=renk)
            for v in (18.5, 25, 30):
                k.text((px(v), 120), sy(v), font=F(24, 700), fill=MUTED, anchor='mm')
            m = 15 + (VKI - 15) * eo((t - T_VKI - 0.1) / 0.6)
            mx = px(m)
            k.polygon([(mx - 16, 40), (mx + 16, 40), (mx, 62)], fill=INK)
            k.rectangle((mx - 3, 58, mx + 3, 96), fill=INK)
            koy(c, im, x, vy + 30 * (1 - av), av)
    return bitis_karart(c, t, sure)

def ses_protein(sure):
    ol = [(0.0, sesler.vuus(), 0.5), (0.15, sesler.vuus(0.35), 0.4), (0.95, sesler.pop(), 0.6)]
    n = 14
    for i in range(n):
        tt = T_SAY0 + (T_SAY1 - T_SAY0) * (1 - (1 - (i + 0.5) / n) ** 0.6) * 0.98
        ol.append((tt, sesler.tik(i % 2 == 0), 0.5))
    ol += [(T_SAY1, sesler.ding(), 0.8), (T_VKI, sesler.vuus(0.3), 0.4), (T_VKI + 0.7, sesler.pop(), 0.5)]
    return ol

# ================= SAHNE 6: Meclis-i Mide =================
SAATLER = ['30 dk', '1 sa', '2 sa', '3 sa', '4 sa', '5 sa', '6+ sa']
T_OY = 1.75

def sahne_meclis(t, sure):
    c = Image.new('RGB', (W, H), FOREST)
    baslik(c, t, '04 · MECLİS-İ MİDE', 'Hesaba katılmıyor musun?', 'Oyunu ver.')
    a, dy = kart_giris(t)
    if a > 0:
        golge_kart(c, KX0, KY0 + dy, KX1, KY1 + dy)
        x = KX0 + 40; w = KX1 - KX0 - 80
        ph = foto('tarhana-corbasi', w, 300, 30); koy(c, ph, x, KY0 + 40 + dy, a)
        im, k = katman(w, 70); hap(k, 0, 0, 'Hesap: 2,5 saat', F(30, 800), FOREST, LIME, pad=(20, 11))
        koy(c, im, x + 20, KY0 + 60 + dy, a)
        yazi(c, (x, KY0 + 395 + dy), 'Tarhana çorbası', F(44, 800), INK, a, 'lm')
        yazi(c, (x, KY0 + 450 + dy), 'seni kaç saat tuttu?', F(36, 700), MUTED, a, 'lm')
        bw, bh, g = (w - 3 * 14) / 4, 92, 14
        sec = 4 if t >= T_OY else -1
        konum = None
        for i, ad in enumerate(SAATLER):
            r, s = divmod(i, 4)
            bx = x + s * (bw + g); by = KY0 + 510 + r * (bh + g)
            ai = eo((t - 0.6 - 0.06 * i) / 0.3)
            im, k = katman(bw, bh)
            on = i == sec
            k.rounded_rectangle((0, 0, bw - 1, bh - 1), radius=20, fill=LIME if on else FOREST)
            k.text((bw / 2, bh / 2), ad, font=F(32, 800), fill=FOREST if on else BEYAZ, anchor='mm')
            if on and t - T_OY < 0.3:
                kk = 1 + 0.08 * math.sin(clamp((t - T_OY) / 0.3) * math.pi)
                im = im.resize((int(bw * kk), int(bh * kk)), Image.LANCZOS); bx -= (im.width - bw) / 2; by -= (im.height - bh) / 2
            koy(c, im, bx, by + 20 * (1 - ai), ai * a)
            if i == 4: konum = (x + s * (bw + g) + bw / 2, KY0 + 510 + r * (bh + g) + bh / 2)
        dokunus(c, *konum, t - T_OY)
        ak = eo((t - T_OY - 0.25) / 0.3)
        if ak > 0:
            yesil = (30, 122, 76); cy = KY0 + 760
            im, k = katman(w, 70)
            tik_ikon(k, 30, 35, 18, yesil, 8)
            k.text((66, 35), 'Kaydedildi. Hesap 2,5 dedi, sen 4.', font=F(32, 800), fill=yesil, anchor='lm')
            koy(c, im, x, cy, ak)
    return bitis_karart(c, t, sure)

def ses_meclis(sure):
    ol = [(0.0, sesler.vuus(), 0.5), (0.15, sesler.vuus(0.35), 0.4)]
    ol += [(0.6 + 0.06 * i, sesler.tik(False), 0.25) for i in range(7)]
    ol += [(T_OY, sesler.tik(True), 1.0), (T_OY + 0.25, sesler.ding(), 0.7)]
    return ol

# ================= SAHNE 7: Tok Plan =================
OGUNLER = [('Kahvaltı', 'menemen'), ('Öğle', 'kuru-fasulye'), ('Akşam', 'izgara-kofte')]
LISTE = ['Yumurta · 6 adet', 'Kuru fasulye · 500 g', 'Kıyma · 400 g']
T_LISTE = 2.35

def sahne_plan(t, sure):
    c = Image.new('RGB', (W, H), FOREST)
    baslik(c, t, '05 · TOK PLAN', 'Kendi yediklerinden', 'haftalık plan.')
    a, dy = kart_giris(t)
    if a > 0:
        golge_kart(c, KX0, KY0 + dy, KX1, KY1 + dy)
        x = KX0 + 40; w = KX1 - KX0 - 80
        gunler = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
        gw = (w - 6 * 10) / 7
        im, k = katman(w, 80)
        for i, g in enumerate(gunler):
            on = i == 0; gx = i * (gw + 10)
            k.rounded_rectangle((gx, 0, gx + gw, 76), radius=20, fill=FOREST if on else CARD, outline=None if on else LINE, width=2)
            k.text((gx + gw / 2, 38), g, font=F(28, 800), fill=LIME if on else INK, anchor='mm')
        koy(c, im, x, KY0 + 40 + dy, a)
        for i, (og, slug) in enumerate(OGUNLER):
            ai = eo((t - 0.6 - 0.2 * i) / 0.35)
            if ai <= 0: continue
            yv = Y[slug]
            im, k = katman(w, 128)
            k.rounded_rectangle((0, 0, w - 1, 127), radius=24, fill=CARD, outline=LINE, width=2)
            ph = foto(slug, 96, 96, 22); im.paste(ph, (16, 16), ph)
            k.text((132, 40), og.upper(), font=F(24, 800), fill=TEAL, anchor='lm')
            k.text((132, 86), yv['ad'], font=F(36, 800), fill=INK, anchor='lm')
            k.text((w - 24, 64), f"{yv['kcal']} kcal", font=F(30, 700), fill=MUTED, anchor='rm')
            koy(c, im, x + 50 * (1 - ai), KY0 + 145 + i * 140, ai)
        al = eo((t - T_LISTE) / 0.4)
        if al > 0:
            ly0 = KY0 + 580; lh = 250
            im, k = katman(w, lh)
            k.rounded_rectangle((0, 0, w - 1, lh - 1), radius=26, fill=FOREST)
            k.text((28, 42), 'Alışveriş listesi', font=F(32, 800), fill=LIME, anchor='lm')
            for j, s in enumerate(LISTE):
                ty = 98 + j * 56; tt = t - (T_LISTE + 0.5 + 0.3 * j)
                k.rounded_rectangle((28, ty - 20, 68, ty + 20), radius=10, fill=LIME if tt >= 0 else None, outline=LIME, width=3)
                if tt >= 0: tik_ikon(k, 48, ty, 11, FOREST, 5)
                k.text((90, ty), s, font=F(30, 700), fill=BEYAZ if tt < 0 else (176, 196, 182), anchor='lm')
            koy(c, im, x, ly0 + 60 * (1 - al), al)
    return bitis_karart(c, t, sure)

def ses_plan(sure):
    ol = [(0.0, sesler.vuus(), 0.5), (0.15, sesler.vuus(0.35), 0.4)]
    ol += [(0.6 + 0.2 * i, sesler.pop(), 0.55) for i in range(3)]
    ol += [(T_LISTE, sesler.vuus(0.3), 0.5)]
    ol += [(T_LISTE + 0.5 + 0.3 * j, sesler.tik(True), 0.8) for j in range(3)]
    return ol

# ================= SAHNE 8: kapanış =================
def sahne_son(t, sure):
    c = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(c)
    a0 = eo(t / 0.3)
    if a0 < 1: c = Image.blend(Image.new('RGB', (W, H), FOREST), c, a0); d = ImageDraw.Draw(c)
    a1 = eo((t - 0.1) / 0.35)
    yazi(c, (W / 2, 520 + 24 * (1 - a1)), 'Bugün ne yiyeceksin?', B(78), FOREST, a1, 'mm')
    a2 = eo((t - 0.4) / 0.35)
    f = B(78); s = 'Önce tokluğuna bak.'; w = d.textlength(s, font=f)
    im, k = katman(w + 56, 110); k.rounded_rectangle((0, 0, w + 55, 109), radius=22, fill=LIME)
    k.text((28 + w / 2, 55), s, font=f, fill=FOREST, anchor='mm')
    koy(c, im, W / 2 - w / 2 - 28, 590 + 24 * (1 - a2), a2)
    a3 = eo((t - 0.9) / 0.4)
    if a3 > 0:
        kk = 0.9 + 0.1 * back((t - 0.9) / 0.4)
        f = B(96); w = d.textlength('platerank.dev', font=f) + 100
        im, k = katman(w, 170); k.rounded_rectangle((0, 0, w - 1, 169), radius=36, fill=FOREST)
        k.text((w / 2, 85), 'platerank.dev', font=f, fill=LIME, anchor='mm')
        im = im.resize((int(im.width * kk), int(im.height * kk)), Image.LANCZOS)
        koy(c, im, W / 2 - im.width / 2, 900 - im.height / 2, a3)
    a4 = eo((t - 1.4) / 0.35)
    yazi(c, (W / 2, 1060), 'Ücretsiz. Üyelik şart değil.', F(44, 800), FOREST, a4, 'mm')
    yazi(c, (W / 2, 1125), 'Link profilde', F(38, 700), MUTED, a4, 'mm')
    return c

def ses_son(sure):
    return [(0.0, sesler.vuus(0.4), 0.6), (0.4, sesler.pop(), 0.6), (0.9, sesler.gum(), 0.7),
            (0.95, sesler.zafer(), 0.7), (1.4, sesler.pop(), 0.5)]

SAHNELER = [
    ('kanca', sahne_kanca, ses_kanca, 5.0),
    ('marka', sahne_marka, ses_marka, 3.4),
    ('lig', sahne_lig, ses_lig, 4.8),
    ('yesem', sahne_yesem, ses_yesem, 4.9),
    ('protein', sahne_protein, ses_protein, 5.0),
    ('meclis', sahne_meclis, ses_meclis, 4.7),
    ('plan', sahne_plan, ses_plan, 4.9),
    ('son', sahne_son, ses_son, 4.2),
]

def kare(ad, t):
    for a, fn, _, sure in SAHNELER:
        if a == ad: return fn(t, sure)

def render_sahne(i):
    ad, fn, _, sure = SAHNELER[i]
    yol = os.path.join(GECICI, f'{i:02d}-{ad}.mp4'); tmp = yol[:-4] + '.tmp.mp4'
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                           '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18',
                           '-pix_fmt', 'yuv420p', '-r', str(FPS), tmp], stdin=subprocess.PIPE)
    n = int(round(sure * FPS))
    for j in range(n): ff.stdin.write(fn(j / FPS, sure).convert('RGB').tobytes())
    ff.stdin.close()
    if ff.wait() != 0: raise RuntimeError(ad)
    os.replace(tmp, yol); return yol

def ses_yaz(yol):
    ol = []; t0 = 0
    for ad, _, sf, sure in SAHNELER:
        ol += [(t0 + s, x, k) for s, x, k in sf(sure)]; t0 += round(sure * FPS) / FPS
    sesler.miks(ol, t0, yol); return t0

if __name__ == '__main__':
    os.makedirs(GECICI, exist_ok=True)
    if len(sys.argv) > 2 and sys.argv[1] == 'kare':   # kare <sahne> <saniye> <cikti.png>
        kare(sys.argv[2], float(sys.argv[3])).save(sys.argv[4]); sys.exit()
    with ProcessPoolExecutor(max_workers=int(os.environ.get('IS', '2'))) as ex:
        dosyalar = list(ex.map(render_sahne, range(len(SAHNELER))))
    liste = os.path.join(GECICI, 'liste.txt')
    with open(liste, 'w') as f:
        for y in dosyalar: f.write(f"file '{y}'\n")
    sessiz = os.path.join(GECICI, 'goruntu.mp4'); ses = os.path.join(GECICI, 'ses.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', liste, '-c', 'copy', sessiz], check=True)
    sure = ses_yaz(ses)
    os.makedirs(os.path.dirname(CIKTI), exist_ok=True)
    tmp = CIKTI[:-4] + '.tmp.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', sessiz, '-i', ses, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                    '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', tmp], check=True)
    os.replace(tmp, CIKTI)
    print(CIKTI, f'{sure:.1f} sn')
