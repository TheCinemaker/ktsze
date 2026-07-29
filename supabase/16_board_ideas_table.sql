-- =============================================================================
--  16_board_ideas_table.sql
--  Zárt Elnökségi Ötletelő & Jegyzetfal tábla az Elnökségi Portálhoz
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.board_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Általános ötlet',
    status TEXT DEFAULT 'idea',
    is_pinned BOOLEAN DEFAULT false
);

ALTER TABLE public.board_ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Elnökség láthatja a board_ideas táblát" ON public.board_ideas;
CREATE POLICY "Elnökség láthatja a board_ideas táblát"
ON public.board_ideas FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Elnökség kezelheti a board_ideas táblát" ON public.board_ideas;
CREATE POLICY "Elnökség kezelheti a board_ideas táblát"
ON public.board_ideas FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

GRANT ALL ON public.board_ideas TO authenticated;
GRANT ALL ON public.board_ideas TO service_role;
