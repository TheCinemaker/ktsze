-- =============================================================================
--  17_flower_spots_add_gps.sql
--  GPS koordináták hozzáadása a meglévő flower_spots táblához
--  (latitude / longitude — opcionális, térképes megjelenítéshez)
-- =============================================================================

-- Latitude (szélesség) és Longitude (hosszúság) oszlopok hozzáadása
ALTER TABLE flower_spots
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION DEFAULT NULL;

-- Komment a jövőbeli fejlesztők számára
COMMENT ON COLUMN flower_spots.latitude IS 'GPS szélesség (opcionális, térképes megjelenítéshez)';
COMMENT ON COLUMN flower_spots.longitude IS 'GPS hosszúság (opcionális, térképes megjelenítéshez)';
