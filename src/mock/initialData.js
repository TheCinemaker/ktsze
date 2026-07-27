// Kőszegi Turisztikai Szövetség Egyesület - Initial Data 2026

export const INITIAL_WORKGROUPS = [
  {
    id: "wg-1",
    name: "Kőszeg virágzik",
    slug: "koszeg-viragzik",
    description: "Főtéri kaspók, beton virágládák és virágos sarkok örökbefogadása, gondozása a városi kertésszel együttműködésben.",
    leader_name: "Szalók Adrienn Alelnök",
    image_url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
    latest_updates: "Főtéri piros bódé lebontva! Megkezdődött a kaspók és virágládák összeírása a városi kertésszel.",
    is_active: true,
    members: [
      { name: "Szalók Adrienn", role: "Munkacsoport Vezető", phone: "+36 30 123 4567" },
      { name: "Farkas Péter", organization: "Ibrahim Boutique Hotel", phone: "+36 30 987 1122" },
      { name: "Vörös Róbert", organization: "Portré Étterem és Panzió", phone: "+36 94 360 444" }
    ]
  },
  {
    id: "wg-2",
    name: "Digitális Kőszegért",
    slug: "digitalis-koszegert",
    description: "Egyesületi webes felület, tagi portál, kétirányú Google Drive csatlakozó és digitális edukációs akciónapok.",
    leader_name: "Avar Szilveszter Alelnök (SA Software)",
    image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    latest_updates: "Elkészült az új KTSZE portál v1.0, a zárt tagi rendszer és a számlázási elszámolás modul.",
    is_active: true,
    members: [
      { name: "Avar Szilveszter", role: "Munkacsoport Vezető (SA Software)", phone: "+36 30 555 7788" },
      { name: "Drescher Gábor", role: "KTSZE Elnök", phone: "+36 94 563 001" }
    ]
  },
  {
    id: "wg-3",
    name: "Őszi Forgalomnövelés & B2B Nyílt Nap",
    slug: "oszi-forgalomnoveles",
    description: "Aktív & gasztronómiai programok, Kőszegi Esték zenés sorozat és szeptemberi B2B Nyílt Nap & Média Study Tour.",
    leader_name: "Szekér Zoltán, Farkas Péter & Vörös Róbert",
    image_url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
    latest_updates: "Szeptemberi B2B nyílt nap időpontjának egyeztetése a Jurisics Várban és a kőszegi attrakcióknál.",
    is_active: true,
    members: [
      { name: "Szekér Zoltán", role: "Turisztikai Menedzser", phone: "+36 94 360 111" },
      { name: "Vörös Róbert", organization: "Portré Étterem és Panzió", phone: "+36 94 360 444" },
      { name: "Farkas Péter", organization: "Ibrahim Boutique Hotel", phone: "+36 30 987 1122" }
    ]
  }
];

