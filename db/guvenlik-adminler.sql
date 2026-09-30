-- Güvenlik (Supabase migration: guvenlik_adminler_rls), 30.09.2026. Canlıya MCP ile uygulandı; bu dosya kayıt için.
-- authenticated artık admin değil; yetkiyi adminler tablosu belirler.
create table public.adminler (
  user_id uuid primary key references auth.users(id) on delete cascade,
  eklendi timestamptz not null default now()
);
alter table public.adminler enable row level security;
create policy "admin kendi satirini gorur" on public.adminler for select to authenticated
  using (user_id = (select auth.uid()));
revoke insert, update, delete, truncate on public.adminler from anon, authenticated;
insert into public.adminler (user_id) select id from auth.users where email = 'ibrahimarslann99@gmail.com';

drop policy "admin yemek tam yetki" on public.yemekler;
create policy "admin yemek okur" on public.yemekler for select to authenticated
  using (exists (select 1 from public.adminler where user_id = (select auth.uid())));
create policy "admin yemek ekler" on public.yemekler for insert to authenticated
  with check (exists (select 1 from public.adminler where user_id = (select auth.uid())));
create policy "admin yemek gunceller" on public.yemekler for update to authenticated
  using (exists (select 1 from public.adminler where user_id = (select auth.uid())))
  with check (exists (select 1 from public.adminler where user_id = (select auth.uid())));
create policy "admin yemek siler" on public.yemekler for delete to authenticated
  using (exists (select 1 from public.adminler where user_id = (select auth.uid())));

drop policy "oneri admin okur" on public.oneriler;
drop policy "oneri admin gunceller" on public.oneriler;
drop policy "oneri admin siler" on public.oneriler;
create policy "oneri admin okur" on public.oneriler for select to authenticated
  using (exists (select 1 from public.adminler where user_id = (select auth.uid())));
create policy "oneri admin gunceller" on public.oneriler for update to authenticated
  using (exists (select 1 from public.adminler where user_id = (select auth.uid())))
  with check (exists (select 1 from public.adminler where user_id = (select auth.uid())));
create policy "oneri admin siler" on public.oneriler for delete to authenticated
  using (exists (select 1 from public.adminler where user_id = (select auth.uid())));

drop policy "ayar admin gunceller" on public.ayarlar;
create policy "ayar admin gunceller" on public.ayarlar for update to authenticated
  using (exists (select 1 from public.adminler where user_id = (select auth.uid())))
  with check (exists (select 1 from public.adminler where user_id = (select auth.uid())));

drop policy "oneri oyu admin siler" on public.oneri_oylar;
create policy "oneri oyu admin siler" on public.oneri_oylar for delete to authenticated
  using (exists (select 1 from public.adminler where user_id = (select auth.uid())));

-- oylar ve rozet_oylar: silme kimseye açık değil, güncelleme politikası yok.
drop policy "admin oy siler" on public.oylar;
drop policy "admin rozet siler" on public.rozet_oylar;

-- Kendi cihaz kaydına yazma: cihaz değeri sunucuda SHA-256 özetiyle saklanır.
create or replace function public.cihaz_ozetle()
returns trigger language plpgsql set search_path = public as $$
begin
  new.cihaz := 'h:' || encode(sha256(convert_to(new.cihaz, 'UTF8')), 'hex');
  return new;
end $$;
revoke execute on function public.cihaz_ozetle() from public, anon, authenticated;
create trigger a_cihaz_ozetle before insert on public.oylar for each row execute function public.cihaz_ozetle();
create trigger a_cihaz_ozetle before insert on public.rozet_oylar for each row execute function public.cihaz_ozetle();
update public.oylar set cihaz = 'h:' || encode(sha256(convert_to(cihaz, 'UTF8')), 'hex');
update public.rozet_oylar set cihaz = 'h:' || encode(sha256(convert_to(cihaz, 'UTF8')), 'hex');
