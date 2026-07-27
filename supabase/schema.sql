-- Kőszegi Turisztikai Szövetség Egyesület - Teljes Supabase SQL Schema (2026)
-- Futtatható a Supabase Dashboard -> SQL Editor felületén

-- 1. Profiles Table (Tagok, Pártoló tagok és Adminisztrátorok részletes adatlapja)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  home_address TEXT,
  phone TEXT NOT NULL,
  private_email TEXT, -- Privát e-mail (nem kötelező)
  
  -- Tagsági típus: 'Rendes tag', 'Pártoló tag', 'Elnökségi tag'
  member_category TEXT DEFAULT 'Rendes tag',
  
  -- Tevékenység: 'szállásadó', 'vendéglős', 'borász', 'szolgáltató', 'kulturális', 'egyéb'
  business_activity TEXT DEFAULT 'szolgáltató',
  
  -- Szolgáltatás helyszínének adatai
  service_location_name TEXT NOT NULL, -- Pl. "Ibrahim Boutique Hotel"
  service_street TEXT,
  service_house_number TEXT,
  service_contacts TEXT, -- Telefon, weboldal, nyitvatartás
  
  -- Egyedi tisztség/poszt megnevezés (Pl. "Alelnök — Rendezvények a határon", "Elnök")
  custom_title TEXT,
  
  -- Jogosultsági szerepkör: 'member', 'patron', 'admin'
  role TEXT DEFAULT 'member',
  
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Biztosítjuk, hogy a meglévő profiles táblában is meglegyenek az újabb oszlopok:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_title TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS workgroups TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dues_status TEXT DEFAULT 'pending';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dues_amount INTEGER DEFAULT 24000;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dues_paid_at DATE;

-- A phone / service_location_name NOT NULL megkötés megbuktatja a mentést, ha a
-- felhasználó üresen hagyja a mezőt. Lazítjuk, a kötelezőséget a frontend őrzi.
ALTER TABLE profiles ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN service_location_name DROP NOT NULL;

-- 2. Workgroups Table (Munkacsoportok - Admin által dinamikusan kezelhető)
CREATE TABLE IF NOT EXISTS workgroups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- Pl. "Kőszeg virágzik" (Bármikor módosítható!)
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL, -- Mivel foglalkozik a csoport
  leader_name TEXT, -- Munkacsoport vezetője
  image_url TEXT, -- Képek URL-je (Supabase Storage / Drive)
  latest_updates TEXT, -- Friss infók, legutóbbi hírek
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- A description NOT NULL feleslegesen buktatja az upsertet, ha üresen hagyják:
ALTER TABLE workgroups ALTER COLUMN description DROP NOT NULL;

-- 3. Workgroup Members Junction Table (Melyik tag melyik munkacsoportban van bent)
CREATE TABLE IF NOT EXISTS workgroup_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workgroup_id UUID REFERENCES workgroups(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(workgroup_id, profile_id)
);

-- 4. Membership Dues Table (Tagdíjak és Befizetések nyilvántartása)
CREATE TABLE IF NOT EXISTS membership_dues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL DEFAULT 2026,
  amount_huf INTEGER NOT NULL DEFAULT 24000, -- Rendes tag: 24k/36k, Pártoló: 15k
  status TEXT DEFAULT 'pending', -- 'paid', 'pending', 'overdue'
  due_date DATE NOT NULL DEFAULT '2026-03-31',
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT DEFAULT 'Banki átutalás',
  proof_file_url TEXT, -- Feltöltött banki igazolás bizonylat
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Documents Table (Egyesületi Dokumentumok - Kizárólag Admin tölthet fel!)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Alapszabály', 'Közgyűlés', 'Pénzügyi beszámoló', 'Munkaterv', 'Szabályzat'
  file_url TEXT NOT NULL,
  file_size TEXT,
  access_level TEXT DEFAULT 'members', -- 'public', 'members', 'admin'
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- A frontend ezeket az oszlopokat is küldi — enélkül a beszúrás PGRST204 hibával elszáll:
ALTER TABLE documents ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT 'PDF';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploaded_at DATE DEFAULT CURRENT_DATE;
-- A file_url NOT NULL megbuktatja a rögzítést, amíg nincs tényleges fájlfeltöltés:
ALTER TABLE documents ALTER COLUMN file_url DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS documents_slug_key ON documents (slug);

