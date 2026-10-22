// =============================================================================
//  Adatréteg — a Supabase az EGYETLEN igazságforrás.
//
//  Szabályok, amiket ez a fájl betart:
//    1. Minden hívás `await`-elt, és az `error` mezőt megvizsgáljuk (unwrap).
//    2. Hiba esetén beszédes Error-t dobunk — a hívó oldal toastban mutatja.
//       Nincs néma elnyelés, és nincs "sikeres mentés" üzenet sikertelen mentésre.
//    3. localStorage-ot NEM használunk. A böngésző csak megjelenít.
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import { supabase, unwrap, describeError, supabaseUrl, supabaseAnonKey } from './supabaseClient';

/** Ékezetes cím -> URL-barát slug. */
export const slugify = (text) =>
  (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'elem';

/** Ütközésmentes slug: ha foglalt, rövid utótagot kap. */
const uniqueSlug = async (table, base, ignoreId = null) => {
  let candidate = slugify(base);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    let query = supabase.from(table).select('id').eq('slug', candidate).limit(1);
    if (ignoreId) query = query.neq('id', ignoreId);
    const rows = unwrap(await query);
    if (!rows || rows.length === 0) return candidate;
    candidate = `${slugify(base)}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${slugify(base)}-${Date.now().toString(36)}`;
};

// -----------------------------------------------------------------------------
//  Profilok és szerepkörök
// -----------------------------------------------------------------------------

// A kapcsolatot KIFEJEZETTEN megnevezzük az idegen kulcs nevével.
// A sima `user_roles(role)` kétértelmű lenne, ha a user_roles táblának egynél
// több idegen kulcsa van a profiles-ra — a PostgREST ilyenkor PGRST201 hibát ad
// ("more than one relationship was found") és nem tölt be a profil.
const PROFILE_WITH_ROLES = '*, user_roles!user_roles_user_id_fkey(role)';

const PROFILE_FIELDS = [
  'full_name',
  'private_email',
  'phone',
  'home_address',
  'member_category',
  'business_activity',
  'service_location_name',
  'service_street',
  'service_house_number',
  'service_contacts',
  'custom_title',
  // Nyilvános elnökségi bemutatkozó mezők (21_board_members.sql).
  // A board_public/board_order SZÁNDÉKOSAN nincs itt: a tag ne tudja magát
  // felvenni a nyilvános elnökség oldalra — azt az elnökség/SQL állítja.
  'avatar_url',
  'bio',
  'motto',
  'public_email',
  'public_phone'
];

/** Csak a valóban létező oszlopokat engedjük át, üres stringből NULL lesz. */
const sanitizeProfile = (input, allowed = PROFILE_FIELDS) => {
  const out = {};
  allowed.forEach((key) => {
    if (!(key in input)) return;
    const value = input[key];
    out[key] = typeof value === 'string' ? value.trim() || null : (value ?? null);
  });
  return out;
};

/**
 * Igaz, ha a hiba a beágyazott kapcsolat feloldásáról szól.
 * PGRST200 = nincs ilyen kapcsolat, PGRST201 = több kapcsolat is illeszkedik.
 */
const isEmbedError = (error) =>
  error && (error.code === 'PGRST200' || error.code === 'PGRST201' || /relationship/i.test(error.message || ''));

/**
 * Saját profil a szerepkörökkel.
 *
 * Két úton is megpróbálja. A beágyazott kérés egy körben végez, de ha az
 * adatbázis-kapcsolat bármiért nem oldható fel, NEM bukik el a belépés —
 * ilyenkor két külön kéréssel szedjük össze ugyanazt.
 */
export const getProfile = async (userId) => {
  let embedded = await supabase.from('profiles').select(PROFILE_WITH_ROLES).eq('id', userId).maybeSingle();

  // Self-Healing: Ha a profil hiányzik vagy nincs hozzá rendelve semmilyen szerepkör a user_roles táblában, automatikusan pótoljuk a 'member' szerepkört!
  const hasRoles = Array.isArray(embedded?.data?.user_roles) && embedded.data.user_roles.length > 0;
  if ((!embedded.data || !hasRoles) && !embedded.error) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (user && user.id === userId) {
        await supabase.from('profiles').upsert({
          id: userId,
          account_email: user.email,
          full_name: user.user_metadata?.full_name || null,
          member_category: 'Rendes tag'
        });
        await supabase.from('user_roles').upsert(
          { user_id: userId, role: 'member' },
          { onConflict: 'user_id,role' }
        );
        embedded = await supabase.from('profiles').select(PROFILE_WITH_ROLES).eq('id', userId).maybeSingle();
      }
    } catch (healErr) {
      console.warn('[db] Automatikus profil/szerepkör pótlás hiba:', healErr);
    }
  }

  if (!embedded.error && embedded.data) return embedded.data;
  if (embedded.error && !isEmbedError(embedded.error)) throw new Error(describeError(embedded.error));

  const profile = unwrap(await supabase.from('profiles').select('*').eq('id', userId).maybeSingle());
  if (!profile) return null;

  const roles = unwrap(await supabase.from('user_roles').select('role').eq('user_id', userId)) || [];
  return { ...profile, user_roles: roles };
};

/** Teljes tagnyilvántartás a szerepkörökkel, ugyanezzel a tartalék úttal. */
export const listMembers = async () => {
  const embedded = await supabase
    .from('profiles')
    .select(PROFILE_WITH_ROLES)
    .order('full_name', { ascending: true, nullsFirst: false });

  if (!embedded.error) return embedded.data || [];
  if (!isEmbedError(embedded.error)) throw new Error(describeError(embedded.error));

  const profiles =
    unwrap(await supabase.from('profiles').select('*').order('full_name', { ascending: true, nullsFirst: false })) || [];
  const allRoles = unwrap(await supabase.from('user_roles').select('user_id, role')) || [];

  return profiles.map((p) => ({
    ...p,
    user_roles: allRoles.filter((r) => r.user_id === p.id).map((r) => ({ role: r.role }))
  }));
};

/** A tag a saját profilját szerkeszti. custom_title-t itt NEM engedünk. */
export const updateOwnProfile = async (userId, patch) => {
  const allowed = PROFILE_FIELDS.filter((f) => f !== 'custom_title');
  return unwrap(
    await supabase
      .from('profiles')
      .update(sanitizeProfile(patch, allowed))
      .eq('id', userId)
      .select(PROFILE_WITH_ROLES)
      .single()
  );
};

