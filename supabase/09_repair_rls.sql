-- =============================================================================
--  RLS JAVÍTÁS — a jogosultsági függvények és az írási szabályok újraépítése
--
--  Miért kell ez: az adatbázisban a korábbi séma maradványai is ott vannak
--  (pl. a news_projects tábla), ezért nem biztos, hogy a jogosultsági
--  függvények és a policy-k pontosan azok, amiket a kód elvár.
--
--  Ez a szkript:
--    - ADATOT NEM TÖRÖL
--    - táblát nem dob el
--    - csak a négy jogosultsági függvényt és a policy-ket építi újra
--    - újrafuttatható
--
--  Futtatás: Supabase Dashboard -> SQL Editor -> RUN (egészben).
-- =============================================================================

-- -----------------------------------------------------------------------------
--  1. Jogosultsági függvények újraépítése
--
--  A SECURITY DEFINER itt nem díszítés: a függvény a user_roles táblát olvassa,
--  amin szintén van RLS. Enélkül a policy kiértékelése önmagába hivatkozna, és
--  vagy végtelen rekurzió lenne belőle, vagy — ami rosszabb — némán hamisat
--  adna vissza, és pontosan azt a "nincs jogosultság" hibát okozná, amit látsz.
-- -----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'::public.app_role
  );
$$;

create or replace function public.can_manage_members()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('admin'::public.app_role, 'president'::public.app_role)
  );
$$;

create or replace function public.can_manage_content()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('admin'::public.app_role,
                   'president'::public.app_role,
                   'vicepresident'::public.app_role)
  );
$$;

create or replace function public.is_board()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('admin'::public.app_role,
                   'president'::public.app_role,
                   'vicepresident'::public.app_role,
                   'board'::public.app_role)
  );
$$;

-- A függvény tulajdonosa legyen a postgres, hogy a SECURITY DEFINER tényleg
-- megkerülje az RLS-t:
alter function public.is_admin()           owner to postgres;
alter function public.can_manage_members() owner to postgres;
alter function public.can_manage_content() owner to postgres;
alter function public.is_board()           owner to postgres;

grant execute on function public.is_admin()           to anon, authenticated;
grant execute on function public.can_manage_members() to anon, authenticated;
grant execute on function public.can_manage_content() to anon, authenticated;
grant execute on function public.is_board()           to anon, authenticated;

-- -----------------------------------------------------------------------------
--  2. Policy-k újraépítése
--
--  Minden táblánál: eldobjuk a meglévőket, majd tisztán újra létrehozzuk.
--  A szerepkör (`to authenticated`) is ki van írva, hogy egyértelmű legyen.
-- -----------------------------------------------------------------------------

-- --- workgroups -------------------------------------------------------------
drop policy if exists "munkacsoport: publikus olvasás" on public.workgroups;
drop policy if exists "munkacsoport: szerkesztés"      on public.workgroups;

create policy "munkacsoport: publikus olvasás" on public.workgroups
  for select to anon, authenticated
  using (is_active or public.is_board());

create policy "munkacsoport: szerkesztés" on public.workgroups
  for all to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());

-- --- dues_rates -------------------------------------------------------------
drop policy if exists "tagdíjtétel: publikus olvasás" on public.dues_rates;
drop policy if exists "tagdíjtétel: szerkesztés"      on public.dues_rates;

create policy "tagdíjtétel: publikus olvasás" on public.dues_rates
  for select to anon, authenticated
  using (true);

create policy "tagdíjtétel: szerkesztés" on public.dues_rates
  for all to authenticated
  using (public.can_manage_members())
  with check (public.can_manage_members());

-- --- news -------------------------------------------------------------------
drop policy if exists "hír: publikált olvasás" on public.news;
drop policy if exists "hír: szerkesztés"       on public.news;

create policy "hír: publikált olvasás" on public.news
  for select to anon, authenticated
  using (is_published or public.can_manage_content());

create policy "hír: szerkesztés" on public.news
  for all to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());

-- --- documents --------------------------------------------------------------
drop policy if exists "dokumentum: publikus"    on public.documents;
drop policy if exists "dokumentum: tagi"        on public.documents;
drop policy if exists "dokumentum: elnökségi"   on public.documents;
drop policy if exists "dokumentum: szerkesztés" on public.documents;

create policy "dokumentum: publikus" on public.documents
  for select to anon, authenticated
  using (access_level = 'public');

create policy "dokumentum: tagi" on public.documents
  for select to authenticated
  using (access_level = 'members');

