-- =============================================================================
--  Rendszergazda és tisztségviselők beállítása
--
--  ELŐFELTÉTEL: a fiókoknak MÁR LÉTEZNIÜK KELL a Supabase Authentication
--  felületén. Jelszót SQL-ből nem állítunk.
--
--    Dashboard -> Authentication -> Users -> "Add user" -> "Create new user"
--       Email:    admin@visitkoszeg.hu
--       Password: (a megbeszélt jelszó)
--       "Auto Confirm User"  <-- FONTOS, pipáld be
--
--  Ha ezt a szkriptet a fiókok létrehozása ELŐTT futtatod le, egyszerűen
--  kihagyja őket — utána futtasd le újra. Bármikor újrafuttatható.
--
--  A jelszó SOHA nem kerül a forráskódba és nem kerül ki a böngészőbe.
-- =============================================================================

-- -----------------------------------------------------------------------------
--  Segédfüggvény: szerepkör kiosztása e-mail cím alapján
-- -----------------------------------------------------------------------------
create or replace function public.grant_role_by_email(
  target_email text,
  target_role  text,
  target_title text default null,
  drop_member  boolean default true
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(target_email);

  if uid is null then
    return format('KIHAGYVA — nincs ilyen felhasznalo: %s (hozd letre a Dashboardon, majd futtasd ujra)', target_email);
  end if;

  -- Profil pótlása, ha a felhasználó a séma előtt jött létre
  insert into public.profiles (id, account_email)
  values (uid, target_email)
  on conflict (id) do nothing;

  if target_title is not null then
    update public.profiles
       set custom_title    = target_title,
           member_category = 'Elnökségi tag'
     where id = uid;
  end if;

  insert into public.user_roles (user_id, role)
  values (uid, target_role::public.app_role)
  on conflict (user_id, role) do nothing;

  -- A regisztrációs trigger által adott alap szerep itt már felesleges
  if drop_member then
    delete from public.user_roles
     where user_id = uid
       and role in ('member'::public.app_role, 'patron'::public.app_role);
  end if;

  return format('OK — %s -> %s', target_email, target_role);
end $$;

-- -----------------------------------------------------------------------------
--  Szerepkörök kiosztása
--
--  Igazítsd az e-mail címeket, ha máshogy hívják a fiókokat.
-- -----------------------------------------------------------------------------
select public.grant_role_by_email('admin@visitkoszeg.hu', 'admin', 'Rendszergazda')        as eredmeny
union all
select public.grant_role_by_email('avar.szilveszter@gmail.com', 'admin', 'Digitális Kőszeg alelnök');

-- Megjegyzés: a fenti sor az avar.szilveszter fióknak 'admin' szerepkört ad,
-- hogy azonnal MINDENT láss. Ha később szűkíteni akarod tényleges alelnöki
-- jogkörre (tartalom + munkacsoportok + dokumentumok, tagdíj nélkül), futtasd:
--
--   delete from public.user_roles
--    where user_id = (select id from auth.users where email = 'avar.szilveszter@gmail.com')
--      and role = 'admin';
--   select public.grant_role_by_email('avar.szilveszter@gmail.com', 'vicepresident', 'Digitális Kőszeg alelnök');

-- -----------------------------------------------------------------------------
--  Ellenőrzés — ennek kell látszania a futtatás után
-- -----------------------------------------------------------------------------
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
