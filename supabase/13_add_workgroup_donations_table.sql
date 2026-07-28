-- =============================================================================
-- Migration 13: Workgroup Donations (Barion Támogatási Tranzakciók Tábla)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.workgroup_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workgroup_id uuid REFERENCES public.workgroups(id) ON DELETE CASCADE,
  donor_name text DEFAULT 'Névtelen Támogató',
  donor_email text,
  amount numeric NOT NULL CHECK (amount > 0),
  commission_amount numeric DEFAULT 0,
  net_amount numeric NOT NULL,
  barion_payment_id text,
  status text DEFAULT 'Succeeded',
  created_at timestamptz DEFAULT now()
);

-- Indexek a gyors összesítéshez
CREATE INDEX IF NOT EXISTS idx_donations_workgroup_id ON public.workgroup_donations(workgroup_id);

-- RLS Adatvédelmi szabályok
ALTER TABLE public.workgroup_donations ENABLE ROW LEVEL SECURITY;

-- Bárki (publikus) olvashatja az összesített adományokat
CREATE POLICY "Public read donations" ON public.workgroup_donations
  FOR SELECT USING (true);

-- Bárki (publikus/tag) indíthat új adománytranzakciót
CREATE POLICY "Public insert donations" ON public.workgroup_donations
  FOR INSERT WITH CHECK (true);

-- Jogosultságok megadása
GRANT SELECT, INSERT ON public.workgroup_donations TO authenticated, anon;
