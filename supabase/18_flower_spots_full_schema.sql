-- =============================================================================
--  18_flower_spots_full_schema.sql
--  "Vízadás" — a flower_spots / flower_logs séma kiegészítése és megszigorítása.
--
--  Miért kell ez?
--    a) A két táblát egyetlen verziózott migráció sem hozta létre (kézzel,
--       Dashboardról készültek) — ez a fájl pótolja, hogy új környezetben is
--       felállhasson a vízadás modul.
--    b) A meglévő RLS (`FOR ALL USING (true)`) miatt a publikus anon kulccsal
--       BÁRKI át tudja írni és le tudja törölni az összes fát. Ezt lezárjuk.
--    c) Az öntözés eddig 2 külön kérés volt (napló insert + kaspó update), a
--       havi számláló pedig sosem nullázódott. Egy RPC-vel mindkettő megoldva.
--
--  A tábla-definíciók SZÁNDÉKOSAN TEXT id-vel készülnek, mert az élesben futó
--  táblák így vannak (gen_random_uuid()::text) — ne térjen el a két környezet.
--
--  Futtatás: Supabase Dashboard -> SQL Editor, a 17_flower_spots_add_gps.sql UTÁN.
--  Újrafuttatható (idempotens).
-- =============================================================================

-- -----------------------------------------------------------------------------
--  1. Táblák (új környezethez; létező táblát nem bánt)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.flower_spots (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,                        -- pontos cím: utca + házszám
  location_name TEXT,                          -- rövid helymegjelölés a kártyán
  description TEXT,
  photo_url TEXT,
  adopter_name TEXT,
  adopter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',
  last_watered_at TIMESTAMPTZ,                 -- NINCS default: az új fa nem "öntözött"
  water_count_this_month INT DEFAULT 0,
  water_count_today INT DEFAULT 0,
  latitude DOUBLE PRECISION,                   -- GPS, opcionális (térképhez)
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.flower_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  spot_id TEXT REFERENCES public.flower_spots(id) ON DELETE CASCADE,
  user_name TEXT,
  action_type TEXT DEFAULT 'locsolas',
  water_liters INT DEFAULT 10,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
--  2. Hiányzó oszlop az élő táblában: mai öntözésszám (a kártya badge használja)
-- -----------------------------------------------------------------------------
ALTER TABLE public.flower_spots
  ADD COLUMN IF NOT EXISTS water_count_today INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Az élő tábla két defaultja rossz eredményt ad:
--   last_watered_at = NOW()  ->  a frissen rögzített fa "ma megöntözve" lett
--   location_name   = 'Kőszeg Belváros'  ->  kitalált helyszín a cím elé
ALTER TABLE public.flower_spots ALTER COLUMN last_watered_at DROP DEFAULT;
ALTER TABLE public.flower_spots ALTER COLUMN location_name   DROP DEFAULT;
ALTER TABLE public.flower_spots ALTER COLUMN adopter_name    DROP DEFAULT;
ALTER TABLE public.flower_logs  ALTER COLUMN user_name       DROP DEFAULT;

COMMENT ON COLUMN public.flower_spots.title IS 'Pontos cím: utca és házszám (kötelező)';
COMMENT ON COLUMN public.flower_spots.latitude IS 'GPS szélesség (opcionális, térképes megjelenítéshez)';
COMMENT ON COLUMN public.flower_spots.longitude IS 'GPS hosszúság (opcionális, térképes megjelenítéshez)';
COMMENT ON COLUMN public.flower_spots.photo_url IS 'A flower-photos bucket publikus URL-je — NEM base64 data URI!';
COMMENT ON COLUMN public.flower_spots.water_count_today IS 'Mai öntözések száma, a flower_log_watering RPC tartja karban';

-- -----------------------------------------------------------------------------
--  3. Indexek — ezek tartják gyorsan a listát 200+ fánál is
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS flower_spots_created_at_idx ON public.flower_spots (created_at DESC);
CREATE INDEX IF NOT EXISTS flower_logs_created_at_idx  ON public.flower_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS flower_logs_spot_id_idx     ON public.flower_logs (spot_id, created_at DESC);

-- -----------------------------------------------------------------------------
--  4. RLS újraszabása
--
--  Marad: bárki (belépés nélkül) olvashat és rögzíthet új fát, illetve írhat a
--  naplóba — a vízadás lényege pont ez.
--  Megszűnik: az anonim UPDATE/DELETE a meglévő rekordokra. Az öntözés a lenti
--  SECURITY DEFINER RPC-n megy, ahhoz nem kell tábla-szintű írásjog.
-- -----------------------------------------------------------------------------
ALTER TABLE public.flower_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flower_logs  ENABLE ROW LEVEL SECURITY;

-- A korábbi, teljesen nyitott szabályok eldobása (eredeti nevekkel is)
DROP POLICY IF EXISTS "Nyilvános olvasás kaspók"          ON public.flower_spots;
DROP POLICY IF EXISTS "Nyilvános írás kaspók"             ON public.flower_spots;
DROP POLICY IF EXISTS "Nyilvános olvasás napló"           ON public.flower_logs;
DROP POLICY IF EXISTS "Nyilvános írás napló"              ON public.flower_logs;
DROP POLICY IF EXISTS "vizadas: fák publikus olvasása"    ON public.flower_spots;
DROP POLICY IF EXISTS "vizadas: új fa rögzítése bárkinek" ON public.flower_spots;
DROP POLICY IF EXISTS "vizadas: fa módosítása"            ON public.flower_spots;
DROP POLICY IF EXISTS "vizadas: fa törlése"               ON public.flower_spots;
DROP POLICY IF EXISTS "vizadas: napló publikus olvasása"  ON public.flower_logs;
DROP POLICY IF EXISTS "vizadas: napló írása bárkinek"     ON public.flower_logs;
DROP POLICY IF EXISTS "vizadas: napló törlése"            ON public.flower_logs;

CREATE POLICY "vizadas: fák publikus olvasása" ON public.flower_spots
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "vizadas: új fa rögzítése bárkinek" ON public.flower_spots
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "vizadas: fa módosítása" ON public.flower_spots
  FOR UPDATE TO authenticated USING (public.can_manage_content());

CREATE POLICY "vizadas: fa törlése" ON public.flower_spots
  FOR DELETE TO authenticated USING (public.can_manage_content());

CREATE POLICY "vizadas: napló publikus olvasása" ON public.flower_logs
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "vizadas: napló írása bárkinek" ON public.flower_logs
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "vizadas: napló törlése" ON public.flower_logs
  FOR DELETE TO authenticated USING (public.can_manage_content());

REVOKE UPDATE, DELETE ON public.flower_spots FROM anon;
REVOKE UPDATE, DELETE ON public.flower_logs  FROM anon;
GRANT  SELECT, INSERT ON public.flower_spots TO anon, authenticated;
GRANT  SELECT, INSERT ON public.flower_logs  TO anon, authenticated;
GRANT  UPDATE, DELETE ON public.flower_spots TO authenticated;
GRANT  DELETE         ON public.flower_logs  TO authenticated;
GRANT  ALL ON public.flower_spots TO service_role;
GRANT  ALL ON public.flower_logs  TO service_role;

-- -----------------------------------------------------------------------------
--  5. Öntözés rögzítése EGYETLEN kérésben (RPC)
--     A számlálókat a naplóból számoljuk újra, így a "havi" érték
--     hónapváltáskor magától nullázódik, a "mai" pedig éjfélkor.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.flower_log_watering(
    p_spot_id      TEXT,
    p_user_name    TEXT DEFAULT NULL,
    p_action_type  TEXT DEFAULT 'locsolas',
    p_water_liters INT  DEFAULT 10,
    p_notes        TEXT DEFAULT NULL,
    p_photo_url    TEXT DEFAULT NULL
)
RETURNS public.flower_logs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_log   public.flower_logs;
    v_month INT;
    v_today INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.flower_spots WHERE id = p_spot_id) THEN
        RAISE EXCEPTION 'Ezt a fát már törölték, az öntözést nem tudtuk rögzíteni.';
    END IF;

    INSERT INTO public.flower_logs (spot_id, user_name, action_type, water_liters, notes, photo_url)
    VALUES (
        p_spot_id,
        NULLIF(btrim(coalesce(p_user_name, '')), ''),
        coalesce(NULLIF(btrim(coalesce(p_action_type, '')), ''), 'locsolas'),
        greatest(1, least(coalesce(p_water_liters, 10), 500)),
        NULLIF(btrim(coalesce(p_notes, '')), ''),
        p_photo_url
    )
    RETURNING * INTO v_log;

    SELECT count(*) FILTER (WHERE created_at >= date_trunc('month', now())),
           count(*) FILTER (WHERE created_at >= date_trunc('day',   now()))
      INTO v_month, v_today
      FROM public.flower_logs
     WHERE spot_id = p_spot_id;

    UPDATE public.flower_spots
       SET last_watered_at        = v_log.created_at,
           water_count_this_month = v_month,
           water_count_today      = v_today
     WHERE id = p_spot_id;

    RETURN v_log;
