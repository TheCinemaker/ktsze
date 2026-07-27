# Kőszegi Turisztikai Szövetség Egyesület — Hivatalos Portál & Tagi Rendszer

**Digitális Érintettség & Elnökségi Bemutató Anyag (2026)**  
*Készült a "Digitalizáljuk Kőszeg" kezdeményezés keretében.*

---

## 🏛️ Projekt Áttekintés

Ez a webalkalmazás a **Kőszegi Turisztikai Szövetség Egyesület** hivatalos tájékoztató oldala és zárt tagi/adminisztrációs rendszere.

### 📜 Főbb Alapelvek & Elkülönítés:
- **Kifejezetten Egyesületi Felület**: Az oldal az egyesület szakmai munkájáról, a **készülő turisztikai fejlesztési projektekről**, nyertes pályázatokról és hivatalos elnökségi hírekről ad tájékoztatást. **NEM keveredik a koszegapp-al** (nincsenek benne lakossági étterem- vagy rendezvénykatalógusok).
- **2026-os Szerkesztőségi Elegancia**: Bézs (`#FAF6F0`), meleg krém (`#F3ECE0`), mély földbarna (`#2C221E`) és kőszegi borvidéki bordó (`#6B1D2F`) prémium színvilág, Playfair Display tipográfiával és vektoros SVG ikonográfiával.
- **Mobiltudatosság**: 100%-ban reszponzív felület okostelefonoktól a 4K kijelzőkig.

---

## 🚀 Főbb Modulok

### 1. Publikus Tájékoztató Portál
- **Főoldal & Küldetés**: Az Egyesület elnökségének és 15+ éves szakmai múltjának bemutatása.
- **Programok & Hírek**: Szűrhető kategóriák (Turisztikai Fejlesztés, Közgyűlés, Pályázat) és részletes közlemény-olvasó modal.
- **Publikus Irattár**: Éves pénzügyi beszámolók és a hatályos Alapszabály letöltése.
- **Csatlakozási Nyilatkozat**: Tagdíjkategóriák (Magánszállások: 24.000 Ft, Hotelek & Borászatok: 36.000 Ft, Pártoló tagok: 15.000 Ft) és online kérelmezés.

### 2. Tagi Portál (Zárt Felület)
- **Tagdíj Kezelés**: Éves egyenleg rögzítés, esedékességi státusz (`Rendezve` / `Függőben`), banki átutalási adatok (OTP 11747051-20019948) és átutalási igazolás feltöltő modul.
- **Belső Dokumentumtár**: Közgyűlési jegyzőkönyvek és zárt szabályzatok elérése.
- **Google Drive Felhő Integráció**: Kétirányú fájl- és mappaszinkronizáció (`2026_Kozgyules_Es_Elenoksegi_Anyagok`, `Palyazatok`, `Fototarak_Es_Logo_Pakett`).

### 3. Adminisztrációs Portál (Elnökség & Titkárság)
- **Tagnyilvántartó**: Tagok keresése, tagdíj státusz jóváhagyása egy kattintással.
- **Tartalomkezelő (CMS)**: Hírek és fejlesztési projektek publikálása.
- **Supabase & Drive Állapot**: Adatbázis RLS szabályok és felhőtárhely státusza.

---

## 🛠️ Technológiai Stakk

- **Frontend**: React 18, Vite 8, Tailwind CSS v3 (Custom Color Tokens).
- **Ikonográfia**: Lucide-React & Custom Inline Vector SVG (Emoji mentes).
- **Backend / DB**: Supabase PostgreSQL (SQL Schema megtalálható a `supabase/schema.sql` állományban).
- **Felhő Storage**: Google Drive API integráció.

---

## 💻 Helyi Indítás & Fejlesztés

```bash
# 1. Függőségek telepítése (ha szükséges)
npm install

# 2. Fejlesztői szerver indítása
npm run dev

# 3. Éles build generálása
npm run build
```

Az alkalmazás alapértelmezetten a `http://localhost:5173` címen érhető el.
