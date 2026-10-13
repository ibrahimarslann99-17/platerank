#!/usr/bin/env python3
"""Pinterest pinleri: 1000x1500 dikey görsel + toplu yükleme CSV'si.
Girdi: aşağıdaki YEMEKLER listesi (ad, mutfak, kcal, doyuruculuk, protein, lif, tür), img/yemek/<slug>.webp
Çıktı: img/pin/<slug>.jpg ve "Claude outputs/pinterest-parti-1.csv"
Pin linki /yemek/<slug> sayfasına gider; slug api/_veri.js'teki slugla ile aynı.
"""
import csv, os, re, unicodedata, datetime
from PIL import Image, ImageDraw, ImageFont, ImageOps

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FD = '/usr/share/fonts/truetype/google-fonts/'
def F(w, s): return ImageFont.truetype(FD + f'Poppins-{w}.ttf', s)

PAPER = (230, 239, 232); FOREST = (14, 34, 23); LIME = (213, 236, 98); BEYAZ = (255, 255, 255)
SOLUK = (176, 196, 182)
LIG = {'S': (30, 122, 76), 'A': (90, 145, 53), 'B': (194, 150, 27), 'C': (208, 108, 40), 'D': (191, 59, 56)}
HUKUM = {'S': 'EVET, HEM DE ÇOK', 'A': 'EVET', 'B': 'ORTA', 'C': 'PEK DEĞİL', 'D': 'HAYIR'}
HUKUM_UZUN = {'S': 'Evet, hem de çok. Az kaloriyle uzun süre tok tutan yemeklerden.',
              'A': 'Evet. Kalorisine göre güvenilir bir tokluk verir.',
              'B': 'Orta. Kalorisi karşılığında ortalama bir tokluk verir.',
              'C': 'Pek değil. Kalorisine göre çabuk acıktırır.',
              'D': 'Hayır. Kalorisi tokluğundan büyük; yersin ama doymazsın.'}
PANO = {'corba': 'Doyurucu çorbalar', 'kahvalti': 'Doyurucu kahvaltılıklar', 'tatli': 'Tatlılar tok tutar mı?'}
PANO_VARSAYILAN = 'Tok tutar mı? Türk yemekleri'
W, H = 1000, 1500

TR = str.maketrans({'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u',
                    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'I': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u', '&': ' ve '})
def slugla(s):
    s = s.translate(TR).lower()
    s = unicodedata.normalize('NFKD', s); s = ''.join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"['’]", '', s); s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

def lig(p):
    return 'S' if p >= 200 else 'A' if p >= 150 else 'B' if p >= 100 else 'C' if p >= 70 else 'D'

def tok_saat(d, p, l):  # index.html acikmaSuresi ile aynı
    s = 1 + (d / 280) * 3.2 + p * 0.02 + l * 0.05
    s = max(1, min(5, s)); return round(s * 2) / 2

def saat_yaz(t): return (str(int(t)) if t == int(t) else str(t).replace('.', ',')) + ' sa'

def bas_ve_alt(ad):
    m = re.match(r'^(.*?)\s*\((.*)\)\s*$', ad)
    return (m.group(1), m.group(2)) if m else (ad, None)

def sar(d, metin, font, gen):
    out, s = [], ''
    for k in metin.split():
        t = (s + ' ' + k).strip()
        if d.textlength(t, font=font) <= gen: s = t
        else: out.append(s); s = k
    if s: out.append(s)
    return out

def yuvarlak_yapistir(im, foto, xy, r):
    m = Image.new('L', foto.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, foto.width - 1, foto.height - 1), radius=r, fill=255)
    im.paste(foto, xy, m)

