-- Meclis-i Mide: ikili oy sistemi (14.10.2026)
-- 1) Girişsiz oy açık kalır ama sitedeki halk medyanında yarım ağırlıkla sayılır:
--    girişli oy 2, girişsiz oy 1 katsayıyla medyana girer (oran aynı: girişsiz = yarım).
--    "saatli" gerçek kişi sayısı olarak kalır; "uyeli" girişli kişi sayısıdır.
-- 2) Satılabilir/temiz veri seti = oylar where uye = true.
-- 3) oylari_hesaba_tasi(cihaz): kişi giriş yapınca o cihazdan verdiği girişsiz oylar
--    hesabına taşınır ve tam sayılır. Ham cihaz kimliği yalnızca o cihazın
--    localStorage'ında durur; başkası bilemez.

create or replace view public.oy_son with (security_invoker = on) as
 select distinct on (yemek_id, cihaz) yemek_id, cihaz, lig, saat_dk, created_at, uye
   from public.oylar o
  order by yemek_id, cihaz, created_at desc;

create or replace view public.meclis_ozet with (security_invoker = on) as
 select s.yemek_id,
    (count(*))::integer as oy,
    (count(*) filter (where s.lig = 'S'))::integer as s,
    (count(*) filter (where s.lig = 'A'))::integer as a,
    (count(*) filter (where s.lig = 'B'))::integer as b,
    (count(*) filter (where s.lig = 'C'))::integer as c,
    (count(*) filter (where s.lig = 'D'))::integer as d,
    (count(s.saat_dk))::integer as saatli,
    (select percentile_cont(0.5) within group (order by (x.saat_dk)::double precision)
       from public.oy_son x
       cross join lateral generate_series(1, case when x.uye then 2 else 1 end)
      where x.yemek_id = s.yemek_id and x.saat_dk is not null) as medyan_dk,
    max(s.created_at) as son_oy,
    (count(s.saat_dk) filter (where s.uye))::integer as uyeli
   from public.oy_son s
  group by s.yemek_id;

create or replace function public.oylari_hesaba_tasi(p_cihaz text) returns integer
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); n int;
begin
  if uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then
    raise exception 'giris_gerekli' using errcode = '42501';
  end if;
  if p_cihaz is null or p_cihaz !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    raise exception 'cihaz_gecersiz' using errcode = '22023';
  end if;
  update oylar
     set cihaz = 'h:' || encode(sha256(convert_to('u:' || uid::text, 'UTF8')), 'hex'),
         uye = true
   where cihaz = 'h:' || encode(sha256(convert_to('d:' || p_cihaz, 'UTF8')), 'hex')
     and uye = false;
  get diagnostics n = row_count;
  return n;
end $$;
revoke execute on function public.oylari_hesaba_tasi(text) from public, anon;
grant execute on function public.oylari_hesaba_tasi(text) to authenticated;
