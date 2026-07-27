# Kőszegi Turisztikai Szövetség Egyesület — portál és tagi rendszer

Az egyesület nyilvános tájékoztató oldala, valamint a tagok és az elnökség zárt
munkafelülete.

**Az alkalmazás tartalom nélkül indul.** Nincs benne demó adat, példahír vagy
kitalált taglista — a felület mindenhol üres állapotot mutat, amíg valódi
tartalom nem kerül bele. Ez szándékos: így nem kerülhet ki a nyilvánosság elé
olyan adat, amit senki nem hagyott jóvá.

---

## Technológia

| Réteg | Megoldás |
|---|---|
| Frontend | React 19, Vite 8, React Router 7 |
| Stílus | Tailwind CSS 3 — a színek és a tipográfia a `tailwind.config.js`-ben |
| Ikonok | lucide-react |
| Adatbázis | Supabase PostgreSQL, Row Level Security |
| Belépés | Supabase Auth (e-mail + jelszó) |
| Fájlok | Supabase Storage |
| Élesítés | Netlify (`netlify.toml`) |

---

## Üzembe helyezés

### 1. Adatbázis felépítése

A Supabase Dashboard → **SQL Editor** felületén, ebben a sorrendben:

1. `supabase/01_schema.sql` — táblák, jogosultsági függvények, RLS szabályok
2. `supabase/02_storage.sql` — Storage bucketek és hozzáférési szabályok
3. `supabase/03_admin.sql` — a rendszergazda és a tisztségviselők beállítása

> **Figyelem:** a `01_schema.sql` eldobja a korábbi táblákat. Ez az első
> telepítésnél szándékos, de éles adat mellett ne futtasd le mentés nélkül.

### 2. Rendszergazda létrehozása

Jelszót SQL-ből nem állítunk be. A Dashboard → **Authentication → Users → Add
user** felületén hozd létre a fiókot:

- E-mail: `admin@visitkoszeg.hu`
- Jelszó: a megbeszélt jelszó
- **„Auto Confirm User” bepipálva**

Ezután futtasd le a `03_admin.sql`-t, ami hozzáadja az `admin` szerepkört.

Belépésnél elég az `admin` szót beírni — a rendszer feloldja e-mail címre.

### 3. E-mail megerősítés

Alapból a Supabase megerősítő levelet kér minden regisztrációnál. Ha ezt nem
akarod, kapcsold ki: **Authentication → Sign In / Providers → Confirm email**.

### 4. Környezeti változók

Másold a `.env.example`-t `.env`-re, és töltsd ki. Netlify esetén ugyanezeket a
változókat a **Site settings → Environment variables** alatt kell megadni.

### 5. Egyesületi alapadatok

A székhely, az e-mail cím, a telefonszám, az adószám és a bankszámlaszám a
`src/config/organization.js` fájlban van — **alapból üresen**. Amit nem töltesz
ki, az a weboldalon meg sem jelenik.

Csak azt írd be, ami hivatalosan igazolható.

### 6. Helyi fejlesztés

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

---

## Jogosultsági szintek

A szerepkör külön táblában van (`user_roles`), nem a profilban — így a tag nem
tudja saját magát előléptetni a profilja szerkesztésével.

| Szerepkör | Mit tud |
|---|---|
| `admin` | Mindent, beleértve a szerepkörök és a rendszerbeállítások kezelését |
| `president` | Tagnyilvántartás, tagdíj, tartalom, szerepkörök (admin kiosztása nélkül) |
| `vicepresident` | Hírek, munkacsoportok, dokumentumok. Tagdíjhoz nem ér hozzá |
| `board` | Elnökségi betekintés — belső dokumentumok és tagnyilvántartás, írás nélkül |
| `member` | Saját adatlap, saját tagdíj, tagi dokumentumok |
| `patron` | Ugyanaz, mint a rendes tag |

A `profiles.custom_title` (pl. „Digitális Kőszeg alelnök”) **csak kiírt
megnevezés — jogosultságot nem ad.**

A kliensoldali szabályok (`src/lib/permissions.js`) és az adatbázis-oldali
függvények (`is_admin()`, `can_manage_members()`, `can_manage_content()`,
`is_board()`) párban vannak. **Ha az egyiket módosítod, a másikat is kell.**
A böngészőben elrejtett gomb nem védelem — a védelmet az RLS adja.

---

## Google Drive

Jelenleg **nincs bekötve**, és a felület ezt nyíltan ki is írja. A csatolási
pont elő van készítve: `documents.drive_file_id` és `documents.drive_url`.

A bekötéshez Google Cloud OAuth kliens azonosító kell, és egy szerveroldali
komponens (Supabase Edge Function) — a Drive írási művelet nem végezhető el
biztonságosan közvetlenül a böngészőből.

---

## Adatvédelem

A tagok telefonszáma, lakcíme és privát e-mail címe **személyes adat**. Az RLS
ennek megfelelően van beállítva:

- a tag csak a saját profilját látja,
- a teljes tagnyilvántartást kizárólag az elnökség,
- a tagdíj-igazolásokat csak a feltöltő tag és az elnökség.

A nyilvános oldalak egyetlen tag személyes adatát sem kérik le.

---

## Amit tudni érdemes a kódról

- **A Supabase az egyetlen igazságforrás.** A böngésző nem tárol adatot; nincs
  localStorage-alapú állapot.
- **Minden adatbázis-hívás `await`-elt, és az `error` mezőt megvizsgálja**
  (`src/lib/db.js`). A supabase-js query builder nem Promise — nincs rajta
  `.catch()`, ezért a hibát az `error` mezőből kell kiolvasni, különben némán
  elnyelődik.
- **Nincs `alert()`.** Minden visszajelzés toast (`src/context/ToastContext.jsx`),
  és sikerüzenet csak tényleges sikeres mentés után jelenik meg.
- **Üres állapotok mindenhol.** Ha nincs adat, azt írjuk ki — nem töltjük fel
  példatartalommal.