def pin(y, cikti):
    ad, mutfak, kcal, d_, p, lif, tur = y
    L = lig(d_); bas, alt = bas_ve_alt(ad); t = tok_saat(d_, p, lif)
    im = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(im)
    foto = ImageOps.fit(Image.open(os.path.join(KOK, 'img', 'yemek', slugla(ad) + '.webp')).convert('RGB'), (920, 700), Image.LANCZOS)
    yuvarlak_yapistir(im, foto, (40, 40), 36)
    # lig rozeti
    d.ellipse((70, 70, 210, 210), fill=LIG[L], outline=BEYAZ, width=6)
    d.text((140, 132), L, font=F('Bold', 84), fill=BEYAZ, anchor='mm')
    d.text((140, 186), 'LİGİ', font=F('Bold', 20), fill=BEYAZ, anchor='mm')
    # alt panel
    d.rounded_rectangle((40, 770, 960, 1460), radius=36, fill=FOREST)
    x0 = 90
    d.text((x0, 820), 'TOK TUTAR MI?', font=F('Bold', 34), fill=LIME, anchor='lm')
    # başlık: sığana kadar küçült, en fazla 2 satır
    # en büyük boy: en fazla 2 satır ve hüküm hapı kutuların üstünde (1220) bitecek
    for boy in (92, 84, 76, 68, 60, 54):
        f = F('Bold', boy); satir = sar(d, bas, f, 820)
        alt_y = 880 + len(satir[:2]) * int(boy * 1.12) + (46 if alt else 0) + 24 + 92
        if len(satir) <= 2 and alt_y <= 1220: break
    y0 = 880
    for s in satir[:2]:
        d.text((x0, y0), s, font=f, fill=BEYAZ, anchor='lt'); y0 += int(boy * 1.12)
    if alt:
        d.text((x0, y0 + 4), alt, font=F('Medium', 30), fill=SOLUK, anchor='lt'); y0 += 46
    # hüküm hapı
    y0 += 24
    hk = HUKUM[L]; fh = F('Bold', 54); w = d.textlength(hk, font=fh) + 64
    d.rounded_rectangle((x0, y0, x0 + w, y0 + 92), radius=46, fill=LIG[L])
    d.text((x0 + w / 2, y0 + 47), hk, font=fh, fill=BEYAZ, anchor='mm')
    # üç kutu
    yk = 1250; kw = (820 - 2 * 20) / 3
    for i, (b, a) in enumerate([(f'{kcal}', 'kcal'), (f'{p} g', 'protein'), ('~' + saat_yaz(t), 'tok tutar')]):
        kx = x0 + i * (kw + 20)
        d.rounded_rectangle((kx, yk, kx + kw, yk + 120), radius=22, fill=(30, 54, 39))
        d.text((kx + kw / 2, yk + 48), b, font=F('Bold', 42), fill=BEYAZ, anchor='mm')
        d.text((kx + kw / 2, yk + 94), a, font=F('Medium', 24), fill=SOLUK, anchor='mm')
    d.text((x0, 1412), 'platerank.dev', font=F('Bold', 32), fill=LIME, anchor='lm')
    d.text((910, 1412), 'kalori başına tokluk', font=F('Medium', 26), fill=SOLUK, anchor='rm')
    im.save(cikti, 'JPEG', quality=86, optimize=True, progressive=True)
    return L, t

def aciklama(y, L, t):
    ad, mutfak, kcal, d_, p, lif, tur = y
    bas, alt = bas_ve_alt(ad)
    por = f' ({alt})' if alt else ''
    return (f'{bas} kaç kalori, tok tutar mı? {bas}{por}: {kcal} kcal, {p} g protein, {lif} g lif. '
            f'{HUKUM_UZUN[L]} Doyuruculuk puanı {d_} ({L} ligi), tahmini tokluk ~{saat_yaz(t)}. '
            f'Aynı kaloride daha tok tutan alternatifler platerank.dev\'de.')

