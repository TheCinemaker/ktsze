-- =============================================================================
--  21. Nyilvános elnökségi adatok a DB-ből (a törékeny névalapú tippelés helyett)
--
--  Futtatás: Supabase Dashboard -> SQL Editor, a 01_schema.sql UTÁN.
--  Újrafuttatható (idempotens).
--
--  Mit old meg:
--    - A profiles tábla publikus bemutatkozó mezőkkel bővül (bio, mottó, portré,
--      nyilvános e-mail/telefon), plusz egy board_public kapcsoló és board_order
--      sorrend az elnökségi oldali megjelenítéshez.
--    - Egy SECURITY DEFINER függvény (public_board_members) adja vissza a
--      nyilvános elnökségi listát KIJELENTKEZVE is — a profiles tábla RLS-e
--      egyébként csak a saját profilt és az elnökséget engedi olvasni, ezért a
--      nyilvános oldal eddig a kódba drótozott tartalékra esett vissza.
--    - A jelenlegi (kódban lévő) bemutatkozásokat NÉV alapján beülteti. Csak a
--      MÁR LÉTEZŐ profilokat frissíti; akinek még nincs fiókja, az a fiók
--      létrehozása után kap sort (vagy az elnökség a Tagnyilvántartásból
--      kapcsolja be neki a board_public mezőt).
-- =============================================================================

-- -----------------------------------------------------------------------------
--  1. Publikus profilmezők
-- -----------------------------------------------------------------------------
alter table public.profiles add column if not exists avatar_url   text;
alter table public.profiles add column if not exists bio          text;
alter table public.profiles add column if not exists motto        text;
alter table public.profiles add column if not exists public_email text;
alter table public.profiles add column if not exists public_phone text;
alter table public.profiles add column if not exists board_public boolean not null default false;
alter table public.profiles add column if not exists board_order  integer;

comment on column public.profiles.public_email is 'Kifejezetten NYILVÁNOSAN vállalt e-mail (nem a belépési/privát cím).';
comment on column public.profiles.public_phone is 'Kifejezetten NYILVÁNOSAN vállalt telefonszám.';
comment on column public.profiles.board_public is 'Igaz, ha a tag megjelenik a nyilvános Elnökség oldalon.';

-- -----------------------------------------------------------------------------
--  2. Nyilvános elnökségi lista — RLS-t megkerülő, de CSAK a publikus mezőket
--     visszaadó függvény. Anonim felhasználó is hívhatja.
-- -----------------------------------------------------------------------------
create or replace function public.public_board_members()
returns table (
  id                    uuid,
  full_name             text,
  custom_title          text,
  service_location_name text,
  business_activity     text,
  avatar_url            text,
  bio                   text,
  motto                 text,
  public_email          text,
  public_phone          text,
  board_order           integer
)
language sql
stable
security definer
set search_path = public
as $$
  select id, full_name, custom_title, service_location_name, business_activity,
         avatar_url, bio, motto, public_email, public_phone, board_order
  from public.profiles
  where board_public = true
  order by board_order nulls last, full_name;
$$;

grant execute on function public.public_board_members() to anon, authenticated;

-- -----------------------------------------------------------------------------
--  3. A jelenlegi bemutatkozások beültetése (best-effort, név szerint)
--     Csak létező profilt frissít; hiányzó nevet egyszerűen kihagy.
-- -----------------------------------------------------------------------------
update public.profiles set
  board_public = true,
  board_order  = 1,
  custom_title = 'Elnök',
  avatar_url   = coalesce(avatar_url, '/drescher_gabor.jpg'),
  motto        = coalesce(motto, $m$„Kőszeg számomra nem csupán egy város, hanem közösség, otthon és közös felelősség. Ha nincs közös szervezetünk, akkor nincs közös hangunk sem.”$m$),
  bio          = coalesce(bio, $b$Kőszeg számomra nem csupán egy város, hanem közösség, otthon és közös felelősség. Hiszek abban, hogy Kőszeg különleges történelmi, természeti és kulturális értékei olyan lehetőséget jelentenek, amelyre együtt, helyi összefogással lehet sikeres és fenntartható turizmust építeni.

Vállalkozóként és szálláshely-üzemeltetőként naponta találkozom a városba érkező vendégekkel, az igényeikkel, benyomásaikkal és visszajelzéseikkel. Pénzügyi tanácsadói munkám során pedig sokéves tapasztalatot szereztem vállalkozások támogatásában, ügyintézésben, szervezésben és érdekképviseletben.

A Kőszegi Turisztikai Szövetség Egyesület elnökeként az a célom, hogy összefogjuk a turizmusban, vendéglátásban, szálláshely-szolgáltatásban, kultúrában, kereskedelemben és rendezvényszervezésben dolgozó helyi szereplőket. Olyan együttműködő közösséget szeretnénk építeni, amely nemcsak beszél a lehetőségekről, hanem közösen dolgozik is azok megvalósításán.$b$)
where full_name = 'Drescher Gábor';

