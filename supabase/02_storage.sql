-- =============================================================================
--  Storage bucketek és jogosultságok
--  Futtatás: Supabase Dashboard -> SQL Editor, a 01_schema.sql UTÁN
--  Újrafuttatható.
-- =============================================================================

-- -----------------------------------------------------------------------------
--  Bucketek
--    public-media : nyilvános képek (hír borítók, fejléckép) — bárki olvashatja
--    documents    : egyesületi dokumentumok — csak beléptetve, szint szerint
--    dues-proofs  : banki átutalási igazolások — csak a saját tag + elnökség
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('public-media', 'public-media', true),
  ('documents',    'documents',    false),
  ('dues-proofs',  'dues-proofs',  false)
on conflict (id) do update set public = excluded.public;

-- -----------------------------------------------------------------------------
--  Régi szabályok eldobása (újrafuttathatóság)
-- -----------------------------------------------------------------------------
drop policy if exists "media: publikus olvasás"    on storage.objects;
drop policy if exists "media: feltöltés"           on storage.objects;
drop policy if exists "media: módosítás"           on storage.objects;
drop policy if exists "media: törlés"              on storage.objects;
drop policy if exists "doksi: tagi olvasás"        on storage.objects;
drop policy if exists "doksi: feltöltés"           on storage.objects;
drop policy if exists "doksi: módosítás"           on storage.objects;
drop policy if exists "doksi: törlés"              on storage.objects;
drop policy if exists "igazolás: saját olvasás"    on storage.objects;
drop policy if exists "igazolás: saját feltöltés"  on storage.objects;
drop policy if exists "igazolás: elnökségi olvasás" on storage.objects;
drop policy if exists "igazolás: törlés"           on storage.objects;

-- -----------------------------------------------------------------------------
--  public-media
-- -----------------------------------------------------------------------------
create policy "media: publikus olvasás" on storage.objects for select
  using (bucket_id = 'public-media');

create policy "media: feltöltés" on storage.objects for insert
  with check (bucket_id = 'public-media' and public.can_manage_content());

create policy "media: módosítás" on storage.objects for update
  using (bucket_id = 'public-media' and public.can_manage_content());

create policy "media: törlés" on storage.objects for delete
  using (bucket_id = 'public-media' and public.can_manage_content());

-- -----------------------------------------------------------------------------
--  documents — olvasáshoz elég a belépés; a szintenkénti szűrést a
--  public.documents tábla RLS-e végzi, a fájl elérése aláírt URL-lel történik.
-- -----------------------------------------------------------------------------
create policy "doksi: tagi olvasás" on storage.objects for select
  using (bucket_id = 'documents' and auth.uid() is not null);

create policy "doksi: feltöltés" on storage.objects for insert
  with check (bucket_id = 'documents' and public.can_manage_content());

create policy "doksi: módosítás" on storage.objects for update
  using (bucket_id = 'documents' and public.can_manage_content());

create policy "doksi: törlés" on storage.objects for delete
  using (bucket_id = 'documents' and public.can_manage_content());

-- -----------------------------------------------------------------------------
--  dues-proofs — a fájl útvonala kötelezően a feltöltő user id-jával kezdődik:
--      <user_id>/2026-atutalas.pdf
--  Így más tag igazolásához nem lehet hozzáférni.
-- -----------------------------------------------------------------------------
create policy "igazolás: saját feltöltés" on storage.objects for insert
  with check (
    bucket_id = 'dues-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "igazolás: saját olvasás" on storage.objects for select
  using (
    bucket_id = 'dues-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "igazolás: elnökségi olvasás" on storage.objects for select
  using (bucket_id = 'dues-proofs' and public.can_manage_members());

create policy "igazolás: törlés" on storage.objects for delete
  using (
    bucket_id = 'dues-proofs'
    and ((storage.foldername(name))[1] = auth.uid()::text
         or public.can_manage_members())
  );