/** Elnökség szerkeszti bármelyik profilt, a tisztségnévvel együtt. */
export const updateMemberProfile = async (profileId, patch) =>
  unwrap(
    await supabase
      .from('profiles')
      .update(sanitizeProfile(patch))
      .eq('id', profileId)
      .select(PROFILE_WITH_ROLES)
      .single()
  );

export const deleteMemberProfile = async (profileId) => {
  unwrap(await supabase.from('profiles').delete().eq('id', profileId));
  return true;
};

/**
 * A nyilvános elnökségi oldal tartaléka — amíg a DB fel nem töltődik.
 *
 * SZÁNDÉKOSAN PII-mentes: csak név, tisztség, vállalt bemutatkozás és portré.
 * E-mail/telefon csak ott, ahol az érintett nyilvánosan vállalta. A korábbi,
 * kitalált céges e-mailek (…@ibrahim.hu, …@portre.hu) kikerültek.
 */
const BOARD_FALLBACK = [
  {
    id: 'fallback-drescher',
    full_name: 'Drescher Gábor',
    custom_title: 'Elnök',
    service_location_name: 'Kőszegi Turisztikai Szövetség Egyesület',
    business_activity: 'Turisztikai Képviselet & Vezetés',
    avatar_url: '/drescher_gabor.jpg',
    motto: '„Ha nincs közös szervezetünk, akkor nincs közös hangunk sem.”',
    bio: 'Kőszeg számomra nem csupán egy város, hanem közösség, otthon és közös felelősség. A Kőszegi Turisztikai Szövetség Egyesület elnökeként célom összefogni a turizmusban, vendéglátásban, szálláshely-szolgáltatásban, kultúrában és rendezvényszervezésben dolgozó helyi szereplőket.',
    public_email: 'g.drescher@ktsze.hu',
    public_phone: null
  },
  {
    id: 'fallback-avar',
    full_name: 'Avar Szilveszter',
    custom_title: 'Digitális Kőszeg alelnök',
    service_location_name: 'SA Software & Network Solutions',
    business_activity: 'Informatikai és Turisztikai Szoftverfejlesztés',
    avatar_url: '/avar_szilveszter.jpg',
    motto: '„Ha valamit nem találsz a neten, azt nem is keresed igazán”',
    bio: 'Kőszegen születtem és nőttem fel. A „Digitális Kőszegért” munkacsoport szakmai vezetőjeként Kőszeg turizmusának teljes körű digitalizációjáért dolgozom: a helyi éttermek, szálláshelyek és turisztikai szereplők összekapcsolásáért modern megoldásokkal.',
    public_email: 's.avar@ktsze.hu',
    public_phone: '+36 70 636 4745'
  },
  {
    id: 'fallback-farkas',
    full_name: 'Farkas Péter',
    custom_title: 'Alelnök',
    service_location_name: 'Ibrahim Boutique Hotel',
    business_activity: 'Szálláshely-szolgáltatás',
    avatar_url: null,
    motto: null,
    bio: 'Az Ibrahim Boutique Hotel vezetője. Alelnökként a minőségi szálláshely-szolgáltatások, a városi vendégfogadási standardok és a turisztikai marketing fejlesztéséért felel.',
    public_email: 'p.farkas@ktsze.hu',
    public_phone: null
  },
  {
    id: 'fallback-kovacs-szalok',
    full_name: 'Kovács-Szalók Adrienn',
    custom_title: 'Alelnök',
    service_location_name: 'Turisztikai Munkacsoport',
    business_activity: 'Szállodaüzemeltetés & Vendégélmény',
    avatar_url: null,
    motto: '„Hiszek Kőszegben. Nem azért, mert minden készen van, hanem mert minden lehetőség benne van.”',
    bio: 'Több mint két évtizede dolgozom a turizmus és a vendéglátás területén. Alapító tagként azért dolgozom, hogy Kőszeg egész évben vonzó, többnapos tartózkodásra ösztönző úti cél legyen.',
    public_email: 'a.szalok@ktsze.hu',
    public_phone: '+36 30 677 5777'
  },
  {
    id: 'fallback-voros',
    full_name: 'Vörös Róbert',
    custom_title: 'Alelnök',
    service_location_name: 'Portré Étterem és Panzió',
    business_activity: 'Gasztronómia & Szálláshely',
    avatar_url: null,
    motto: null,
    bio: 'A Portré Étterem és Panzió tulajdonos-vezetője. Alelnökként a gasztronómiai és vendéglátóipari programok koordinációjáért felel.',
    public_email: 'r.voros@ktsze.hu',
    public_phone: null
  }
];

/**
 * Nyilvános elnökségi tagok.
 *
 * Elsődleges forrás a DB: a public_board_members() SECURITY DEFINER RPC
 * (board_public=true profilok, lásd supabase/21_board_members.sql). A DB adatai
 * az elsődlegesek; a PII-mentes BOARD_FALLBACK-ból CSAK azokat fűzzük hozzá,
 * akik a DB-ben (még) nincsenek — így egyetlen elnökségi tag sem marad le, amíg
 * nincs mindenkinek board_public=true profilja (pl. akinek még nincs fiókja).
 * Amint egy tag bekerül a DB-be, az ő DB-adata lép a tartalék helyére.
 */
export const listPublicBoardMembers = async () => {
  let dbRows = [];
  try {
    const rows = unwrap(await supabase.rpc('public_board_members'));
    if (Array.isArray(rows)) dbRows = rows;
  } catch (err) {
    console.warn('[db] public_board_members RPC nem elérhető, tartalékra váltás:', err);
  }

  const key = (n) => (n || '').toLowerCase();
  const alreadyInDb = (fb) =>
    dbRows.some((r) =>
      key(fb.full_name)
        .split(' ')
        .some((part) => part.length > 3 && key(r.full_name).includes(part))
    );

  const merged = [...dbRows];
  BOARD_FALLBACK.forEach((fb, i) => {
    if (!alreadyInDb(fb)) merged.push({ ...fb, board_order: fb.board_order ?? i + 1 });
  });

  // Elnök elöl (board_order 1), utána a sorrend szerint, végül név szerint.
  return merged.sort((a, b) => {
    const ao = a.board_order ?? 99;
    const bo = b.board_order ?? 99;
    if (ao !== bo) return ao - bo;
    return (a.full_name || '').localeCompare(b.full_name || '', 'hu');
  });
};

