// Kőszegi Turisztikai Szövetség Egyesület - Initial Demo & Mock Dataset

export const INITIAL_NEWS_PROJECTS = [
  {
    id: "np-1",
    title: "Előkészületben a 2026–2030-as Kőszegi Turisztikai Stratégia",
    slug: "turisztikai-strategia-2026-2030",
    type: "projekt",
    category: "Turisztikai Fejlesztés",
    summary: "Egyesületünk megkezdte a következő 5 éves stratégiai munkaterv kidolgozását a helyi szolgáltatók bevonásával.",
    content: `A Kőszegi Turisztikai Szövetség Egyesület elnöksége kibővített ülést tartott, ahol kijelöltük a 2026-2030 közötti időszak fő fejlesztési irányait. 

A stratégia fókuszában a következők állnak:
• A történelmi belváros és a Jurisics Vár környékének fenntartható turisztikai pozícionálása.
• Az aktív és természetjáró turizmus (Írott-kő Natúrpark túraútvonalai, kerékpáros útvonalak) egyesületi szintű minőségbiztosítása.
• A kőszegi borvidék és gasztronómia szereplőinek egységes minőségi hálózattá szervezése.
• Közös digitális jelenlét és tagsági szolgáltatások bővítése.

A munkaterv véglegesítésében számítunk valamennyi egyesületi tagunk aktív javaslataira!`,
    date: "2026-07-20",
    published_at: "2026-07-20T10:00:00Z",
    image: "https://images.unsplash.com/photo-1548625361-185b376d8b37?auto=format&fit=crop&w=1200&q=80",
    is_published: true
  },
  {
    id: "np-2",
    title: "Meghívó a Kőszegi Turisztikai Szövetség Rendes Közgyűlésére",
    slug: "kozgyulesi-meghivo-2026",
    type: "hír",
    category: "Közgyűlés",
    summary: "Értesítjük kedves Tagjainkat, hogy az egyesület tavaszi rendes közgyűlését a Jurisics Vár Lovagtermében tartjuk.",
    content: `Tisztelt Egyesületi Tagok!

Ezúton meghívjuk Önöket a Kőszegi Turisztikai Szövetség Egyesület soron következő Rendes Közgyűlésére.

Helyszín: Jurisics Vár Lovagterme (9730 Kőszeg, Rajnis utca 9.)
Időpont: 2026. augusztus 18. (kedd) 14:00 óra

Napirendi pontok:
1. Elnöki beszámoló a 2025-ös pénzügyi évről és elvégzett munkáról.
2. A Pénzügyi Ellenőrző Bizottság jelentése.
3. 2026. évi költségvetés és munkaterv elfogadása.
4. Tagdíjstruktúra áttekintése és új tagsági jelentkezések elbírálása.
5. Egyebek.

Megjelenésükre és aktív részvételükre feltétlenül számítunk!`,
    date: "2026-07-15",
    published_at: "2026-07-15T14:30:00Z",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
    is_published: true
  },
  {
    id: "np-3",
    title: "Sikeres Pályázat: 4.5 M Ft Támogatás Helyi Értékeink Népszerűsítésére",
    slug: "nyertes-palyazat-2026",
    type: "pályázat",
    category: "Pályázat",
    summary: "Sikeresen szerepelt egyesületünk a megyei turizmusfejlesztési alap kiírásán.",
    content: `Örömmel tájékoztatjuk egyesületünk tagságát, hogy a "Kőszegi Történelmi és Természeti Örökség Minőségi Bemutatása" című pályázatunk pozitív elbírálásban részesült!

A megítélt 4,5 millió forintos támogatásból az alábbi fejlesztéseket valósítjuk meg:
• Nyomtatott egyesületi tájékoztató kiadványok és térképek megújítása.
• Helyi szolgáltatói táblarendszer korszerűsítése.
• Egyesületi tagjaink számára tartandó szakmai workshopok és továbbképzések szervezése.`,
    date: "2026-07-02",
    published_at: "2026-07-02T09:15:00Z",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    is_published: true
  }
];