END;
$$;

GRANT EXECUTE ON FUNCTION public.flower_log_watering(TEXT, TEXT, TEXT, INT, TEXT, TEXT)
  TO anon, authenticated;

-- Egyszeri visszamenőleges feltöltés: a meglévő fák számlálói a naplóból
UPDATE public.flower_spots s
   SET water_count_this_month = c.month_count,
       water_count_today      = c.today_count,
       last_watered_at        = c.last_at
  FROM (
        SELECT spot_id,
               count(*) FILTER (WHERE created_at >= date_trunc('month', now())) AS month_count,
               count(*) FILTER (WHERE created_at >= date_trunc('day',   now())) AS today_count,
               max(created_at) AS last_at
          FROM public.flower_logs
         GROUP BY spot_id
       ) c
 WHERE s.id = c.spot_id;

-- -----------------------------------------------------------------------------
--  6. Fotó bucket — a képek IDE kerülnek, nem a tábla egy base64 mezőjébe.
--     Egy base64 data URI ~1-3 MB-ot ad MINDEN sorhoz, és a lista minden
--     betöltéskor letölti az összeset. 200 fánál ez több száz MB-os kérés —
--     ez volt a lassulás fő oka.
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('flower-photos', 'flower-photos', true)
ON CONFLICT (id) DO UPDATE SET public = excluded.public;

