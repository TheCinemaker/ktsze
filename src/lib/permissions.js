// =============================================================================
//  Jogosultsági modell
//
//  Ez a fájl a supabase/01_schema.sql RLS szabályainak a kliensoldali párja.
//  A kettőnek EGYÜTT kell változnia. A UI-elrejtés csak kényelem — az igazi
//  védelem az adatbázisban van, mert a kliens kód mindig megkerülhető.
// =============================================================================

export const ROLES = {
  ADMIN: 'admin',
  PRESIDENT: 'president',
  VICEPRESIDENT: 'vicepresident',
  BOARD: 'board',
  MEMBER: 'member',
  PATRON: 'patron'
};

export const ROLE_LABELS = {
  admin: 'Rendszergazda',
  president: 'Elnök',
  vicepresident: 'Alelnök',
  board: 'Elnökségi tag',
  member: 'Rendes tag',
  patron: 'Pártoló tag'
};

/** Rangsor — csak megjelenítési sorrendhez, nem jogosultsághoz. */
export const ROLE_ORDER = ['admin', 'president', 'vicepresident', 'board', 'member', 'patron'];

const STAFF = [ROLES.ADMIN, ROLES.PRESIDENT, ROLES.VICEPRESIDENT, ROLES.BOARD];
const MANAGERS = [ROLES.ADMIN, ROLES.PRESIDENT];
const EDITORS = [ROLES.ADMIN, ROLES.PRESIDENT, ROLES.VICEPRESIDENT];

/**
 * Mit szabad melyik szerepkörnek.
 * A kulcsok mellé írt megjegyzés mutatja, melyik SQL függvény a párja.
 */
const PERMISSIONS = {
  // Elnökségi felület egyáltalán megnyitható-e        -> is_board()
  'admin.access': STAFF,

  // Tagnyilvántartás                                  -> is_board() / can_manage_members()
  'members.view': STAFF,
  'members.edit': MANAGERS,
  'members.delete': [ROLES.ADMIN],

  // Szerepkör kiosztás                                -> can_manage_members()
  'roles.manage': MANAGERS,
  'roles.grantAdmin': [ROLES.ADMIN],

  // Tagdíj                                            -> is_board() / can_manage_members()
  'dues.view': STAFF,
  'dues.manage': MANAGERS,
  'duesRates.manage': MANAGERS,

  // Tartalom                                          -> can_manage_content()
  'news.manage': EDITORS,
  'workgroups.manage': EDITORS,
  'documents.manage': EDITORS,

  // Munkacsoport-jelentkezések elbírálása             -> can_decide_workgroup()
  //
  // FONTOS: az adatbázisban a csoport VEZETŐJE is elbírálhat, akkor is, ha
  // egyébként csak sima tag. Ezt a kliens nem tudja előre eldönteni (a
  // vezetőség csoportonként változik), ezért itt a szerkesztői kör szerepel,
  // és a tényleges engedélyt a can_decide_workgroup() adja meg soronként.
  'workgroups.decide': EDITORS,

  // Belső dokumentumok elnökségi szintje              -> is_board()
  'documents.viewBoard': STAFF,

  // Rendszerbeállítások, integrációk
  'settings.view': MANAGERS,
  'settings.manage': [ROLES.ADMIN]
};

/**
 * @param {string[]} roles  a belépett felhasználó szerepkörei
 * @param {string}   action pl. 'news.manage'
 */
export const can = (roles, action) => {
  if (!Array.isArray(roles) || roles.length === 0) return false;
  const allowed = PERMISSIONS[action];
  if (!allowed) {
    if (import.meta.env.DEV) {
      console.warn(`[permissions] Ismeretlen művelet: "${action}" — tiltva.`);
    }
    return false;
  }
  return roles.some((r) => allowed.includes(r));
};

/** A legmagasabb rangú szerepkör kiírható neve, pl. fejlécben. */
export const primaryRoleLabel = (roles) => {
  if (!Array.isArray(roles) || roles.length === 0) return null;
  const top = ROLE_ORDER.find((r) => roles.includes(r));
  return top ? ROLE_LABELS[top] : null;
};

/** Kiosztható szerepkörök listája — admin nélkül, ha nincs rá jog. */
export const assignableRoles = (actorRoles) =>
  ROLE_ORDER.filter((r) => (r === ROLES.ADMIN ? can(actorRoles, 'roles.grantAdmin') : true));