update public.profiles set
  board_public = true,
  board_order  = 2,
  custom_title = 'Digitális Kőszeg alelnök',
  avatar_url   = coalesce(avatar_url, '/avar_szilveszter.jpg'),
  public_email = coalesce(public_email, 'avar.szilveszter@gmail.com'),
  public_phone = coalesce(public_phone, '+36 70 636 4745'),
  motto        = coalesce(motto, $m$„Ha valamit nem találsz a neten, azt nem is keresed igazán”$m$),
  bio          = coalesce(bio, $b$Kőszegen születtem és nőttem fel, a város iránti szeretetem és az informatika világa már fiatalon meghatározta az utamat. A Kőszegi Turisztikai Szövetség Egyesület alelnökeként és a „Digitális Kőszegért” munkacsoport szakmai vezetőjeként elkötelezetten küzdök Kőszeg turizmusának teljes körű digitalizációjáért. Célom a helyi éttermek, szálláshelyek és turisztikai szereplők összekapcsolása modern digitális megoldásokkal.$b$)
where full_name = 'Avar Szilveszter';

update public.profiles set
  board_public = true,
  board_order  = 3,
  custom_title = 'Alelnök',
  bio          = coalesce(bio, $b$Az Ibrahim Boutique Hotel vezetője. A Kőszegi Turisztikai Szövetség Egyesület alelnökeként a minőségi szálláshely-szolgáltatások, a városi vendégfogadási standardok és a turisztikai marketing fejlesztéséért felel.$b$)
where full_name = 'Farkas Péter';

update public.profiles set
  board_public = true,
  board_order  = 4,
  custom_title = 'Alelnök',
  public_email = coalesce(public_email, 'szalok.adrienn@gmail.com'),
  public_phone = coalesce(public_phone, '+36 30 677 5777'),
  motto        = coalesce(motto, $m$„Hiszek Kőszegben. Nem azért, mert minden készen van, hanem mert minden lehetőség benne van.”$m$),
  bio          = coalesce(bio, $b$Több mint két évtizede dolgozom a turizmus és a vendéglátás területén. A Kőszegi Turisztikai Szövetség Egyesület alapító tagjaként azért dolgozom, hogy Kőszeg egész évben vonzó, többnapos tartózkodásra ösztönző úti cél legyen, ahol a szálláshelyek, vendéglátók, üzletek, kulturális szereplők és szolgáltatók egymást erősítve működnek.$b$)
where full_name = 'Kovács-Szalók Adrienn';

update public.profiles set
  board_public = true,
  board_order  = 5,
  custom_title = 'Alelnök',
  bio          = coalesce(bio, $b$A Portré Étterem és Panzió tulajdonos-vezetője. A Kőszegi Turisztikai Szövetség Egyesület alelnökeként a gasztronómiai és vendéglátóipari programok koordinációjáért felel, támogatva a helyi ízek, a vendéglátás és a borvidéki kultúra fejlődését.$b$)
where full_name = 'Vörös Róbert';

-- =============================================================================
--  Kész. Kliens oldali párja: src/lib/db.js (listPublicBoardMembers -> RPC),
--  src/pages/AboutPage.jsx (DB-mezők közvetlen használata), ProfileForm (tag
--  szerkesztheti a saját publikus bio/mottó/portré/elérhetőség mezőit).
-- =============================================================================
