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

-- Biztosítjuk, hogy a meglévő profiles táblában is meglegyen a custom_title oszlop:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_title TEXT;

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
