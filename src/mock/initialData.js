// Kőszegi Turisztikai Szövetség Egyesület - Authentic Data 2026
// Complete Official Leadership & Board Structure

export const INITIAL_NEWS_PROJECTS = [
  {
    id: "np-1",
    title: "Sikeres Egyeztetés Kőszeg Polgármesterével: Elindul a Városszépítő & Turisztikai Cselekvési Terv",
    slug: "polgarmesteri-egyeztetes-es-cselekvési-terv",
    type: "hír",
    category: "Egyesület",
    summary: "Drescher Gábor elnök, Szalók Adrienn alelnök és az elnökség tárgyalt Básthy Béla polgármesterrel és Szekér Zoltán turisztikai menedzserrel. Teljes körű együttműködésről biztosította a város a KTSZE-t.",
    content: `Kedves Tagtársak!

Örömmel tájékoztatjuk egyesületünk tagságát, hogy sikeres és rendkívül előremutató egyeztetést folytattunk Kőszeg polgármesterével, Básthy Béla úrral.

A tárgyaláson a KTSZE képviseletében Szalók Adrienn alelnök asszony és Drescher Gábor elnök úr vett részt. Jelen volt továbbá Szekér Zoltán turisztikai menedzser, a Jurisics-vár Művelődési Központ és Várszínház igazgatója.

A megbeszélés során minden általunk bemutatott kezdeményezés támogatásra talált, és Polgármester Úr teljes körű együttműködéséről biztosította a Kőszegi Turisztikai Szövetség Egyesületet. Hosszas, konstruktív ötletelés után megkezdtük egy közös cselekvési terv kialakítását is.

Mindannyian egyetértettünk abban, hogy Kőszeg turisztikai fejlődéséhez közös kommunikációra, összehangolt fellépésre és a helyi vállalkozók aktív részvételére van szükség. Kőszeg marketingjét egy irányba kell vinnünk annak érdekében, hogy városunk ismét méltó helyére kerüljön a hazai és nemzetközi turisztikai térképen!`,
    date: "2026-07-27",
    published_at: "2026-07-27T08:00:00Z",
    image: "https://images.unsplash.com/photo-1548625361-185b376d8b37?auto=format&fit=crop&w=1200&q=80",
    is_published: true
  },
  {
    id: "np-2",
    title: "Elindul a „Kőszeg virágzik” Munkacsoport – Csatlakozz az Örökbefogadási Programhoz!",
    slug: "koszeg-viragzik-munkacsoport-indulasa",
    type: "projekt",
    category: "Turisztikai Fejlesztés",
    summary: "Elsőként a leginkább kért városszépítő munkacsoport indul el Szalók Adrienn alelnök vezetésével. Várjuk a kaspókat örökbe fogadó, virágos sarkokat gondozó vállalkozókat és lakosokat!",
    content: `Mottónk: „Kőszeg virágzik – a város tisztul, szépül, él és újra vendéget vár.”

Elsőként a „Kőszeg virágzik” munkacsoportot indítjuk el, mert ezt kértétek a legtöbben! Ebbe a csoportba várjuk mindazokat a vállalkozókat és lakosokat, akik kaspókat szeretnének örökbe fogadni, virágos sarkokat alakítanának ki, vagy más módon részt vennének Kőszeg szebbé tételében.

A munkacsoport vezetőjével a városi kertésszel egyeztetünk, hogy a tervezett virágosítás szakmailag, egységes koncepció alapján és a várossal teljes egyetértésben valósulhasson meg.

Már elérhető eredményeink:
• Főtéri piros árusító bódé sikeres eltávolítása (a Fő tér egységét csúfító felület lefedése).
• Országos Kéktúra kőszegi útvonalának tisztítása a természetjárók támogatására.
• Olmódi út aszfaltozásának előkészítése.`,
    date: "2026-07-26",
    published_at: "2026-07-26T10:00:00Z",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
    is_published: true
  },
  {
    id: "np-3",
    title: "Digitális Kőszeg Kezdeményezés & Őszi B2B Nyílt Nap",
    slug: "digitalis-koszeg-es-oszi-forgalomnoveles",
    type: "projekt",
    category: "Pályázat",
    summary: "Avar Szilveszter alelnök (SA Software) vezetésével elindul a Digitális Kőszeg felület és edukációs akciónap. Szekér Zoltán turisztikai menedzserrel előkészítjük a szeptemberi B2B Nyílt Napot.",
    content: `Elindul a „Digitális Kőszegért” kezdeményezés Avar Szilveszter alelnök (SA Software) szakmai vezetésével!

Főbb célkitűzések:
1. Egységes egyesületi digitális portál és zárt tagi rendszer működtetése.
2. Edukációs akciónapok szervezése: KTSZE tagok segítése az azonnali digitális beállításokban, felületek és keresőoptimális beállítások kezelésében.
3. Google Drive kétirányú felhőalapú dokumentumtár és közös állománycsere.

Szekér Zoltán turisztikai menedzserrel és az elnökséggel közösen készítjük elő a szeptemberi B2B Szakmai Nyílt Napot és Média Study Tour-t a Jurisics Vár és a kőszegi turisztikai attrakciók bemutatására.`,
    date: "2026-07-25",
    published_at: "2026-07-25T14:00:00Z",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
    is_published: true
  }
];

