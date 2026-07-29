-- =============================================================================
--  15_workgroup_projects_tasks_files.sql
--  Munkacsoport Projektek, Feladatok, Külső Partnerek, Hozzászólások és Storage
-- =============================================================================

-- 1. Projektek tábla (Kizárólag a Munkacsoport Vezetője / Elnökség indíthatja)
CREATE TABLE IF NOT EXISTS public.workgroup_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workgroup_id UUID NOT NULL REFERENCES public.workgroups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Feladatok tábla (Checklist / Taskboard: ki mit csinál)
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.workgroup_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assignee_name TEXT,
  due_date DATE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Biztosítjuk az esetlegesen korábban létrejött tábla frissítését
ALTER TABLE public.project_tasks ADD COLUMN IF NOT EXISTS assignee_name TEXT;

-- 3. Külső Partnerek & Kapcsolattartók (Főkertész, Polgármester, Alvállalkozó stb.)
CREATE TABLE IF NOT EXISTS public.project_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.workgroup_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role_title TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Biztosítjuk a korábban létrejött partnerek tábla mezőit
ALTER TABLE public.project_contacts ADD COLUMN IF NOT EXISTS role_title TEXT;
ALTER TABLE public.project_contacts ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.project_contacts ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.project_contacts ADD COLUMN IF NOT EXISTS notes TEXT;

-- 4. Megjegyzések & Fájlcsatolmányok (Realtime Activity Feed)
CREATE TABLE IF NOT EXISTS public.project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.workgroup_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  comment_text TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Bekapcsolása
ALTER TABLE public.workgroup_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

-- Újra-futtatható RLS szabályok (CSAK BEJELENTKEZETT TAGOKNAK LÁTHATÓ!)
DROP POLICY IF EXISTS "Projektek megtekintése mindenkinek" ON public.workgroup_projects;
DROP POLICY IF EXISTS "Projektek megtekintése bejelentkezett tagoknak" ON public.workgroup_projects;
DROP POLICY IF EXISTS "Projektek létrehozása bejelentkezett tagoknak" ON public.workgroup_projects;
DROP POLICY IF EXISTS "Projektek szerkesztése tulajdonosnak vagy adminnak" ON public.workgroup_projects;
DROP POLICY IF EXISTS "Projektek törlése elnökségi tagoknak" ON public.workgroup_projects;

CREATE POLICY "Projektek megtekintése bejelentkezett tagoknak"
  ON public.workgroup_projects FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Projektek létrehozása bejelentkezett tagoknak"
  ON public.workgroup_projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Projektek szerkesztése tulajdonosnak vagy adminnak"
  ON public.workgroup_projects FOR UPDATE USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'president', 'vicepresident', 'board')
    )
  );

CREATE POLICY "Projektek törlése elnökségi tagoknak"
  ON public.workgroup_projects FOR DELETE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'president', 'vicepresident', 'board')
    )
  );

-- Feladatok RLS (Zárt, csak bejelentkezetteknek)
DROP POLICY IF EXISTS "Feladatok megtekintése mindenkinek" ON public.project_tasks;
DROP POLICY IF EXISTS "Feladatok kezelése bejelentkezett tagoknak" ON public.project_tasks;

CREATE POLICY "Feladatok kezelése bejelentkezett tagoknak"
  ON public.project_tasks FOR ALL USING (auth.role() = 'authenticated');

-- Külső partnerek RLS (Zárt, csak bejelentkezetteknek)
DROP POLICY IF EXISTS "Külső partnerek megtekintése mindenkinek" ON public.project_contacts;
DROP POLICY IF EXISTS "Külső partnerek kezelése bejelentkezett tagoknak" ON public.project_contacts;

CREATE POLICY "Külső partnerek kezelése bejelentkezett tagoknak"
  ON public.project_contacts FOR ALL USING (auth.role() = 'authenticated');

-- Megjegyzések RLS (Zárt, csak bejelentkezetteknek)
DROP POLICY IF EXISTS "Megjegyzések megtekintése mindenkinek" ON public.project_comments;
DROP POLICY IF EXISTS "Megjegyzések írása bejelentkezett tagoknak" ON public.project_comments;

CREATE POLICY "Megjegyzések kezelése bejelentkezett tagoknak"
  ON public.project_comments FOR ALL USING (auth.role() = 'authenticated');

-- Supabase Storage vödör a munkacsoporti csatolmányoknak (Zárt olvasás tagoknak)
INSERT INTO storage.buckets (id, name, public)
VALUES ('workgroup-files', 'workgroup-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS szabályok
DROP POLICY IF EXISTS "Munkacsoport fájlok nyilvános olvasása" ON storage.objects;
DROP POLICY IF EXISTS "Munkacsoport fájlok feltöltése tagoknak" ON storage.objects;
DROP POLICY IF EXISTS "Munkacsoport fájlok olvasása tagoknak" ON storage.objects;

CREATE POLICY "Munkacsoport fájlok olvasása tagoknak"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'workgroup-files' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Munkacsoport fájlok feltöltése tagoknak"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'workgroup-files' AND auth.role() = 'authenticated'
  );

-- Realtime biztonságos hozzáadása
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_tasks;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_contacts;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_comments;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
