-- =============================================================================
--  supabase/19_clear_flower_data.sql
--  Kiszárítja a teszt adatokat a faöntözéses (Vízadás) táblákból élesítés előtt.
--  Semmi mást nem töröl, a tagok profiljai, beállítások, dokumentumok megmaradnak.
-- =============================================================================

-- 1. A naplóbejegyzések törlése (locsolások, szelfik)
DELETE FROM public.flower_logs;

-- 2. A regisztrált kaspók / fák törlése (utca, házszám)
DELETE FROM public.flower_spots;

-- Opcionális: Ha az azonosító számlálókat is le akarod nullázni
-- ALTER SEQUENCE IF EXISTS public.flower_logs_id_seq RESTART WITH 1;
