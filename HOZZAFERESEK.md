# KTSZE — Projekt Információk, Hozzáférések & Rendszerleírás

**Projekt Neve**: Kőszegi Turisztikai Szövetség Egyesület Hivatalos Portálja & Tagi Rendszere  
**Felelős**: Avar Szilveszter Alelnök (SA Software)  
**Utolsó Frissítés**: 2026. július 27.  

---

## 🔐 1. Backend & Adatbázis Hozzáférések (Supabase)

- **Supabase Dashboard URL**: [https://supabase.com/dashboard/project/kcuqebzmloattlgzuhpg](https://supabase.com/dashboard/project/kcuqebzmloattlgzuhpg)
- **Belépési E-mail Cím**: `koszegfotok@gmail.com`
- **Belépési Jelszó**: `Nyanyuska_0169`
- **Projekt Referencia ID**: `kcuqebzmloattlgzuhpg`
- **SQL Adatbázis Schema Helye**: [`supabase/schema.sql`](file:///C:/Users/Szilveszter/.gemini/antigravity-ide/scratch/koszeg-turizmus-egyesulet/supabase/schema.sql)  
  *(A Supabase Dashboard -> SQL Editor felületére bemásolva és lefuttatva 1 kattintással felépíti az összes PostgreSQL táblát és RLS biztonsági szabályt.)*

---

## 🌐 2. Verziókezelés & Élesítési (Deploy) Hozzáférések

- **GitHub Repository**: [https://github.com/TheCinemaker/ktsze.git](https://github.com/TheCinemaker/ktsze.git)
- **Fő Branch**: `main`
- **Netlify Deployment Konfiguráció**:
  - Konfigurációs fájl: [`netlify.toml`](file:///C:/Users/Szilveszter/.gemini/antigravity-ide/scratch/koszeg-turizmus-egyesulet/netlify.toml)
  - Publish könyvtár: `dist`
  - Átirányítási szabály: `/* -> /index.html (200 OK)` SPA támogatással.

---

## 👥 3. Előre Beállított Teszt Fiókok (Demo Nézetváltó)

A weboldal jobb felső sarkában lévő szerepkör-váltóval azonnal tesztelhető az összes nézet:

| Szerepkör | Teszt E-mail / Fiók | Jogosultságok & Funkciók |
|---|---|---|
| **Elnökségi Admin** | `elnok@koszegiturizmus.hu` | Teljes hozzáférés, tagok adatainak szerkesztése, új munkacsoportok indítása, elnökségi hírek CMS, dokumentum feltöltés. |
| **Rendes Tag (Vállalkozó)** | `info@irottko.hu` | Tagi portál, 2026. évi tagdíj befizetés igazolás, belső irattár elérése (feltöltés nélkül), Google Drive mappa elérés. |
| **Pártoló Tag (Magánszemély)** | `kovacs.janos@partolotag.hu` | Pártolói tagsági portál (15k Ft/év tagdíj), városszépítő munkacsoport tagság, egyesületi irattár megtekintése. |
| **Publikus Látogató** | *(Belépés nélkül)* | Egyesület küldetése, Polgármesteri megállapodás, hírek, munkacsoporti felhívások, nyílt dokumentumok. |

---

## 🏛️ 4. Hivatalos Elnökségi Struktúra (2026)

1. **Drescher Gábor** — Elnök (*Kőszegi Turisztikai Szövetség Egyesület*)
2. **Szalók Adrienn** — Alelnök asszony (*„Kőszeg virágzik” városszépítő munkacsoport*)
3. **Farkas Péter** — Alelnök (*Ibrahim Boutique Hotel tulajdonosa*)
4. **Vörös Róbert** — Alelnök (*Portré Étterem és Panzió tulajdonosa*)
5. **Avar Szilveszter** — Alelnök (*SA Software — „Digitális Kőszegért” munkacsoport felelőse*)
6. **Szekér Zoltán** — Turisztikai Menedzser (*Jurisics-vár Művelődési Központ & Várszínház*)

---

## 📊 5. Elszámolási & Projektdokumentumok

- 📁 **[SZAMLAZASI_NAPLO.md](file:///C:/Users/Szilveszter/.gemini/antigravity-ide/scratch/koszeg-turizmus-egyesulet/SZAMLAZASI_NAPLO.md)**  
  Hivatalos elszámolás az SA Software részéről: **52 óra @ 13 000 Ft/óra = 676 000 Ft + ÁFA** összegről kiállítandó számla.
- 📁 **[PROJEKTNAPLO.md](file:///C:/Users/Szilveszter/.gemini/antigravity-ide/scratch/koszeg-turizmus-egyesulet/PROJEKTNAPLO.md)**  
  Piaci összehasonlító értékelés az elnökségi bemutatóhoz: 104 fejlesztői óra = 1 352 000 Ft + ÁFA megtakarítás.
