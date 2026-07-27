// =============================================================================
//  Adatréteg — a Supabase az EGYETLEN igazságforrás.
//
//  Szabályok, amiket ez a fájl betart:
//    1. Minden hívás `await`-elt, és az `error` mezőt megvizsgáljuk (unwrap).
//    2. Hiba esetén beszédes Error-t dobunk — a hívó oldal toastban mutatja.
//       Nincs néma elnyelés, és nincs "sikeres mentés" üzenet sikertelen mentésre.
//    3. localStorage-ot NEM használunk. A böngésző csak megjelenít.
// =============================================================================

import { supabase, unwrap, describeError } from './supabaseClient';

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
  'custom_title'
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
  const embedded = await supabase.from('profiles').select(PROFILE_WITH_ROLES).eq('id', userId).maybeSingle();

  if (!embedded.error) return embedded.data;
  if (!isEmbedError(embedded.error)) throw new Error(describeError(embedded.error));

  console.warn('[db] A szerepkörök beágyazása nem sikerült, tartalék útra váltok. Futtasd le a supabase/04_fix_embed.sql szkriptet.');

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
 * Nyilvános elnökségi tagok (Elnök és Alelnökök).
 * Kizárja a technikai rendszergazda fiókot, és megmutatja a valódi elnökségi tagokat
 * (akiknek van kitöltött custom_title tisztségük vagy 'vicepresident' szerepkörük).
 */
export const listPublicBoardMembers = async () => {
  const embedded = await supabase
    .from('profiles')
    .select('id, full_name, custom_title, service_location_name, business_activity, account_email, user_roles!user_roles_user_id_fkey(role)');

  let profiles = [];
  if (!embedded.error && embedded.data) {
    profiles = embedded.data;
  } else {
    const rawProfiles = unwrap(await supabase.from('profiles').select('id, full_name, custom_title, service_location_name, business_activity, account_email')) || [];
    const allRoles = unwrap(await supabase.from('user_roles').select('user_id, role')) || [];
    profiles = rawProfiles.map((p) => ({
      ...p,
      user_roles: allRoles.filter((r) => r.user_id === p.id)
    }));
  }

  return profiles
    .filter((p) => {
      // Rendszergazda technikai fiók elrejtése a nyilvános felületről
      if (p.account_email?.toLowerCase() === 'admin@visitkoszeg.hu') return false;
      if (!p.full_name || p.full_name.trim() === '' || p.full_name.toLowerCase() === 'rendszergazda') return false;

      const hasTitle = Boolean(p.custom_title && p.custom_title.trim() !== '');
      const hasViceRole = Array.isArray(p.user_roles) && p.user_roles.some((r) => r.role === 'vicepresident');
      return hasTitle || hasViceRole;
    })
    .map((p) => ({
      id: p.id,
      full_name: p.full_name,
      custom_title: p.custom_title || 'Tisztségviselő',
      service_location_name: p.service_location_name,
      business_activity: p.business_activity
    }));
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
        sort_order: input.sort_order ?? 0
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
    latest_updates: patch.latest_updates?.trim() || null
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
  let storagePath = null;

  if (file) {
    const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'dat';
    storagePath = `${new Date().getFullYear()}/${slug}.${extension}`;
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
          access_level: input.access_level || 'members',
          storage_path: storagePath,
          file_size: file?.size ?? null,
          file_type: file?.type || null,
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
