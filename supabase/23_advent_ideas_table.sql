-- =============================================================================
--  23_advent_ideas_table.sql
--  KTSZE Zárt Adventi Ötletbörze & Kérdőív tábla
--
--  Futtatás: Supabase Dashboard -> SQL Editor
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.advent_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    access_code TEXT NOT NULL,
    submitter_name TEXT NOT NULL,
    submitter_email TEXT NOT NULL,
    submitter_phone TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    target_weekend TEXT,
    description TEXT NOT NULL,
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    price_or_cost TEXT,
    willing_to_sponsor BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'uj'
);

ALTER TABLE public.advent_ideas ENABLE ROW LEVEL SECURITY;

-- Bárki beküldhet ötletet a helyes 99118822 belépőkóddal
DROP POLICY IF EXISTS "Advent ötlet beküldése kóddal" ON public.advent_ideas;
CREATE POLICY "Advent ötlet beküldése kóddal"
ON public.advent_ideas FOR INSERT
TO anon, authenticated
WITH CHECK (access_code = '99118822');

-- Megtekintési jog (anon és belépett tagoknak is)
DROP POLICY IF EXISTS "Advent ötletek olvasása" ON public.advent_ideas;
CREATE POLICY "Advent ötletek olvasása"
ON public.advent_ideas FOR SELECT
TO anon, authenticated
USING (true);

-- Elnökségi adminisztráció
DROP POLICY IF EXISTS "Elnökség kezeli az advent ötleteket" ON public.advent_ideas;
CREATE POLICY "Elnökség kezeli az advent ötleteket"
ON public.advent_ideas FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

GRANT ALL ON public.advent_ideas TO anon, authenticated, service_role;
