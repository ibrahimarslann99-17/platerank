#!/usr/bin/env python3
"""USDA'da (FNDDS) karsiligi olmayan yemeklerin tarif uzerinden besin hesabi.

Malzeme degerleri 100 g basina USDA SR/FNDDS standart degerleri (yuvarlanmis).
Tarifler tipik tek porsiyon; porsiyon gramaji = malzeme toplami (su/et suyu dahil).
Bu kalemler sitede 'kaynakli' isaretlenmez (kaynak bos); degerler tahmindir.
Cikti: araclar/cikti/tarif_sonuc.json
"""
import json, os

# ad: (kcal, protein, yag, karbonhidrat, lif, seker)  -- 100 g basina
M = {
    'su':               (0, 0, 0, 0, 0, 0),
    'tavuk_gogus':      (165, 31, 3.6, 0, 0, 0),
    'tavuk_but':        (180, 25, 8.5, 0, 0, 0),
    'tavuk_derili':     (230, 24, 14.5, 0, 0, 0),
    'kizarmis_tavuk':   (280, 24, 16, 9, 0.4, 0),
    'kuzu':             (258, 25.6, 16.5, 0, 0, 0),
    'kiyma_kuzu':       (283, 24.8, 19.7, 0, 0, 0),
    'kiyma_dana':       (250, 26, 15, 0, 0, 0),
    'dana_yagsiz':      (200, 30, 8, 0, 0, 0),
    'dana_yagli':       (295, 27, 20, 0, 0, 0),
    'domuz_kol':        (230, 27, 13, 0, 0, 0),
    'domuz_kiyma':      (297, 25.7, 20.8, 0, 0, 0),
    'jambon':           (145, 21, 6, 1.5, 0, 1.5),
    'sosis_spam':       (290, 10.3, 25.8, 4.2, 0, 1.5),
    'bresaola':         (151, 32, 2, 0.5, 0, 0),
    'karides':          (99, 24, 0.3, 0.2, 0, 0),
    'beyaz_balik':      (105, 23, 0.9, 0, 0, 0),
    'kizarmis_balik':   (230, 15, 12, 16, 0.7, 0.5),
    'somon_cig':        (208, 20.4, 13.4, 0, 0, 0),
    'deniz_urunu':      (100, 18, 1.5, 3, 0, 0),
    'istakoz':          (89, 19, 0.9, 0, 0, 0),
    'midye_vongole':    (148, 25.5, 2, 5.1, 0, 0),
    'yumurta':          (143, 12.6, 9.5, 0.7, 0, 0.4),
    'tofu_sert':        (144, 17.3, 8.7, 2.8, 2.3, 0.6),
    'tofu_ipeksi':      (55, 4.8, 2.7, 2.9, 0.1, 1.3),
    'pirinc':           (130, 2.7, 0.3, 28.2, 0.4, 0.1),
    'yapiskan_pirinc':  (97, 2, 0.2, 21.1, 1, 0),
    'bulgur_firik':     (83, 3.1, 0.2, 18.6, 4.5, 0.1),
    'makarna':          (158, 5.8, 0.9, 30.9, 1.8, 0.6),
    'eriste_bugday':    (138, 4.5, 2.1, 25, 1.2, 0.4),
    'udon':             (105, 2.6, 0.4, 21.6, 0.6, 0.2),
    'cam_eriste':       (84, 0.1, 0.1, 20.7, 0.5, 0),
    'pirinc_eriste':    (108, 1.8, 0.2, 24, 1, 0),
    'pirinc_kagidi':    (334, 1, 0.2, 83, 1.3, 0),
    'poha_kuru':        (350, 6.7, 1.2, 77, 2.5, 0.5),
    'grits':            (71, 1.7, 0.5, 15.6, 0.8, 0.1),
    'pide_pita':        (275, 9.1, 1.2, 55.7, 2.2, 1.3),
    'ekmek':            (266, 8.9, 3.3, 49, 2.7, 5.7),
    'misir_tortilla':   (218, 5.7, 2.9, 44.6, 6.3, 0.9),
    'roti':             (320, 7, 12, 46, 3, 2),
    'kizarmis_hamur':   (390, 7, 20, 45, 1.5, 1.5),
    'waffle':           (373, 8.7, 18.8, 43.5, 2.5, 8.3),
    'un':               (364, 10.3, 1, 76.3, 2.7, 0.3),
    'galeta':           (395, 13.4, 5.3, 72, 4.5, 6.2),
    'mercimek':         (116, 9, 0.4, 20.1, 7.9, 1.8),
    'nohut':            (164, 8.9, 2.6, 27.4, 7.6, 4.8),
    'soya_fasulyesi':   (173, 16.6, 9, 9.9, 6, 3),
    'fasulye_ezmesi':   (90, 5.5, 1.2, 15, 5.2, 0.5),
    'kuru_fasulye_sos': (94, 4.8, 0.4, 21, 4.1, 8),
    'bezelye':          (84, 5.4, 0.2, 15.6, 5.5, 5.9),
    'patates':          (87, 1.9, 0.1, 20.1, 1.8, 0.9),
    'patates_kizartma': (312, 3.4, 15, 41, 3.8, 0.3),
    'tatli_patates':    (86, 1.6, 0.1, 20, 3, 4.2),
    'karisik_sebze':    (35, 2, 0.2, 7, 2.8, 3),
    'sogan':            (40, 1.1, 0.1, 9.3, 1.7, 4.2),
    'domates':          (18, 0.9, 0.2, 3.9, 1.2, 2.6),
    'domates_sos':      (24, 1.2, 0.3, 5.3, 1.5, 3.6),
    'ketcap':           (101, 1, 0.1, 27, 0.3, 22),
    'patlican':         (35, 0.8, 0.2, 8.7, 2.5, 3.2),
    'yesillik':         (20, 2, 0.3, 3, 2, 1.2),
    'salatalik':        (15, 0.7, 0.1, 3.6, 0.5, 1.7),
    'kimchi':           (15, 1.1, 0.5, 2.4, 1.6, 1.1),
    'balkabagi':        (20, 0.7, 0.1, 4.9, 1.1, 2.1),
    'havuc':            (35, 0.8, 0.2, 8.2, 3, 3.5),
    'molohiya':         (37, 3.7, 0.2, 7.3, 2, 0.5),
    'roka':             (25, 2.6, 0.7, 3.7, 1.6, 2),
    'avokado':          (160, 2, 14.7, 8.5, 6.7, 0.7),
    'muz':              (89, 1.1, 0.3, 22.8, 2.6, 12.2),
    'yag':              (884, 0, 100, 0, 0, 0),
    'tereyag':          (717, 0.9, 81, 0.1, 0, 0.1),
    'krema':            (340, 2.8, 36, 2.7, 0, 2.9),
    'eksi_krema':       (198, 2.4, 19, 4.6, 0, 3.4),
    'sut':              (61, 3.2, 3.3, 4.8, 0, 5),
    'yogurt':           (61, 3.5, 3.3, 4.7, 0, 4.7),
    'labne':            (160, 8, 12, 5, 0, 4),
    'beyaz_peynir':     (265, 14, 21, 4, 0, 4),
    'hellim':           (321, 22, 25, 1.5, 0, 1.5),
    'paneer':           (296, 21, 22.5, 3.6, 0, 2.6),
    'parmesan':         (392, 35.8, 25.8, 3.2, 0, 0.9),
    'cedar':            (403, 25, 33, 1.3, 0, 0.5),
    'tahin':            (595, 17, 54, 21, 9.3, 0.5),
    'fistik':           (567, 25.8, 49.2, 16.1, 8.5, 4),
    'fistik_ezmesi':    (588, 25, 50, 20, 6, 9),
    'kaju':             (553, 18.2, 43.9, 30.2, 3.3, 5.9),
    'cam_fistigi':      (673, 13.7, 68.4, 13.1, 3.7, 3.6),
    'soya_sosu':        (53, 8.1, 0.6, 4.9, 0.8, 0.4),
    'seker':            (387, 0, 0, 100, 0, 100),
    'surup':            (260, 0, 0, 67, 0, 60),
    'kondanse_sut':     (321, 7.9, 8.7, 54.4, 0, 54.4),
    'evaporated_sut':   (134, 6.8, 7.6, 10, 0, 10),
    'hindistan_sutu':   (197, 2, 21.3, 2.8, 0, 2.8),
    'gochujang':        (200, 4, 1.5, 43, 2, 20),
    'chunjang':         (230, 10, 10, 25, 5, 8),
    'hoisin':           (220, 3.3, 3.4, 44, 2.8, 27),
    'kori_kup':         (500, 6, 34, 44, 3, 6),
    'mayonez':          (680, 1, 75, 0.6, 0, 0.6),
    'tartar':           (211, 1, 17, 13, 0.5, 4),
    'soya_sutu_sekerli': (54, 3.3, 1.8, 6.3, 0.6, 4),
    'yapiskan_pirinc_unu': (370, 6, 1, 80, 2, 0),
    'bagel':            (257, 10, 1.7, 50, 2.2, 6),
    'krem_peynir':      (342, 6, 34, 4, 0, 3.2),
    'elma':             (52, 0.3, 0.2, 13.8, 2.4, 10.4),
    'ceviz':            (654, 15.2, 65.2, 13.7, 6.7, 2.6),
    'kuru_uzum':        (299, 3.1, 0.5, 79, 3.7, 59),
    'uzum':             (69, 0.7, 0.2, 18.1, 0.9, 15.5),
    'misir':            (96, 3.4, 1.5, 21, 2.4, 4.5),
    'un_tortilla':      (304, 8, 8, 50, 3.5, 3),
}

