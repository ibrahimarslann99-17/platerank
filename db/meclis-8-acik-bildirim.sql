-- Meclis-i Mide: saat bildirimi girişsiz (13.10.2026)
-- 1) Tokluk saati bildirimi herkese açık. Rozet, öneri ve öneri oyu üyelerde kalır
--    (uye_damgala o tablolarda aynen çalışıyor).
-- 2) Kimlik: üye ise 'u:<uid>' (eskisi gibi). Üye değilse istemci cihazındaki gizli
--    kimliği 'd:<uuid>' olarak gönderir; a_cihaz_ozetle bunu sha256'lar. Herkese açık
--    okumada yalnızca özet görünür, başkasının oyunu ezmek için ham kimlik gerekir.
-- 3) uye sütunu üye oylarını ayrı işaretler; ileride ağırlık verilecekse buradan.
-- 4) Kota: üye olmayan bildirimde cihaz başına 24 saatte 20, IP başına 40.
--    Sayaç oy_kota tablosunda; anon/authenticated okuyamaz, 2 günden eskisi silinir.

alter table public.oylar add column if not exists uye boolean not null default false;
update public.oylar set uye = true where cihaz like 'h:%' and uye = false;

create table if not exists public.oy_kota(
  id bigserial primary key,
  ip_h text,
  cihaz text not null,
  created_at timestamptz not null default now()
);
alter table public.oy_kota enable row level security;
revoke all on public.oy_kota from anon, authenticated;
create index if not exists oy_kota_zaman on public.oy_kota(created_at);
create index if not exists oy_kota_ip on public.oy_kota(ip_h, created_at);
create index if not exists oy_kota_cihaz on public.oy_kota(cihaz, created_at);

create or replace function public.oy_kimlik() returns trigger
language plpgsql security definer set search_path = public as $$
declare h json; ip text; iph text; n int;
begin
  if auth.uid() is not null and not coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then
    new.cihaz := 'u:' || auth.uid()::text;
    new.uye := true;
    return new;
  end if;
  if new.cihaz is null or new.cihaz !~ '^d:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    raise exception 'cihaz_gecersiz' using errcode = '42501';
  end if;
  new.uye := false;
  begin
    h := nullif(current_setting('request.headers', true), '')::json;
  exception when others then h := null;
  end;
  ip := coalesce(h->>'cf-connecting-ip', h->>'x-real-ip', split_part(h->>'x-forwarded-for', ',', 1));
  iph := case when nullif(trim(ip), '') is null then null
              else encode(sha256(convert_to('platerank-kota:' || trim(ip), 'UTF8')), 'hex') end;
  delete from oy_kota where created_at < now() - interval '2 days';
  select count(*) into n from oy_kota where cihaz = new.cihaz and created_at > now() - interval '1 day';
  if n >= 20 then raise exception 'gunluk_sinir' using errcode = 'P0001'; end if;
  if iph is not null then
    select count(*) into n from oy_kota where ip_h = iph and created_at > now() - interval '1 day';
    if n >= 40 then raise exception 'gunluk_sinir' using errcode = 'P0001'; end if;
  end if;
  insert into oy_kota(ip_h, cihaz) values (iph, new.cihaz);
  return new;
end $$;
revoke execute on function public.oy_kimlik() from public, anon, authenticated;

-- oylar: üyelik tetiği yerine oy_kimlik (a0_ adı korunur: a_cihaz_ozetle'den önce çalışır)
drop trigger if exists a0_uye_damgala on public.oylar;
drop trigger if exists a0_oy_kimlik on public.oylar;
create trigger a0_oy_kimlik before insert on public.oylar for each row execute function public.oy_kimlik();

drop policy if exists "uye bildirir" on public.oylar;
drop policy if exists "herkes saat bildirir" on public.oylar;
create policy "herkes saat bildirir" on public.oylar for insert to anon, authenticated
  with check (saat_dk is not null and lig is null
              and (select ayarlar.oylama_acik from public.ayarlar where ayarlar.id = 1));
