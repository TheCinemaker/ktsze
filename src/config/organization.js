// =============================================================================
//  Egyesületi alapadatok — EGYETLEN hely, ahol ezek szerepelnek.
//
//  FONTOS: minden mező szándékosan ÜRES. A felület az üres mezőket egyszerűen
//  nem jeleníti meg, tehát semmi kitalált adat nem kerül ki az oldalra.
//  Töltsd ki azt, ami hitelesen igazolható — és csak azt.
//
//  Korábban itt (illetve szétszórva a komponensekben) kitalált adatok voltak:
//  bankszámlaszám, "15+ éves szakmai múlt", "40+ tagvállalkozás", nevesített
//  önkormányzati együttműködés. Ezek mind el lettek távolítva.
// =============================================================================

export const ORGANIZATION = {
  legalName: 'Kőszegi Turisztikai Szövetség Egyesület',
  shortName: 'Kőszegi Turisztikai Szövetség',

  // --- Bemutatkozás ---
  // Ez a két szöveg szándékosan semleges: nem tartalmaz évszámot, taglétszámot,
  // partnernevet vagy bármilyen olyan állítást, amit ne lehetne igazolni.
  // Írd át a saját szavaidra, amikor van hozzá pontos tartalom.
  tagline: 'Kőszeg turisztikai szereplőinek szakmai szövetsége',
  mission:
    'Az egyesület a kőszegi szálláshelyek, vendéglátók, borászok és kulturális ' +
    'szolgáltatók szakmai összefogása. Elkötelezettek vagyunk Kőszeg egyedülálló ' +
    'történelmi és természeti örökségének megőrzése, a város turisztikai vonzerejének ' +
    'fenntartható fellendítése, valamint a minőségi látogatói élmények fejlesztése mellett.',

  // --- Kapcsolat ---
  email: 'avar.szilveszter@gmail.com',
  phone: '+36 70 636 4745',

  // --- Székhely ---
  addressPostalCode: '',
  addressCity: '',
  addressStreet: '',

  // --- Hivatalos azonosítók ---
  taxNumber: '',            // adószám
  registrationNumber: '',   // nyilvántartási szám
  courtRegistration: '',    // bejegyző bíróság

  // --- Pénzügy ---
  // Csak akkor írd be, ha ez tényleg az egyesület számlaszáma.
  bankName: '',
  bankAccount: '',

  // --- Online jelenlét ---
  websiteUrl: '',
  facebookUrl: '',
  instagramUrl: ''
};

/** Összeállított székhely, vagy null ha nincs elég adat. */
export const formattedAddress = () => {
  const { addressPostalCode, addressCity, addressStreet } = ORGANIZATION;
  const parts = [addressPostalCode, addressCity, addressStreet].map((p) => (p || '').trim()).filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : null;
};

/** Van-e egyáltalán bármilyen megjeleníthető kapcsolati adat? */
export const hasContactDetails = () =>
  Boolean(ORGANIZATION.email || ORGANIZATION.phone || formattedAddress());

/** Kitöltött közösségi linkek, megjelenítéshez. */
export const socialLinks = () =>
  [
    { label: 'Weboldal', url: ORGANIZATION.websiteUrl },
    { label: 'Facebook', url: ORGANIZATION.facebookUrl },
    { label: 'Instagram', url: ORGANIZATION.instagramUrl }
  ].filter((l) => Boolean(l.url));

/**
 * Elnökségi tagok nyilvános bemutatkozó szövegei és portréi.
 * Kulcs: e-mail cím vagy név részlet. Adatbázis módosítás nélkül, tetszőlegesen bővíthető.
 */
