// Domuz eti (ya da tipik tarifinde domuz ürünü: jambon, bacon, sosis, chorizo, char siu) içeren yemekler.
// Türkçe Tok Plan bunları plana koymaz; site listelerinde ve yemek sayfalarında yemekler olduğu gibi durur.
// Veritabanında ayrı bir etiket yok: kimlik (id ilk 8 hane) listesi + ada göre yedek kontrol.
// Yeni yabancı mutfak partisi eklenince bu liste gözden geçirilir.
const DOMUZ_ID = new Set([
  '04a19db1', // Gyoza
  '0e026b18', // Prosciutto & kavun
  '1ba7c035', // Samgyeopsal
  '139af631', // Kruvasan kahvaltı sandviçi (sosis)
  '230f6cc5', // English muffin sandviç (jambon)
  '235d3c7c', // Mandu
  '2bdb8756', // Tonkotsu ramen
  '311585a8', // Pad kra pao (kıymalı; Tayland'da tipik olarak domuz)
  '3a0df063', // Clam chowder (bacon)
  '3d6cf540', // Katsudon
  '404aaaae', // Mapo fensi
  '4259e3be', // Bacon
  '48089cab', // Gumbo (andouille sosis)
  '54f30965', // Kahvaltı burritosu (sosis)
  '558e6025', // Biscuits and gravy (sosisli sos)
  '567dfa99', // Pozole
  '6231c444', // Hot dog
  '67a885ae', // Kimchi jjigae
  '6a70b7c2', // Moo shu domuz
  '7439e7ad', // Baozi (etli)
  '7e11016c', // Club sandviç (bacon)
  '820d158b', // Moo ping
  '851bab80', // Xiaolongbao
  '8adc95a8', // Bezelye çorbası (jambonlu)
  '9242f584', // Katsu curry
  '9adce7c0', // Tonkatsu
  'a6bea12d', // Wonton çorbası
  'accd353f', // Barbekü kaburga (ABD, domuz)
  'ad5b95e0', // Cochinita pibil
  'ae928bb9', // Bossam
  'b0ce0296', // Dan dan noodle
  'b1c632c5', // Carbonara (guanciale)
  'b85b3a45', // Bacon, yumurta ve peynirli biscuit
  'b9a28a81', // Jambalaya (sosis)
  'bda99ed2', // BLT sandviç
  'be86d25a', // Yakisoba
  'c0e75bad', // Kahvaltılık sosis
  'c22509a8', // Pulled pork sandviç
  'c2f56e13', // Cobb salata (bacon)
  'c9900381', // Mapo tofu
  'cad2504b', // Izgara domuz pirzola
  'cc45f678', // Denver omleti (jambon)
  'd94b7a66', // Al pastor tacos
  'e462dd35', // Pepperoni pizza
  'e5d49e2b', // Larb
  'e7b1a455', // Budae jjigae
  'f4025ab4', // Carnitas tacos
  'f91f40f8', // Okonomiyaki
  'fd8eda20', // Char siu
  '16278ccd', // Yangzhou kızarmış pilavı (char siu)
  '20793a88', // Kimbap (jambon)
]);
const DOMUZ_AD = /domuz|jambon|bacon|pork|prosciutto|pepperoni|chorizo|pancetta|guanciale|sosis|char siu|carnitas|tonkatsu|katsu/i;
function domuzlu(y) { return DOMUZ_ID.has(String(y.id).slice(0, 8)) || DOMUZ_AD.test(y.ad || ''); }
module.exports = { domuzlu, DOMUZ_ID };