export const INITIAL_MEMBERS = [
  {
    id: "m-1",
    email: "elnok@koszegiturizmus.hu",
    full_name: "Drescher Gábor",
    organization_name: "KTSZE Elnökség",
    member_type: "Elnök",
    role: "admin",
    phone: "+36 94 563 001",
    address: "9730 Kőszeg, Rajnis utca 7.",
    joined_date: "2010-04-12",
    dues_2026: { status: "paid", amount: 36000, paid_at: "2026-01-15" }
  },
  {
    id: "m-2",
    email: "szalok.adrienn@koszegiturizmus.hu",
    full_name: "Szalók Adrienn",
    organization_name: "KTSZE Elnökség",
    member_type: "Alelnök",
    role: "admin",
    phone: "+36 30 123 4567",
    address: "9730 Kőszeg, Várkör 12.",
    joined_date: "2012-05-10",
    dues_2026: { status: "paid", amount: 36000, paid_at: "2026-01-20" }
  },
  {
    id: "m-3",
    email: "farkas.peter@ibrahimhotel.hu",
    full_name: "Farkas Péter",
    organization_name: "Ibrahim Boutique Hotel",
    member_type: "Alelnök",
    role: "admin",
    phone: "+36 30 987 1122",
    address: "9730 Kőszeg, Fő tér 4.",
    joined_date: "2014-03-15",
    dues_2026: { status: "paid", amount: 36000, paid_at: "2026-01-18" }
  },
  {
    id: "m-4",
    email: "voros.robert@portreetterem.hu",
    full_name: "Vörös Róbert",
    organization_name: "Portré Étterem & Panzió",
    member_type: "Alelnök",
    role: "admin",
    phone: "+36 94 360 444",
    address: "9730 Kőszeg, Fő tér 7.",
    joined_date: "2013-08-01",
    dues_2026: { status: "paid", amount: 36000, paid_at: "2026-01-22" }
  },
  {
    id: "m-5",
    email: "avar.szilveszter@sasoftware.hu",
    full_name: "Avar Szilveszter",
    organization_name: "SA Software (Digitális Kőszegért)",
    member_type: "Alelnök",
    role: "admin",
    phone: "+36 30 555 7788",
    address: "9730 Kőszeg, Rajnis utca 7.",
    joined_date: "2016-11-20",
    dues_2026: { status: "paid", amount: 36000, paid_at: "2026-01-10" }
  }
];

export const INITIAL_DOCUMENTS = [
  {
    id: "doc-1",
    title: "KTSZE Bővített Programfüzet 2026 – Polgármesteri Együttműködési Program",
    category: "Munkaterv",
    access_level: "public",
    file_size: "2.4 MB",
    uploaded_at: "2026-07-27",
    description: "Kőszeg városszépítő, turisztikai és kommunikációs megújítási anyaga a Polgármesteri Hivatal részére (Drescher Gábor Elnök, Szalók Adrienn, Farkas Péter, Vörös Róbert, Avar Szilveszter Alelnökök).",
    file_url: "#"
  },
  {
    id: "doc-2",
    title: "Digitális Kőszeg Stratégiai Munkaterv – Avar Szilveszter Alelnök",
    category: "Munkaterv",
    access_level: "public",
    file_size: "1.4 MB",
    uploaded_at: "2026-07-27",
    description: "Digitális jelenlét, oktatás, kétirányú Google Drive felhő integráció és KTSZE webes platform.",
    file_url: "#"
  },
  {
    id: "doc-3",
    title: "Szekér Zoltán Turisztikai Menedzser Összefoglalója & Akcióterve",
    category: "Munkaterv",
    access_level: "public",
    file_size: "1.1 MB",
    uploaded_at: "2026-07-27",
    description: "Őszi forgalomnövelő kampányok, B2B szakmai nyílt nap és digitális beállítások munkamenete.",
    file_url: "#"
  }
];

export const INITIAL_DRIVE_FOLDERS = [
  {
    id: "drive-1",
    name: "2026_Digitalis_Koszeg_Es_Rendszerbeallitasok",
    drive_id: "1A2B3C4D_Digitalis",
    web_link: "https://drive.google.com/drive/folders/demo_digitalis",
    files_count: 8,
    last_synced: "2026-07-27 09:25",
    files: [
      { name: "KTSZE_Weboldal_Es_Tagi_Portal_Forraskod.zip", size: "2.8 MB", modified: "2026-07-27" },
      { name: "Digitalis_Koszeg_Avar_Szilveszter_Munkaterv.pdf", size: "1.4 MB", modified: "2026-07-27" }
    ]
  },
  {
    id: "drive-2",
    name: "2026_Koszeg_Viragzik_Es_Varosszepites",
    drive_id: "5E6F7G8H_Viragzik",
    web_link: "https://drive.google.com/drive/folders/demo_viragzik",
    files_count: 12,
    last_synced: "2026-07-27 09:10",
    files: [
      { name: "Koszeg_Viragzik_Munkacsoport_Jelentkezesi_Ív.xlsx", size: "145 KB", modified: "2026-07-27" },
      { name: "Orokbefogadhato_Kaspok_Es_Viragladak_Listaja.pdf", size: "1.2 MB", modified: "2026-07-26" }
    ]
  },
  {
    id: "drive-3",
    name: "Elnokseg_Es_Polgarmesteri_Egyeztetes_2026",
    drive_id: "9I0J1K2L_Elnokseg",
    web_link: "https://drive.google.com/drive/folders/demo_elnokseg",
    files_count: 15,
    last_synced: "2026-07-27 08:30",
    files: [
      { name: "KTSZE_Bovitett_Programfuzet_2026_Julius_Vegleges.pdf", size: "2.4 MB", modified: "2026-07-27" },
      { name: "Elnoksegi_Ules_Jegyzokonyv_2026.pdf", size: "890 KB", modified: "2026-07-27" }
    ]
  }
];
