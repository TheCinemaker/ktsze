-- =============================================================================
--  23. Zárt Adventi Ötletbörze & Kérdőív — advent_ideas
--
--  Futtatás: Supabase Dashboard -> SQL Editor. Idempotens, újrafuttatható.
--
--  BIZTONSÁGI MODELL (miért így):
--    - A nyers táblát (benne beküldő e-mail/telefon, kapcsolattartó adatok) CSAK
--      az elnökség olvashatja. A publikus anon kulccsal NEM lehet lekérni a
--      személyes adatokat — ez adatvédelmi (GDPR) követelmény.
--    - A nyilvános/kóddal elérhető lista egy SECURITY DEFINER függvényen megy,
--      amely CSAK a nem-személyes mezőket adja vissza (ötlet címe, leírása,
--      kategória, beküldő NEVE mint attribúció — de e-mail/telefon SOHA).
--    - Beküldeni bárki tud a belépőkóddal (a kód csak enyhe spam-gát, nem
--      biztonsági védelem — ne tároljunk mögé érzékeny adatot láthatóságilag).
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
--  Publikus/kóddal elérhető lista — CSAK nem-személyes mezők.
--  SECURITY DEFINER: a tábla RLS-ét megkerülve fut, de kézzel válogatva csak a
--  biztonságos oszlopokat adja vissza (NINCS benne e-mail, telefon, kapcsolattartó).
-- -----------------------------------------------------------------------------
create or replace function public.public_advent_ideas()
returns table (
  id                 uuid,
  created_at         timestamptz,
  submitter_name     text,
  title              text,
  category           text,
  target_weekend     text,
  description        text,
  price_or_cost      text,
  willing_to_sponsor boolean,
  status             text
)
language sql
stable
security definer
set search_path = public
as $$
  select id, created_at, submitter_name, title, category, target_weekend,
         description, price_or_cost, willing_to_sponsor, status
  from public.advent_ideas
  order by created_at desc;
$$;

grant execute on function public.public_advent_ideas() to anon, authenticated;

-- Táblajogok: beküldés anon-nak is; a nyers olvasást/kezelést az RLS fenti
-- szabályai döntik el. (A korábbi GRANT ALL TO anon túl tág volt.)
revoke all on public.advent_ideas from anon;
grant insert on public.advent_ideas to anon;
grant select, insert, update, delete on public.advent_ideas to authenticated;

-- =============================================================================
--  Kliens oldali pár: src/lib/db.js listAdventIdeas() -> rpc('public_advent_ideas').
-- =============================================================================