/**
 * A tag szerepköreinek beállítása.
 *
 * EGYETLEN adatbázis-függvénnyel megy, NEM törlés + beszúrás párossal.
 *
 * Miért: a korábbi megoldás először törölte az összes szerepkört, majd
 * beszúrta az újakat. Ha valaki saját magát szerkesztette, a törlés elvette a
 * saját admin jogát, és az azt követő beszúrást az RLS már elutasította —
 * a felhasználó pedig szerepkör nélkül maradt. A set_user_roles() a hívó
 * jogosultságát a módosítás ELŐTT ellenőrzi, egy tranzakcióban dolgozik, és
 * nem engedi, hogy az utolsó rendszergazda megfossza magát a jogától.
 */
export const setMemberRoles = async (userId, roles) => {
  const wanted = [...new Set(roles)].filter(Boolean);
  return unwrap(
    await supabase.rpc('set_user_roles', { target_user: userId, new_roles: wanted })
  );
};

// -----------------------------------------------------------------------------
//  Munkacsoportok
// -----------------------------------------------------------------------------

export const listWorkgroups = async () =>
  unwrap(
    await supabase
      .from('workgroups')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
  ) || [];

export const createWorkgroup = async (input) => {
  const slug = await uniqueSlug('workgroups', input.name);
  return unwrap(
    await supabase
      .from('workgroups')
      .insert({
        name: input.name.trim(),
        slug,
        description: input.description?.trim() || null,
        leader_name: input.leader_name?.trim() || null,
        leader_user_id: input.leader_user_id || null,
        latest_updates: input.latest_updates?.trim() || null,
        is_active: input.is_active ?? true,
        sort_order: input.sort_order ?? 0,
        target_amount: input.target_amount ? Number(input.target_amount) : 250000,
        campaign_goal: input.campaign_goal?.trim() || null,
        enable_crowdfunding: Boolean(input.enable_crowdfunding)
      })
      .select()
      .single()
  );
};

export const updateWorkgroup = async (id, patch) => {
  const payload = {
    description: patch.description?.trim() || null,
    leader_name: patch.leader_name?.trim() || null,
    leader_user_id: patch.leader_user_id || null,
    latest_updates: patch.latest_updates?.trim() || null,
    target_amount: patch.target_amount ? Number(patch.target_amount) : 250000,
    campaign_goal: patch.campaign_goal?.trim() || null,
    enable_crowdfunding: Boolean(patch.enable_crowdfunding)
  };
  if (patch.name) {
    payload.name = patch.name.trim();
    payload.slug = await uniqueSlug('workgroups', patch.name, id);
  }
  if ('is_active' in patch) payload.is_active = patch.is_active;
  if ('sort_order' in patch) payload.sort_order = patch.sort_order;

  // Az azonosító alapján frissítünk, NEM a slug alapján: átnevezéskor a slug is
  // változik, így a slug-alapú frissítés némán nulla sort érintene.
  return unwrap(await supabase.from('workgroups').update(payload).eq('id', id).select().single());
};

export const deleteWorkgroup = async (id) => {
  unwrap(await supabase.from('workgroups').delete().eq('id', id));
  return true;
};

export const getWorkgroupBySlug = async (slug) =>
  unwrap(await supabase.from('workgroups').select('*').eq('slug', slug).maybeSingle());

// -----------------------------------------------------------------------------
//  Munkacsoport-tagság
//
//  A jelentkezés jóváhagyásos: a felhasználó csak 'pending' állapotú sort tud
//  létrehozni magának (ezt az RLS is kikényszeríti), a jóváhagyás a csoport
//  vezetőjének vagy az elnökségnek a dolga.
// -----------------------------------------------------------------------------

/**
 * Nyilvános taglétszámok. Nevet NEM ad vissza — az személyes adat.
 * @returns {Promise<Record<string, {approved: number, pending: number}>>}
 */
export const getWorkgroupStats = async () => {
  const rows = unwrap(await supabase.rpc('workgroup_stats')) || [];
  return rows.reduce((acc, row) => {
    acc[row.workgroup_id] = {
      approved: Number(row.approved_count) || 0,
      pending: Number(row.pending_count) || 0
    };
    return acc;
  }, {});
};

/** A belépett felhasználó saját csoporttagságai és jelentkezései. */
export const listMyWorkgroupMemberships = async (profileId) =>
  unwrap(
    await supabase
      .from('workgroup_members')
      .select('*, workgroups(id, name, slug, description, leader_name)')
      .eq('profile_id', profileId)
      .order('requested_at', { ascending: false })
  ) || [];

/** Jelentkezés egy munkacsoportba. */
export const requestJoinWorkgroup = async (workgroupId, profileId, message = '') =>
  unwrap(
    await supabase
      .from('workgroup_members')
      .insert({
        workgroup_id: workgroupId,
        profile_id: profileId,
        status: 'pending',
        message: message?.trim() || null
      })
      .select()
      .single()
  );

/** Jelentkezés visszavonása vagy kilépés a csoportból. */
export const leaveWorkgroup = async (membershipId) => {
  unwrap(await supabase.from('workgroup_members').delete().eq('id', membershipId));
  return true;
};

/**
 * Minden jelentkezés és tagság — elnökségi nézet.
 * A profil adatait is hozza, hogy a listában név szerint lehessen látni.
 */
export const listAllWorkgroupMemberships = async () =>
  unwrap(
    await supabase
      .from('workgroup_members')
      .select(
        '*, workgroups(id, name, slug), profiles(id, full_name, account_email, phone, service_location_name)'
      )
      .order('requested_at', { ascending: false })
  ) || [];

/** Jóváhagyás vagy elutasítás. A döntés időpontját trigger írja be. */
export const decideWorkgroupMembership = async (membershipId, status, note = '') =>
  unwrap(
    await supabase
      .from('workgroup_members')
      .update({ status, decision_note: note?.trim() || null })
      .eq('id', membershipId)
      .select()
      .single()
  );

