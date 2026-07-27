-- =============================================================================
--  Kőszegi Turisztikai Szövetség Egyesület — adatbázis séma
--  Futtatás: Supabase Dashboard -> SQL Editor -> New query -> beilleszt -> Run
--
--  FIGYELEM: ez a szkript ELDOBJA a korábbi táblákat és a bennük lévő adatokat.
--  A projekt eddigi tartalma teljes egészében demó/teszt adat volt, ezért ez
--  szándékos. Éles adat esetén NE futtasd le mentés nélkül.
--
--  A szkript újrafuttatható (idempotens).
-- =============================================================================

-- -----------------------------------------------------------------------------
--  0. Tiszta lap
-- -----------------------------------------------------------------------------
drop table if exists public.workgroup_members cascade;
drop table if exists public.membership_dues  cascade;
drop table if exists public.dues_rates       cascade;
drop table if exists public.documents        cascade;
drop table if exists public.news             cascade;
drop table if exists public.workgroups       cascade;
drop table if exists public.user_roles       cascade;
drop table if exists public.profiles         cascade;

drop function if exists public.handle_new_user()            cascade;
drop function if exists public.has_role(uuid, text)         cascade;
drop function if exists public.current_roles()              cascade;
drop function if exists public.is_admin()                   cascade;
drop function if exists public.can_manage_members()          cascade;
drop function if exists public.can_manage_content()          cascade;
drop function if exists public.is_board()                    cascade;
drop function if exists public.set_updated_at()              cascade;

-- -----------------------------------------------------------------------------
--  1. Profilok
--
--  Az id egyben az auth.users id-ja -> 1:1 kapcsolat, nincs duplikáció.
--  Alapértelmezett érték szándékosan NINCS a tartalmi mezőkön: amit a tag nem
--  ad meg, az maradjon üres, ne találjon ki helyette a rendszer semmit.
-- -----------------------------------------------------------------------------
create table public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  account_email         text not null,
  full_name             text,
  private_email         text,
  phone                 text,
  home_address          text,

  -- 'Rendes tag' | 'Pártoló tag' | 'Elnökségi tag'
  member_category       text,

  -- 'szállásadó' | 'vendéglős' | 'borász' | 'szolgáltató' | 'kulturális' | 'egyéb'
  business_activity     text,

  service_location_name text,
  service_street        text,
  service_house_number  text,
  service_contacts      text,

  -- Tisztség megnevezése, pl. "Digitális Kőszeg alelnök".
  -- Ez CSAK megjelenítés. Jogot kizárólag a user_roles tábla ad.
  custom_title          text,

  joined_date           date not null default current_date,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index profiles_account_email_idx on public.profiles (lower(account_email));

comment on column public.profiles.custom_title is
  'Csak kiírt tisztségnév. Jogosultságot NEM ad — az a user_roles táblában van.';

-- -----------------------------------------------------------------------------
--  2. Szerepkörök
--
--  A szerepkör SZÁNDÉKOSAN külön táblában van, NEM a profiles-ban.
--  Ha a profiles-ban lenne, a tag a saját profilja szerkesztésekor át tudná
--  írni magát adminná. A user_roles táblába csak admin/elnök írhat.
--
--  A user_id a profiles(id)-ra hivatkozik (ami maga is auth.users(id)), hogy a
--  PostgREST fel tudja oldani a kapcsolatot: profiles?select=*,user_roles(role)
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum (
      'admin',          -- rendszergazda: minden
      'president',      -- elnök: minden, kivéve admin szerepkör adása
      'vicepresident',  -- alelnök: tartalom, munkacsoportok, dokumentumok
      'board',          -- elnökségi tag: belső betekintés, írás nélkül
      'member',         -- rendes tag
      'patron'          -- pártoló tag
    );
  end if;
end $$;

-- FONTOS: a granted_by szándékosan az auth.users-re hivatkozik, NEM a
-- profiles-ra. Ha mindkét oszlop a profiles-ra mutatna, a PostgREST nem tudná
-- eldönteni, melyik kapcsolaton oldja fel a profiles?select=*,user_roles(role)
-- kérést, és PGRST201 hibát adna ("more than one relationship was found").
create table public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       public.app_role not null,
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index user_roles_user_id_idx on public.user_roles (user_id);

comment on table public.user_roles is
  'Jogosultságok. Külön táblában, hogy a tag ne tudja saját magát előléptetni.';

