-- Kőszegi Turisztikai Szövetség Egyesület - Supabase SQL Schema
-- Created for PostgreSQL / Supabase Backend

-- 1. Profiles Table (Tagok és Adminisztrátorok adatlapja)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  organization_name TEXT, -- Pl. "Jurisics Vár Vendégház" vagy "Borműhely Kőszeg"
  member_type TEXT DEFAULT 'Szolgáltató', -- 'Szolgáltató', 'Pártoló tag', 'Rendes tag', 'Vezetőségi tag'
  role TEXT DEFAULT 'member', -- 'member', 'admin'
  phone TEXT,
  address TEXT,
  tax_number TEXT,
  joined_date DATE DEFAULT CURRENT_DATE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Membership Dues Table (Tagdíjak nyilvántartása)
CREATE TABLE IF NOT EXISTS membership_dues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  amount_huf INTEGER NOT NULL DEFAULT 24000,
  status TEXT DEFAULT 'pending', -- 'paid', 'pending', 'overdue'
  due_date DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT, -- 'Banki átutalás', 'Készpénz'
  proof_file_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. News & Projects Table (Hírek és Készülő Programok / Fejlesztések)
CREATE TABLE IF NOT EXISTS news_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'hír', -- 'hír', 'projekt', 'pályázat'
  category TEXT DEFAULT 'Egyesület', -- 'Egyesület', 'Turisztikai Fejlesztés', 'Pályázat', 'Közgyűlés'
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Documents Table (Egyesületi Dokumentumtár)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Közgyűlés', 'Alapszabály', 'Pénzügyi beszámoló', 'Munkaterv', 'Közös anyag'
  file_url TEXT NOT NULL,
  file_size TEXT,
  access_level TEXT DEFAULT 'members', -- 'public', 'members', 'admin'
  drive_file_id TEXT, -- Google Drive referenciaszám
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Google Drive Integration Logs & Folders
CREATE TABLE IF NOT EXISTS drive_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_name TEXT NOT NULL,
  drive_folder_id TEXT UNIQUE NOT NULL,
  web_view_link TEXT NOT NULL,
  category TEXT DEFAULT 'Általános',
  sync_enabled BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Row Level Security (RLS) beállítások
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_folders ENABLE ROW LEVEL SECURITY;

-- Publikus hozzáférési szabályok (Public reads published news)
CREATE POLICY "Public news are readable by everyone" ON news_projects
  FOR SELECT USING (is_published = true);

-- Dokumentumok RLS
CREATE POLICY "Public docs are readable by everyone" ON documents
  FOR SELECT USING (access_level = 'public');

-- Seed Data (Kezdő adatok)
INSERT INTO news_projects (title, slug, type, category, summary, content, published_at) VALUES
('Előkészületben a 2026–2030-as Kőszegi Turisztikai Stratégia', 'turisztikai-strategia-2026-2030', 'projekt', 'Turisztikai Fejlesztés', 'Egyesületünk megkezdte a következő 5 éves stratégiai munkaterv kidolgozását a helyi szolgáltatók bevonásával.', 'A Kőszegi Turisztikai Szövetség Egyesület elnöksége kibővített ülést tartott, ahol kijelöltük a 2026-2030 közötti időszak fő fejlesztési irányaikat. A hangsúly az aktív turizmus, a kultúra és a történelmi örökség fenntartható bemutatásán lesz.', now()),
('Taggyűlési Meghívó és Napirendi Pontok', 'taggyulesi-meghivo-2026-03', 'hír', 'Közgyűlés', 'Értesítjük kedves Tagjainkat, hogy a tavaszi rendes közgyűlésre 2026. március 15-én kerül sor a Jurisics Vár Lovagtermében.', 'Tisztelt Egyesületi Tagok! Ezúton meghívjuk Önöket a Kőszegi Turisztikai Szövetség Egyesület 2026. évi tavaszi közgyűlésére. Napirenden: 2025. évi pénzügyi beszámoló elfogadása, tagdíjstruktúra felülvizsgálata, 2026-os rendezvénytámogatások kiértékelése.', now() - interval '3 days'),
('Nyertes Pályázat a Helyi Értékek Népszerűsítésére', 'nyertes-palyazat-2026', 'pályázat', 'Pályázat', 'Sikeresen szerepelt egyesületünk a megyei turizmusfejlesztési alap pályázatán.', 'Örömmel tájékoztatjuk tagjainkat, hogy az egyesületünk által benyújtott "Kőszeg Történelmi Értékei a Digitális Korban" című pályázat 4,5 millió forint támogatásban részesült. A támogatásból az egyesületi kiadványokat és információs táblákat újítjuk meg.', now() - interval '7 days');