/** Elnökségi felvitel: a tagot közvetlenül beteszi a csoportba. */
export const addWorkgroupMemberDirectly = async (workgroupId, profileId) =>
  unwrap(
    await supabase
      .from('workgroup_members')
      .upsert(
        { workgroup_id: workgroupId, profile_id: profileId, status: 'approved' },
        { onConflict: 'workgroup_id,profile_id' }
      )
      .select()
      .single()
  );

export const listApprovedWorkgroupMembers = async (workgroupId) =>
  unwrap(
    await supabase
      .from('workgroup_members')
      .select('id, requested_at, profiles(id, full_name, account_email, private_email, phone, service_location_name, business_activity)')
      .eq('workgroup_id', workgroupId)
      .eq('status', 'approved')
  ) || [];

// -----------------------------------------------------------------------------
//  Hírek és projektek
// -----------------------------------------------------------------------------

export const listPublishedNews = async () =>
  unwrap(
    await supabase
      .from('news')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false, nullsFirst: false })
  ) || [];

export const listAllNews = async () =>
  unwrap(
    await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
  ) || [];

export const createNews = async (input, authorId = null) => {
  const slug = await uniqueSlug('news', input.title);
  const published = input.is_published ?? false;
  return unwrap(
    await supabase
      .from('news')
      .insert({
        title: input.title.trim(),
        slug,
        category: input.category?.trim() || null,
        excerpt: input.excerpt?.trim() || null,
        body: input.body?.trim() || null,
        cover_path: input.cover_path || null,
        is_published: published,
        published_at: published ? new Date().toISOString() : null,
        author_id: authorId
      })
      .select()
      .single()
  );
};

export const updateNews = async (id, patch) => {
  const payload = {
    category: patch.category?.trim() || null,
    excerpt: patch.excerpt?.trim() || null,
    body: patch.body?.trim() || null
  };
  if (patch.title) {
    payload.title = patch.title.trim();
    payload.slug = await uniqueSlug('news', patch.title, id);
  }
  if ('cover_path' in patch) payload.cover_path = patch.cover_path || null;
  if ('is_published' in patch) {
    payload.is_published = patch.is_published;
    payload.published_at = patch.is_published ? patch.published_at || new Date().toISOString() : null;
  }
  return unwrap(await supabase.from('news').update(payload).eq('id', id).select().single());
};

export const deleteNews = async (id) => {
  unwrap(await supabase.from('news').delete().eq('id', id));
  return true;
};

// -----------------------------------------------------------------------------
//  Dokumentumok
//
//  A fájl a Storage 'documents' bucketjében van. A publikus letöltés is aláírt
//  URL-lel megy, hogy a bucket zárt maradhasson.
// -----------------------------------------------------------------------------

export const listDocuments = async (accessLevels = null) => {
  let query = supabase.from('documents').select('*').order('created_at', { ascending: false });
  if (accessLevels) query = query.in('access_level', accessLevels);
  return unwrap(await query) || [];
};

/** Fájl feltöltése + a dokumentum rekord létrehozása egy lépésben. */
export const createDocument = async (input, file, uploadedBy = null) => {
  const slug = await uniqueSlug('documents', input.title);
  const accessLevel = input.access_level || 'members';
  let storagePath = null;

  if (file) {
    const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'dat';
    const year = new Date().getFullYear();
    // A nyilvános fájl a public/ prefixre kerül — így kijelentkezve is letölthető
    // (lásd supabase/20_documents_and_resolutions.sql storage szabály).
    storagePath =
      accessLevel === 'public' ? `public/${year}/${slug}.${extension}` : `${year}/${slug}.${extension}`;
    const { error } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, { upsert: true, contentType: file.type || undefined });
    if (error) throw new Error(`A fájl feltöltése nem sikerült: ${error.message}`);
  }

  try {
    return unwrap(
      await supabase
        .from('documents')
        .insert({
          title: input.title.trim(),
          slug,
          category: input.category?.trim() || null,
          description: input.description?.trim() || null,
          access_level: accessLevel,
          storage_path: storagePath,
          file_size: file?.size ?? null,
          file_type: file?.type || null,
          // Hivatalos metaadatok (20_documents_and_resolutions.sql):
          document_date: input.document_date || null,
          reference_no: input.reference_no?.trim() || null,
          body_type: input.body_type || null,
          is_official: Boolean(input.is_official),
          uploaded_by: uploadedBy
        })
        .select()
        .single()
    );
  } catch (err) {
    // Ne maradjon árva fájl a Storage-ban, ha a rekord mentése elhasalt.
    if (storagePath) await supabase.storage.from('documents').remove([storagePath]);
    throw err;
  }
};

/**
 * Meglévő dokumentum módosítása.
 *
 *  - Metaadatok mindig frissülnek.
 *  - Ha `newFile` érkezik, feltölti és lecseréli a régit (a slug stabil marad,
 *    így az útvonal kiszámítható; a régi fájlt töröljük, ha más az útvonala).
 *  - Ha nincs új fájl, de az access szint váltása miatt a `public/` prefix már
 *    nem stimmel, a meglévő fájlt áthelyezzük a helyes útvonalra — különben egy
 *    nyilvánossá tett dokumentum fájlját kijelentkezve nem lehetne letölteni.
 */
