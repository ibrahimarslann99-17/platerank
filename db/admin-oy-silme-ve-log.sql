-- Supabase migration: admin_oy_silme_ve_yemekler_log (30.09.2026). Canlıya MCP ile uygulandı; kayıt için.
-- Ayrıca SQL ile: ibrahimaslann99@gmail.com (yazım hatalı ikinci hesap) auth.users'tan silindi.

-- 1) oylar ve rozet_oylar: silme sadece admine.
create policy "admin oy siler" on public.oylar for delete to authenticated
  using (exists (select 1 from public.adminler where user_id = (select auth.uid())));
create policy "admin rozet siler" on public.rozet_oylar for delete to authenticated
  using (exists (select 1 from public.adminler where user_id = (select auth.uid())));
alter table public.rozet_oylar drop constraint rozet_oylar_yemek_id_fkey,
  add constraint rozet_oylar_yemek_id_fkey foreign key (yemek_id) references public.yemekler(id) on delete cascade;

-- 2) updated_at (mevcut satırlar created_at ile başladı)
alter table public.yemekler add column updated_at timestamptz;
update public.yemekler set updated_at = created_at;
alter table public.yemekler alter column updated_at set default now(), alter column updated_at set not null;
create or replace function public.yemek_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end $$;
revoke execute on function public.yemek_updated_at() from public, anon, authenticated;
create trigger yemek_updated_at before update on public.yemekler
  for each row execute function public.yemek_updated_at();

-- 3) yemekler_log: sadece admin okur, kimse elle yazamaz; sadece trigger yazar.
create table public.yemekler_log (
  id bigint generated always as identity primary key,
  zaman timestamptz not null default now(),
  islem text not null check (islem in ('INSERT','UPDATE','DELETE')),
  yemek_id uuid not null,
  eski jsonb,
  yeni jsonb,
  kullanici uuid,
  rol text,
  kaynak text not null     -- kullanici | trigger | api | sql
);
create index yemekler_log_yemek_idx on public.yemekler_log (yemek_id, zaman desc);
alter table public.yemekler_log enable row level security;
create policy "log admin okur" on public.yemekler_log for select to authenticated
  using (exists (select 1 from public.adminler where user_id = (select auth.uid())));
revoke insert, update, delete, truncate on public.yemekler_log from anon, authenticated;

create or replace function public.yemek_log_yaz()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  rol text := coalesce(nullif(current_setting('role', true), 'none'), session_user::text);
  jwt text := current_setting('request.jwt.claims', true);
  kaynak text;
begin
  kaynak := case
    when pg_trigger_depth() > 1 then 'trigger'
    when uid is not null then 'kullanici'
    when jwt is not null and jwt <> '' then 'api'
    else 'sql'
  end;
  insert into yemekler_log (islem, yemek_id, eski, yeni, kullanici, rol, kaynak)
  values (tg_op, coalesce(new.id, old.id),
          case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
          case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end,
          uid, rol, kaynak);
  return null;
end $$;
revoke execute on function public.yemek_log_yaz() from public, anon, authenticated;
create trigger yemek_log after insert or update or delete on public.yemekler
  for each row execute function public.yemek_log_yaz();
