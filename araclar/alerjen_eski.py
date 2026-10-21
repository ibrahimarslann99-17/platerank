#!/usr/bin/env python3
"""Sitedeki eski yemeklere alerjen ve diyet etiketi (Ekim 2026).

Kod: e=et, b=balik (deniz urunu dahil), s=sut, y=yumurta, g=gluten, k=kuruyemis, o=soya, l=baklagil
Diyet: N=ikisi de degil, V=vejetaryen, G=vegan (vejetaryen+vegan)
Tipik tarife gore, belirsizde temkinli (et suyu, balik sosu, dashi -> etiketlenir).
Cikti: SQL update (stdout) -> Supabase'e uygulanir.
"""
import sys

KOD = {'e': 'et', 'b': 'balik', 's': 'sut', 'y': 'yumurta', 'g': 'gluten', 'k': 'kuruyemis', 'o': 'soya', 'l': 'baklagil'}

VERI = """
7439e7ad egO N|7152da40 eog N|a0248bee ebgo N|2f082510 ego N|7a51d18b bog N|fd8eda20 eog N|659b7c92 egoy N|52b0944c e N
b0ce0296 egokl N|e4b783d4 gys V|40b7967b egyo N|c8b181e9 eog N|9a62f3bc eog N|33b01643 geo N|5c41bf90 eklog N|ac25865d ebogk N
404aaaae eog N|c9900381 oeg N|24496b59 egyo N|a0b5e111 ego N|53b7525b yo V|ca1af927 eog N|af1afb3d eoyg N|58f4f23b eog N
9f62396e go G|14a0f274 bog N|35e71e87 gl G|bd256d3c egy N|600c9acb bgy N|a6bea12d ebgyo N|851bab80 ego N|16278ccd ebyo N
812e53b7 g G|f51d19a4 ye N|48d833f9 ego N
1c2500c4 - G|a96a5c99 by N|65d78109 s V
7fa6800f - G|c4da7df0 esk N|1d932317 l G|67d4f972 es N|e815e1bf ls V|577e4276 l G|77faa349 sg V|0a86b9a4 l G|5015e22d s V
73733633 s V|2e49c3e4 s V|11fd4ad5 l G|a8f4f671 gl G|654917b3 es N|f136d5a7 esk N
a1b2842b sy V|b9221678 gsye N|649159a0 g G|9756f9e0 gs V|7fad3d8b gsy V|75e4a921 k G|3b819db3 s V|b1c632c5 gyse N
d92fecac egys N|028beea4 g G|709965e2 sy V|c53bc3ee gsy V|5e21fc91 b N|57bb31c6 b N|923ffa51 egsy N|ed9c0811 gl G
f40a2af6 eg N|84d817eb s N|fc27575e g G|94885e6f gsk V|57d0e851 gs V|a2e25a35 gl G|9bb16708 g G|760929d9 gse N
c244a704 gs V|9ba060d1 s V|0e026b18 e N|e81838dd gsy V|3b81cd20 gl G|fa625901 se N|b28fa9b3 esg N|3b80d0e6 s V
9f01fe65 egs N|cf99e6ec gys V|2a30e74e egys N|10a41a86 eby N
c1f57af1 obg N|b18088cb ybeo N|db0fa54b bogy N|ba493ba4 o G|04a19db1 ego N|e1731aaf eog N|cffc38ed og G|19967901 b N
34ea4204 bog N|4a6da4ad ego N|9242f584 egys N|3d6cf540 egyo N|80e206f2 ob N|cb186bdd l G|22f22d50 o G|e83dc016 bog N
0fefe460 b N|f91f40f8 gyeb N|0c2ca121 bo N|8eaf20d5 eyog N|aa91c377 b N|b747f323 eog N|83ed13a9 eyog N|0b3450ab o G
b0707007 bgy N|a36aaba1 egok N|f1b2685f bgy N|de090cc1 eog N|0ef34481 og G|9adce7c0 egy N|2bdb8756 egoy N|8771378f gbo N
8bd98f63 bog N|be86d25a ego N|a5748b79 eog N|3bee1947 gob N
dab6fe5a bo N|06409a50 eyo N|62706f3b eog N|d23d36b1 ob N|7a297cbb eog N|cae062aa gks V|0a72a13c eoyg N|20793a88 eybo N
67a885ae ebo N|16c532a6 eyg N|842a507f sl V|19306e28 e N|2dd2c48f obye N|6d244dfc bgo N|ef57842a ego N
4a451aa5 gysok V|e22e7590 gs V|5ee88d6b gs V|482c0ca1 gsy V|6d39d8d6 gs V|8bd635a0 kg G|da35ffd7 gyso V|d5e31fde gs V
c5e94d43 s V|05bdea09 s V|6129cb81 b N|f6cd3651 - G|c1ea72a2 s V|791e5995 s V|cb5c2067 sgo V|f5078006 gs V|54015afd gsk V
816c9d94 gsy N|0d7e9418 gs V
f13c66a1 g G|c9e6dcc4 lg G|b13a4aa8 ek N|befdf36f g G|16db642d lg G|5169e22b egk N|742d230b eg N|871b5249 l G|e11f76bb g G
e221624a lsg V|58a88be6 l G|1f56e1b9 kg G|bd8230db gks V|43850ca4 egs N|355d197c g G
e8417cbc b N|d94b7a66 e N|21eee447 e N|2001ce76 egls N|ede980da els N|f4025ab4 e N|b9fd7cee b N|64cb84c3 ys V|a8155f4e syg V
0011d1a3 gys V|ad5b95e0 e N|af54e616 sy V|72b8533a es N|9363eb66 sy V|8625db91 eg N|30af8d93 l G|0e39db4a ys V|c917208a - G
4d0f9b25 yls V|13c5e7b9 eklg N|6a7e244c sl V|c62430d8 s V|b365baa3 e N|567dfa99 e N|ce1b797f gs V|c473fd88 l G|b17e55ff e N
fb3ad710 els N|127c28ce e N|4197bcc7 e N|0e4804c1 eg N|a21fd5fa els N|e80be166 s V|48a67c3a els N|c7a051e3 gys V
cbbd6b51 b N|13baa21d k G|c81ea52a g G|919e82d1 - G|c754c366 - G|9de0e165 k G|63eef8ef - V|6299861a l G|928175a1 s V|46e1a160 - G
9455c405 l G|22a16401 g G|9f1a01ff g G|2737849d k G|d08b79cb - G|1afde1a9 e N|111b2ffc e N|c2e5b400 g G|42242f39 - G|0e0b0473 k G
2d913b67 b N|695b73af e N|aed82948 - G|110e8277 - G|8dfa644d - G|7597a21c b N|37e4062a s V|d7add7a2 - G|302ee059 - G|41b1a7b6 - G
e2ca3549 l G|5c4a5a88 - G|cd54fd43 - G|26ae0016 - G|10d1df73 e N|9d36f2f0 b N|a8774d91 s V|1bbb8361 g G|d6bdef41 l G|c842ca0b - G
5e835c6c l G|56a7e422 - G|5b931e20 - G|f4acfbf2 - G|9aeb1e9f l G|3b15e5ec - G|8d8513b9 - G|0ca2832e - G|7c291d6c b N|821477b8 - G
9f08b5b0 s V|4bbfa378 g G|38948cf6 g G|ed375354 g G|7b6606d3 s V|26a715cd e N|d59cdb5b e N|5aead383 s V|71cb4e78 b N|55175bbe - G
d4d59390 s V|c6e1caef kl G|859ddf36 s V|d196aa5b s V|be27b741 - G|97c15c90 y V|2deeb243 - G
22c36c75 yb N|b5dff587 yebo N|118a10bd egbo N|e5d49e2b eb N|e0b12e07 - G|1565605e eklb N|311585a8 eboy N|7b354874 eyog N
ec7dbf90 byklo N|7642869b eklo N|53da8be0 bkl N|820052d4 eb N|d112246f b N|a4f397dd beo N|c67a97de eb N
e74c0d37 - G|2b985efb gsy V|fed2fc89 e N|ccf43b31 es N|59fc79c4 egl N|69cbecb1 - G|b9f369b2 glk G|0faf4375 s V|66fedddb s V
6dd176e2 ges N|71b76697 gks V|5f6c92cc s V|111446e8 b N|ea5f82c0 bg N|173a85eb e N|4846e568 l G|801a82b9 gs V|27ee00a1 gs V
c021ab43 s V|40f287ce egs N|6fd0825e e N|baab830b e N|9175b8cb g G|34822c73 sg V|c5a07211 gs V|92a990ac s V|9b646286 k G
3a916197 ge N|5e700078 eg N|d7c1b0a5 g G|3e73e3e5 eg N|9dd5b668 - G|5bf92b23 ys V|72fb94d2 - G|95dcc5ef e N|89ef3382 - G
34e4c4e2 sg V|5153e8fe s V|9efbb254 es N|1dda671b eysg N|afd163ef - G|233c56bc egs N|e87ccb0c el N|35f63e38 eg N|fc40a049 e N
37fef38f e N|20cd9daa lgs V|175d087b egsy N|9ae97e59 k G|cab06912 sk V|40ee273a gs V|20b119ee gsk V|ecaee201 bg N|79e9f6bf bk N
86c1cb8a y V|fc1a1873 s V|1ad9b4dd l G|90a0574c ek N|33c56e90 egk N|202350b3 - G|de299eb6 - G|58f9b826 - G|f5ef5399 gsk V
0add4b66 esyg N|2867ed6d egs N|3f81e924 eg N|55b98d46 e N|166c8640 gsy V|3fb6e15f eg N|9e4ed0bb e N|fa47a1c7 k G|85fe679a - G
3b1ebf60 gks V|46128d1f bs N|5d64df3d e N|0b4d1c19 gesy N|d9fdce7a gy V|93b47b15 s V|6c955b1a e N|873f3c75 - G|7c474cc1 gs V
cbc81607 gs V|a8a3c222 gks V|d383e7eb - G|2b1ce273 sg V|98f95225 s V|b7bd7ffd eg N|cce2ebad - G|083c6b0c g G|14b5a052 eg N
2e4bf470 eg N|2160737b s V|b9e41fd9 se N|b3518839 esg N|7d5c0004 gs V|db20cdd6 el N|3da9e7ff - G|f5f77188 egy N|debb8622 e N
8b7c0a75 e N|a262b6bb e N|88f26ba5 e N|3a07c49c e N|0165906e eg N|727f09f9 l G|92e94014 - G|a5b09dc8 g G|d77255e6 - G
8ce958fe - G|84fdc2e8 egsy N|9360d486 y V|13f139d4 ls V|09919c31 lg G|62be2ef3 l G|55572870 - G|aea13ba7 - G|f7a29810 b N
55e19d98 bgy N|8a80202e sg V|46628834 s V|35912a2e e N|3d852c90 - G|ff8519c2 l G|7f2a85e2 le N|3f61188f ls V|c73d40ee - G
51656e6e - G|098458e7 s V|d7da7748 ys V|81850fbb es N|f9e876c0 gs V|4bd59c7f ly V|00821fa7 gsy V|bf911fe3 - G|2a73094e - G
e109da19 gys V|11232af2 gys V|0932a9a9 - G|0c750471 e N|4fdb225e ys V|90bb6855 - G|c9ce86b3 s V|a0db5884 - G|ed418bc0 syg V
1091792f - G|1cf68279 - G|12160123 gys V|5057c48e s V|10b4dcab sygE N|5b24e59d gsy V|9b839359 g G|d90def22 e N|cdfaed98 gsy V
3e35f8d9 s V|785368b6 egsy N|bd1fcbbd egs N|b1802eec ey N|ab1fd090 sg V|f3edec36 s V|284e3b1f eg N|02731251 gs V|a128f5b0 e N
5f7049ed egs N|ab5fbe28 eg N|6cde66ee eg N|22f7ca5f el N|b3d58d9b esygb N|d6db4767 gks V|2578ee5e eyg N|1fb2b792 e N|fd51dc49 b N
253e1f25 gys V|4508cdb7 gy V|111b0d79 - G|4b4d1607 - G|85387895 - G|86f9ab4f - G|24675cef - G|a3e94129 - G|0bf53aa8 syg V
badf75ba gys V|b8977bf7 g G|65ecf868 - G|934f4068 - G|b715016d - G
4361844f egys N|26f359f1 gs V|7595831a - G|59687092 g G|00832d2d - G|d8800c8f k G|119906bf e N|5db3f37b gso V|0708567f so V
bda99ed2 egy N|774b57e7 gys V|26e9dae2 es N|fcdba179 sygb N|47d6996c egs N|ad9b7e20 syg V|ced118eb el N|e8721893 egs N
3a0df063 bsg N|c2f56e13 eys N|afb89b2b egys N|65fb41bd s V|0675dc4f gys V|c4d68ba1 egs N|3b9ba943 - G|f14a8c75 - G|5f995dd3 s V
4f4cc815 sgk V|f6a6e838 gk G|6a903ae5 eg N|330b186c - G|6231c444 eg N|7a8bf177 b N|545da5cf e N|4830e280 kl G|0a0dcb3f egys N
7bb5d723 - G|63fd7952 g G|6e21f276 - G|6b9028e5 s V|6a02dcd8 gs V|43769903 egys N|c10d8200 - G|0a4b57fd gs V|cb29c540 ys V
00ab4915 gys V|766dfdc7 - G|0f233459 - G|e462dd35 egs N|a71e783b egs N|c9641ddc - G|244307c4 sok V|e62253a7 s V|65fdc118 - G
7217d87a lo G|d9442f23 - G|2a21f2fe o G|827a791e so V|df128f59 egy N|16efe792 gol G|020a98c3 - G|53f7c201 s V|16aed46f - G
d7733dec l G|64871ffe l G|e4b52c3e l G|300e6d05 l G|6c263ed4 og G|f80580a0 og G|111ebd64 l G|f7f3f736 s V|0dd06baa ls V
3c7ab74b o G|b04c0b05 o G|368e89d0 o G|c2e6990e l G|ed20378e gkl G|33130dcb l G|395960cd l G|56cd17cf o G|aec6e4dd l G
83274140 s V|6d5f5ba8 syg V|135cd2f4 l G|4865d282 l G|754efd29 sg V|87ef065c lg G|07bb2ca7 l G|3728e773 l G|911ab2ad lg G
4c703d2b o G|08ba9047 l G|0e837cb1 o G|d386bc83 os V|348f234f l G|e6a4516f lg G|d8b7afd0 l G|3434a3cc l G|a03bb8ab l G
8ebc38b5 ly V|b0c2893e s V|d4c372f7 sok V|ad1adeb3 sok V|65e726fa os V|34eeca20 gks V|87286de3 sy V|89a729dc s V|d70276c7 ks V
9e32b433 gso V|0a57bc31 klso V|271707db gsy V|17c33fa3 s V|7b26087f ys V|9a87f098 y V|1de81fac go G|6dc75d0c go G|275ccc3a s V
74f85bfc ls V|efe9ed9b o G|c3d5a51d og G|69aab80e og G|b5c9eb1f o G|72aa146a og G|f6c3a060 s V|90dfdb6d s V|355cfea1 s V
43d1e5e6 s V
24c33f87 egsy N|cd8e83e9 eg N|093b523b egys N|250ac9fe s V|46550b10 egsyo N|2c6b0144 s V|1da3eba3 s V|be462bcb - G|e50ee731 s V
5ece478e egs N|118db30c eg N|17b64c58 eg N|b93f258a s V|ca8882af gsyo V|cdb65ff8 gs V|f6e40ada egys N|e174df5d - G|2fc25542 - G
21da9fb3 gsy V|3234264b gs V|52626be4 egsyo N|ea501632 egs N|8d8d27f3 egy N|b55fee4e egs N|479bd83d - G|d6b05950 s V|f7e8fec1 sk V
66c3e849 eg N|1d185642 s V|273e5bd5 egs N|34dcc46e eg N|8e30d7ef - G|0735746f sg V|3b47f94e s V|9e71ce75 egy N|c8108a61 sgo V
7479f3e1 sgo V|8508f1f4 egs N|bb6da943 gs V|dd94dc90 - G|2ec774e9 - G|a36ee756 - G|c216ba08 egs N|6c051917 - G|193589a7 s V
58344743 gsy V
"""


def coz():
    sonuc = {}
    for parca in VERI.replace('\n', '|').split('|'):
        parca = parca.strip()
        if not parca:
            continue
        i, kod, diyet = parca.split()
        kod = kod.lower()
        al = sorted({KOD[c] for c in kod if c in KOD})
        d = {'N': [], 'V': ['vejetaryen'], 'G': ['vejetaryen', 'vegan']}[diyet]
        if {'et', 'balik'} & set(al):
            d = []
        if {'sut', 'yumurta'} & set(al):
            d = [x for x in d if x != 'vegan']
        assert i not in sonuc, i
        sonuc[i] = (al, d)
    return sonuc


if __name__ == '__main__':
    s = coz()
    print(f'-- {len(s)} kalem', file=sys.stderr)
    deger = ','.join(
        "('%s',array[%s]::text[],array[%s]::text[])" % (
            i, ','.join(f"'{a}'" for a in al), ','.join(f"'{x}'" for x in d))
        for i, (al, d) in s.items())
    print(f"update public.yemekler y set alerjenler=v.a, diyet=v.d from (values {deger}) as v(p,a,d) "
          f"where left(y.id::text,8)=v.p and y.alerjenler is null returning left(y.id::text,8);")
