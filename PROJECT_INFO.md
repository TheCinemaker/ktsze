# Projekt Információk - KTSZE (Kőszegi Turisztikai Szövetség Egyesület)

Ez a fájl tartalmazza a Kőszegi Turisztikai Szövetség Egyesület (visitkoszeg.hu) portál és zárt tagi rendszerének legfontosabb fejlesztési adatait, elérési útjait és konfigurációs fájljait.

---

## 🏛️ Projekt Adatok

* **Projekt neve**: KTSZE Portál & Tagi Rendszer
* **Helyi elérési út (Workspace)**: `/Users/thecinemaker/ktsze/ktsze`
* **Leírás**: Az egyesület nyilvános tájékoztató oldala (arculati dizájn, hírek, munkacsoportok), valamint a tagok és az elnökség zárt munkafelülete (tagdíj-igazolások, belső dokumentumtár, szerepkör-kezelés).
* **Egyesületi Alapadatok fájlja**: [organization.js](file:///Users/thecinemaker/ktsze/ktsze/src/config/organization.js)

---

## ⚡ Aktuális Státusz & Fejlesztések

* **Helyi fejlesztés**:
  * Az alkalmazás Vite 8 + React 19 + Tailwind v3 alapú.
  * A macOS ARM64-es Rolldown natív modulproblémát javítottuk a `@rolldown/binding-darwin-arm64` közvetlen telepítésével.
  * A projekt sikeresen fordul (`npm run build`) és a dev szerver fut.
* **Adatbázis sémák**:
  * A `supabase/` mappában található 14 SQL fájl írja le a teljes sémát és az RLS szabályokat.
  * Az RLS védi a tagok személyes adatait, csak az elnökség férhet hozzá a teljes taglistához.
* **Jogosultsági szintek**:
  * `admin`: Teljes hozzáférés, jogosultságok kezelése.
  * `president`: Tagok, tagdíjak és tartalmak kezelése.
  * `vicepresident`: Hírek, munkacsoportok, dokumentumok kezelése (tagdíj-hozzáférés nélkül).
  * `board`: Belső elnökségi betekintés írási jog nélkül.
  * `member` / `patron`: Saját profil, saját tagdíj, tagi dokumentumok elérése.

---

## 🔑 Környezeti Változók & Kulcsok (`.env`)

* A `.env.example` alapján a helyi `.env` fájlt kell beállítani a Supabase eléréséhez:
  * `VITE_SUPABASE_URL`: a Supabase projekt URL címe.
  * `VITE_SUPABASE_ANON_KEY`: a nyilvános névtelen kulcs.

---

## ⏭️ Elmaradt feladatok / TODO / Ötletek

* [ ] **Egyesületi adatok beállítása**: `src/config/organization.js` kitöltése (székhely, számlaszám, adószám).
* [ ] **Drescher Gábor elnöki bemutatkozása**: Elnöki bio kitöltése.
* [ ] **Google Drive integráció**: OAuth kliens azonosító konfigurálása és a szerveroldali Drive-szinkron szimuláció bekötése.
* [ ] **E-mail küldés élesítése**: Regisztrációs e-mailek és értesítők testreszabása.