export const INITIAL_MEMBERS = [
  {
    id: "m-1",
    account_email: "elnok@koszegiturizmus.hu",
    private_email: "gabor.drescher@gmail.com",
    full_name: "Drescher Gábor",
    home_address: "9730 Kőszeg, Várkör 8.",
    phone: "+36 94 563 001",
    member_category: "Elnökségi tag",
    business_activity: "kulturális",
    service_location_name: "Kőszegi Turisztikai Szövetség Egyesület (Elnökség)",
    service_street: "Rajnis utca",
    service_house_number: "7.",
    service_contacts: "elnok@koszegiturizmus.hu | +36 94 563 001",
    workgroups: ["Kőszeg virágzik", "Digitális Kőszegért"],
    role: "admin",
    joined_date: "2010-04-12",
    dues_2026: { status: "paid", amount: 36000, paid_at: "2026-01-15" }
  },
  {
    id: "m-2",
    account_email: "szalok.adrienn@koszegiturizmus.hu",
    private_email: "adrienn.szalok@gmail.com",
    full_name: "Szalók Adrienn",
    home_address: "9730 Kőszeg, Chernel utca 12.",
    phone: "+36 30 123 4567",
    member_category: "Elnökségi tag",
    business_activity: "szolgáltató",
    service_location_name: "KTSZE Városszépítő Munkacsoport",
    service_street: "Várkör",
    service_house_number: "12.",
    service_contacts: "+36 30 123 4567",
    workgroups: ["Kőszeg virágzik"],
    role: "admin",
    joined_date: "2012-05-10",
    dues_2026: { status: "paid", amount: 36000, paid_at: "2026-01-20" }
  },
  {
    id: "m-3",
    email: "farkas.peter@ibrahimhotel.hu",
    account_email: "farkas.peter@ibrahimhotel.hu",
    private_email: "peter.farkas@ibrahim.hu",
    full_name: "Farkas Péter",
    home_address: "9730 Kőszeg, Fő tér 4.",
    phone: "+36 30 987 1122",
    member_category: "Elnökségi tag",
    business_activity: "szállásadó",
    service_location_name: "Ibrahim Boutique Hotel",
    service_street: "Fő tér",
    service_house_number: "4.",
    service_contacts: "info@ibrahimhotel.hu | +36 30 987 1122",
    workgroups: ["Kőszeg virágzik", "Őszi Forgalomnövelés & B2B Nyílt Nap"],
    role: "admin",
    joined_date: "2014-03-15",
    dues_2026: { status: "paid", amount: 36000, paid_at: "2026-01-18" }
  },
  {
    id: "m-4",
    account_email: "voros.robert@portreetterem.hu",
    private_email: "robert.voros@portre.hu",
    full_name: "Vörös Róbert",
    home_address: "9730 Kőszeg, Fő tér 7.",
    phone: "+36 94 360 444",
    member_category: "Elnökségi tag",
    business_activity: "vendéglős",
    service_location_name: "Portré Étterem és Panzió",
    service_street: "Fő tér",
    service_house_number: "7.",
    service_contacts: "info@portreetterem.hu | +36 94 360 444",
    workgroups: ["Kőszeg virágzik", "Őszi Forgalomnövelés & B2B Nyílt Nap"],
    role: "admin",
    joined_date: "2013-08-01",
    dues_2026: { status: "paid", amount: 36000, paid_at: "2026-01-22" }
  },
  {
    id: "m-5",
    account_email: "avar.szilveszter@sasoftware.hu",
    private_email: "szilveszter.avar@sasoftware.hu",
    full_name: "Avar Szilveszter",
    home_address: "9730 Kőszeg, Rajnis utca 7.",
    phone: "+36 30 555 7788",
    member_category: "Elnökségi tag",
    business_activity: "szolgáltató",
    service_location_name: "SA Software (Digitális Kőszegért)",
    service_street: "Rajnis utca",
    service_house_number: "7.",
    service_contacts: "info@sasoftware.hu | +36 30 555 7788",
    workgroups: ["Digitális Kőszegért"],
    role: "admin",
    joined_date: "2016-11-20",
    dues_2026: { status: "paid", amount: 36000, paid_at: "2026-01-10" }
  },
  {
    id: "m-6",
    account_email: "info@irottko.hu",
    private_email: "",
    full_name: "Molnár Katalin",
    home_address: "9730 Kőszeg, Temető utca 18.",
    phone: "+36 94 563 888",
    member_category: "Rendes tag",
    business_activity: "szállásadó",
    service_location_name: "Írottkő Panzió & Vendégház",
    service_street: "Temető utca",
    service_house_number: "18.",
    service_contacts: "info@irottko.hu | +36 94 563 888",
    workgroups: ["Kőszeg virágzik"],
    role: "member",
    joined_date: "2020-02-20",
    dues_2026: { status: "paid", amount: 24000, paid_at: "2026-01-28" }
  },
  {
    id: "m-7",
    account_email: "kovacs.janos@partolotag.hu",
    private_email: "janos.kovacs.private@gmail.com",
    full_name: "Kovács János",
    home_address: "9730 Kőszeg, Kossuth Lajos utca 15.",
    phone: "+36 30 444 3322",
    member_category: "Pártoló tag",
    business_activity: "egyéb",
    service_location_name: "Magánszemély Pártoló Tag",
    service_street: "Kossuth Lajos utca",
    service_house_number: "15.",
    service_contacts: "+36 30 444 3322",
    workgroups: ["Kőszeg virágzik"],
    role: "patron",
    joined_date: "2024-05-10",
    dues_2026: { status: "paid", amount: 15000, paid_at: "2026-02-05" }
  }
];

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

A megbeszélés során minden általunk bemutatott kezdeményezés támogatásra talált, és Polgármester Úr teljes körű együttműködéséről biztosította a Kőszegi Turisztikai Szövetség Egyesületet. Hosszas, konstruktív ötletelés után megkezdtük egy közös cselekvési terv kialakítását is.`,
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

Elsőként a „Kőszeg virágzik” munkacsoportot indítjuk el, mert ezt kértétek a legtöbben! Ebbe a csoportba várjuk mindazokat a vállalkozókat és lakosokat, akik kaspókat szeretnének örökbe fogadni, virágos sarkokat alakítanának ki, vagy más módon részt vennének Kőszeg szebbé tételében.`,
    date: "2026-07-26",
    published_at: "2026-07-26T10:00:00Z",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
    is_published: true
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
    description: "Kőszeg városszépítő, turisztikai és kommunikációs megújítási anyaga a Polgármesteri Hivatal részére (2026. július).",
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
    title: "Hatályos Alapszabály - Kőszegi Turisztikai Szövetség Egyesület",
    category: "Alapszabály",
    access_level: "public",
    file_size: "1.2 MB",
    uploaded_at: "2025-01-10",
    description: "Az Egyesület hivatalos hatályos Alapszabálya.",
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
  }
];
