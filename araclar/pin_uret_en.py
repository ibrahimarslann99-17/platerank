#!/usr/bin/env python3
"""İngilizce Pinterest pinleri: 1000x1500 görsel + toplu yükleme CSV'si.
Girdi: araclar/pin_en_secim.json (tek yemekler + karşılaştırma çiftleri; İngilizce site verisinden üretildi),
       img/yemek/<türkçe slug>.webp
Çıktı: img/pin/en/food-<slug>.jpg, img/pin/en/vs-<a>-vs-<b>.jpg ve "Claude outputs/pinterest-en-parti-1.csv"
Tasarım Türkçe pin_uret.py ile aynı (orman yeşili panel, lime vurgu, Poppins).
"""
import csv, json, os, datetime
from PIL import Image, ImageDraw, ImageFont, ImageOps

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FD = '/usr/share/fonts/truetype/google-fonts/'
def F(w, s): return ImageFont.truetype(FD + f'Poppins-{w}.ttf', s)

PAPER = (230, 239, 232); FOREST = (14, 34, 23); LIME = (213, 236, 98); BEYAZ = (255, 255, 255)
SOLUK = (176, 196, 182); KUTU = (30, 54, 39)
LIG = {'S': (30, 122, 76), 'A': (90, 145, 53), 'B': (194, 150, 27), 'C': (208, 108, 40), 'D': (191, 59, 56)}
HUKUM = {'S': 'YES, VERY', 'A': 'YES', 'B': 'SOMEWHAT', 'C': 'NOT REALLY', 'D': 'NO'}
HUKUM_UZUN = {'S': 'Yes, very. It keeps you full for a long time on few calories.',
              'A': 'Yes. It gives reliable fullness for its calories.',
              'B': 'Somewhat. It gives average fullness for its calories.',
              'C': 'Not really. For its calories, it leaves you hungry fast.',
              'D': "No. Its calories outweigh its fullness: you eat it but you don't feel full."}
PANO_TEK = 'Most Filling Foods'
PANO_VS = 'Which Keeps You Full Longer?'
W, H = 1000, 1500
SITE = 'https://platerank.dev'

def saat(t): return str(int(t)) if t == int(t) else f'{t:.1f}'

def sar(d, metin, font, gen):
    out, s = [], ''
    for k in metin.split():
        t = (s + ' ' + k).strip()
        if d.textlength(t, font=font) <= gen: s = t
        else:
            if s: out.append(s)
            s = k
    if s: out.append(s)
    return out

def sigdir(d, metin, gen, boylar, satir_max):
    for boy in boylar:
        f = F('Bold', boy); s = sar(d, metin, f, gen)
        if len(s) <= satir_max: return f, boy, s
    return f, boy, s[:satir_max]

def foto(y, boyut):
    im = Image.open(os.path.join(KOK, 'img', 'yemek', y['tr'] + '.webp')).convert('RGB')
    return ImageOps.fit(im, boyut, Image.LANCZOS)

def yuvarlak_yapistir(im, ft, xy, r):
    m = Image.new('L', ft.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, ft.width - 1, ft.height - 1), radius=r, fill=255)
    im.paste(ft, xy, m)

def alt_bilgi(d, sag):
    d.text((90, 1412), 'platerank.dev', font=F('Bold', 32), fill=LIME, anchor='lm')
    d.text((910, 1412), sag, font=F('Medium', 26), fill=SOLUK, anchor='rm')

# ---------- tek yemek ----------

def pin_tek(y, cikti):
    L = y['lig']
    im = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(im)
    yuvarlak_yapistir(im, foto(y, (920, 700)), (40, 40), 36)
    d.ellipse((70, 70, 210, 210), fill=LIG[L], outline=BEYAZ, width=6)
    d.text((140, 128), L, font=F('Bold', 84), fill=BEYAZ, anchor='mm')
    d.text((140, 186), 'TIER', font=F('Bold', 20), fill=BEYAZ, anchor='mm')
    d.rounded_rectangle((40, 770, 960, 1460), radius=36, fill=FOREST)
    x0 = 90
    d.text((x0, 820), 'DOES IT KEEP YOU FULL?', font=F('Bold', 34), fill=LIME, anchor='lm')
    alt = y['porsiyon'] or y['tanim']
    for boy in (92, 84, 76, 68, 60, 54):
        f = F('Bold', boy); satir = sar(d, y['ad'], f, 820)
        bitis = 880 + len(satir[:2]) * int(boy * 1.12) + (46 if alt else 0) + 24 + 92
        if len(satir) <= 2 and bitis <= 1220: break
    y0 = 880
    for s in satir[:2]:
        d.text((x0, y0), s, font=f, fill=BEYAZ, anchor='lt'); y0 += int(boy * 1.12)
    if alt:
        d.text((x0, y0 + 4), alt, font=F('Medium', 30), fill=SOLUK, anchor='lt'); y0 += 46
    y0 += 24
    hk = HUKUM[L]; fh = F('Bold', 54); w = d.textlength(hk, font=fh) + 64
    d.rounded_rectangle((x0, y0, x0 + w, y0 + 92), radius=46, fill=LIG[L])
    d.text((x0 + w / 2, y0 + 47), hk, font=fh, fill=BEYAZ, anchor='mm')
    yk = 1250; kw = (820 - 2 * 20) / 3
    for i, (b, a) in enumerate([(f"{y['kcal']}", 'kcal'), (f"{y['protein']} g", 'protein'), (f"~{saat(y['saat'])} h", 'keeps you full')]):
        kx = x0 + i * (kw + 20)
        d.rounded_rectangle((kx, yk, kx + kw, yk + 120), radius=22, fill=KUTU)
        d.text((kx + kw / 2, yk + 48), b, font=F('Bold', 42), fill=BEYAZ, anchor='mm')
        d.text((kx + kw / 2, yk + 94), a, font=F('Medium', 24), fill=SOLUK, anchor='mm')
    alt_bilgi(d, 'satiety per calorie')
    im.save(cikti, 'JPEG', quality=86, optimize=True, progressive=True)