export const updateDocument = async (doc, patch, newFile = null) => {
  const accessLevel = patch.access_level || doc.access_level || 'members';
  const slug = doc.slug;
  let storagePath = doc.storage_path;

  if (newFile) {
    const extension = newFile.name.includes('.') ? newFile.name.split('.').pop().toLowerCase() : 'dat';
    const year = (patch.document_date ? new Date(patch.document_date) : new Date()).getFullYear();
    const newPath =
      accessLevel === 'public' ? `public/${year}/${slug}.${extension}` : `${year}/${slug}.${extension}`;

    const { error } = await supabase.storage
      .from('documents')
      .upload(newPath, newFile, { upsert: true, contentType: newFile.type || undefined });
    if (error) throw new Error(`A fájl feltöltése nem sikerült: ${error.message}`);

    if (storagePath && storagePath !== newPath) {
      await supabase.storage.from('documents').remove([storagePath]);
    }
    storagePath = newPath;
  } else if (storagePath) {
    const isPublicPath = storagePath.startsWith('public/');
    const shouldBePublic = accessLevel === 'public';
    if (isPublicPath !== shouldBePublic) {
      const movedPath = shouldBePublic ? `public/${storagePath}` : storagePath.replace(/^public\//, '');
      const { error } = await supabase.storage.from('documents').move(storagePath, movedPath);
      // Ha a mozgatás nem sikerül, nem blokkoljuk a mentést — a metaadat frissül.
      if (!error) storagePath = movedPath;
    }
  }

  return unwrap(
    await supabase
      .from('documents')
      .update({
        title: patch.title?.trim() || doc.title,
        category: patch.category?.trim() || null,
        description: patch.description?.trim() || null,
        access_level: accessLevel,
        document_date: patch.document_date || null,
        reference_no: patch.reference_no?.trim() || null,
        body_type: patch.body_type || null,
        is_official: Boolean(patch.is_official),
        storage_path: storagePath,
        file_size: newFile ? newFile.size : doc.file_size,
        file_type: newFile ? newFile.type || null : doc.file_type
      })
      .eq('id', doc.id)
      .select()
      .single()
  );
};

export const deleteDocument = async (doc) => {
  if (doc.storage_path) {
    await supabase.storage.from('documents').remove([doc.storage_path]);
  }
  unwrap(await supabase.from('documents').delete().eq('id', doc.id));
  return true;
};

/** Időlimitált letöltési link. `null`, ha nincs feltöltött fájl. */
export const getDocumentUrl = async (doc) => {
  if (doc.drive_url) return doc.drive_url;
  if (!doc.storage_path) return null;
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(doc.storage_path, 300);
  if (error) throw new Error(`A letöltési link készítése nem sikerült: ${error.message}`);
  return data.signedUrl;
};

// -----------------------------------------------------------------------------
//  Határozatok tára (alapszabály XIV.)
//
//  Séma: supabase/20_documents_and_resolutions.sql
//  A nyilvános lista csak a publikált (is_published) sorokat hozza — ezt az RLS
//  is kikényszeríti, de a nyilvános oldalon kifejezetten szűrünk is rá.
// -----------------------------------------------------------------------------

/** Határozatok listája. publishedOnly=true esetén csak a nyilvánosak. */
export const listResolutions = async (publishedOnly = false) => {
  let query = supabase
    .from('resolutions')
    .select('*')
    .order('decision_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (publishedOnly) query = query.eq('is_published', true);
  return unwrap(await query) || [];
};

const RESOLUTION_FIELDS = (input) => ({
  resolution_no: input.resolution_no?.trim(),
  body_type: input.body_type || 'elnokseg',
  decision_date: input.decision_date || null,
  subject: input.subject?.trim(),
  decision_text: input.decision_text?.trim() || null,
  effect: input.effect?.trim() || null,
  votes_for: input.votes_for === '' || input.votes_for == null ? null : Number(input.votes_for),
  votes_against:
    input.votes_against === '' || input.votes_against == null ? null : Number(input.votes_against),
  votes_abstain:
    input.votes_abstain === '' || input.votes_abstain == null ? null : Number(input.votes_abstain),
  is_published: input.is_published ?? true,
  document_id: input.document_id || null
});

export const createResolution = async (input, createdBy = null) => {
  const payload = RESOLUTION_FIELDS(input);
  if (!payload.resolution_no) throw new Error('A határozatszám megadása kötelező.');
  if (!payload.decision_date) throw new Error('A határozat dátumának megadása kötelező.');
  if (!payload.subject) throw new Error('A határozat tárgyának megadása kötelező.');
  return unwrap(
    await supabase
      .from('resolutions')
      .insert({ ...payload, created_by: createdBy })
      .select()
      .single()
  );
};

export const updateResolution = async (id, input) =>
  unwrap(await supabase.from('resolutions').update(RESOLUTION_FIELDS(input)).eq('id', id).select().single());

export const deleteResolution = async (id) => {
  unwrap(await supabase.from('resolutions').delete().eq('id', id));
  return true;
};

// -----------------------------------------------------------------------------
//  Tagdíjak
// -----------------------------------------------------------------------------

export const listDuesRates = async (year = null) => {
  let query = supabase
    .from('dues_rates')
    .select('*')
    .order('year', { ascending: false })
    .order('sort_order', { ascending: true });
  if (year) query = query.eq('year', year);
  return unwrap(await query) || [];
};

export const createDuesRate = async (input) =>
  unwrap(
    await supabase
      .from('dues_rates')
      .insert({
        year: Number(input.year),
        label: input.label.trim(),
        amount_huf: Number(input.amount_huf),
        note: input.note?.trim() || null,
        sort_order: input.sort_order ?? 0
      })
      .select()
      .single()
  );

export const deleteDuesRate = async (id) => {
  unwrap(await supabase.from('dues_rates').delete().eq('id', id));
  return true;
};

export const listDues = async (year = null) => {
  let query = supabase
    .from('membership_dues')
    .select('*')
    .order('year', { ascending: false });
  if (year) query = query.eq('year', year);
  return unwrap(await query) || [];
};

export const listOwnDues = async (profileId) =>
  unwrap(
    await supabase
      .from('membership_dues')
      .select('*')
      .eq('profile_id', profileId)
      .order('year', { ascending: false })
  ) || [];

/** Elnökségi rögzítés: évenként egy sor tagonként (unique profile_id+year). */
export const upsertDues = async (profileId, year, patch) =>
  unwrap(
    await supabase
      .from('membership_dues')
      .upsert(
        {
          profile_id: profileId,
          year: Number(year),
          amount_huf: patch.amount_huf === '' || patch.amount_huf == null ? null : Number(patch.amount_huf),
          status: patch.status || 'pending',
          due_date: patch.due_date || null,
          paid_at: patch.status === 'paid' ? patch.paid_at || new Date().toISOString().slice(0, 10) : null,
          payment_method: patch.payment_method?.trim() || null,
          notes: patch.notes?.trim() || null
        },
        { onConflict: 'profile_id,year' }
      )
      .select()
      .single()
  );

/**
 * A tag feltölti a saját átutalási igazolását.
 * Az útvonal ELSŐ szegmense kötelezően a saját user id — erre épül a Storage
 * szabály, így más tag igazolásához nem lehet hozzáférni.
 */
export const uploadDuesProof = async (profileId, year, file) => {
  const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'dat';
  const path = `${profileId}/${year}-igazolas.${extension}`;

  const { error } = await supabase.storage
    .from('dues-proofs')
    .upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (error) throw new Error(`Az igazolás feltöltése nem sikerült: ${error.message}`);

  // A státuszt nem a tag állítja 'paid'-re — azt az elnökség hagyja jóvá.
  return unwrap(
    await supabase
      .from('membership_dues')
      .upsert(
        { profile_id: profileId, year: Number(year), proof_path: path },
        { onConflict: 'profile_id,year' }
      )
      .select()
      .single()
  );
};

export const getDuesProofUrl = async (proofPath) => {
  if (!proofPath) return null;
  const { data, error } = await supabase.storage.from('dues-proofs').createSignedUrl(proofPath, 300);
  if (error) throw new Error(`Az igazolás megnyitása nem sikerült: ${error.message}`);
  return data.signedUrl;
};

// -----------------------------------------------------------------------------
//  Munkacsoport Projektek, Feladatok, Külső Partnerek & Csatolmányok
// -----------------------------------------------------------------------------

export const listProjectsByWorkgroup = async (workgroupId) =>
  unwrap(
    await supabase
      .from('workgroup_projects')
      .select('*, profiles:created_by(full_name)')
      .eq('workgroup_id', workgroupId)
      .order('created_at', { ascending: false })
  ) || [];

export const createWorkgroupProject = async (input) =>
  unwrap(
    await supabase
      .from('workgroup_projects')
      .insert({
        workgroup_id: input.workgroup_id,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        status: input.status || 'active',
        created_by: input.created_by || null
      })
      .select('*, profiles:created_by(full_name)')
      .single()
  );

export const deleteWorkgroupProject = async (projectId) => {
  unwrap(
    await supabase
      .from('workgroup_projects')
      .delete()
      .eq('id', projectId)
  );
  return true;
};

export const listProjectTasks = async (projectId) =>
  unwrap(
    await supabase
      .from('project_tasks')
      .select('*, assignee:assignee_id(full_name)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
  ) || [];

export const createProjectTask = async (input) =>
  unwrap(
    await supabase
      .from('project_tasks')
      .insert({
        project_id: input.project_id,
        title: input.title.trim(),
        status: input.status || 'todo',
        assignee_id: input.assignee_id || null,
        assignee_name: input.assignee_name?.trim() || null,
        due_date: input.due_date || null,
        created_by: input.created_by || null
      })
      .select('*, assignee:assignee_id(full_name)')
      .single()
  );

export const updateTaskStatus = async (taskId, newStatus) =>
  unwrap(
    await supabase
      .from('project_tasks')
      .update({ status: newStatus })
      .eq('id', taskId)
      .select('*, assignee:assignee_id(full_name)')
      .single()
  );

export const listProjectContacts = async (projectId) =>
  unwrap(
    await supabase
      .from('project_contacts')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
  ) || [];

export const createProjectContact = async (input) =>
  unwrap(
    await supabase
      .from('project_contacts')
      .insert({
        project_id: input.project_id,
        name: input.name.trim(),
        role_title: input.role_title?.trim() || null,
        phone: input.phone?.trim() || null,
        email: input.email?.trim() || null,
        notes: input.notes?.trim() || null
      })
      .select('*')
      .single()
  );

export const listProjectComments = async (projectId) =>
  unwrap(
    await supabase
      .from('project_comments')
      .select('*, user:user_id(full_name)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
  ) || [];

export const addProjectComment = async (input) =>
  unwrap(
    await supabase
      .from('project_comments')
      .insert({
        project_id: input.project_id,
        user_id: input.user_id || null,
        comment_text: input.comment_text.trim(),
        attachment_url: input.attachment_url || null,
        attachment_name: input.attachment_name || null
      })
      .select('*, user:user_id(full_name)')
      .single()
  );

export const uploadWorkgroupAttachment = async (file) => {
  const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'file';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${extension}`;
  const path = `attachments/${fileName}`;

  const { error } = await supabase.storage
    .from('workgroup-files')
    .upload(path, file, { upsert: true, contentType: file.type || undefined });

  if (error) throw new Error(`A fájl feltöltése nem sikerült: ${error.message}`);

  const { data } = supabase.storage.from('workgroup-files').getPublicUrl(path);
  return { url: data.publicUrl, name: file.name };
};

// -----------------------------------------------------------------------------
//  Tagok kézi felvétele (Elnökségi felületről ideiglenes jelszóval)
// -----------------------------------------------------------------------------

export const registerMemberByAdmin = async (input) => {
  const email = input.account_email.trim();
  const password = input.temp_password || `Koszeg${Math.floor(1000 + Math.random() * 9000)}!`;

  let userId = null;
  const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/belepes` : 'https://ktsze.hu/belepes';

  // Használjunk külön, persistentMunkamenet NÉLKÜLI Supabase kliens példányt a signUp-hoz!
  // Így a signUp NEM írja felül a bejelentkezett admin helyi auth tokenjét a böngészőben.
  const tempAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: authData, error: authError } = await tempAuthClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: input.full_name?.trim() || null
      },
      emailRedirectTo: redirectUrl
    }
  });

  if (authError) {
    if (authError.message?.toLowerCase().includes('already registered')) {
      // Meglévő profil keresése e-mail alapján
      const existing = await supabase.from('profiles').select('id').eq('account_email', email).maybeSingle();
      if (existing?.data?.id) {
        userId = existing.data.id;
      } else {
        throw new Error(`Ez az e-mail cím (${email}) már regisztrálva van a Supabase hitelesítőben. Töröld az Authentication -> Users menüben, ha újra szeretnéd regisztrálni!`);
      }
    } else {
      throw new Error(`Nem sikerült a fiók regisztrációja: ${authError.message}`);
    }
  } else {
    userId = authData.user?.id;
  }

  if (!userId) {
    throw new Error('A felhasználói azonosító nem jött létre.');
  }

  // 2. Frissítjük a profil adatait
  await supabase.from('profiles').upsert({
    id: userId,
    account_email: email,
    full_name: input.full_name?.trim() || null,
    private_email: input.private_email?.trim() || email,
    phone: input.phone?.trim() || null,
    home_address: input.home_address?.trim() || null,
    member_category: input.member_category || 'Rendes tag',
    service_location_name: input.service_location_name?.trim() || null
  });

  // 3. Beállítjuk a tagi alapértelmezett szerepkört
  await supabase.from('user_roles').upsert(
    { user_id: userId, role: 'member' },
    { onConflict: 'user_id,role' }
  );

  // 4. Automatikus üdvözlő e-mail küldése az új tag részére
  let emailSent = false;
  try {
    const welcomeHtml = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #1e1b26; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e0d8; border-radius: 16px; background-color: #faf7f1;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #701a2e;">
          <h2 style="color: #701a2e; margin: 0; font-size: 20px;">Kőszegi Turisztikai Szövetség Egyesület</h2>
          <p style="font-size: 13px; color: #666; margin-top: 4px;">Üdvözlünk az Egyesület Tagi Portálján!</p>
        </div>
        <div style="padding: 24px 0; font-size: 15px; color: #2d2838;">
          <p>Kedves <strong>${input.full_name || 'Tagunk'}</strong>!</p>
          <p>Örömmel értesítünk, hogy az elnökség regisztrálta a fiókodat a Kőszegi Turisztikai Szövetség Egyesület zárt tagi felületén.</p>
          <div style="background-color: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #e5e0d8; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 14px;"><strong>🌐 Belépési oldal:</strong> <a href="https://ktsze.hu/belepes" style="color: #701a2e; font-weight: bold;">https://ktsze.hu/belepes</a></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>✉️ Bejelentkezési e-mail:</strong> ${email}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>🔑 Ideiglenes jelszavad:</strong> <span style="font-family: monospace; font-size: 16px; color: #701a2e; font-weight: bold;">${password}</span></p>
          </div>
          <p style="font-size: 13px; color: #666;">Kérjük, az első belépést követően változtasd meg a jelszavadat a Profil beállításaidban!</p>
        </div>
        <div style="border-top: 1px solid #e5e0d8; pt: 16px; text-align: center; font-size: 11px; color: #888;">
          <p>© ${new Date().getFullYear()} Kőszegi Turisztikai Szövetség Egyesület | <a href="https://ktsze.hu" style="color: #701a2e; text-decoration: underline;">ktsze.hu</a></p>
        </div>
      </div>
    `;

    const emailRes = await sendNewsletterViaResend({
      fromEmail: 'Koszegi Turisztikai Szovetseg <info@ktsze.hu>',
      recipients: [{ name: input.full_name, email }],
      subject: '[KTSZE] Üdvözlünk az Egyesületben! — Belépési adataid',
      htmlContent: welcomeHtml
    });
    if (emailRes && emailRes.success > 0) {
      emailSent = true;
    }
  } catch (mailErr) {
    console.warn('[RegisterMember] Üdvözlő email küldési hiba:', mailErr);
  }

  return {
    userId,
    email,
    tempPassword: password,
    fullName: input.full_name,
    emailSent
  };
};

// -----------------------------------------------------------------------------
//  Resend Hírlevél Küldő Integráció
// -----------------------------------------------------------------------------

export const sendNewsletterViaResend = async ({ fromEmail, recipients, subject, htmlContent, attachments }) => {
  try {
    const response = await fetch('/.netlify/functions/send-newsletter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fromEmail,
        recipients,
        subject,
        htmlContent,
        attachments
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Szerveroldali hiba: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[sendNewsletterViaResend] Hiba:', err);
    throw err;
  }
};

// -----------------------------------------------------------------------------
//  Zárt Elnökségi Ötletelő & Jegyzetfal API (Supabase + LocalStorage Fallback)
// -----------------------------------------------------------------------------

const LOCAL_IDEAS_KEY = 'ktsze_board_ideas_storage';

const getLocalIdeas = () => {
  try {
    const raw = localStorage.getItem(LOCAL_IDEAS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalIdeas = (ideas) => {
  try {
    localStorage.setItem(LOCAL_IDEAS_KEY, JSON.stringify(ideas));
  } catch (err) {
    console.warn('[LocalStorage] Nem sikerült az ötletek mentése:', err);
  }
};

export const listBoardIdeas = async () => {
  try {
    const { data, error } = await supabase
      .from('board_ideas')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) return data;
  } catch (err) {
    console.warn('[db] board_ideas tábla hiányzik, helyi tárolóra váltás:', err);
  }
  return getLocalIdeas();
};

export const createBoardIdea = async (input) => {
  const newIdea = {
    title: input.title?.trim(),
    description: input.description?.trim() || '',
    category: input.category || 'Általános ötlet',
    author_name: input.author_name || 'Elnökségi Tag',
    author_id: input.author_id || null,
    status: 'idea',
    is_pinned: false,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase.from('board_ideas').insert(newIdea).select().single();
    if (!error && data) return data;
  } catch (err) {
    console.warn('[db] Helyi mentés:', err);
  }

  const local = getLocalIdeas();
  const ideaWithId = { id: `local_${Date.now()}`, ...newIdea };
  const updated = [ideaWithId, ...local];
  saveLocalIdeas(updated);
  return ideaWithId;
};

export const updateBoardIdea = async (id, patch) => {
  try {
    const { data, error } = await supabase.from('board_ideas').update(patch).eq('id', id).select().single();
    if (!error && data) return data;
  } catch (err) {
    console.warn('[db] Helyi frissítés:', err);
  }

  const local = getLocalIdeas();
  const updated = local.map((item) => (item.id === id ? { ...item, ...patch } : item));
  saveLocalIdeas(updated);
  return updated.find((i) => i.id === id);
};

export const deleteBoardIdea = async (id) => {
  try {
    await supabase.from('board_ideas').delete().eq('id', id);
  } catch (err) {
    console.warn('[db] Helyi törlés:', err);
  }

  const local = getLocalIdeas();
  const updated = local.filter((item) => item.id !== id);
  saveLocalIdeas(updated);
  return true;
};

// =============================================================================
//  "Vízadás" — önkéntes faöntözési térkép és napló
//
//  Séma: supabase/18_flower_spots_full_schema.sql
//
//  Két szabály, amit ez a szekció korábban megszegett:
//    1. NINCS localStorage tartalék. Ha a mentés elhasal, azt a felhasználónak
//       látnia kell — a "csak nálam létező fa" rosszabb, mint egy hibaüzenet.
//    2. A fotó a flower-photos bucketbe megy, és csak az URL kerül a táblába.
//       A base64 data URI soronként MB-okat jelent, és a lista minden
//       betöltéskor letölti mindet.
// =============================================================================

/** A napló listájához pontosan ennyi kell — a `select('*')` felesleges terhelés. */
const FLOWER_LOG_COLUMNS = 'id,created_at,spot_id,user_name,action_type,water_liters,notes,photo_url';

/**
 * Fa-fotó feltöltése a publikus bucketbe. Belépés nem kell hozzá.
 * @returns {Promise<string>} a kép publikus URL-je
 */
export const uploadFlowerPhoto = async (file) => {
  const extension = (file.name?.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `fak/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const { error } = await supabase.storage
    .from('flower-photos')
    .upload(path, file, { contentType: file.type || undefined, cacheControl: '31536000' });

  if (error) throw new Error(`A fotó feltöltése nem sikerült: ${describeError(error)}`);

  const { data } = supabase.storage.from('flower-photos').getPublicUrl(path);
  return data.publicUrl;
};