# ad: [(malzeme, gram), ...]
T = {
    'Shrimp and grits': [('grits', 200), ('karides', 80), ('tereyag', 8), ('cedar', 12)],
    'Steak and eggs': [('dana_yagsiz', 150), ('yumurta', 100), ('yag', 5)],
    'Chicken and waffles': [('kizarmis_tavuk', 150), ('waffle', 100), ('surup', 30)],
    'Lobster roll': [('istakoz', 100), ('mayonez', 15), ('tereyag', 8), ('ekmek', 60), ('karisik_sebze', 15)],
    'Fish and chips': [('kizarmis_balik', 170), ('patates_kizartma', 180)],
    'Poke bowl (somonlu)': [('somon_cig', 110), ('pirinc', 180), ('avokado', 30), ('salatalik', 20), ('soya_sosu', 10), ('yag', 5)],
    'Chicken korma': [('tavuk_but', 130), ('sogan', 50), ('yogurt', 40), ('krema', 30), ('kaju', 15), ('yag', 12), ('domates', 20)],
    'Tavuk tikka (şiş)': [('tavuk_gogus', 180), ('yogurt', 15), ('yag', 5)],
    'Malai kofta': [('patates', 50), ('paneer', 40), ('un', 8), ('yag', 12), ('sogan', 40), ('domates', 40), ('krema', 40), ('kaju', 15), ('tereyag', 8), ('seker', 4)],
    'Baingan bharta (patlıcan)': [('patlican', 200), ('sogan', 30), ('domates', 40), ('yag', 10)],
    'Chole bhature': [('nohut', 160), ('sogan', 30), ('domates', 40), ('yag', 12), ('kizarmis_hamur', 110)],
    'Pav bhaji': [('patates', 100), ('karisik_sebze', 80), ('domates', 40), ('sogan', 20), ('tereyag', 15), ('ekmek', 80)],
    'Poha (pirinç yassısı)': [('poha_kuru', 60), ('patates', 40), ('sogan', 30), ('bezelye', 20), ('fistik', 10), ('yag', 8), ('su', 82)],
    'Uttapam': [('pirinc', 90), ('mercimek', 30), ('sogan', 30), ('domates', 30), ('yag', 8), ('su', 12)],
    'Shakshuka (yumurtalı, Kuzey Afrika usulü)': [('yumurta', 100), ('domates_sos', 120), ('karisik_sebze', 50), ('yag', 10)],
    'Hummus bil lahm (etli humus)': [('nohut', 130), ('tahin', 25), ('yag', 10), ('kiyma_kuzu', 60), ('cam_fistigi', 8)],
    'Zahterli labne (pita ile)': [('labne', 80), ('yag', 8), ('pide_pita', 60)],
    'Izgara hellim': [('hellim', 80)],
    'Tavuk şevarma tabağı': [('tavuk_but', 150), ('pirinc', 120), ('yag', 10), ('karisik_sebze', 50), ('tahin', 10)],
    'Kafta (Lübnan köftesi)': [('kiyma_kuzu', 85), ('kiyma_dana', 85), ('sogan', 30)],
    'Mansaf (yoğurtlu kuzu pilav)': [('kuzu', 150), ('pirinc', 150), ('yogurt', 80), ('tereyag', 10), ('cam_fistigi', 10)],
    'Maklube': [('pirinc', 150), ('tavuk_but', 100), ('patlican', 60), ('yag', 12), ('karisik_sebze', 30)],
    'Koshari': [('pirinc', 80), ('makarna', 60), ('mercimek', 80), ('nohut', 30), ('domates_sos', 70), ('sogan', 20), ('yag', 10)],
    'Molohiya (tavuklu)': [('molohiya', 200), ('tavuk_but', 100), ('tereyag', 8), ('su', 42)],
    'Fatteh (nohutlu)': [('nohut', 120), ('yogurt', 100), ('tahin', 15), ('pide_pita', 40), ('yag', 8), ('cam_fistigi', 8), ('tereyag', 5)],
    'Musakhan (sumaklı tavuk)': [('tavuk_derili', 130), ('sogan', 80), ('yag', 20), ('pide_pita', 70), ('cam_fistigi', 5)],
    'Sambusek (3 adet, peynirli)': [('un', 45), ('beyaz_peynir', 40), ('yag', 15), ('su', 20)],
    'Firikli tavuk': [('bulgur_firik', 180), ('tavuk_but', 120), ('sogan', 20), ('tereyag', 10), ('kaju', 10)],
    'Arayes (kıymalı pide)': [('pide_pita', 80), ('kiyma_kuzu', 100), ('sogan', 15), ('yag', 5)],
    'Pad woon sen': [('cam_eriste', 150), ('yumurta', 50), ('tavuk_gogus', 50), ('karisik_sebze', 30), ('yag', 10), ('soya_sosu', 10)],
    'Moo ping (domuz şiş, yapışkan pilavla)': [('domuz_kol', 130), ('seker', 6), ('yapiskan_pirinc', 160), ('yag', 4)],
    'Taze spring roll (3 adet)': [('pirinc_eriste', 60), ('karides', 45), ('yesillik', 50), ('pirinc_kagidi', 15), ('fistik_ezmesi', 6), ('seker', 4)],
    'Yum woon sen (cam erişte salatası)': [('cam_eriste', 120), ('karides', 50), ('domuz_kiyma', 30), ('karisik_sebze', 40), ('seker', 5)],
    'Yum nua (dana salatası)': [('dana_yagsiz', 130), ('karisik_sebze', 100), ('seker', 5), ('pirinc', 5), ('soya_sosu', 10)],
    'Thai buzlu çay': [('su', 275), ('kondanse_sut', 40), ('evaporated_sut', 20), ('seker', 15)],
    'Gaeng som (ekşi köri çorbası)': [('beyaz_balik', 80), ('karisik_sebze', 125), ('su', 140), ('seker', 5)],
    'Muzlu roti': [('roti', 80), ('muz', 50), ('kondanse_sut', 15), ('yag', 5)],
    'Dakgalbi': [('tavuk_but', 150), ('tatli_patates', 40), ('karisik_sebze', 80), ('gochujang', 25), ('yag', 8), ('seker', 5)],
    'Jjajangmyeon': [('eriste_bugday', 250), ('chunjang', 40), ('domuz_kol', 40), ('karisik_sebze', 80), ('yag', 12), ('seker', 5), ('un', 5)],
    'Jjamppong': [('eriste_bugday', 200), ('deniz_urunu', 80), ('domuz_kol', 20), ('karisik_sebze', 80), ('su', 100), ('yag', 12)],
    'Haemul pajeon (deniz ürünlü gözleme)': [('un', 70), ('yumurta', 25), ('deniz_urunu', 50), ('yesillik', 50), ('yag', 25), ('su', 30)],
    'Kimchijeon (kimchili gözleme)': [('un', 55), ('kimchi', 80), ('yag', 20), ('yumurta', 15), ('su', 30)],
    'Bossam (haşlanmış domuz)': [('domuz_kol', 170), ('kimchi', 60), ('gochujang', 10), ('yesillik', 10)],
    'Budae jjigae': [('eriste_bugday', 100), ('sosis_spam', 80), ('kimchi', 60), ('tofu_sert', 40), ('kuru_fasulye_sos', 30), ('cedar', 15), ('gochujang', 15), ('su', 110)],
    'Kongguksu (soğuk soya sütlü erişte)': [('eriste_bugday', 200), ('soya_fasulyesi', 60), ('su', 140), ('salatalik', 30), ('tahin', 5)],
    'Dubu jorim (soslu tofu)': [('tofu_sert', 160), ('soya_sosu', 15), ('yag', 6), ('seker', 4), ('yesillik', 15)],
    'Gyeran-jjim (buharda yumurta)': [('yumurta', 100), ('su', 95), ('yesillik', 5)],
    'Hobak juk (balkabağı lapası)': [('balkabagi', 200), ('yapiskan_pirinc_unu', 25), ('seker', 10), ('su', 65)],
    'Molletes': [('ekmek', 80), ('fasulye_ezmesi', 70), ('cedar', 35), ('domates', 15)],
    'Enfrijoladas': [('misir_tortilla', 90), ('fasulye_ezmesi', 120), ('su', 30), ('beyaz_peynir', 25), ('eksi_krema', 15), ('sogan', 10)],
    'Torta de milanesa': [('ekmek', 110), ('dana_yagsiz', 90), ('galeta', 15), ('yumurta', 5), ('yag', 10), ('avokado', 30), ('domates', 20), ('fasulye_ezmesi', 20)],
    'Sopa de fideo': [('makarna', 70), ('domates_sos', 50), ('su', 200), ('yag', 5), ('sogan', 25)],
    'Carne asada tabağı': [('dana_yagsiz', 150), ('pirinc', 120), ('yag', 5), ('fasulye_ezmesi', 100), ('domates', 25)],
    'Tavuk tinga (tostada ile)': [('tavuk_but', 130), ('domates_sos', 50), ('sogan', 30), ('yag', 10), ('misir_tortilla', 30)],
    'Pasta e ceci': [('makarna', 120), ('nohut', 120), ('domates', 30), ('yag', 10), ('su', 70)],
    'Chicken piccata': [('tavuk_gogus', 150), ('un', 8), ('tereyag', 10), ('yag', 6), ('su', 30)],
    'Spaghetti alle vongole': [('makarna', 220), ('midye_vongole', 70), ('yag', 15), ('su', 15)],
    'Bresaola, roka ve parmesan': [('bresaola', 70), ('roka', 30), ('parmesan', 12), ('yag', 8)],
    'Tamago kake gohan (çiğ yumurtalı pilav)': [('pirinc', 200), ('yumurta', 50), ('soya_sosu', 5)],
    'Omurice': [('pirinc', 180), ('tavuk_gogus', 50), ('ketcap', 20), ('tereyag', 8), ('yumurta', 100), ('yag', 5)],
    'Nikujaga (etli patates)': [('dana_yagli', 80), ('patates', 150), ('sogan', 50), ('havuc', 30), ('seker', 8), ('soya_sosu', 15), ('yag', 5), ('su', 12)],
    'Chicken nanban': [('tavuk_but', 150), ('un', 10), ('yumurta', 10), ('yag', 15), ('seker', 6), ('tartar', 50)],
    'Hiyashi chuka (soğuk ramen)': [('eriste_bugday', 200), ('jambon', 30), ('yumurta', 30), ('salatalik', 40), ('domates', 30), ('soya_sosu', 15), ('seker', 8), ('yag', 6), ('su', 10)],
    'Köri udon': [('udon', 250), ('dana_yagli', 50), ('kori_kup', 20), ('sogan', 40), ('su', 140)],
    'Hiyayakko (soğuk tofu)': [('tofu_ipeksi', 140), ('soya_sosu', 5), ('yesillik', 5)],
    'Yosenabe (karışık güveç)': [('beyaz_balik', 80), ('karides', 40), ('tavuk_but', 40), ('tofu_sert', 60), ('karisik_sebze', 150), ('su', 130)],
    'Youtiao ve soya sütü': [('kizarmis_hamur', 60), ('soya_sutu_sekerli', 290)],
    'Jianbing': [('un', 50), ('su', 40), ('yumurta', 50), ('kizarmis_hamur', 15), ('hoisin', 15), ('yesillik', 10), ('yag', 8)],
    'Aslan başı köftesi (2 adet)': [('domuz_kiyma', 160), ('galeta', 15), ('yumurta', 15), ('yesillik', 50), ('soya_sosu', 10)],
    'Sarımsaklı bok choy': [('yesillik', 190), ('yag', 8), ('soya_sosu', 2)],
    'Soğuk susamlı erişte': [('eriste_bugday', 220), ('tahin', 30), ('soya_sosu', 15), ('seker', 6), ('yag', 6), ('salatalik', 25)],
    # --- ikinci tur: USDA eslesmesi tutmayanlar ---
    'Krem peynirli bagel': [('bagel', 100), ('krem_peynir', 30)],
    'Fıstık ezmeli tost': [('ekmek', 60), ('fistik_ezmesi', 30)],
    'Denver omleti (jambonlu, biberli)': [('yumurta', 130), ('jambon', 40), ('karisik_sebze', 30), ('tereyag', 5)],
    'Muzlu kek (banana bread, dilim)': [('un', 28), ('seker', 14), ('muz', 22), ('yag', 8), ('yumurta', 8)],
    'Izgara domuz pirzola': [('domuz_kol', 180), ('yag', 3)],
    'Chef salata': [('yesillik', 150), ('jambon', 40), ('tavuk_gogus', 40), ('cedar', 20), ('yumurta', 30), ('mayonez', 10), ('su', 10)],
    'Waldorf salata': [('elma', 70), ('karisik_sebze', 30), ('ceviz', 20), ('mayonez', 20), ('uzum', 10)],
    'Yumurta salatası': [('yumurta', 90), ('mayonez', 20), ('karisik_sebze', 10)],
    'Mısır çorbası (corn chowder)': [('misir', 80), ('patates', 60), ('sut', 150), ('tereyag', 10), ('sogan', 20), ('un', 8), ('su', 22)],
    'Rogan josh (kuzu)': [('kuzu', 150), ('yogurt', 30), ('sogan', 40), ('domates', 40), ('yag', 12), ('su', 28)],
    'Keema (kuzu kıyma körisi)': [('kiyma_kuzu', 130), ('bezelye', 40), ('sogan', 40), ('domates', 30), ('yag', 8)],
    'Yumurta körisi': [('yumurta', 120), ('sogan', 50), ('domates', 60), ('yag', 12), ('su', 38)],
    'Khao man gai': [('tavuk_gogus', 130), ('pirinc', 200), ('yag', 10), ('salatalik', 30), ('soya_sosu', 10), ('seker', 3)],
    'Kajulu tavuk': [('tavuk_gogus', 140), ('kaju', 30), ('karisik_sebze', 80), ('yag', 12), ('soya_sosu', 15), ('seker', 5), ('sogan', 20)],
    'Pad pak ruam (sebze sote)': [('karisik_sebze', 230), ('yag', 12), ('soya_sosu', 10)],
    'Mandu (buharda, 5 adet)': [('un', 50), ('domuz_kiyma', 45), ('tofu_sert', 15), ('yesillik', 25), ('su', 15)],
    'Kahvaltı tacosu (yumurtalı, 2 adet)': [('un_tortilla', 60), ('yumurta', 100), ('cedar', 20), ('yag', 5), ('domates', 15)],
    'Penne arrabbiata': [('makarna', 230), ('domates_sos', 60), ('yag', 10)],
    'Aloo paratha': [('roti', 90), ('patates', 50), ('yag', 8)],
    'Jok (pirinç lapası)': [('pirinc', 110), ('su', 200), ('domuz_kiyma', 40)],
    'Frittata (sebzeli)': [('yumurta', 120), ('karisik_sebze', 50), ('sut', 10), ('parmesan', 8), ('yag', 5)],
}


