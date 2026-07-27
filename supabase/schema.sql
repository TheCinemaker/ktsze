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
  
  -- Jogosultsági szerepkör: 'member', 'patron', 'admin'
  role TEXT DEFAULT 'member',
  
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

-- RLS házirendek (Read permissions)
CREATE POLICY "Public read workgroups" ON workgroups FOR SELECT USING (true);
CREATE POLICY "Public read public documents" ON documents FOR SELECT USING (access_level = 'public');
CREATE POLICY "Members read internal documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Profiles read own or public profile" ON profiles FOR SELECT USING (true);

-- Kezdő Adatok (Seed Data)
INSERT INTO workgroups (name, slug, description, leader_name, latest_updates, image_url) VALUES
('Kőszeg virágzik', 'koszeg-viragzik', 'Főtéri kaspók, virágládák és virágos sarkok örökbefogadása, gondozása a városi kertésszel együttműködésben.', 'Szalók Adrienn Alelnök', 'Főtéri piros bódé lebontva! Megkezdődött a kaspók összeírása.', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80'),
('Digitális Kőszegért', 'digitalis-koszegert', 'Egyesületi webes felület, tagi portál, kétirányú Google Drive csatlakozó és digitális edukációs akciónapok.', 'Avar Szilveszter Alelnök', 'Elkészült az új KTSZE portál v1.0 és a zárt tagi rendszer.', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80'),
('Őszi Forgalomnövelés & B2B Nyílt Nap', 'oszi-forgalomnoveles', 'Aktív & gasztronómiai programok, Kőszegi Esték zenés sorozat és szeptemberi B2B Nyílt Nap & Média Study Tour.', 'Szekér Zoltán, Farkas Péter & Vörös Róbert', 'Szeptemberi B2B nyílt nap időpontjának egyeztetése a Jurisics Várban.', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80');
