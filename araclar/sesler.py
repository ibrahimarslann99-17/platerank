"""Videolar için sentezlenmiş arayüz sesleri (numpy). Kayıt yok, telif yok.
Her fonksiyon 44.1 kHz mono float dizi döndürür; miks() olayları zaman çizelgesine yerleştirir."""
import numpy as np, wave
SR = 44100
def _t(sn): return np.arange(int(SR * sn)) / SR
def _zarf(n, atak=0.004, sonum=8.0):
    t = np.arange(n) / SR
    a = np.minimum(1, t / max(atak, 1e-6))
    return a * np.exp(-sonum * t)

def tik(yuksek=True):
    t = _t(0.035); f = 2600 if yuksek else 1900
    return 0.35 * np.sin(2 * np.pi * f * t) * _zarf(len(t), 0.001, 140)

def pop():
    t = _t(0.11); f = 520 + 900 * (t / t[-1])
    return 0.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * _zarf(len(t), 0.002, 30)

def vuus(sure=0.28):
    n = int(SR * sure); g = np.random.default_rng(7).standard_normal(n)
    # basit kayan alçak geçiren: üstel ortalama, katsayı zamanla değişir
    out = np.zeros(n); y = 0.0
    k = np.linspace(0.02, 0.35, n)
    for i in range(n): y += k[i] * (g[i] - y); out[i] = y
    zarf = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return 0.55 * out * zarf / (np.abs(out).max() + 1e-9)

def gum():  # damga vuruşu
    t = _t(0.35); f = 110 * np.exp(-6 * t) + 45
    ton = np.sin(2 * np.pi * np.cumsum(f) / SR) * _zarf(len(t), 0.001, 11)
    gurultu = np.random.default_rng(3).standard_normal(len(t)) * _zarf(len(t), 0.0005, 60) * 0.5
    return 0.9 * (ton + gurultu)

def uzgun():  # "acıktım": inen iki nota, testere dişi yumuşatılmış
    parcalar = []
    for f0, f1, sn in ((392, 370, 0.22), (330, 262, 0.5)):
        t = _t(sn); f = np.linspace(f0, f1, len(t)); faz = 2 * np.pi * np.cumsum(f) / SR
        dalga = sum(np.sin(k * faz) / k for k in range(1, 6))
        parcalar.append(0.28 * dalga * _zarf(len(t), 0.01, 2.5 if sn > 0.3 else 6))
    return np.concatenate(parcalar)

def zafer():  # yükselen arpej
    out = np.zeros(int(SR * 0.9))
    for i, f in enumerate((523.25, 659.25, 783.99, 1046.5)):
        t = _t(0.55); ton = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * _zarf(len(t), 0.003, 5)
        s = int(SR * 0.09 * i); out[s:s + len(t)] += 0.3 * ton[: len(out) - s]
    return out

def ding():
    t = _t(0.7); f = 1318.5
    return 0.35 * (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t)) * _zarf(len(t), 0.002, 6)

def miks(olaylar, sure, cikti):
    """olaylar: [(saniye, dizi, kazanc)]; tepe -6 dBFS'e çekilir, 16 bit wav yazar."""
    tampon = np.zeros(int(SR * sure) + SR)
    for sn, ses, kz in olaylar:
        s = int(SR * sn); e = min(len(tampon), s + len(ses)); tampon[s:e] += kz * ses[: e - s]
    tampon = tampon[: int(SR * sure)]
    tepe = np.abs(tampon).max() or 1
    tampon = tampon / tepe * (10 ** (-6 / 20))
    with wave.open(cikti, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((tampon * 32767).astype(np.int16).tobytes())