def hesapla(tarif):
    top = [0.0] * 6
    gram = 0
    for m, g in tarif:
        v = M[m]
        gram += g
        for i in range(6):
            top[i] += v[i] * g / 100
    k, p, y, kh, l, s = top
    return {'porsiyon_g': gram, 'kcal': round(k), 'protein': round(p, 1), 'yag': round(y, 1),
            'karb': round(kh, 1), 'lif': round(l, 1), 'seker': round(s, 1)}


if __name__ == '__main__':
    liste = {y['ad']: y for y in json.load(open(os.path.join(os.path.dirname(__file__), 'yeni_mutfak_liste.json'), encoding='utf-8'))}
    eksik = [a for a in T if a not in liste]
    assert not eksik, eksik
    sonuc = {}
    for ad, tarif in T.items():
        r = hesapla(tarif)
        # kalori dogrulamasi (ayni kural): 4P + 9Y + 4K - 2L
        h = 4 * r['protein'] + 9 * r['yag'] + 4 * r['karb'] - 2 * r['lif']
        r['dogrulama'] = 'ok' if r['kcal'] == 0 or abs(h - r['kcal']) / r['kcal'] <= 0.08 else f'tutmuyor {h:.0f}'
        r['tarif'] = tarif
        sonuc[ad] = r
    os.makedirs(os.path.join(os.path.dirname(__file__), 'cikti'), exist_ok=True)
    json.dump(sonuc, open(os.path.join(os.path.dirname(__file__), 'cikti', 'tarif_sonuc.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for ad, r in sonuc.items():
        print(f"{ad[:38]:38} {r['porsiyon_g']:4}g {r['kcal']:5} kcal P{r['protein']:5} Y{r['yag']:5} K{r['karb']:5} L{r['lif']:4} S{r['seker']:5} {r['dogrulama']}")
    print(len(sonuc), 'tarif')