export const INITIAL_MEMBERS = [
  {
    id: "m-1",
    email: "admin@koszegiturizmus.hu",
    full_name: "Kőszegi Turisztikai Szövetség Elnökség",
    organization_name: "Kőszegi Turisztikai Szövetség Egyesület",
    member_type: "Vezetőség",
    role: "admin",
    phone: "+36 94 563 001",
    address: "9730 Kőszeg, Rajnis utca 7.",
    joined_date: "2010-04-12",
    dues_2026: { status: "paid", amount: 36000, paid_at: "2026-01-15" }
  },
  {
    id: "m-2",
    email: "info@jurisicsvarhotel.hu",
    full_name: "Nagy István",
    organization_name: "Jurisics Vár Hotel & Étterem",
    member_type: "Szálláshely & Vendéglátás",
    role: "member",
    phone: "+36 94 360 123",
    address: "9730 Kőszeg, Várkör 12.",
    joined_date: "2015-06-01",
    dues_2026: { status: "paid", amount: 36000, paid_at: "2026-02-10" }
  },
  {
    id: "m-3",
    email: "bor@koszegibormuhely.hu",
    full_name: "Horváth Gábor",
    organization_name: "Kőszegi Borműhely Kft.",
    member_type: "Borászat",
    role: "member",
    phone: "+36 30 987 6543",
    address: "9730 Kőszeg, Rómer Flóris utca 4.",
    joined_date: "2018-09-15",
    dues_2026: { status: "pending", amount: 24000, paid_at: null }
  },
  {
    id: "m-4",
    email: "info@irottko.hu",
    full_name: "Molnár Katalin",
    organization_name: "Írottkő Panzió & Vendégház",
    member_type: "Szálláshely",
    role: "member",
    phone: "+36 94 563 888",
    address: "9730 Kőszeg, Temető utca 18.",
    joined_date: "2020-02-20",
    dues_2026: { status: "paid", amount: 24000, paid_at: "2026-01-28" }
  }
];

export const INITIAL_DOCUMENTS = [
  {
    id: "doc-1",
    title: "Alapszabály - Kőszegi Turisztikai Szövetség Egyesület",
    category: "Alapszabály",
    access_level: "public",
    file_size: "1.2 MB",
    uploaded_at: "2025-01-10",
    description: "Az Egyesület hatályos Alapszabálya a 2025. évi módosításokkal.",
    file_url: "#"
  },
  {
    id: "doc-2",
    title: "2025. évi Közgyűlési Jegyzőkönyv és Elnöki Beszámoló",
    category: "Közgyűlés",
    access_level: "members",
    file_size: "3.4 MB",
    uploaded_at: "2025-12-18",
    description: "A 2025. decemberi rendes közgyűlés hitelesített jegyzőkönyve és mellékletei.",
    file_url: "#"
  },
  {
    id: "doc-3",
    title: "Pénzügyi Ellenőrző Bizottság Jelentése (2025)",
    category: "Pénzügyek",
    access_level: "members",
    file_size: "890 KB",
    uploaded_at: "2026-01-05",
    description: "Hivatalos beszámoló a 2025-ös egyesületi gazdálkodásról és tagdíjbevételekről.",
    file_url: "#"
  },
  {
    id: "doc-4",
    title: "2026. évi Tagdíj megállapítási szabályzat",
    category: "Szabályzatok",
    access_level: "members",
    file_size: "540 KB",
    uploaded_at: "2026-01-02",
    description: "Kategóriánkénti tagdíjtételek (Szálláshelyek, Borászatok, Pártoló tagok).",
    file_url: "#"
  }
];

export const INITIAL_DRIVE_FOLDERS = [
  {
    id: "drive-1",
    name: "2026_Kozgyules_Es_Elenoksegi_Anyagok",
    drive_id: "1A2B3C4D_Kozgyules",
    web_link: "https://drive.google.com/drive/folders/demo_kozgyules",
    files_count: 8,
    last_synced: "2026-07-26 18:40",
    files: [
      { name: "2026_08_18_Kozgyulesi_Meghivo_Draft.docx", size: "245 KB", modified: "2026-07-25" },
      { name: "Penzugyi_Beszamolo_2025_Végleges.pdf", size: "1.8 MB", modified: "2026-07-20" },
      { name: "Tagdij_Befizetesek_2026_Q2.xlsx", size: "112 KB", modified: "2026-07-26" }
    ]
  },
  {
    id: "drive-2",
    name: "Palyazatok_Es_Fejlesztesi_Dokumentacio",
    drive_id: "5E6F7G8H_Palyazatok",
    web_link: "https://drive.google.com/drive/folders/demo_palyazat",
    files_count: 14,
    last_synced: "2026-07-27 08:15",
    files: [
      { name: "Megyei_Turizmus_Palyazat_Alairt.pdf", size: "4.2 MB", modified: "2026-07-02" },
      { name: "Koszeg_Strategia_2026_2030_Vázlat.docx", size: "890 KB", modified: "2026-07-22" }
    ]
  },
  {
    id: "drive-3",
    name: "Egyesuleti_Fototarak_Es_Logo_Pakett",
    drive_id: "9I0J1K2L_Fototar",
    web_link: "https://drive.google.com/drive/folders/demo_fototar",
    files_count: 32,
    last_synced: "2026-07-24 12:00",
    files: [
      { name: "KTSzE_Vektoros_Logo_Pakett_2026.zip", size: "12.4 MB", modified: "2026-06-15" },
      { name: "Jurisics_Var_Szakmai_Fotok_2026.zip", size: "45.0 MB", modified: "2026-07-01" }
    ]
  }
];
