-- =============================================================================
--  RLS DIAGNOSZTIKA — miért utasítja el a mentést?
--
--  Ez a szkript SEMMIT NEM MÓDOSÍT. Csak megmutatja a tényleges állapotot,
--  és a végén SZIMULÁLJA a te bejelentkezett munkamenetedet.
--
--  Futtatás: Supabase Dashboard -> SQL Editor.
--
--  FONTOS: a Dashboard csak az UTOLSÓ eredményt mutatja. Ezért a lekérdezések
--  MEG VANNAK SZÁMOZVA, és egyenként kell lefuttatni:
--  jelöld ki az adott blokkot, és úgy nyomj RUN-t (Ctrl+Enter).
--  Az utolsó blokk (5.) a legfontosabb — ha csak egyet futtatsz, azt futtasd.
-- =============================================================================


-- ##### 1. BLOKK — Milyen a jogosultsági függvények tényleges tartalma? #####
-- Itt kell látnod a "security definer" szót és a user_roles hivatkozást.

select
  p.proname                                as fuggveny,
  p.prosecdef                              as security_definer,
  pg_get_function_identity_arguments(p.oid) as argumentumok,
  pg_get_functiondef(p.oid)                as teljes_definicio
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('is_admin', 'can_manage_members', 'can_manage_content', 'is_board')
order by p.proname;


-- ##### 2. BLOKK — Milyen RLS szabályok vannak valójában? #####
-- A "cmd" oszlopban ALL/INSERT/UPDATE mellett a "with_check" a döntő.

select
  tablename    as tabla,
  policyname   as szabaly,
  cmd          as muvelet,
  roles        as szerepek,
  qual         as using_kifejezes,
  with_check   as with_check_kifejezes
from pg_policies
where schemaname = 'public'
  and tablename in ('workgroups', 'dues_rates', 'news', 'documents', 'membership_dues', 'profiles', 'user_roles')
order by tablename, cmd, policyname;


-- ##### 3. BLOKK — Van-e régi, ide nem tartozó tábla? #####
-- A news_projects a KORÁBBI sémából maradt. Nem okoz hibát, de zavaró.

select table_name as tabla
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE'
order by table_name;


-- ##### 4. BLOKK — Kinek van admin szerepköre? #####

select u.email, r.role::text as szerepkor
from public.user_roles r
join auth.users u on u.id = r.user_id
order by u.email, r.role;


-- ##### 5. BLOKK — A LEGFONTOSABB: a TE munkamenetednek a szimulálása #####
--
--  Beállítjuk pontosan azt, amit a böngésződ küld (a te felhasználó
--  azonosítóddal és az 'authenticated' szereppel), és megkérdezzük a
--  függvényeket. Ezután megkísérlünk egy valódi beszúrást, majd visszavonjuk.
--
--  Ha az admin e-mailed más, ÍRD ÁT az első sorban.

do $$
declare
  cel_email text := 'avar.szilveszter@gmail.com';   -- <- igazítsd, ha kell
  uid uuid;
  v_is_admin boolean;
  v_members  boolean;
  v_content  boolean;
  v_board    boolean;
  uj_id uuid;
begin
  select id into uid from auth.users where lower(email) = lower(cel_email);
  if uid is null then
    raise notice 'NINCS ILYEN FELHASZNALO: %', cel_email;
    return;
  end if;

  raise notice '--- Felhasznalo: % (%)', cel_email, uid;

  -- A PostgREST pontosan ezt a két dolgot allitja be minden keresnel:
  perform set_config('request.jwt.claims',
                     json_build_object('sub', uid::text, 'role', 'authenticated')::text,
                     true);
  perform set_config('role', 'authenticated', true);

  raise notice '--- auth.uid() a szimulacioban: %', auth.uid();

  select public.is_admin()            into v_is_admin;
  select public.can_manage_members()  into v_members;
  select public.can_manage_content()  into v_content;
  select public.is_board()            into v_board;

  raise notice '--- is_admin()            = %', v_is_admin;
  raise notice '--- can_manage_members()  = %', v_members;
  raise notice '--- can_manage_content()  = %', v_content;
  raise notice '--- is_board()            = %', v_board;

  if not v_content then
    raise notice '*** EZ A HIBA OKA: a can_manage_content() hamis, ezert az RLS elutasitja az irast.';
  end if;

  -- Valodi beszuras megkiserlese ugyanezzel a jogosultsaggal
  begin
    insert into public.workgroups (name, slug)
    values ('__rls_teszt__', '__rls_teszt__' || floor(random() * 100000)::text)
    returning id into uj_id;

    raise notice '--- BESZURAS SIKERES (workgroups), id = %', uj_id;
    delete from public.workgroups where id = uj_id;
    raise notice '--- tesztsor torolve';
  exception when others then
    raise notice '*** BESZURAS ELUTASITVA: % / %', sqlstate, sqlerrm;
  end;
end $$;

-- Az 5. blokk kimenete a "Messages" / "Notices" fülön jelenik meg,
-- NEM a "Results" táblázatban. Ott keresd.
