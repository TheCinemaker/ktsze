# Hivatalos, aláírt PDF-ek

Ide kerülnek a bírósághoz benyújtott / aláírt-záradékolt **hivatalos**
dokumentumok eredeti PDF változatai. Ezeket a honlap statikusan szolgálja ki,
elérési útjuk: `/documents/hivatalos/<fájlnév>`.

## Fontos tudnivalók

- **Személyes adat**: a nyilvánosan letölthető PDF ne tartalmazzon anyja nevét,
  otthoni lakcímet és aláírásképet, ha nem feltétlenül szükséges. A teljes,
  bírósági példány NEM ide való, hanem zárt (tagi/elnökségi) feltöltésbe a
  Supabase Storage-ba, az elnökségi felület „Dokumentumok" füléről.
- **Jegyzőkönyvek NEM ide kerülnek.** A közgyűlési/elnökségi jegyzőkönyveket az
  elnökségi felület „Dokumentumok" füléről töltsd fel (szint: Tagoknak), a
  nyilvános kivonatot/határozatokat pedig a „Határozatok Tára" fülön rögzítsd.
  Ez a mappa kizárólag a két, mindenki számára nyilvános alapdokumentumé.

## Várt fájlnevek (ezekre van előkészítve a hivatkozás)

| Dokumentum | Javasolt fájlnév |
|---|---|
| Hivatalos alapszabály (aláírt) | `alapszabaly-ktsze-alairt.pdf` |
| Bővített programfüzet (2026) | `programfuzet-ktsze-2026.pdf` |

Ha más fájlnevet használsz, szólj, és átírom a hivatkozásokat
(`src/config/documentsData.js` → `downloadUrl`). A `.txt` változatok addig is
megmaradnak tartalékként, amíg a PDF-ek fel nem kerülnek.