# ---------- karşılaştırma ----------

def vs_sonuc(a, b, kazanan):
    if kazanan is None:
        h, l = (a, b) if a['kcal'] <= b['kcal'] else (b, a)
        if l['kcal'] - h['kcal'] >= 50:
            return f"Same {saat(a['saat'])} hours, but {h['ad']} does it with {l['kcal'] - h['kcal']} fewer kcal."
        return f"It's a tie: about {saat(a['saat'])} hours each."
    z = b if kazanan is a else a
    fark = abs(a['saat'] - b['saat'])
    s = f"{kazanan['ad']} wins by {saat(fark)} hour{'s' if fark != 1 else ''}"
    return s + (f", with {z['kcal'] - kazanan['kcal']} fewer kcal." if kazanan['kcal'] < z['kcal'] else '.')

def pin_vs(c, cikti):
    a, b = c['a'], c['b']
    berabere = a['saat'] == b['saat']
    kazanan = None if berabere else (a if a['saat'] > b['saat'] else b)
    im = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(im)
    x0, gen = 90, 820
    sonuc = vs_sonuc(a, b, kazanan)
    # içerik yüksekliğini önce ölç; panel tam oturacak kadar yukarı başlar, kalan yer fotoğraflara gider
    icerik = 0
    for y in (a, b):
        _, boy, satir = sigdir(d, y['ad'], gen, (60, 54, 48, 42), 2)
        icerik += len(satir) * int(boy * 1.12) + 50 + 44 + 46
    icerik += len(sar(d, sonuc, F('Bold', 34), gen)[:2]) * 46
    panel = max(610, min(780, 1460 - (110 + icerik + 120)))
    fh = panel - 70
    yuvarlak_yapistir(im, foto(a, (450, fh)), (40, 40), 32)
    yuvarlak_yapistir(im, foto(b, (450, fh)), (510, 40), 32)
    oy = 40 + fh // 2
    d.ellipse((430, oy - 70, 570, oy + 70), fill=FOREST, outline=PAPER, width=8)
    d.text((500, oy - 2), 'VS', font=F('Bold', 52), fill=LIME, anchor='mm')
    for x, y in ((60, a), (530, b)):
        if y is kazanan:
            fw = F('Bold', 24); t = 'LASTS LONGER'; tw = d.textlength(t, font=fw) + 36
            d.rounded_rectangle((x, 60, x + tw, 104), radius=22, fill=LIME)
            d.text((x + tw / 2, 83), t, font=fw, fill=FOREST, anchor='mm')

    d.rounded_rectangle((40, panel, 960, 1460), radius=36, fill=FOREST)
    d.text((x0, panel + 52), 'WHICH KEEPS YOU FULL LONGER?', font=F('Bold', 34), fill=LIME, anchor='lm')

    y0 = panel + 110
    for y in (a, b):
        f, boy, satir = sigdir(d, y['ad'], gen, (60, 54, 48, 42), 2)
        for s in satir:
            d.text((x0, y0), s, font=f, fill=BEYAZ, anchor='lt'); y0 += int(boy * 1.12)
        alt = f"{y['kcal']} kcal · {y['protein']} g protein" + (f" · {y['porsiyon']}" if y['porsiyon'] and len(y['porsiyon']) < 18 else '')
        d.text((x0, y0 + 2), alt, font=F('Medium', 28), fill=SOLUK, anchor='lt'); y0 += 50
        # saat çubuğu: 5 saat = tam genişlik
        cub_w = gen - 170; dolu = max(40, cub_w * y['saat'] / 5)
        renk = LIME if y is kazanan or berabere else LIG[y['lig']]
        d.rounded_rectangle((x0, y0, x0 + cub_w, y0 + 44), radius=22, fill=KUTU)
        d.rounded_rectangle((x0, y0, x0 + dolu, y0 + 44), radius=22, fill=renk)
        d.text((x0 + gen, y0 + 22), f"~{saat(y['saat'])} h", font=F('Bold', 44), fill=BEYAZ, anchor='rm')
        y0 += 44 + 46

    fs = F('Bold', 34)
    for s in sar(d, sonuc, fs, gen)[:2]:
        d.text((x0, y0), s, font=fs, fill=LIME, anchor='lt'); y0 += 46
    alt_bilgi(d, 'full breakdown on the site')
    im.save(cikti, 'JPEG', quality=86, optimize=True, progressive=True)