/** Összes fa lekérése (üres tömb is valid válasz). */
export const listFlowerSpots = async () =>
  unwrap(
    await supabase
      .from('flower_spots')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
  ) || [];

/** Új fa rögzítése — cím kötelező, GPS opcionális. */
export const createFlowerSpot = async (input) => {
  const title = input.title?.trim();
  if (!title) throw new Error('A pontos cím (utca, házszám) megadása kötelező.');

  return unwrap(
    await supabase
      .from('flower_spots')
      .insert({
        title,
        // A helymegjelölés maga a cím — nincs kitalált városrész elé fűzve.
        location_name: input.location_name?.trim() || title,
        description: input.description?.trim() || null,
        photo_url: input.photo_url || null,
        adopter_name: input.adopter_name?.trim() || null,
        adopter_user_id: input.adopter_user_id || null,
        status: 'active',
        // Az új fa NEM megöntözött: a badge így rögtön a vízadásra hív.
        last_watered_at: null,
        water_count_this_month: 0,
        water_count_today: 0,
        latitude: Number.isFinite(input.latitude) ? input.latitude : null,
        longitude: Number.isFinite(input.longitude) ? input.longitude : null
      })
      .select()
      .single()
  );
};

/** Fa adatainak módosítása (tartalomkezelői jog kell hozzá). */
export const updateFlowerSpot = async (id, patch) =>
  unwrap(await supabase.from('flower_spots').update(patch).eq('id', id).select().single());