-- 6. News & Projects Table (CMS - Hírek és készülő projektek)
CREATE TABLE IF NOT EXISTS news_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'hír',            -- 'hír' | 'projekt'
  category TEXT,
  summary TEXT,
  content TEXT,
  image TEXT,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) szabályok
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workgroups ENABLE ROW LEVEL SECURITY;
ALTER TABLE workgroup_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS házirendek (Read, Insert, Update permissions) - Újrafuttatható biztonságos megadás
DROP POLICY IF EXISTS "Public read workgroups" ON workgroups;
DROP POLICY IF EXISTS "Public read public documents" ON documents;
DROP POLICY IF EXISTS "Members read internal documents" ON documents;
DROP POLICY IF EXISTS "Profiles read own or public profile" ON profiles;
DROP POLICY IF EXISTS "Public insert profiles" ON profiles;
DROP POLICY IF EXISTS "Public update profiles" ON profiles;

CREATE POLICY "Public read workgroups" ON workgroups FOR SELECT USING (true);
CREATE POLICY "Public read public documents" ON documents FOR SELECT USING (access_level = 'public');
CREATE POLICY "Members read internal documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Profiles read own or public profile" ON profiles FOR SELECT USING (true);

CREATE POLICY "Public insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update profiles" ON profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public insert workgroups" ON workgroups;
DROP POLICY IF EXISTS "Public update workgroups" ON workgroups;
CREATE POLICY "Public insert workgroups" ON workgroups FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update workgroups" ON workgroups FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public insert documents" ON documents;
DROP POLICY IF EXISTS "Public update documents" ON documents;
CREATE POLICY "Public insert documents" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update documents" ON documents FOR UPDATE USING (true);

ALTER TABLE news_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read news" ON news_projects;
DROP POLICY IF EXISTS "Public insert news" ON news_projects;
DROP POLICY IF EXISTS "Public update news" ON news_projects;
CREATE POLICY "Public read news" ON news_projects FOR SELECT USING (true);
CREATE POLICY "Public insert news" ON news_projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update news" ON news_projects FOR UPDATE USING (true);

-- DELETE házirendek. RLS alatt DELETE policy NÉLKÜL a törlés NEM hibázik,
-- csak csendben 0 sort érint — ezért kell külön kimondani.
DROP POLICY IF EXISTS "Public delete profiles" ON profiles;
DROP POLICY IF EXISTS "Public delete workgroups" ON workgroups;
DROP POLICY IF EXISTS "Public delete documents" ON documents;
DROP POLICY IF EXISTS "Public delete news" ON news_projects;
CREATE POLICY "Public delete profiles" ON profiles FOR DELETE USING (true);
CREATE POLICY "Public delete workgroups" ON workgroups FOR DELETE USING (true);
CREATE POLICY "Public delete documents" ON documents FOR DELETE USING (true);
CREATE POLICY "Public delete news" ON news_projects FOR DELETE USING (true);

-- Diagnosztikai teszt sorok takarítása (a kapcsolat ellenőrzésekor keletkeztek).
-- A DELETE korábban azért nem működött, mert nem volt DELETE policy — fentebb pótoltuk.
DELETE FROM profiles WHERE account_email IN (
  'teszt.debug@example.com', 'teszt.ekezet@example.com', 'sema.teszt@example.com'
);
DELETE FROM workgroups WHERE slug = 'teszt-csoport';
DELETE FROM documents WHERE title = 'X';
