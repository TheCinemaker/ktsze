-- =============================================================================
--  23. Zárt Adventi Ötletbörze & Kérdőív — advent_ideas
--
--  Futtatás: Supabase Dashboard -> SQL Editor. Idempotens, újrafuttatható.
--
--  BIZTONSÁGI MODELL (miért így):
--    - A beküldött ötletek NEM nyilvánosak: a táblát CSAK az elnökség olvashatja.
--      A publikus anon kulccsal semmilyen beküldött adat nem kérhető le — ez
--      adatvédelmi (GDPR) követelmény, és a felhasználó döntése (a beküldések
--      kizárólag az elnökségre tartoznak).
--    - Beküldeni bárki tud a belépőkóddal (a kód a tagi e-mailben megy ki; csak
--      enyhe spam-gát, nem biztonsági védelem).
--    - Módosítani/törölni CSAK a tartalomkezelő jogúak (elnök/alelnök/admin).
-- =============================================================================

create table if not exists public.advent_ideas (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  access_code        text not null,
  submitter_name     text not null,
  submitter_email    text not null,
  submitter_phone    text,
  title              text not null,
  category           text not null,
  target_weekend     text,
  description        text not null,
  contact_name       text,
  contact_phone      text,
  contact_email      text,
  price_or_cost      text,
  willing_to_sponsor boolean default false,
  status             text default 'uj'
);

alter table public.advent_ideas enable row level security;

-- A Gemini-féle, túl megengedő szabályok eldobása (ha léteznek), majd a biztonságosak:
drop policy if exists "Advent ötlet beküldése kóddal"      on public.advent_ideas;
drop policy if exists "Advent ötletek olvasása"            on public.advent_ideas;
drop policy if exists "Elnökség kezeli az advent ötleteket" on public.advent_ideas;
drop policy if exists "advent: beküldés kóddal"            on public.advent_ideas;
drop policy if exists "advent: elnökségi olvasás"          on public.advent_ideas;
drop policy if exists "advent: elnökségi módosítás"        on public.advent_ideas;
drop policy if exists "advent: elnökségi törlés"           on public.advent_ideas;

-- Beküldés: bárki (anon és belépett) a helyes belépőkóddal.
create policy "advent: beküldés kóddal" on public.advent_ideas for insert
  to anon, authenticated
  with check (access_code = '99118822');

-- Olvasás a NYERS táblából (személyes adatokkal): CSAK az elnökség.
create policy "advent: elnökségi olvasás" on public.advent_ideas for select
  to authenticated
  using (public.is_board());

-- Módosítás és törlés: CSAK tartalomkezelő (elnök/alelnök/admin).
create policy "advent: elnökségi módosítás" on public.advent_ideas for update
  to authenticated
  using (public.can_manage_content()) with check (public.can_manage_content());

create policy "advent: elnökségi törlés" on public.advent_ideas for delete
  to authenticated
  using (public.can_manage_content());

-- -----------------------------------------------------------------------------
--  Nincs publikus listázó függvény: a beküldött ötletek nem nyilvánosak.
--  (Ha egy korábbi futtatás létrehozta, eldobjuk.)
-- -----------------------------------------------------------------------------
drop function if exists public.public_advent_ideas();

-- Táblajogok: beküldés anon-nak is; a nyers olvasást/kezelést az RLS fenti
-- szabályai döntik el. (A korábbi GRANT ALL TO anon túl tág volt.)
revoke all on public.advent_ideas from anon;
grant insert on public.advent_ideas to anon;
grant select, insert, update, delete on public.advent_ideas to authenticated;

-- =============================================================================
--  A beküldött ötleteket csak az elnökség látja (admin felület). A publikus
--  oldal (src/pages/AdventIdeaPage.jsx) csak a beküldő űrlapot mutatja.
-- =============================================================================
