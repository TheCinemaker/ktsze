-- =============================================================================
--  ADMIN JOG ERŐSZAKOS BEÁLLÍTÁSA
--
--  Ez a legegyszerűbb lehetséges változat: nincs benne függvény, nincs benne
--  ciklus, nincs benne feltétel, ami néma kihagyáshoz vezethet. Csak sima SQL.
--
--  Futtatás: Supabase Dashboard -> SQL Editor -> New query -> beilleszt -> RUN
--  Futtasd le EGÉSZBEN, ne csak egy kijelölt részt.
--
--  Utána a böngészőben: Ctrl+Shift+R, majd léptesd ki és be magad.
-- =============================================================================

-- -----------------------------------------------------------------------------
--  1. Nézzük meg, mi van most. Ha itt üres a lista, akkor nincs egyetlen
--     felhasználó sem — akkor a Dashboard -> Authentication -> Users alatt
--     kell létrehozni őket, és a szkriptnek nincs mit beállítani.
-- -----------------------------------------------------------------------------
select 'ELOTTE' as mikor, id, email, email_confirmed_at is not null as megerositve
from auth.users
order by created_at;

-- -----------------------------------------------------------------------------
--  2. Profil pótlása MINDEN felhasználónak, akinek nincs.
-- -----------------------------------------------------------------------------
insert into public.profiles (id, account_email)
select u.id, u.email
from auth.users u
where u.email is not null
  and not exists (select 1 from public.profiles p where p.id = u.id);

-- -----------------------------------------------------------------------------
--  3. Admin szerepkör a két fiókra.
--     Ha más e-mail címet használsz, ÍRD ÁT itt.
-- -----------------------------------------------------------------------------
insert into public.user_roles (user_id, role)
select u.id, 'admin'::public.app_role
from auth.users u
where lower(u.email) in (
        'admin@visitkoszeg.hu',
        'avar.szilveszter@gmail.com'
      )
on conflict (user_id, role) do nothing;

-- -----------------------------------------------------------------------------
--  4. Az alap 'member' / 'patron' szerep levétele azoktól, akik már adminok.
--     (Nem kötelező, de így tisztább a kép a felületen.)
-- -----------------------------------------------------------------------------
delete from public.user_roles
where role in ('member'::public.app_role, 'patron'::public.app_role)
  and user_id in (
    select user_id from public.user_roles where role = 'admin'::public.app_role
  );

-- -----------------------------------------------------------------------------
--  5. Tisztségnevek
-- -----------------------------------------------------------------------------
update public.profiles
   set custom_title = 'Rendszergazda',
       member_category = 'Elnökségi tag'
 where lower(account_email) = 'admin@visitkoszeg.hu';

update public.profiles
   set custom_title = 'Digitális Kőszeg alelnök',
       member_category = 'Elnökségi tag'
 where lower(account_email) = 'avar.szilveszter@gmail.com';

-- -----------------------------------------------------------------------------
--  6. EREDMÉNY — ez a lényeg. A "szerepkorok" oszlopban ott kell lennie az
--     "admin" szónak. Ha nincs, akkor a 3. lépésben szereplő e-mail cím nem
--     egyezik azzal, amivel a fiók létre lett hozva — hasonlítsd össze az
--     1. lépés kimenetével.
-- -----------------------------------------------------------------------------
select
  'UTANA' as mikor,
  p.account_email,
  coalesce(p.custom_title, '—') as tisztseg,
  coalesce(
    (select string_agg(r.role::text, ', ' order by r.role)
     from public.user_roles r where r.user_id = p.id),
    '!!! NINCS SZEREPKOR !!!'
  ) as szerepkorok
from public.profiles p
order by p.created_at;

-- -----------------------------------------------------------------------------
--  7. Ellenőrizzük, hogy a jogosultsági függvények is léteznek-e.
--     Mind a négynek szerepelnie kell a listában.
-- -----------------------------------------------------------------------------
select routine_name as letezo_jogosultsagi_fuggveny
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('is_admin', 'can_manage_members', 'can_manage_content', 'is_board')
order by routine_name;
