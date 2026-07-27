-- =============================================================================
--  SZEREPKÖR-KIOSZTÁS JAVÍTÁSA + ÖNKIZÁRÁS ELLENI VÉDELEM
--
--  A HIBA: a felület a szerepkörök mentésekor először TÖRÖLTE a tag összes
--  szerepkörét, majd beszúrta az újakat. Ha valaki SAJÁT MAGÁT szerkesztette,
--  a törlés elvette a saját admin jogát, és az azt követő beszúrást az RLS már
--  elutasította — mert addigra a kérés küldője nem volt admin.
--  Eredmény: "new row violates row-level security policy for table user_roles",
--  és a felhasználó admin jog nélkül maradt.
--
--  A JAVÍTÁS: a szerepkör-beállítás egyetlen adatbázis-függvénybe kerül, ami
--    - EGYSZER ellenőrzi a hívó jogosultságát, még a törlés előtt,
--    - egy tranzakcióban végzi a módosítást,
--    - és nem engedi, hogy az utolsó admin megfossza magát a jogától.
--
--  Futtatás: Supabase Dashboard -> SQL Editor -> RUN (egészben).
--  Adatot nem töröl. Újrafuttatható.
-- =============================================================================

-- -----------------------------------------------------------------------------
--  1. ELSŐ LÉPÉS: az admin jog visszaadása
--
--  Ha az önkizárás megtörtént, ez helyreteszi. Igazítsd az e-mail címeket, ha
--  másokat használsz.
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
--  2. Szerepkör-beállítás egyetlen, biztonságos művelettel
--
--  SECURITY DEFINER: a jogosultság-ellenőrzést a függvény maga végzi el az
--  ELEJÉN, így a köztes állapot (amikor a tagnak épp nincs szerepköre) nem tudja
--  megbuktatni a saját műveletét.
-- -----------------------------------------------------------------------------
create or replace function public.set_user_roles(
  target_user uuid,
  new_roles   text[]
)
returns text[]
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller           uuid := auth.uid();
  caller_is_admin  boolean;
  caller_can_manage boolean;
  wants_admin      boolean;
  target_had_admin boolean;
  other_admins     integer;
  cleaned          text[];
begin
  if caller is null then
    raise exception 'Ehhez be kell lépni.';
  end if;

  -- A jogosultságot MOST ellenőrizzük, a módosítás előtt.
  select exists (
    select 1 from public.user_roles
    where user_id = caller and role = 'admin'::public.app_role
  ) into caller_is_admin;

  select exists (
    select 1 from public.user_roles
    where user_id = caller
      and role in ('admin'::public.app_role, 'president'::public.app_role)
  ) into caller_can_manage;

  if not caller_can_manage then
    raise exception 'Nincs jogosultságod szerepkört módosítani.';
  end if;

  -- Ismétlődések és üres értékek kiszűrése
  select coalesce(array_agg(distinct r), '{}')
    into cleaned
  from unnest(coalesce(new_roles, '{}')) as r
  where r is not null and r <> '';

  wants_admin := 'admin' = any(cleaned);

  -- Admin jogot csak admin adhat.
  if wants_admin and not caller_is_admin then
    raise exception 'Admin szerepkört csak rendszergazda oszthat ki.';
  end if;

  select exists (
    select 1 from public.user_roles
    where user_id = target_user and role = 'admin'::public.app_role
  ) into target_had_admin;

  -- ÖNKIZÁRÁS ELLENI VÉDELEM:
  -- ha az utolsó adminról vennénk le az admin jogot, ne engedjük.
  if target_had_admin and not wants_admin then
    select count(*) into other_admins
    from public.user_roles
    where role = 'admin'::public.app_role
      and user_id <> target_user;

    if other_admins = 0 then
      raise exception
        'Ez az utolsó rendszergazda — nem vehető el tőle az admin jog. Előbb jelölj ki egy másik rendszergazdát.';
    end if;
  end if;

  -- A tényleges módosítás. Egy tranzakció, a hívó jogosultsága már eldőlt.
  delete from public.user_roles where user_id = target_user;

  if array_length(cleaned, 1) > 0 then
    insert into public.user_roles (user_id, role, granted_by)
    select target_user, r::public.app_role, caller
    from unnest(cleaned) as r
    on conflict (user_id, role) do nothing;
  end if;

  return cleaned;
end $$;

alter function public.set_user_roles(uuid, text[]) owner to postgres;
grant execute on function public.set_user_roles(uuid, text[]) to authenticated;

-- -----------------------------------------------------------------------------
--  3. Ellenőrzés — kinek van most szerepköre?
-- -----------------------------------------------------------------------------
select
  u.email,
  coalesce(
    (select string_agg(r.role::text, ', ' order by r.role)
     from public.user_roles r where r.user_id = u.id),
    '!!! NINCS SZEREPKOR !!!'
  ) as szerepkorok
from auth.users u
order by u.created_at;
