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
    'szolgáltatók összefogása. Ez az oldal az egyesület hivatalos tájékoztató ' +
    'felülete, valamint a tagok és az elnökség zárt munkafelülete.',

  // --- Kapcsolat ---
  email: '',
  phone: '',

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
    bio: 'Az SA Software & Network Solutions alapítója és vezető fejlesztője. A Kőszegi Turisztikai Szövetség Egyesület alelnökeként a Digitális Kőszeg program szakmai vezetője, ahol az okosturisztikai szoftverrendszerek, a felhőalapú tagi platform és az egyesület informatikai infrastruktúrájának fejlesztését irányítja. Munkájának középpontjában az innovatív digitális megoldások, a vendégélmény-központú turizmus és a helyi vállalkozások technológiai fejlődésének támogatása áll.',
    motto: '„Ha valamit nem találsz a neten, azt nem is keresed igazán”',
    photoUrl: '/avar_szilveszter.jpg'
  },
  'elnok': {
    bio: 'A Kőszegi Turisztikai Szövetség Egyesület elnöke. A városi turisztikai összefogás, a helyi vállalkozói partnerségek, a turisztikai fejlesztési stratégiák és az egyesületi képviselet vezetője.',
    motto: null,
    photoUrl: null
  }
};

