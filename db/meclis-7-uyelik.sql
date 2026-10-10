-- Meclis-i Mide sadeleşme (Ekim 2026)
-- 1) Yazma üyelere açık: tokluk bildirimi, rozet, öneri ve öneri oyu için giriş şart.
-- 2) Kimlik hesaptan gelir: uye_damgala tetiği cihaz alanını 'u:<uid>' yapar
--    (istemcinin gönderdiği değer yok sayılır), ardından cihaz_ozetle bunu sha256'lar.
--    Böylece mevcut "kişi başı son oy" görünümleri (oy_son, rozet_durumu) olduğu gibi çalışır:
--    her üye bir yemekte tek ses, yeniden bildirirse eskisinin yerine geçer.
-- 3) Lig oyu bırakıldı: bildirim = saat (zorunlu) + en fazla 2 rozet (isteğe bağlı).

create or replace function public.uye_damgala() returns trigger
language plpgsql set search_path = public as $$
begin
  if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then
    raise exception 'uye_gerekli' using errcode = '42501';
  end if;
  new.cihaz := 'u:' || auth.uid()::text;
  return new;
end $$;

-- tetikler ada göre sırayla çalışır: a0_ < a_cihaz_ozetle < rozet_kontrol
drop trigger if exists a0_uye_damgala on public.oylar;
create trigger a0_uye_damgala before insert on public.oylar for each row execute function public.uye_damgala();
drop trigger if exists a0_uye_damgala on public.rozet_oylar;
create trigger a0_uye_damgala before insert on public.rozet_oylar for each row execute function public.uye_damgala();
drop trigger if exists a0_uye_damgala on public.oneri_oylar;
create trigger a0_uye_damgala before insert on public.oneri_oylar for each row execute function public.uye_damgala();
drop trigger if exists a_cihaz_ozetle on public.oneri_oylar;
create trigger a_cihaz_ozetle before insert on public.oneri_oylar for each row execute function public.cihaz_ozetle();

alter table public.oylar alter column lig drop not null;

drop policy if exists "oy ekleme aciksa" on public.oylar;
drop policy if exists "uye bildirir" on public.oylar;
create policy "uye bildirir" on public.oylar for insert to authenticated
  with check ((select auth.uid()) is not null and saat_dk is not null
              and (select ayarlar.oylama_acik from public.ayarlar where ayarlar.id = 1));

drop policy if exists "rozet ekleme aciksa" on public.rozet_oylar;
drop policy if exists "uye rozet basar" on public.rozet_oylar;
create policy "uye rozet basar" on public.rozet_oylar for insert to authenticated
  with check ((select auth.uid()) is not null
              and (select ayarlar.oylama_acik from public.ayarlar where ayarlar.id = 1));

drop policy if exists "oneri herkes ekler" on public.oneriler;
drop policy if exists "uye oneri ekler" on public.oneriler;
create policy "uye oneri ekler" on public.oneriler for insert to authenticated
  with check (durum = 'bekliyor' and (select auth.uid()) is not null);

drop policy if exists "oneri oyu herkes ekler" on public.oneri_oylar;
drop policy if exists "uye oneri oylar" on public.oneri_oylar;
create policy "uye oneri oylar" on public.oneri_oylar for insert to authenticated
  with check ((select auth.uid()) is not null);
