# KTSZE — hozzáférések és rendszerleírás

**Projekt**: Kőszegi Turisztikai Szövetség Egyesület portálja és tagi rendszere
**Felelős**: Avar Szilveszter — Digitális Kőszeg alelnök

---

## ⚠️ Biztonsági figyelmeztetés — olvasd el

Ez a fájl korábban **nyílt szövegben tartalmazta a Supabase-fiók jelszavát**, és
git-ben követve volt (`github.com/TheCinemaker/ktsze.git`). A jelszót
eltávolítottam, de ez önmagában nem elég:

1. **Változtasd meg a Supabase-fiók jelszavát**, és kapcsold be rá a
   kétfaktoros hitelesítést. A régi jelszó bekerült a git előzményébe, tehát a
   repó minden korábbi állapotából visszaolvasható — akkor is, ha a mostani
   verzióban már nincs benne.
2. Ugyanez igaz a korábbi admin jelszóra, ami a kliens kódban volt: az a
   böngészőbe letöltött csomagba is bekerült, tehát nyilvánosnak tekintendő.
   Ne használd újra máshol.
3. **Jelszót ne írj be ebbe a fájlba.** Használj jelszókezelőt.

A `.gitignore` mostantól kizárja ezt a fájlt. Hogy a git a már követett
példányt is elfelejtse:

```bash
git rm --cached HOZZAFERESEK.md
git commit -m "Hozzaferesi jegyzet kivetele a verziokezelesbol"
```

---

## 1. Adatbázis (Supabase)

- **Dashboard**: https://supabase.com/dashboard/project/kcuqebzmloattlgzuhpg
- **Projekt referencia**: `kcuqebzmloattlgzuhpg`
- **Belépési e-mail**: `koszegfotok@gmail.com`
- **Jelszó**: jelszókezelőben — *ebbe a fájlba nem írjuk be*

### SQL szkriptek — ebben a sorrendben futtatva

| Fájl | Mit tesz |
|---|---|
| `supabase/01_schema.sql` | Táblák, jogosultsági függvények, RLS szabályok |
| `supabase/02_storage.sql` | Storage bucketek (`public-media`, `documents`, `dues-proofs`) |
| `supabase/03_admin.sql` | Rendszergazda és tisztségviselők szerepköre |

A korábbi `supabase/schema.sql` megszűnt — a fenti három fájl váltotta fel.

---

## 2. Verziókezelés és élesítés

- **Repository**: https://github.com/TheCinemaker/ktsze.git (branch: `main`)
- **Netlify**: `netlify.toml`, publish könyvtár `dist`, SPA átirányítással
- **Környezeti változók**: `.env.example` alapján, Netlify → Site settings →
  Environment variables

---

## 3. Belépés

**Nincsenek teszt fiókok és nincs demó nézetváltó.** A korábbi verzióban a
weboldalon lehetett szerepkört váltani jelszó nélkül — ez megszűnt.

Fiókokat a Supabase Dashboard → Authentication → Users felületén hozunk létre
(vagy a felhasználó regisztrál a nyilvános oldalon), a szerepkört pedig az
elnökségi felületen osztjuk ki.

Belépésnél a rendszergazda az `admin` rövid nevet is használhatja a teljes
e-mail cím helyett.

---

## 4. Jogosultsági szintek

| Szerepkör | Hozzáférés |
|---|---|
| `admin` | Minden, beleértve a szerepkör-kiosztást és a rendszerbeállításokat |
| `president` | Tagnyilvántartás, tagdíj, tartalom, szerepkörök (admin nélkül) |
| `vicepresident` | Hírek, munkacsoportok, dokumentumok — tagdíj nélkül |
| `board` | Elnökségi betekintés írás nélkül |
| `member` / `patron` | Saját adatlap, saját tagdíj, tagi dokumentumok |

A tisztségnév (`custom_title`, pl. „Digitális Kőszeg alelnök”) csak kiírt
megnevezés — **jogosultságot nem ad**, azt kizárólag a szerepkör.

---

## 5. Tartalomfeltöltés

Az oldal szándékosan üresen indul. A tartalom az elnökségi felületen kerül be:

- **Hírek és programok** → Hírek fül. Amíg nincs bepipálva a „Közzétéve”, csak
  belül látszik.
- **Munkacsoportok** → Munkacsoportok fül.
- **Dokumentumok** → Dokumentumok fül, hozzáférési szinttel (nyilvános / tagi /
  elnökségi).
- **Tagdíjtételek** → Tagdíjtételek fül. Amíg nincs bevitt tétel, a nyilvános
  Tagság oldalon nem jelenik meg összeg.
- **Egyesületi alapadatok** (székhely, e-mail, telefon, adószám, bankszámla) →
  `src/config/organization.js`. Ami üres, az nem jelenik meg a weboldalon.

---

## 6. Projektdokumentumok

- `PROJEKTNAPLO.md`
- `SZAMLAZASI_NAPLO.md`
