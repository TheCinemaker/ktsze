-- =============================================================================
-- Migration 14: Enable Supabase Realtime for workgroup_donations
-- =============================================================================

-- Publikáció engedélyezése az azonnali élő frissítésekhez
ALTER PUBLICATION supabase_realtime ADD TABLE public.workgroup_donations;
