-- =============================================================================
--  Adminisztrátor és tisztségviselő beállítása
--
--  ELŐFELTÉTEL — ezt kézzel kell megtenni, mert jelszót SQL-ből nem állítunk:
--
--    Supabase Dashboard -> Authentication -> Users -> "Add user"
--       -> "Create new user"
--       -> Email:    admin@visitkoszeg.hu
--       -> Password: (a megbeszélt admin jelszó)
--       -> "Auto Confirm User"  <-- FONTOS, pipáld be
--       -> Create user
--
--  Ismételd meg a saját, személyes fiókodra is (pl. avar.szilveszter@gmail.com).
--
--  Ezután futtasd le ezt a szkriptet. Újrafuttatható.
--
--  A jelszó SOHA nem kerül a forráskódba és nem kerül ki a böngészőbe.
-- =============================================================================

-- -----------------------------------------------------------------------------
--  1. Rendszergazda fiók
-- -----------------------------------------------------------------------------
do $$
declare
  admin_email text := 'admin@visitkoszeg.hu';   -- <- igazítsd, ha mást használsz
  uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(admin_email);

  if uid is null then
    raise exception
      'Nincs ilyen felhasználó: %. Előbb hozd létre a Dashboard -> Authentication -> Users felületen (Auto Confirm bepipálva).',
      admin_email;
  end if;

  -- Profil (a trigger már létrehozta; itt csak a tisztségnevet írjuk rá)
  insert into public.profiles (id, account_email, full_name, custom_title, member_category)
  values (uid, admin_email, 'Rendszergazda', 'Rendszergazda', 'Elnökségi tag')
  on conflict (id) do update
    set custom_title    = coalesce(excluded.custom_title, public.profiles.custom_title),
        member_category = coalesce(excluded.member_category, public.profiles.member_category);

  -- Admin szerepkör
  insert into public.user_roles (user_id, role)
  values (uid, 'admin')
  on conflict (user_id, role) do nothing;

  -- A regisztrációs trigger által adott 'member' szerep itt már felesleges
  delete from public.user_roles where user_id = uid and role = 'member';

  raise notice 'Rendszergazda beállítva: % (%)', admin_email, uid;
end $$;

-- -----------------------------------------------------------------------------
--  2. Digitális Kőszeg alelnök
--
--  Az 'admin' szerepkör mellé nem kell más. Ha ez a fiók CSAK alelnök legyen
--  (tartalom + munkacsoportok + dokumentumok, tagdíj nélkül), akkor hagyd
--  benne a 'vicepresident' sort és NE add hozzá az 'admin'-t.
-- -----------------------------------------------------------------------------
do $$
declare
  vp_email text := 'avar.szilveszter@gmail.com';  -- <- igazítsd, ha kell
  vp_title text := 'Digitális Kőszeg alelnök';
  uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(vp_email);

  if uid is null then
    raise notice
      'Kihagyva: nincs ilyen felhasználó: %. Hozd létre a Dashboardon, majd futtasd újra.',
      vp_email;
    return;
  end if;

  insert into public.profiles (id, account_email, custom_title, member_category)
  values (uid, vp_email, vp_title, 'Elnökségi tag')
  on conflict (id) do update
    set custom_title    = vp_title,
        member_category = 'Elnökségi tag';

  insert into public.user_roles (user_id, role)
  values (uid, 'vicepresident')
  on conflict (user_id, role) do nothing;

  delete from public.user_roles where user_id = uid and role = 'member';

  raise notice 'Alelnök beállítva: % — %', vp_email, vp_title;
end $$;

-- -----------------------------------------------------------------------------
--  3. Ellenőrzés — ezt érdemes megnézni futtatás után
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
