-- Meclis-i Mide, aşama 1 (Supabase migration: meclis_1_saat_rozet + meclis_1b_rozet_zaman_sirasi)
-- Canlıya MCP ile uygulandı; bu dosya kayıt için.

-- oylar: opsiyonel tok tutma süresi (dk). Eski oylar tokluk ligi, dokunulmadı.
alter table public.oylar add column saat_dk integer check (saat_dk between 30 and 360);

-- İçecek ve sadece malzeme kalemlerinde saat kabul edilmez.
create or replace function public.oy_saat_temizle()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.saat_dk is not null and exists(
    select 1 from yemekler y where y.id = new.yemek_id and (y.tur = 'icecek' or y.sadece_malzeme)
  ) then
    new.saat_dk := null;
  end if;
  return new;
end $$;
revoke execute on function public.oy_saat_temizle() from public, anon, authenticated;
create trigger oy_saat_temizle before insert on public.oylar
  for each row execute function public.oy_saat_temizle();

-- rozet_oylar: olay kaydı. (cihaz, yemek, rozet) için son satır geçerli; RLS oylar ile aynı.
create table public.rozet_oylar (
  id uuid primary key default gen_random_uuid(),
  yemek_id uuid not null references public.yemekler(id),
  cihaz text not null check (char_length(cihaz) between 10 and 80),
  rozet text not null check (rozet in ('cennetten_indi','cadi_kazani','soda_lazim','kafa_kapatir','tatli_krizi','gece_3')),
  aktif boolean not null default true,
  created_at timestamptz not null default clock_timestamp()
);
create index rozet_oylar_son_idx on public.rozet_oylar (yemek_id, cihaz, rozet, created_at desc);
alter table public.rozet_oylar enable row level security;
create policy "rozet herkes okur" on public.rozet_oylar for select using (true);
create policy "rozet ekleme aciksa" on public.rozet_oylar for insert
  with check ((select ayarlar.oylama_acik from public.ayarlar where ayarlar.id = 1));
create policy "admin rozet siler" on public.rozet_oylar for delete to authenticated using (true);

-- Tekillik ve 2 rozet sınırı son duruma göre.
create or replace function public.rozet_kontrol()
returns trigger language plpgsql set search_path = public as $$
declare simdiki boolean; aktif_n int;
begin
  perform pg_advisory_xact_lock(hashtext(new.cihaz || new.yemek_id::text));
  select r.aktif into simdiki from rozet_oylar r
   where r.yemek_id = new.yemek_id and r.cihaz = new.cihaz and r.rozet = new.rozet
   order by r.created_at desc limit 1;
  if coalesce(simdiki, false) = new.aktif then
    return null;
  end if;
  if new.aktif then
    select count(*) into aktif_n from (
      select distinct on (r.rozet) r.rozet, r.aktif from rozet_oylar r
       where r.yemek_id = new.yemek_id and r.cihaz = new.cihaz and r.rozet <> new.rozet
       order by r.rozet, r.created_at desc
    ) s where s.aktif;
    if aktif_n >= 2 then
      raise exception 'rozet_siniri: bir yemege en fazla 2 rozet' using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;
revoke execute on function public.rozet_kontrol() from public, anon, authenticated;
create trigger rozet_kontrol before insert on public.rozet_oylar
  for each row execute function public.rozet_kontrol();

-- Görünümler (security_invoker)
create view public.oy_son with (security_invoker = on) as
  select distinct on (o.yemek_id, o.cihaz) o.yemek_id, o.cihaz, o.lig, o.saat_dk, o.created_at
  from public.oylar o order by o.yemek_id, o.cihaz, o.created_at desc;

create view public.meclis_ozet with (security_invoker = on) as
  select s.yemek_id, count(*)::int as oy,
    count(*) filter (where s.lig = 'S')::int as s, count(*) filter (where s.lig = 'A')::int as a,
    count(*) filter (where s.lig = 'B')::int as b, count(*) filter (where s.lig = 'C')::int as c,
    count(*) filter (where s.lig = 'D')::int as d, count(s.saat_dk)::int as saatli,
    percentile_cont(0.5) within group (order by s.saat_dk) filter (where s.saat_dk is not null) as medyan_dk,
    max(s.created_at) as son_oy
  from public.oy_son s group by s.yemek_id;

create view public.rozet_durumu with (security_invoker = on) as
  select t.yemek_id, t.rozet, count(*)::int as adet
  from (select distinct on (r.yemek_id, r.cihaz, r.rozet) r.yemek_id, r.rozet, r.aktif
        from public.rozet_oylar r order by r.yemek_id, r.cihaz, r.rozet, r.created_at desc) t
  where t.aktif group by t.yemek_id, t.rozet;

-- k: sitede 20 saatli oy olana kadar null; sonra en az 5 saatli oyu olan yemeklerde
-- median(site_puani / (medyan_dk / max(kcal,100))).
create view public.meclis_k with (security_invoker = on) as
  with oz as (
    select m.medyan_dk, m.saatli, y.doyuruculuk, greatest(y.kcal, 100) as kcal_t
    from public.meclis_ozet m join public.yemekler y on y.id = m.yemek_id
    where y.yayinda and m.saatli > 0)
  select (select coalesce(sum(saatli), 0) from oz)::int as toplam_saatli,
    (select count(*) from oz where saatli >= 5)::int as uygun_yemek,
    case when (select coalesce(sum(saatli), 0) from oz) >= 20 then
      (select percentile_cont(0.5) within group (order by doyuruculuk / (medyan_dk / kcal_t)) from oz where saatli >= 5)
    end as k,
    (select min(doyuruculuk) from public.yemekler where yayinda) as site_min,
    (select max(doyuruculuk) from public.yemekler where yayinda) as site_max;