-- -----------------------------------------------------------------------------
--  3. Munkacsoportok
-- -----------------------------------------------------------------------------
create table public.workgroups (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  slug           text not null unique,
  description    text,
  leader_user_id uuid references public.profiles(id) on delete set null,
  leader_name    text,          -- ha a vezető nem regisztrált felhasználó
  latest_updates text,
  is_active      boolean not null default true,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.workgroup_members (
  id           uuid primary key default gen_random_uuid(),
  workgroup_id uuid not null references public.workgroups(id) on delete cascade,
  profile_id   uuid not null references public.profiles(id)   on delete cascade,
  joined_at    timestamptz not null default now(),
  unique (workgroup_id, profile_id)
);

-- -----------------------------------------------------------------------------
--  4. Tagdíjak
--
--  A tagdíj összegeket az elnökség tölti fel — nincs beégetett összeg.
-- -----------------------------------------------------------------------------
create table public.dues_rates (
  id         uuid primary key default gen_random_uuid(),
  year       integer not null,
  label      text    not null,   -- pl. "Rendes tag — szállásadó"
  amount_huf integer not null check (amount_huf >= 0),
  note       text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (year, label)
);

create table public.membership_dues (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  year           integer not null,
  amount_huf     integer check (amount_huf >= 0),
  status         text not null default 'pending'
                   check (status in ('pending', 'paid', 'overdue', 'waived')),
  due_date       date,
  paid_at        date,
  payment_method text,
  proof_path     text,           -- Supabase Storage útvonal (dues-proofs bucket)
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (profile_id, year)
);

-- -----------------------------------------------------------------------------
--  5. Dokumentumok
--
--  A fájl a Storage 'documents' bucketben van, itt csak az útvonala.
--  storage_path IS NULL = még nincs feltöltve fájl (nem letölthető).
-- -----------------------------------------------------------------------------
create table public.documents (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  category     text,
  description  text,
  access_level text not null default 'members'
                 check (access_level in ('public', 'members', 'board', 'admin')),
  storage_path text,
  file_size    bigint,
  file_type    text,

  -- Google Drive: előkészített csatolási pont. Amíg nincs bekötve, marad NULL.
  drive_file_id text,
  drive_url     text,

  uploaded_by  uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
--  6. Hírek és projektek
-- -----------------------------------------------------------------------------
create table public.news (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  category     text,
  excerpt      text,
  body         text,
  cover_path   text,          -- Storage 'public-media' bucket
  is_published boolean not null default false,
  published_at timestamptz,
  author_id    uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index news_published_idx on public.news (is_published, published_at desc);

-- -----------------------------------------------------------------------------
--  7. updated_at automatikus léptetése
-- -----------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_updated_at        before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger workgroups_updated_at      before update on public.workgroups
  for each row execute function public.set_updated_at();
create trigger membership_dues_updated_at before update on public.membership_dues
  for each row execute function public.set_updated_at();
create trigger documents_updated_at       before update on public.documents
  for each row execute function public.set_updated_at();
create trigger news_updated_at            before update on public.news
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
--  8. Jogosultsági segédfüggvények
--
--  SECURITY DEFINER + üres search_path: így a user_roles olvasása nem esik bele
--  a saját RLS szabályába (végtelen rekurzió lenne belőle).
-- -----------------------------------------------------------------------------
create function public.has_role(check_user_id uuid, check_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = check_user_id
      and role = check_role::public.app_role
  );
$$;

create function public.current_roles()
returns text[]
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(array_agg(role::text), '{}')
  from public.user_roles
  where user_id = auth.uid();
$$;

-- Rendszergazda: mindent lát és mindent módosít.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'::public.app_role
  );
$$;

-- Tagnyilvántartás és tagdíj: admin + elnök.
create function public.can_manage_members()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('admin'::public.app_role, 'president'::public.app_role)
  );
$$;

-- Tartalom (hírek, munkacsoportok, dokumentumok): admin + elnök + alelnök.
create function public.can_manage_content()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('admin'::public.app_role,
                   'president'::public.app_role,
                   'vicepresident'::public.app_role)
  );
$$;

-- Elnökségi betekintés (írás nélkül is): a fentiek + 'board'.
create function public.is_board()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('admin'::public.app_role,
                   'president'::public.app_role,
                   'vicepresident'::public.app_role,
                   'board'::public.app_role)
  );
$$;

