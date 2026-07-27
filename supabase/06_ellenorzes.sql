-- =============================================================================
--  ELLENŐRZÉS — csak egyetlen kérdés, semmit nem módosít.
--
--  FONTOS: a Supabase SQL Editor alapból csak az UTOLSÓ utasítás eredményét
--  mutatja. Ezért van ez külön fájlban: itt egyetlen SELECT van, tehát az
--  eredményt biztosan látni fogod.
--
--  Amit látnod kell:
--
--    account_email                | tisztseg                  | szerepkorok
--    -----------------------------+---------------------------+-------------
--    admin@visitkoszeg.hu         | Rendszergazda             | admin
--    avar.szilveszter@gmail.com   | Digitális Kőszeg alelnök  | admin
--
--  Ha a "szerepkorok" oszlopban "admin" áll, az adatbázis rendben van, és a
--  hiba a böngészőben keresendő: npm run build, majd Ctrl+Shift+R és újra
--  belépés.
-- =============================================================================

select
  u.email                                        as account_email,
  coalesce(p.custom_title, '— nincs —')          as tisztseg,
  coalesce(
    (select string_agg(r.role::text, ', ' order by r.role)
     from public.user_roles r
     where r.user_id = u.id),
    '!!! NINCS SZEREPKOR !!!'
  )                                              as szerepkorok,
  case when p.id is null then '!!! NINCS PROFIL !!!' else 'van profil' end as profil,
  u.email_confirmed_at is not null               as email_megerositve
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at;
