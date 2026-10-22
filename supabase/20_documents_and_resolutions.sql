-- =============================================================================
--  20. Hivatalos iratkezelés: dokumentum-metaadatok + Határozatok tára
--
--  Futtatás: Supabase Dashboard -> SQL Editor, a 01_schema.sql és 02_storage.sql
--  UTÁN. Újrafuttatható (idempotens).
--
--  Mit old meg:
--    1. A `documents` tábla hivatalos metaadatokkal bővül: az irat VALÓDI
--       kelte (az ülés napja), iktató-/határozatszám, a kiállító testület,
--       és a hitelesség jelölése. Enélkül a jegyzőkönyvek nem rendezhetők
--       dátum/testület szerint, és nincs mivel kiírni a hivatalos azonosítót.
--    2. Új `resolutions` tábla = az alapszabály XIV. pontja által kötelezővé
--       tett, sorszámozott Határozatok tára (szám, dátum, tárgy, tartalom,
--       hatály, szavazati arány).
--    3. Storage: a `documents` bucket nyilvános olvasása a `public/` útvonal-
--       prefixre. Enélkül egy kijelentkezett látogató a nyilvános jegyzőkönyv-
--       kivonat fájlját sem tudná letölteni (a 02_storage.sql csak belépett
--       felhasználónak enged olvasást).
-- =============================================================================

-- -----------------------------------------------------------------------------
--  1. documents — hivatalos metaadatok
-- -----------------------------------------------------------------------------
alter table public.documents add column if not exists document_date date;
alter table public.documents add column if not exists reference_no  text;
alter table public.documents add column if not exists body_type     text;
alter table public.documents add column if not exists is_official   boolean not null default false;

-- A testület/ülés típusa csak a megengedett értékek egyike lehet (vagy NULL).
-- Drop + recreate, hogy újrafuttatáskor a bővített értékkészlet is érvényre jusson.
alter table public.documents drop constraint if exists documents_body_type_check;
alter table public.documents
  add constraint documents_body_type_check
  check (body_type is null or body_type in ('kozgyules', 'elnokseg', 'munkamegbeszeles', 'egyeb'));

comment on column public.documents.document_date is 'Az irat kelte / az ülés napja (nem a feltöltés ideje).';
comment on column public.documents.reference_no is 'Iktató- vagy határozatszám, pl. 2/2026. (VI. 30.).';
comment on column public.documents.body_type   is 'Ülés/testület: kozgyules | elnokseg | munkamegbeszeles | egyeb.';
comment on column public.documents.is_official is 'Igaz, ha aláírt/hitelesített hivatalos irat (nem munkaanyag).';

-- -----------------------------------------------------------------------------
--  2. resolutions — Határozatok tára (alapszabály XIV.)
-- -----------------------------------------------------------------------------
create table if not exists public.resolutions (
  id             uuid primary key default gen_random_uuid(),
  resolution_no  text not null,                 -- pl. "2/2026. (VI. 30.)"
  body_type      text not null
                   check (body_type in ('kozgyules', 'elnokseg')),
  decision_date  date not null,                 -- a határozat napja
  subject        text not null,                 -- tárgy (rövid cím)
  decision_text  text,                          -- a határozat tartalma
  effect         text,                          -- hatály
  votes_for      integer,                       -- igen szavazatok
  votes_against  integer,                       -- nem szavazatok
  votes_abstain  integer,                       -- tartózkodás
  is_published   boolean not null default true, -- nyilvánosan megjelenjen-e
  -- A kapcsolódó jegyzőkönyv (ha fel van töltve a documents közé):
  document_id    uuid references public.documents(id) on delete set null,
  created_by     uuid references public.profiles(id)  on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists resolutions_date_idx
  on public.resolutions (decision_date desc);
create index if not exists resolutions_published_idx
  on public.resolutions (is_published, decision_date desc);

-- Egy határozatszám testületenként egyedi.
create unique index if not exists resolutions_no_unique
  on public.resolutions (body_type, resolution_no);

drop trigger if exists resolutions_updated_at on public.resolutions;
create trigger resolutions_updated_at before update on public.resolutions
  for each row execute function public.set_updated_at();

alter table public.resolutions enable row level security;

-- A publikált határozatot bárki olvashatja; a nem publikáltat csak az elnökség.
drop policy if exists "határozat: publikus olvasás" on public.resolutions;
create policy "határozat: publikus olvasás" on public.resolutions for select
  using (is_published or public.is_board());

-- Felvinni/módosítani/törölni a tartalomkezelő jogúak tudnak (elnök, alelnök, admin).
drop policy if exists "határozat: szerkesztés" on public.resolutions;
create policy "határozat: szerkesztés" on public.resolutions for all
  using (public.can_manage_content()) with check (public.can_manage_content());

-- -----------------------------------------------------------------------------
--  3. Storage: a documents bucket nyilvános olvasása a public/ prefixre
--
--  A nyilvános (access_level = 'public') dokumentumok fájljai a
--  `public/<év>/<slug>.<kiterjesztés>` útvonalra kerülnek, és ezeket
--  belépés nélkül is olvasni lehet. Minden más fájl (members/board/admin)
--  továbbra is csak belépve, a 02_storage.sql "doksi: tagi olvasás" szabálya
--  szerint érhető el.
-- -----------------------------------------------------------------------------
drop policy if exists "doksi: nyilvános olvasás" on storage.objects;
create policy "doksi: nyilvános olvasás" on storage.objects for select
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = 'public');

-- =============================================================================
--  Kész. A kliens oldali párja: src/lib/db.js (resolutions CRUD + createDocument
--  bővített mezők), src/components/admin/ResolutionsAdmin.jsx, DocumentAdmin.jsx,
--  src/pages/ResolutionsPage.jsx.
-- =============================================================================