-- -----------------------------------------------------------------------------
--  9. Új felhasználó -> profil automatikusan
--
--  A regisztrációnál átadott metaadatokból készül a profil, és minden új
--  felhasználó 'member' (vagy 'patron') szerepkört kap. Adminná KIZÁRÓLAG
--  meglévő admin léptethet elő valakit — a regisztráció ezt nem tudja.
-- -----------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  category text := nullif(meta->>'member_category', '');
begin
  insert into public.profiles (
    id, account_email, full_name, phone, private_email, home_address,
    member_category, business_activity, service_location_name,
    service_street, service_house_number, service_contacts
  ) values (
    new.id,
    new.email,
    nullif(meta->>'full_name', ''),
    nullif(meta->>'phone', ''),
    nullif(meta->>'private_email', ''),
    nullif(meta->>'home_address', ''),
    category,
    nullif(meta->>'business_activity', ''),
    nullif(meta->>'service_location_name', ''),
    nullif(meta->>'service_street', ''),
    nullif(meta->>'service_house_number', ''),
    nullif(meta->>'service_contacts', '')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (
    new.id,
    case when category = 'Pártoló tag'
         then 'patron'::public.app_role
         else 'member'::public.app_role
    end
  )
  on conflict (user_id, role) do nothing;

  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
--  10. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.user_roles        enable row level security;
alter table public.workgroups        enable row level security;
alter table public.workgroup_members enable row level security;
alter table public.dues_rates        enable row level security;
alter table public.membership_dues   enable row level security;
alter table public.documents         enable row level security;
alter table public.news              enable row level security;

-- --- profiles ----------------------------------------------------------------
-- A tag a SAJÁT profilját látja és szerkeszti. A teljes tagnyilvántartást csak
-- az elnökség. Nincs többé "mindenki mindent olvashat" szabály: a telefonszám,
-- lakcím és privát e-mail személyes adat.
create policy "profil: saját olvasás"      on public.profiles for select
  using (id = auth.uid());
create policy "profil: elnökségi olvasás"  on public.profiles for select
  using (public.is_board());
create policy "profil: saját szerkesztés"  on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy "profil: admin szerkesztés"  on public.profiles for update
  using (public.can_manage_members());
create policy "profil: admin felvitel"     on public.profiles for insert
  with check (public.can_manage_members());
create policy "profil: admin törlés"       on public.profiles for delete
  using (public.is_admin());

-- --- user_roles --------------------------------------------------------------
-- Saját szerepkörét mindenki látja (kell a UI-nak). Írni csak admin/elnök tud.
create policy "szerep: saját olvasás"     on public.user_roles for select
  using (user_id = auth.uid());
create policy "szerep: elnökségi olvasás" on public.user_roles for select
  using (public.is_board());
create policy "szerep: kiosztás"          on public.user_roles for insert
  with check (public.can_manage_members() and (role <> 'admin' or public.is_admin()));
create policy "szerep: visszavonás"       on public.user_roles for delete
  using (public.can_manage_members() and (role <> 'admin' or public.is_admin()));

-- --- workgroups -------------------------------------------------------------
create policy "munkacsoport: publikus olvasás" on public.workgroups for select
  using (is_active or public.is_board());
create policy "munkacsoport: szerkesztés"      on public.workgroups for all
  using (public.can_manage_content()) with check (public.can_manage_content());

create policy "csoporttag: olvasás"     on public.workgroup_members for select
  using (profile_id = auth.uid() or public.is_board());
create policy "csoporttag: szerkesztés" on public.workgroup_members for all
  using (public.can_manage_content()) with check (public.can_manage_content());

-- --- dues_rates (publikus tagdíjtáblázat) -----------------------------------
create policy "tagdíjtétel: publikus olvasás" on public.dues_rates for select
  using (true);
create policy "tagdíjtétel: szerkesztés"      on public.dues_rates for all
  using (public.can_manage_members()) with check (public.can_manage_members());

-- --- membership_dues --------------------------------------------------------
create policy "tagdíj: saját olvasás"  on public.membership_dues for select
  using (profile_id = auth.uid());
create policy "tagdíj: elnökségi olvasás" on public.membership_dues for select
  using (public.is_board());
-- A tag feltöltheti a saját igazolását, de a 'paid' státuszt nem ő állítja be:
create policy "tagdíj: saját igazolás" on public.membership_dues for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid() and status <> 'paid');
create policy "tagdíj: elnökségi kezelés" on public.membership_dues for all
  using (public.can_manage_members()) with check (public.can_manage_members());

-- --- documents --------------------------------------------------------------
create policy "dokumentum: publikus"   on public.documents for select
  using (access_level = 'public');
create policy "dokumentum: tagi"       on public.documents for select
  using (access_level = 'members' and auth.uid() is not null);
create policy "dokumentum: elnökségi"  on public.documents for select
  using (access_level in ('board', 'admin') and public.is_board());
create policy "dokumentum: szerkesztés" on public.documents for all
  using (public.can_manage_content()) with check (public.can_manage_content());

-- --- news -------------------------------------------------------------------
create policy "hír: publikált olvasás" on public.news for select
  using (is_published or public.can_manage_content());
create policy "hír: szerkesztés"       on public.news for all
  using (public.can_manage_content()) with check (public.can_manage_content());

-- =============================================================================
--  Kész. Következő lépés: 02_storage.sql, majd 03_admin.sql
-- =============================================================================
