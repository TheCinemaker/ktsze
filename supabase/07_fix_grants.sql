-- =============================================================================
--  ÍRÁSI JOG JAVÍTÁSA (42501 hiba a mentésnél)
--
--  A Postgresben KÉT, egymástól független engedélyszint van:
--
--    1. GRANT   — egyáltalán hozzáérhet-e a bejelentkezett szerep a táblához
--    2. RLS     — a táblán belül MELYIK SOROKAT érheti el
--
--  Az RLS szabályok a helyükön vannak, de ha az 1. szint hiányzik, akkor a
--  mentés 42501-es hibával elszáll — ugyanazzal a kóddal, mint az RLS
--  elutasítás. Ez a szkript az 1. szintet állítja helyre.
--
--  Futtatás: Supabase Dashboard -> SQL Editor. Újrafuttatható, adatot nem
--  módosít, RLS-t nem lazít.
-- =============================================================================

-- -----------------------------------------------------------------------------
--  1. Séma elérése
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

-- -----------------------------------------------------------------------------
--  2. Táblaszintű engedélyek
--
--  A soronkénti szűrést továbbra is az RLS végzi — ez csak azt engedi meg,
--  hogy a kérés egyáltalán eljusson az RLS-ig.
-- -----------------------------------------------------------------------------
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Az ezután létrehozott táblákra is érvényes legyen:
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

-- -----------------------------------------------------------------------------
--  3. A jogosultsági függvények hívhatósága
-- -----------------------------------------------------------------------------
grant execute on function public.is_admin()            to anon, authenticated;
grant execute on function public.can_manage_members()   to anon, authenticated;
grant execute on function public.can_manage_content()   to anon, authenticated;
grant execute on function public.is_board()             to anon, authenticated;
grant execute on function public.current_roles()        to anon, authenticated;
grant execute on function public.has_role(uuid, text)   to anon, authenticated;

-- -----------------------------------------------------------------------------
--  4. ÖNTESZT — mit tud a bejelentkezett szerep?
--
--  Ezt a Dashboardon `postgres`-ként futtatod, tehát itt mindenre `true` jön.
--  A valódi próbát az alkalmazás /diagnosztika oldalán tudod elvégezni, ott a
--  saját munkameneteddel fut.
-- -----------------------------------------------------------------------------
select
  t.table_name as tabla,
  has_table_privilege('authenticated', 'public.' || t.table_name, 'SELECT') as olvasas,
  has_table_privilege('authenticated', 'public.' || t.table_name, 'INSERT') as beszuras,
  has_table_privilege('authenticated', 'public.' || t.table_name, 'UPDATE') as modositas,
  has_table_privilege('authenticated', 'public.' || t.table_name, 'DELETE') as torles,
  (select count(*) from pg_policies p
    where p.schemaname = 'public' and p.tablename = t.table_name) as rls_szabalyok
from information_schema.tables t
where t.table_schema = 'public'
  and t.table_type = 'BASE TABLE'
order by t.table_name;
