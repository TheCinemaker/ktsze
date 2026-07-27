// Kőszegi Turisztikai Szövetség Egyesület - Authentic Data 2026
// Based on President Drescher Gábor's announcement & 2026 July Program Book

export const INITIAL_NEWS_PROJECTS = [
  {
    id: "np-1",
    title: "Sikeres Egyeztetés Kőszeg Polgármesterével: Elindul a Városszépítő & Turisztikai Cselekvési Terv",
    slug: "polgarmesteri-egyeztetes-es-cselekvési-terv",
    type: "hír",
    category: "Egyesület",
    summary: "Drescher Gábor elnök és Szalók Adrienn tárgyalt Básthy Béla polgármesterrel és Szekér Zoltán turisztikai menedzserrel. Teljes körű együttműködésről biztosította a város a KTSZE-t.",
    content: `Kedves Tagtársak!

Örömmel tájékoztatjuk egyesületünk tagságát, hogy sikeres és rendkívül előremutató egyeztetést folytattunk Kőszeg polgármesterével, Básthy Béla úrral.

A tárgyaláson a KTSZE képviseletében Szalók Adrienn és Drescher Gábor elnök vett részt. Jelen volt továbbá Szekér Zoltán turisztikai menedzser, a Jurisics-vár Művelődési Központ és Várszínház igazgatója.

A megbeszélés során minden általunk bemutatott kezdeményezés támogatásra talált, és Polgármester Úr teljes körű együttműködéséről biztosította a Kőszegi Turisztikai Szövetség Egyesületet. Hosszas, konstruktív ötletelés után megkezdztük egy közös cselekvési terv kialakítását is.

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
    summary: "Elsőként a leginkább kért városszépítő munkacsoport indul el. Várjuk a kaspókat örökbe fogadó, virágos sarkokat gondozó vállalkozókat és lakosokat!",
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
    title: "Őszi Forgalomnövelő Kampány, Kőszegi Esték & B2B Szakmai Nyílt Nap",
    slug: "oszi-forgalomnovelo-kampanyok-es-b2b-nyilt-nap",
    type: "projekt",
    category: "Pályázat",
    summary: "Előkészítjük az őszi aktív & gasztronómiai programkínálatot, a Kőszegi Esték sorozatot és a szeptemberi szakmai B2B Study Tour-t.",
    content: `Következő lépések Szekér Zoltán turisztikai menedzser összefoglalója alapján:

1. Őszi forgalomnövelő kampányok és termékfejlesztések előkészítése:
• Aktív & gasztronómiai őszi programkínálat
• Kőszegi Esték sorozat (akusztikus koncertélmények, színházi együttműködések)
• Eszközök: kuponfüzet, digitális élménycsomagok, éttermek közvetlen bemutatása

2. Szakmai Nyílt Nap & Média Study Tour (Szeptember):
• A Jurisics Vár mellett további kőszegi attrakciókat bevonva bemutatjuk a KTSZE közreműködésével minden B2B partner részére a kínálatot.

3. Edukációs Akciónapok & Digitális beállítások:
• A KTSZE szervezésében segítünk a helyi szolgáltatóknak az azonnali digitális beállításokban és felületek kezelésében.`,
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
    organization_name: "Kőszegi Turisztikai Szövetség Egyesület (Elnökség)",
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
    organization_name: "KTSZE Elnökségi Munkacsoport",
    member_type: "Vezetőségi tag",
    role: "admin",
    phone: "+36 30 123 4567",
    address: "9730 Kőszeg, Várkör 12.",
    joined_date: "2012-05-10",
    dues_2026: { status: "paid", amount: 36000, paid_at: "2026-01-20" }
  },
  {
    id: "m-3",
    email: "info@jurisicsvarhotel.hu",
    full_name: "Nagy István",
    organization_name: "Jurisics Vár Hotel & Étterem",
    member_type: "Szálláshely & Vendéglátás",
    role: "member",
    phone: "+36 94 360 123",
    address: "9730 Kőszeg, Várkör 14.",
    joined_date: "2015-06-01",
    dues_2026: { status: "paid", amount: 36000, paid_at: "2026-02-10" }
  },
  {
    id: "m-4",
    email: "bor@koszegibormuhely.hu",
    full_name: "Horváth Gábor",
    organization_name: "Kőszegi Borműhely Kft.",
    member_type: "Borászat",
    role: "member",
    phone: "+36 30 987 6543",
    address: "9730 Kőszeg, Rómer Flóris utca 4.",
    joined_date: "2018-09-15",
    dues_2026: { status: "pending", amount: 24000, paid_at: null }
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
    title: "Szekér Zoltán Turisztikai Menedzser Összefoglalója & Akcióterve",
    category: "Munkaterv",
    access_level: "public",
    file_size: "1.1 MB",
    uploaded_at: "2026-07-27",
    description: "Őszi forgalomnövelő kampányok, B2B szakmai nyílt nap és digitális beállítások munkamenete.",
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
  },
  {
    id: "doc-4",
    title: "2026. évi Tagdíj megállapítási szabályzat & Munkacsoporti rend",
    category: "Szabályzatok",
    access_level: "members",
    file_size: "680 KB",
    uploaded_at: "2026-01-02",
    description: "A munkacsoportok működési rendje és a kategóriánkénti tagdíjtételek.",
    file_url: "#"
  }
];

export const INITIAL_DRIVE_FOLDERS = [
  {
    id: "drive-1",
    name: "2026_Koszeg_Viragzik_Es_Varosszepites",
    drive_id: "1A2B3C4D_Viragzik",
    web_link: "https://drive.google.com/drive/folders/demo_viragzik",
    files_count: 12,
    last_synced: "2026-07-27 09:10",
    files: [
      { name: "Koszeg_Viragzik_Munkacsoport_Jelentkezesi_Ív.xlsx", size: "145 KB", modified: "2026-07-27" },
      { name: "Orokbefogadhato_Kaspok_Es_Viragladak_Listaja.pdf", size: "1.2 MB", modified: "2026-07-26" },
      { name: "Foter_Bode_Eltavolitas_Elotte_Utana_Fotok.zip", size: "18.4 MB", modified: "2026-07-25" }
    ]
  },
  {
    id: "drive-2",
    name: "Polgarmesteri_Egyeztetes_Es_Bovitett_Programfuzet_2026",
    drive_id: "5E6F7G8H_Polgarmesteri",
    web_link: "https://drive.google.com/drive/folders/demo_polgarmesteri",
    files_count: 6,
    last_synced: "2026-07-27 08:30",
    files: [
      { name: "KTSZE_Bovitett_Programfuzet_2026_Julius_Vegleges.pdf", size: "2.4 MB", modified: "2026-07-27" },
      { name: "Szeker_Zoltan_Turisztikai_Menedzser_Osszefoglalos.docx", size: "450 KB", modified: "2026-07-27" }
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