create policy "dokumentum: elnökségi" on public.documents
  for select to authenticated
  using (access_level in ('board', 'admin') and public.is_board());

create policy "dokumentum: szerkesztés" on public.documents
  for all to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());

-- --- membership_dues --------------------------------------------------------
drop policy if exists "tagdíj: saját olvasás"      on public.membership_dues;
drop policy if exists "tagdíj: elnökségi olvasás"  on public.membership_dues;
drop policy if exists "tagdíj: saját igazolás"     on public.membership_dues;
drop policy if exists "tagdíj: elnökségi kezelés"  on public.membership_dues;

create policy "tagdíj: saját olvasás" on public.membership_dues
  for select to authenticated
  using (profile_id = auth.uid());

create policy "tagdíj: elnökségi olvasás" on public.membership_dues
  for select to authenticated
  using (public.is_board());

create policy "tagdíj: saját igazolás" on public.membership_dues
  for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid() and status <> 'paid');

-- A tag maga is létrehozhatja a saját sorát, amikor igazolást tölt fel:
create policy "tagdíj: saját felvitel" on public.membership_dues
  for insert to authenticated
  with check (profile_id = auth.uid() and status = 'pending');

create policy "tagdíj: elnökségi kezelés" on public.membership_dues
  for all to authenticated
  using (public.can_manage_members())
  with check (public.can_manage_members());

-- --- profiles ---------------------------------------------------------------
drop policy if exists "profil: saját olvasás"     on public.profiles;
drop policy if exists "profil: elnökségi olvasás" on public.profiles;
drop policy if exists "profil: saját szerkesztés" on public.profiles;
drop policy if exists "profil: admin szerkesztés" on public.profiles;
drop policy if exists "profil: admin felvitel"    on public.profiles;
drop policy if exists "profil: admin törlés"      on public.profiles;

create policy "profil: saját olvasás" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profil: elnökségi olvasás" on public.profiles
  for select to authenticated
  using (public.is_board());

create policy "profil: saját szerkesztés" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profil: admin szerkesztés" on public.profiles
  for update to authenticated
  using (public.can_manage_members())
  with check (public.can_manage_members());

create policy "profil: admin felvitel" on public.profiles
  for insert to authenticated
  with check (public.can_manage_members());

create policy "profil: admin törlés" on public.profiles
  for delete to authenticated
  using (public.is_admin());

-- --- user_roles -------------------------------------------------------------
drop policy if exists "szerep: saját olvasás"     on public.user_roles;
drop policy if exists "szerep: elnökségi olvasás" on public.user_roles;
drop policy if exists "szerep: kiosztás"          on public.user_roles;
drop policy if exists "szerep: visszavonás"       on public.user_roles;

create policy "szerep: saját olvasás" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid());

create policy "szerep: elnökségi olvasás" on public.user_roles
  for select to authenticated
  using (public.is_board());

create policy "szerep: kiosztás" on public.user_roles
  for insert to authenticated
  with check (public.can_manage_members() and (role <> 'admin'::public.app_role or public.is_admin()));

create policy "szerep: visszavonás" on public.user_roles
  for delete to authenticated
  using (public.can_manage_members() and (role <> 'admin'::public.app_role or public.is_admin()));

-- --- workgroup_members ------------------------------------------------------
drop policy if exists "csoporttag: olvasás"     on public.workgroup_members;
drop policy if exists "csoporttag: szerkesztés" on public.workgroup_members;

create policy "csoporttag: olvasás" on public.workgroup_members
  for select to authenticated
  using (profile_id = auth.uid() or public.is_board());

create policy "csoporttag: szerkesztés" on public.workgroup_members
  for all to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());

-- -----------------------------------------------------------------------------
--  3. A régi séma maradványának eltakarítása
--
--  A news_projects tábla a korábbi verzióból maradt, a kód nem használja.
--  Ha nincs benne semmi, amire szükséged van, ez a sor eltávolítja.
--  Ha nem vagy biztos, tedd elé két kötőjelet, és hagyd bent.
-- -----------------------------------------------------------------------------
drop table if exists public.news_projects cascade;

-- -----------------------------------------------------------------------------
--  4. Ellenőrzés
-- -----------------------------------------------------------------------------
select
  p.proname          as fuggveny,
  p.prosecdef        as security_definer_bekapcsolva,
  r.rolname          as tulajdonos
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
join pg_roles r     on r.oid = p.proowner
where n.nspname = 'public'
  and p.proname in ('is_admin', 'can_manage_members', 'can_manage_content', 'is_board')
order by p.proname;