# ---------- metinler ----------

def tek_satir(y):
    por = f" ({y['porsiyon']})" if y['porsiyon'] else ''
    ad = y['ad']
    return {
        'Title': f"How long does {ad} keep you full? Calories and satiety"[:100],
        'Description': (f"{ad}{por}: {y['kcal']} kcal, {y['protein']} g protein, {y['lif']} g fiber. {HUKUM_UZUN[y['lig']]} "
                        f"Satiety score {y['puan']} (tier {y['lig']}), keeps you full for about {saat(y['saat'])} hours. "
                        f"See what keeps you fuller for the same calories on platerank.dev.")[:500],
        'Link': f"{SITE}/en/food/{y['slug']}?utm_source=pinterest&utm_medium=pin_en",
        'Keywords': f"{ad.lower()} calories, is {ad.lower()} filling, how long does {ad.lower()} keep you full, most filling foods, high protein low calorie",
        'Pinterest board': PANO_TEK,
    }

def vs_satir(c):
    a, b = c['a'], c['b']
    if a['saat'] == b['saat']:
        h, l = (a, b) if a['kcal'] <= b['kcal'] else (b, a)
        ozet = f"{a['ad']} and {b['ad']} both keep you full for about {saat(a['saat'])} hours, but {h['ad']} does it with {l['kcal'] - h['kcal']} fewer calories."
    else:
        k, z = (a, b) if a['saat'] > b['saat'] else (b, a)
        ozet = f"{k['ad']} keeps you full about {saat(abs(a['saat'] - b['saat']))} hours longer than {z['ad']} ({saat(k['saat'])} vs {saat(z['saat'])} hours)."
    return {
        'Title': f"{a['ad']} vs {b['ad']}: which keeps you full longer?"[:100],
        'Description': (f"{ozet} {a['ad']}: {a['kcal']} kcal, {a['protein']} g protein, {a['lif']} g fiber. "
                        f"{b['ad']}: {b['kcal']} kcal, {b['protein']} g protein, {b['lif']} g fiber. "
                        f"Full side-by-side breakdown on platerank.dev.")[:500],
        'Link': f"{SITE}/en/vs/{c['slug']}?utm_source=pinterest&utm_medium=pin_en",
        'Keywords': f"{a['ad'].lower()} vs {b['ad'].lower()}, {a['ad'].lower()} calories, {b['ad'].lower()} calories, most filling foods, satiety",
        'Pinterest board': PANO_VS,
    }

if __name__ == '__main__':
    secim = json.load(open(os.path.join(KOK, 'araclar', 'pin_en_secim.json'), encoding='utf-8'))
    hedef = os.path.join(KOK, 'img', 'pin', 'en'); os.makedirs(hedef, exist_ok=True)
    isler = []
    for y in secim['tek']:
        ad = f"food-{y['slug']}.jpg"; pin_tek(y, os.path.join(hedef, ad)); isler.append((ad, tek_satir(y)))
    vsler = []
    for c in secim['vs']:
        ad = f"vs-{c['slug']}.jpg"; pin_vs(c, os.path.join(hedef, ad)); vsler.append((ad, vs_satir(c)))
    # karşılaştırma ve tek yemek pinleri sırayla karışık; günde 5 pin, ABD saatlerine göre (UTC)
    sira = []
    for i in range(max(len(isler), len(vsler))):
        if i < len(vsler): sira.append(vsler[i])
        if i < len(isler): sira.append(isler[i])
    bas_gun = datetime.date(2026, 10, 18); saatler = ['12:00', '15:00', '18:00', '21:00', '23:00']  # ET 08-19
    satirlar = []
    for i, (ad, s) in enumerate(sira):
        gun = bas_gun + datetime.timedelta(days=i // len(saatler))
        satirlar.append({'Title': s['Title'], 'Media URL': f"{SITE}/img/pin/en/{ad}", 'Pinterest board': s['Pinterest board'],
                         'Thumbnail': '', 'Description': s['Description'], 'Link': s['Link'],
                         'Publish date': f"{gun.isoformat()}T{saatler[i % len(saatler)]}:00", 'Keywords': s['Keywords']})
    yol = os.path.join(KOK, 'Claude outputs', 'pinterest-en-parti-1.csv')
    with open(yol, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=list(satirlar[0].keys())); w.writeheader(); w.writerows(satirlar)
    print(len(satirlar), 'pin;', satirlar[0]['Publish date'], '→', satirlar[-1]['Publish date'])