DROP POLICY IF EXISTS "vizadas fotó: publikus olvasás"   ON storage.objects;
DROP POLICY IF EXISTS "vizadas fotó: feltöltés bárkinek" ON storage.objects;
DROP POLICY IF EXISTS "vizadas fotó: törlés"             ON storage.objects;

CREATE POLICY "vizadas fotó: publikus olvasás" ON storage.objects
  FOR SELECT USING (bucket_id = 'flower-photos');

CREATE POLICY "vizadas fotó: feltöltés bárkinek" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'flower-photos');

CREATE POLICY "vizadas fotó: törlés" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'flower-photos' AND public.can_manage_content());

-- -----------------------------------------------------------------------------
--  7. Realtime
--     A publikáció már be van kapcsolva, de UPDATE/DELETE eseménynél a
--     Realtime csak akkor tud teljes sort küldeni, ha a REPLICA IDENTITY FULL.
--     Enélkül a kaspó frissítése (badge, számláló) nem ér el a többi telefonra.
-- -----------------------------------------------------------------------------
ALTER TABLE public.flower_spots REPLICA IDENTITY FULL;
ALTER TABLE public.flower_logs  REPLICA IDENTITY FULL;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.flower_spots;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.flower_logs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Ellenőrzés: mindkét táblának szerepelnie kell az eredményben.
-- SELECT schemaname, tablename FROM pg_publication_tables
--  WHERE pubname = 'supabase_realtime' AND tablename LIKE 'flower%';