YEMEKLER = [
 ("Mercimek çorbası","tr",150,250,9,6,"corba"), ("Kumpir (orta boy, karışık)","tr",650,58,14,7,"ana"),
 ("Menemen","tr",220,190,11,3,"kahvalti"), ("Baklava","tr",330,50,5,1,"tatli"),
 ("Lahmacun","tr",280,115,12,2,"ana"), ("Haşlanmış yumurta","tr",78,159,6,0,"kahvalti"),
 ("Simit","tr",300,85,9,3,"kahvalti"), ("Kuru fasulye","tr",230,228,14,10,"ana"),
 ("Kokoreç (yarım ekmek)","tr",450,105,24,2,"ana"), ("Ezogelin çorbası","tr",140,245,8,5,"corba"),
 ("Künefe","tr",450,58,10,1,"tatli"), ("Izgara tavuk göğsü","tr",165,235,31,0,"ana"),
 ("İskender","tr",550,82,28,2,"ana"), ("Cacık","tr",90,220,4,1,"kahvalti"),
 ("Serpme kahvaltı tabağı (kişi başı)","tr",850,60,28,6,"kahvalti"), ("Yayla çorbası","tr",120,245,6,1,"corba"),
 ("Mantı (yoğurtlu)","tr",450,105,18,3,"ana"), ("Sucuklu yumurta","tr",380,150,22,0,"kahvalti"),
 ("Islak hamburger (1 adet)","tr",330,105,12,2,"ana"), ("Nohut yemeği","tr",270,180,13,9,"ana"),
 ("Tavuk döner dürüm","tr",450,80,25,2,"ana"), ("Haşlanmış patates","hm",160,280,3,4,"ana"),
 ("Kaşarlı tost","tr",400,110,20,2,"kahvalti"), ("Sütlaç","tr",220,90,6,0,"tatli"),
 ("Adana kebap","tr",400,140,28,1,"ana"), ("Tarhana çorbası","tr",150,240,5,3,"corba"),
 ("Karışık pide","tr",650,55,28,3,"ana"), ("Kısır","tr",230,150,6,6,"salata"),
 ("Balık ekmek","tr",420,140,26,3,"ana"), ("Poğaça (peynirli)","tr",330,80,8,2,"kahvalti"),
 ("Midye dolma (6 adet)","tr",280,120,10,2,"atistirmalik"), ("Yulaf lapası (sütlü)","hm",250,230,11,5,"kahvalti"),
 ("Karnıyarık","tr",320,110,10,5,"ana"), ("Trileçe (1 dilim)","tr",280,70,5,0,"tatli"),
 ("Çiğ köfte (etsiz)","tr",280,150,8,8,"ana"), ("Humus (1 porsiyon)","tr",220,175,7,6,"atistirmalik"),
 ("Tantuni dürüm","tr",420,110,22,2,"ana"), ("Mercimek köftesi (6 adet)","tr",250,190,10,8,"atistirmalik"),
 ("Kumru","tr",480,100,19,3,"ana"), ("İşkembe çorbası","tr",180,215,14,0,"corba"),
 ("Su böreği","tr",350,75,12,1,"atistirmalik"), ("Çılbır (2 yumurta)","tr",300,160,16,0,"kahvalti"),
 ("Et döner dürüm (dana/kuzu)","tr",480,113,24,2,"ana"), ("Ayran","tr",65,300,3,0,"icecek"),
 ("Gözleme (patatesli)","tr",320,106,8,2,"kahvalti"), ("Izgara köfte","tr",350,150,26,1,"ana"),
 ("Profiterol (1 porsiyon)","tr",380,50,6,1,"tatli"), ("Tavuklu pilav (sokak, 1 porsiyon)","tr",480,125,26,2,"ana"),
 ("Ayvalık tostu","tr",520,95,20,3,"ana"), ("Muz (1 orta)","tr",105,185,1,3,"atistirmalik"),
 ("Mıhlama","tr",420,120,16,0,"kahvalti"), ("San Sebastian cheesecake (1 dilim)","tr",420,52,8,0,"tatli"),
 ("İçli köfte (2 adet)","tr",340,100,14,3,"atistirmalik"), ("Pilav üstü tavuk","tr",520,130,32,2,"ana"),
 ("Açma","tr",280,80,7,2,"kahvalti"), ("Tavuklu sezar salata","tr",420,165,32,3,"salata"),
 ("Kıymalı pide","tr",600,60,25,3,"ana"), ("Mercimek salatası","tr",220,198,11,9,"salata"),
]

if __name__ == '__main__':
    os.makedirs(os.path.join(KOK, 'img', 'pin'), exist_ok=True)
    satirlar, eksik = [], []
    bas_gun = datetime.date(2026, 10, 14); saatler = ['07:00', '10:00', '13:00', '16:00', '18:00', '20:00']  # UTC = TR-3
    for y in YEMEKLER:
        s = slugla(y[0])
        if not os.path.exists(os.path.join(KOK, 'img', 'yemek', s + '.webp')): eksik.append(y[0]); continue
        L, t = pin(y, os.path.join(KOK, 'img', 'pin', s + '.jpg'))
        i = len(satirlar); gun = bas_gun + datetime.timedelta(days=i // len(saatler))
        bas, _ = bas_ve_alt(y[0])
        satirlar.append({
            'Title': f'{bas} tok tutar mı? Kaç kalori?'[:100],
            'Media URL': f'https://platerank.dev/img/pin/{s}.jpg',
            'Pinterest board': PANO.get(y[6], PANO_VARSAYILAN),
            'Thumbnail': '',
            'Description': aciklama(y, L, t)[:500],
            'Link': f'https://platerank.dev/yemek/{s}?utm_source=pinterest',
            'Publish date': f'{gun.isoformat()}T{saatler[i % len(saatler)]}:00',
            'Keywords': f'{bas.lower()} kalori, {bas.lower()} tok tutar mı, doyurucu yemekler, diyet, tokluk',
        })
    yol = os.path.join(KOK, 'Claude outputs', 'pinterest-parti-1.csv')
    with open(yol, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=list(satirlar[0].keys())); w.writeheader(); w.writerows(satirlar)
    print(len(satirlar), 'pin; görseli olmayan:', eksik)
