-- Meclis-i Mide, aşama 6 (Supabase migration: meclis_6_temel_100g_kesif_icindekiler)
-- Canlıya MCP ile uygulandı; bu dosya kayıt için.

-- 1) Temel gıdaların 100 g referansı: kaynak metnindeki USDA değerleri birebir ayrıştırılır.
--    USDA'nın vermediği şeker NULL kalır (tahmin yok). 67 kalem, 7'sinde şeker NULL.
create table public.temel_100g (
  yemek_id uuid primary key references public.yemekler(id),
  fdc_id integer,
  kcal numeric not null check (kcal >= 0),
  protein numeric not null check (protein >= 0),
  lif numeric not null check (lif >= 0),
  yag numeric not null check (yag >= 0),
  seker numeric check (seker >= 0)
);
alter table public.temel_100g enable row level security;
create policy "temel 100g herkes okur" on public.temel_100g for select using (true);

insert into public.temel_100g (yemek_id, fdc_id, kcal, protein, lif, yag, seker)
select y.id,
  (regexp_match(y.kaynak, 'FDC:([0-9]+)'))[1]::int,
  m[1]::numeric, m[2]::numeric, m[3]::numeric, m[4]::numeric,
  case when m[5] = '?' then null else m[5]::numeric end
from public.yemekler y,
  lateral regexp_match(y.kaynak, '100g referans: ([0-9.]+)kcal/([0-9.]+)p/([0-9.]+)lif/([0-9.]+)yağ/([0-9.]+|\?)şeker') m
where y.mutfak = 'temel' and y.yayinda and m is not null;

-- 2) Öneriler: içindekiler (temel kalem + gram), opsiyonel tarif, sunucuda hesaplanan makrolar.
alter table public.oneriler
  add column icindekiler jsonb,
  add column tarif text check (char_length(tarif) <= 1500),
  add column protein integer, add column lif integer, add column yag integer, add column seker integer,
  add column seker_eksik boolean not null default false;

alter table public.yemekler
  add column icindekiler jsonb,
  add column tarif text;

-- İstemcinin gönderdiği kcal/makro yok sayılır; hepsi içindekilerden hesaplanır.
-- Yeni öneride içindekiler zorunlu (1-20 kalem, kalem başına 1-2000 g).
create or replace function public.oneri_icindekiler_hesapla()
returns trigger language plpgsql set search_path = public as $$
declare
  kalem jsonb; g numeric; r record; n int;
  t_kcal numeric := 0; t_p numeric := 0; t_l numeric := 0; t_y numeric := 0; t_s numeric := 0; eksik boolean := false;
begin
  if new.icindekiler is null or jsonb_typeof(new.icindekiler) <> 'array' then
    raise exception 'icindekiler_gerekli' using errcode = 'P0001';
  end if;
  n := jsonb_array_length(new.icindekiler);
  if n < 1 or n > 20 then
    raise exception 'icindekiler_sayisi: 1-20 kalem' using errcode = 'P0001';
  end if;
  for kalem in select * from jsonb_array_elements(new.icindekiler) loop
    begin
      g := (kalem->>'g')::numeric;
    exception when others then
      raise exception 'icindekiler_gram' using errcode = 'P0001';
    end;
    if g is null or g < 1 or g > 2000 then
      raise exception 'icindekiler_gram: 1-2000 g' using errcode = 'P0001';
    end if;
    select t.* into r from temel_100g t where t.yemek_id = (kalem->>'id')::uuid;
    if not found then
      raise exception 'icindekiler_kalem: temel gidalarda yok' using errcode = 'P0001';
    end if;
    t_kcal := t_kcal + r.kcal * g / 100;
    t_p := t_p + r.protein * g / 100;
    t_l := t_l + r.lif * g / 100;
    t_y := t_y + r.yag * g / 100;
    if r.seker is null then eksik := true; else t_s := t_s + r.seker * g / 100; end if;
  end loop;
  if round(t_kcal) < 1 or round(t_kcal) > 5000 then
    raise exception 'icindekiler_kcal: toplam 1-5000 kcal olmali' using errcode = 'P0001';
  end if;
  new.icindekiler := (select jsonb_agg(jsonb_build_object('id', e->>'id', 'g', round((e->>'g')::numeric))) from jsonb_array_elements(new.icindekiler) e);
  new.kcal := round(t_kcal);
  new.protein := round(t_p);
  new.lif := round(t_l);
  new.yag := round(t_y);
  new.seker := round(t_s);
  new.seker_eksik := eksik;
  return new;
end $$;
revoke execute on function public.oneri_icindekiler_hesapla() from public, anon, authenticated;
create trigger oneri_icindekiler before insert on public.oneriler
  for each row execute function public.oneri_icindekiler_hesapla();

-- 3) Eşik trigger'ı: yayına girerken makroları, içindekileri ve tarifi de taşır.
--    Şekeri bilinmeyen kalem varsa yemekte şeker boş kalır (eksik toplamı yazmak yanıltır).
create or replace function public.oneri_esik_kontrol()
returns trigger language plpgsql security definer set search_path = public as $$
declare n int; o record;
begin
  select count(*) into n from oneri_oylar where oneri_id = new.oneri_id;
  if n >= 5 then
    select * into o from oneriler where id = new.oneri_id and durum = 'bekliyor';
    if found then
      insert into yemekler (mutfak, ad, kcal, doyuruculuk, protein, lif, yag, seker, icindekiler, tarif, kaynak)
      values (o.mutfak, o.ad, coalesce(o.kcal, 250), 100, o.protein, o.lif, o.yag,
              case when o.seker_eksik then null else o.seker end,
              o.icindekiler, o.tarif,
              case when o.icindekiler is not null then 'Halk keşfi · içindekiler USDA FDC 100 g referanslarından hesaplandı' end);
      update oneriler set durum = 'onaylandi' where id = o.id;
    end if;
  end if;
  return new;
end $$;
revoke execute on function public.oneri_esik_kontrol() from public, anon, authenticated;
