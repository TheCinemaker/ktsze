-- =============================================================================
-- Migration 12: Barion Közösségi Finanszírozási Mezők (workgroups)
-- =============================================================================

ALTER TABLE public.workgroups 
ADD COLUMN IF NOT EXISTS target_amount numeric DEFAULT 250000,
ADD COLUMN IF NOT EXISTS campaign_goal text DEFAULT '',
ADD COLUMN IF NOT EXISTS enable_crowdfunding boolean DEFAULT false;

-- Kezdőértékek kitöltése a meglévő aktivált munkacsoportoknál
UPDATE public.workgroups 
SET campaign_goal = '20 db új virágtartó kaspó kihelyezése és növényesítése a belvárosban.',
    target_amount = 250000,
    enable_crowdfunding = true
WHERE name ILIKE '%virág%';

UPDATE public.workgroups 
SET campaign_goal = '15 db időjárásálló QR-kódos digitális tanösvény tábla az Óház-kilátóhoz.',
    target_amount = 400000,
    enable_crowdfunding = true
WHERE name ILIKE '%digitál%';

-- Jogosultságok megerősítése
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workgroups TO authenticated;
GRANT SELECT ON public.workgroups TO anon;
