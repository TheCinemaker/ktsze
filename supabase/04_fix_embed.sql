-- =============================================================================
--  JAVÍTÁS — PGRST201: "more than one relationship was found for
--            'profiles' and 'user_roles'"
--
--  OK: a user_roles táblának két idegen kulcsa volt a profiles-ra:
--        user_id    -> profiles(id)
--        granted_by -> profiles(id)
--      Ezért a PostgREST nem tudta eldönteni, melyiken kapcsolja össze a
--      profiles?select=*,user_roles(role) kérésnél.
--
--  MEGOLDÁS: a granted_by mostantól az auth.users-re hivatkozik. Így a
--      profiles <-> user_roles között pontosan EGY kapcsolat marad.
--
--  Ez a szkript NEM dob el adatot, és újrafuttatható.
--  Futtatás: Supabase Dashboard -> SQL Editor
-- =============================================================================

-- 1. A kétértelműséget okozó idegen kulcs átirányítása
alter table public.user_roles
  drop constraint if exists user_roles_granted_by_fkey;

alter table public.user_roles
  add constraint user_roles_granted_by_fkey
  foreign key (granted_by) references auth.users(id) on delete set null;

-- 2. Biztonsági háló: ha valamelyik felhasználó a séma lefuttatása ELŐTT jött
--    létre a Dashboardon, akkor nem futott rá a profil-létrehozó trigger.
--    Ez pótolja a hiányzó profilokat.
insert into public.profiles (id, account_email, full_name)
select
  u.id,
  u.email,
  nullif(u.raw_user_meta_data->>'full_name', '')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
  and u.email is not null;

-- 3. Ellenőrzés — ezt nézd meg a futtatás után.
--    Az "szerepkorok" oszlopban ott kell lennie az adminnak, illetve az
--    alelnöknek. Ha "nincs szerepkör" szerepel, futtasd le újra a 03_admin.sql-t.
select
  p.account_email,
  coalesce(p.full_name, '—')    as nev,
  coalesce(p.custom_title, '—') as tisztseg,
  coalesce(
    (select string_agg(r.role::text, ', ' order by r.role)
     from public.user_roles r where r.user_id = p.id),
    'nincs szerepkör'
  ) as szerepkorok
from public.profiles p
order by p.created_at;
