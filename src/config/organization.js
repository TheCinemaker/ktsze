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

  // --- Székhely (Hivatalos alapszabály szerint) ---
  addressPostalCode: '9730',
  addressCity: 'Kőszeg',
  addressStreet: 'Freh Alfonz utca 1.',

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
  'drescher': {
    bio: 'Kőszeg számomra nem csupán egy város, hanem közösség, otthon és közös felelősség. Hiszek abban, hogy Kőszeg különleges történelmi, természeti és kulturális értékei olyan lehetőséget jelentenek, amelyre együtt, helyi összefogással lehet sikeres és fenntartható turizmust építeni.\n\nVállalkozóként és szálláshely-üzemeltetőként naponta találkozom a városba érkező vendégekkel, az igényeikkel, benyomásaikkal és visszajelzéseikkel. Pénzügyi tanácsadói munkám során pedig sokéves tapasztalatot szereztem vállalkozások támogatásában, ügyintézésben, szervezésben és érdekképviseletben.\n\nA Kőszegi Turisztikai Szövetség Egyesület elnökeként az a célom, hogy összefogjuk a turizmusban, vendéglátásban, szálláshely-szolgáltatásban, kultúrában, kereskedelemben és rendezvényszervezésben dolgozó helyi szereplőket. Olyan együttműködő közösséget szeretnénk építeni, amely nemcsak beszél a lehetőségekről, hanem közösen dolgozik is azok megvalósításán.\n\nFontosnak tartom a város tisztaságát, virágosítását, a programkínálat bővítését, az aktív és kerékpáros turizmus fejlesztését, valamint új közösségi és gasztronómiai rendezvények létrehozását. Célunk, hogy Kőszeg ne csupán egy rövid kirándulás helyszíne legyen, hanem olyan úti cél, ahová a vendégek szívesen visszatérnek, és amelyet jó szívvel ajánlanak másoknak is.\n\nMeggyőződésem, hogy a város jövőjét nem egyetlen személy vagy szervezet alakítja. A Kőszegi Turisztikai Szövetség nyitott minden építő ötletre, kezdeményezésre és együttműködésre.',
    motto: '„Kőszeg számomra nem csupán egy város, hanem közösség, otthon és közös felelősség. Ha nincs közös szervezetünk, akkor nincs közös hangunk sem.”',
    photoUrl: null
  },
  'elnok': {
    bio: 'Kőszeg számomra nem csupán egy város, hanem közösség, otthon és közös felelősség. Hiszek abban, hogy Kőszeg különleges történelmi, természeti és kulturális értékei olyan lehetőséget jelentenek, amelyre együtt, helyi összefogással lehet sikeres és fenntartható turizmust építeni.\n\nVállalkozóként és szálláshely-üzemeltetőként naponta találkozom a városba érkező vendégekkel, az igényeikkel, benyomásaikkal és visszajelzéseikkel. Pénzügyi tanácsadói munkám során pedig sokéves tapasztalatot szereztem vállalkozások támogatásában, ügyintézésben, szervezésben és érdekképviseletben.\n\nA Kőszegi Turisztikai Szövetség Egyesület elnökeként az a célom, hogy összefogjuk a turizmusban, vendéglátásban, szálláshely-szolgáltatásban, kultúrában, kereskedelemben és rendezvényszervezésben dolgozó helyi szereplőket. Olyan együttműködő közösséget szeretnénk építeni, amely nemcsak beszél a lehetőségekről, hanem közösen dolgozik is azok megvalósításán.',
    motto: '„Ha nincs közös szervezetünk, akkor nincs közös hangunk sem.”',
    photoUrl: null
  }
};

/**
 * Tartalmi összefoglaló a média és a sajtó részére.
 */
export const PRESS_RELEASE = {
  title: 'Megalakul a Kőszegi Turisztikai Szövetség Egyesület',
  date: '2026. június 30.',
  location: 'Kőszeg',
  lead: 'A kőszegi turizmusban érdekelt vállalkozók, szállásadók, vendéglátók, szolgáltatók és helyi szereplők alakuló ülést tartanak a Kőszegi Turisztikai Szövetség Egyesület létrehozása érdekében. A találkozó az Írottkő Hotel kezdeményezésére jött létre, azzal a céllal, hogy a helyi turisztikai szereplők közös fórumot, érdekképviseletet és cselekvési keretet alakítsanak ki Kőszeg turisztikai helyzetének javítása érdekében.',
  quote: {
    text: 'Ha nincs közös szervezetünk, akkor nincs közös hangunk sem.',
    author: 'Drescher Gábor, elnök'
  },
  goals: [
    'A turisztikai vállalkozások érdekeinek szakmai képviselete',
    'Kőszeg jó hírének és turisztikai vonzerejének helyreállítása',
    'Közös marketing- és kommunikációs tevékenység kialakítása',
    'Kőszeg pozitív országos megjelenésének megerősítése',
    'Közös rendezvények, programok és turisztikai csomagajánlatok létrehozása',
    'Városszépítő és közösségi kezdeményezések támogatása',
    'Imázsfilmek, online tartalmak és kampányok készítése',
    'Együttműködés az önkormányzattal és civil szervezetekkel',
    'Pályázati és támogatási lehetőségek felkutatása',
    'Szezonon kívüli vendégforgalom élénkítése és a visszatérő vendégek számának növelése'
  ],
  expertAdvice: {
    name: 'Szekér Zoltán',
    title: 'Turisztikai és Városmarketing Szakember',
    honors: '3x Városmarketing Gyémánt Díj | Business Excellence Fődíjas',
    roles: 'Dunamente Tourist Nonprofit Kft. ügyvezetője, korábban Esztergomi Turisztikai Nonprofit Kft. ügyvezetője és Aktív- és Ökoturisztikai Fejlesztési Központ kommunikációs igazgatója',
    pillars: [
      {
        title: '1. Felmérés a helyi vállalkozók körében',
        desc: 'Közös felmérés segítségével a célközönség (Budapest, Győr, Bécs), őszi-téli programok és közvetlen vállalkozói igények meghatározása.'
      },
      {
        title: '2. Közös kommunikációs csatorna',
        desc: 'Koordinált turisztikai felületek (visitkoszeg.hu & ktsze.hu), ahol a belváros, a vár, rendezvények, éttermek és szállások biztonságos, magabiztos üzenetei jelennek meg.'
      },
      {
        title: '3. Mérhető turisztikai célok',
        desc: 'Szezonon kívüli rendezvények, garantált programok, Google-értékelések javítása, csomagajánlatok és sajtóbejárások szervezése.'
      }
    ]
  },
  assets: [
    'Történelmi belváros & műemléki környezet',
    'Jurisics-vár',
    'Természetközeliség & Írottkő túraútvonalak',
    'Borvidéki & gasztronómiai értékek',
    'Nyugodt, emberléptékű városi hangulat'
  ]
};