export const BOARD_MEMBERS_BIO = {
  'szilveszter': {
    bio: 'Kőszegen születtem és nőttem fel, a város iránti szeretetem és az informatika világa már fiatalon meghatározta az utamat: 1989-ben az általános iskolai számítógépes szakkörön ültem először gép előtt, és azóta sem engedtem el a technológia kezét. Eredetileg villanyszerelőként végeztem, így a hálózatépítés, a hardveres konfigurációk, a szervizelés és a rendszertelepítések mindig is a kisujjamban voltak. Szoftverfejlesztői tanulmányaimat 2003-ban fejeztem be egy kétéves, olasz hátterű informatikai képzés keretében. Korábban szoftverek honosításával és weboldalak készítésével foglalkoztam, de a technológiai fejlődés iránti szenvedélyem végül visszaterelt a nagyléptékű szoftverfejlesztéshez.\n\nAz SA Software életre hívását a visitkoszeg.hu alapozta meg, amely a cég első komoly fejlesztői mérföldköve lett. Mára az SA Software olyan egyedi, nagy sikerű vállalati webalkalmazások és portálok motorja, mint a kiemet.hu, valamint számos egyéb zárt céges rendszer.\n\nKőszegiként és egykori DJ-ként mindig is a közösségért és a pezsgésért dolgoztam — sosem szerettem, ha a városban állt az élet, a jó hangulat, a rendezvények és a mulatságok mindig közel álltak a szívemhez. A Kőszegi Turisztikai Szövetség Egyesület alelnökeként és a „Digitális Kőszegért” munkacsoport szakmai vezetőjeként elkötelezetten küzdök Kőszeg turizmusának teljes körű digitalizációjáért. Célom a helyi éttermek, szálláshelyek és turisztikai szereplők összekapcsolása modern digitális megoldásokkal. Zsebemben rengeteg új ötlettel, a legalulról megszerzett gyakorlati tudással, vezetői szemléletemmel, és a visitkoszeg.hu portál folyamatos, kifinomult fejlesztésével azon dolgozom, hogy Kőszeg ne csak történelmi múltjával, hanem jövőbe mutató okos turisztikai szolgáltatásaival is kiemelkedjen.',
    motto: '„Ha valamit nem találsz a neten, azt nem is keresed igazán”',
    photoUrl: '/avar_szilveszter.jpg',
    phone: '+36706364745',
    phoneFormatted: '+36 70 636 4745',
    email: 'avar.szilveszter@gmail.com'
  },
  'adrienn': {
    bio: 'Több mint két évtizede dolgozom a turizmus és a vendéglátás területén. Pályámat 2004-ben, tanulóként, a szakma legelső lépcsőfokáról kezdtem. Azóta végigjártam a szállodai működés különböző területeit: dolgoztam külföldön, részt vettem szállodák nyitásában, értékesítési rendszerek felépítésében, szolgáltatások fejlesztésében, csapatok irányításában és teljes szállodai működés vezetésében.\n\nEz a húsz év számomra nemcsak szakmai tapasztalatot jelent. Megtanított arra, hogy a vendégélmény minden apró részleten múlik, hogy egy turisztikai vállalkozás sikere nem választható el a település sikerétől, és hogy tartós eredményt csak együttműködéssel, következetes minőséggel és valódi vendégközpontú gondolkodással lehet elérni.\n\nNem Kőszegen születtem, de ma már a szívem kőszegiként dobban. Talán éppen ezért látom a várost egyszerre az ideérkező vendég szemével és az itt élő, itt dolgozó ember felelősségével. Látom az értékeit, a különleges hangulatát, ugyanakkor azokat a lehetőségeket is, amelyek még közös munkára várnak.\n\nA Kőszeg Turisztikai Szövetség Egyesület alapító tagjaként azért dolgozom, hogy Kőszeg ne csupán egy-egy rendezvény idején vagy néhány órás kirándulás célpontjaként legyen jelen a vendégek életében. Célom egy egész évben vonzó, többnapos tartózkodásra ösztönző úti cél építése, ahol a szálláshelyek, vendéglátók, üzletek, kulturális szereplők és szolgáltatók nem egymás mellett, hanem egymást erősítve működnek.\n\nHiszek abban, hogy a vendég nem különálló szolgáltatásokat lát, hanem egyetlen élményként találkozik Kőszeggel. Azért szeretnék tennen, hogy ez az élmény egységes, minőségi, emlékezetes és visszatérésre ösztönző legyen.\n\nKét évtized szakmai tapasztalatát, a legalulról megszerzett gyakorlati tudást és vezetői szemléletemet szeretném most Kőszeg turizmusának szolgálatába állítani.',
    motto: '„Hiszek Kőszegben. Nem azért, mert minden készen van, hanem mert minden lehetőség benne van.”',
    photoUrl: null,
    phone: '+36306775777',
    phoneFormatted: '+36 30 677 5777',
    email: 'szalok.adrienn@gmail.com'
  },
  'robert': {
    bio: 'A Portré Étterem és Panzió tulajdonos-vezetője. A Kőszegi Turisztikai Szövetség Egyesület alelnökeként a gasztronómiai és vendéglátóipari programok koordinációjáért felel, támogatva a helyi ízek, a vendéglátás és a borvidéki kultúra fejlődését.',
    motto: null,
    photoUrl: null,
    phone: null,
    phoneFormatted: null,
    email: 'voros.robert@portre.hu'
  },
  'peter': {
    bio: 'Az Ibrahim Boutique Hotel vezetője. A Kőszegi Turisztikai Szövetség Egyesület alelnökeként a minőségi szálláshely-szolgáltatások, a városi vendégfogadási standardok és a turisztikai marketing fejlesztéséért felel.',
    motto: null,
    photoUrl: null,
    phone: null,
    phoneFormatted: null,
    email: 'farkas.peter@ibrahim.hu'
  },
  'elnok': {
    bio: 'A Kőszegi Turisztikai Szövetség Egyesület elnöke. A városi turisztikai összefogás, a helyi vállalkozói partnerségek, a turisztikai fejlesztési stratégiák és az egyesületi képviselet vezetője.',
    motto: null,
    photoUrl: null
  }
};

