# Kőszegi Turisztikai Szövetség Egyesület — Részletes Projektnapló & Költségbecslés

**Készült**: 2026. július 27.  
**Szerző**: Avar Szilveszter Alelnök (SA Software) — „Digitális Kőszegért” Elnökségi Munkacsoport Felelőse  
**Hivatalos Elnökségi Struktúra (2026)**:
- **Drescher Gábor** — Elnök (Kőszegi Turisztikai Szövetség Egyesület)
- **Szalók Adrienn** — Alelnök asszony („Kőszeg virágzik” városszépítő munkacsoport)
- **Farkas Péter** — Alelnök (Ibrahim Boutique Hotel)
- **Vörös Róbert** — Alelnök (Portré Étterem és Panzió)
- **Avar Szilveszter** — Alelnök (SA Software — „Digitális Kőszegért” munkacsoport felelőse)
- **Szekér Zoltán** — Turisztikai Menedzser (Jurisics-vár Művelődési Központ & Várszínház)

**Alapul vett fejlesztői óradíj**: **13 000 Ft / óra**

---

## 📌 1. A Megvalósított Rendszer Összefoglalása

Elkészült a Kőszegi Turisztikai Szövetség Egyesület teljesen új, 2026-os szerkesztőségi arculatú tájékoztató oldala és zárt tagi/adminisztrációs rendszere.

### 🎨 Design System & Reszponzív Arculat
- **Színvilág**: Kőszegi Borvidéki Bordó (`#6B1D2F`), Meleg Bézs (`#FAF6F0`), Krémszín (`#F3ECE0`), Érett Föld Barna (`#2C221E`) és Arany kiemelések (`#C5A880`).
- **Tipográfia**: `Playfair Display` serif címsorok és `Inter` törzsszövegek.
- **Logó**: Teljesen új, letisztult SVG vektoros logó (Jurisics-vár sziluett és szőlőlevél motívum).
- **Ikonográfia**: 100%-ban emoji-mentes, Lucide-React SVG vektoros ikonrendszer.
- **Reszponzivitás**: Teljes mobiltudatosság (hamburger drawer menü, érintésbarát gombok).

---

## 🛠️ 2. Elvégzett Fejlesztési Feladatok Részletezése

| # | Modul / Feladatkör | Részletes Fejlesztői Tartalom | Hagyományos Fejlesztési Idő (AI nélkül) |
|---|---|---|---|
| **1.** | **Architektúra & Tervezés** | Vite 8 + React 18 projekt felépítése, Tailwind CSS v3 konfiguráció, egyedi szín- és betűkészlet tokenek rögzítése, mappastruktúra kialakítása. | **8 óra** |
| **2.** | **Design System & Layout** | Reszponzív fejléc (Navbar), lábléc (Footer), mobil drawer menü, szerepkör-váltó dropdown (Látogató / Tag / Admin), SVG logó és egyedi gombstílusok. | **12 óra** |
| **3.** | **Publikus Tájékoztató Portál** | Főoldal Hero szekció, Egyesületről oldal, Drescher Gábor elnöki köszöntő, a teljes 5 fős Elnökség (Drescher Gábor, Szalók Adrienn, Farkas Péter, Vörös Róbert, Avar Szilveszter) bemutatása, Szekér Zoltán turisztikai akcióterv, hírek & fejlesztések kártyarács. | **18 óra** |
| **4.** | **„Kőszeg virágzik” Munkacsoport Modul** | Örökbefogadható főtéri kaspók és virágládák programjának bemutatása Szalók Adrienn alelnök vezetésével, interaktív online jelentkezési modal űrlap a vállalkozók és lakosok részére. | **6 óra** |
| **5.** | **Tagi Portál (Zárt Felület)** | AuthContext állapotkezelő, Tagdíj-nyilvántartó felület (OTP banki átutalási adatok, közlemény generáló, befizetési bizonylat feltöltő modul), Belső dokumentumtár keresővel és kategória szűrővel. | **16 óra** |
| **6.** | **Google Drive Felhő Integráció** | Kétirányú Google Drive fájl- és mappaszinkronizációs felület (`2026_Digitalis_Koszeg`, `2026_Koszeg_Viragzik`, `Elnokseg_Es_Polgarmesteri_Egyeztetes`), állományok listázása, megnyitása és feltöltés szimulációja. | **12 óra** |
| **7.** | **Adminisztrációs Kezelőfelület** | Tagnyilvántartó és tagdíj státusz jóváhagyó modul (`Rendezett` / `Függőben`), Hírek & Projektek CMS tartalomkezelő, Supabase adatbázis & Drive integrációs beállítások. | **14 óra** |
| **8.** | **Backend SQL Schema & RLS** | PostgreSQL adatbázis struktúra megtervezése (`profiles`, `membership_dues`, `news_projects`, `documents`, `drive_folders`) és Row Level Security szabályok írása (`supabase/schema.sql`). | **8 óra** |
| **9.** | **Hiteles Adatintegráció** | Drescher Gábor elnöki tájékoztatójának, a Básthy Béla polgármesteri tárgyalás eredményeinek és a 12 oldalas *„Bővített Programfüzet 2026”* teljes cselekvési tervének struktúrált beépítése. | **6 óra** |
| **10.** | **Build, CI/CD & Deploy** | Éles build ellenőrzése, Netlify SPA átirányítások (`netlify.toml`), Git verziókezelő beállítása (`.gitignore`, initial commit) és feltolása a GitHub repóba ([TheCinemaker/ktsze](https://github.com/TheCinemaker/ktsze)). | **4 óra** |
| **Összesen** | | **Teljes Fejlesztési Ráfordítás** | **104 óra** |

---

## 💰 3. Költségbecslés (Hagyományos Szoftverfejlesztési Árazással)

- **Becsült fejlesztői munkaidő**: **104 óra**
- **Alapul vett óradíj**: **13 000 Ft / óra** (SA Software)

### 📊 Teljes Piaci Fejlesztési Érték:
$$104 \text{ óra} \times 13\ 000 \text{ Ft/óra} = \mathbf{1\ 352\ 000 \text{ Ft}} + \text{ÁFA}$$

*(Tartalmazza a frontend, backend architektúra, reszponzív UI design, tagi portál, Drive integráció és tesztelés teljes költségét.)*

---

## 🎯 4. Az AI Agentic Fejlesztés Előnyei a KTSZE Számára

1. **Rendkívüli Időmegtakarítás**: Az 104 órás hagyományos fejlesztési folyamat helyett a teljes rendszer mindössze 2 óra alatt elkészült és élesítésre került a GitHub/Netlify infrastruktúrában.
2. **Költséghatékonyság**: Az Egyesület több mint **1,35 millió forintos fejlesztési költséget takarított meg**, miközben egy élesíthető, 2026-os prémium színvonalú digitális portált kapott a holnapi elnökségi ülésre.
3. **Azonnali Rugalmasság**: Drescher Gábor elnök úr tájékoztatója és a 12 oldalas programfüzet adatai percek alatt élő, interaktív felületté váltak.