/** Fa törlése (tartalomkezelői jog kell hozzá). */
export const deleteFlowerSpot = async (id) => {
  unwrap(await supabase.from('flower_spots').delete().eq('id', id).select('id'));
  return true;
};

/** Öntözési bejegyzés törlése (moderációhoz). */
export const deleteFlowerLog = async (id) => {
  unwrap(await supabase.from('flower_logs').delete().eq('id', id).select('id'));
  return true;
};

/** Öntözési naplóbejegyzések, legfrissebb elöl. */
export const listFlowerLogs = async (spotId = null, limit = 20) => {
  let query = supabase
    .from('flower_logs')
    .select(FLOWER_LOG_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (spotId) query = query.eq('spot_id', spotId);
  return unwrap(await query) || [];
};

/**
 * Öntözés rögzítése a flower_logs és flower_spots táblákba.
 */
export const addFlowerLog = async (input) => {
  return unwrap(
    await supabase.rpc('flower_log_watering', {
      p_spot_id: input.spot_id,
      p_user_name: input.user_name?.trim() || 'Kőszegi Önkéntes',
      p_action_type: input.action_type || 'locsolas',
      p_water_liters: Number(input.water_liters) || 10,
      p_notes: input.notes?.trim() || null,
      p_photo_url: input.photo_url || null
    })
  );
};

// -----------------------------------------------------------------------------
//  Zárt Adventi Ötletbörze (advent_ideas)
// -----------------------------------------------------------------------------

export const submitAdventIdea = async (ideaData) => {
  const payload = {
    access_code: ideaData.access_code?.trim() || '99118822',
    submitter_name: ideaData.submitter_name?.trim(),
    submitter_email: ideaData.submitter_email?.trim(),
    submitter_phone: ideaData.submitter_phone?.trim() || null,
    title: ideaData.title?.trim(),
    category: ideaData.category || 'Programötlet',
    target_weekend: ideaData.target_weekend || 'Mindkettő',
    description: ideaData.description?.trim(),
    contact_name: ideaData.contact_name?.trim() || null,
    contact_phone: ideaData.contact_phone?.trim() || null,
    contact_email: ideaData.contact_email?.trim() || null,
    price_or_cost: ideaData.price_or_cost?.trim() || null,
    willing_to_sponsor: Boolean(ideaData.willing_to_sponsor),
    status: 'uj'
  };

  const { data, error } = await supabase
    .from('advent_ideas')
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(describeError(error));
  return data;
};

// A beküldött ötletek NEM nyilvánosak — nincs publikus listázó. A beküldő oldal
// csak az űrlapot mutatja; a listát kizárólag az elnökség látja (lásd lent).

/** Elnökségi nézet: MINDEN részletes adattal (telefonszám, kapcsolat, ár, stb.) */
export const listAllAdventIdeasForAdmin = async () => {
  const { data, error } = await supabase
    .from('advent_ideas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[listAllAdventIdeasForAdmin] Error or table missing:', error);
    return [];
  }
  return data || [];
};

/** Státusz módosítása az elnökség által (pl. 'uj', 'egyeztetes', 'elfogadva', 'archiv') */
export const updateAdventIdeaStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('advent_ideas')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(describeError(error));
  return data;
};

/** Ötlet törlése az elnökség által */
export const deleteAdventIdea = async (id) => {
  const { error } = await supabase
    .from('advent_ideas')
    .delete()
    .eq('id', id);

  if (error) throw new Error(describeError(error));
  return true;
};



