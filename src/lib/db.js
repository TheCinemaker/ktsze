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
 * Nyilvános elnökségi tagok (Elnök és Alelnökök).
 * Kizárja a technikai rendszergazda fiókot, és megmutatja a valódi elnökségi tagokat.
 * RLS-biztos: nem terheli a nyilvános kérést kényes joinokkal, és van garantált tartaléka.
 */
export const listPublicBoardMembers = async () => {
  const fallbacks = [
    {
      id: 'gabor-drescher',
      full_name: 'Drescher Gábor',
      custom_title: 'Elnök',
      service_location_name: 'Kőszegi Turisztikai Szövetség Egyesület',
      business_activity: 'Turisztikai Képviselet & Vezetés',
      private_email: 'info@visitkoszeg.hu',
      avatar_url: null,
      bio: null
    },
    {
      id: 'adrienn-szalok',
      full_name: 'Kovács-Szalók Adrienn',
      custom_title: 'Alelnök',
      service_location_name: 'Turisztikai Munkacsoport',
      business_activity: 'Szállodaüzemeltetés & Vendégélmény',
      private_email: 'szalok.adrienn@gmail.com',
      avatar_url: null,
      bio: null
    },
    {
      id: 'peter-farkas',
      full_name: 'Farkas Péter',
      custom_title: 'Alelnök',
      service_location_name: 'Ibrahim Boutique Hotel',
      business_activity: 'Szálloda & Turisztikai Szolgáltatás',
      private_email: 'farkas.peter@ibrahim.hu',
      avatar_url: null,
      bio: null
    },
    {
      id: 'robert-voros',
      full_name: 'Vörös Róbert',
      custom_title: 'Alelnök',
      service_location_name: 'Portré Étterem és Panzió',
      business_activity: 'Gasztronómia & Szálláshely Kezelés',
      private_email: 'voros.robert@portre.hu',
      avatar_url: null,
      bio: null
    },
    {
      id: 'szilveszter-avar',
      full_name: 'Avar Szilveszter',
      custom_title: 'Digitális Kőszeg alelnök',
      service_location_name: 'SA Software & Network Solutions',
      business_activity: 'Informatikai és Turisztikai Szoftverfejlesztés',
      private_email: 'avar.szilveszter@gmail.com',
      avatar_url: null,
      bio: null
    }
  ];

  try {
    const { data: dbProfiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, custom_title, service_location_name, business_activity, account_email, private_email, avatar_url, bio');

    // Még ha sikeres is a lekérdezés, a DB-ben lévő tagokat összefésüljük a fallbackekkel
    const dbMembers = [];
    if (!error && dbProfiles && dbProfiles.length > 0) {
      dbProfiles.forEach((p) => {
        if (!p.full_name || p.full_name.trim() === '' || p.full_name.toLowerCase() === 'rendszergazda') return;
        if (p.account_email?.toLowerCase() === 'admin@visitkoszeg.hu') return;

        dbMembers.push({
          id: p.id,
          full_name: p.full_name,
          custom_title: p.custom_title || (
            p.full_name?.toLowerCase().includes('szilveszter') ? 'Digitális Kőszeg alelnök' :
            p.full_name?.toLowerCase().includes('adrienn') ? 'Alelnök' :
            (p.full_name?.toLowerCase().includes('gábor') || p.full_name?.toLowerCase().includes('drescher')) ? 'Elnök' :
            p.full_name?.toLowerCase().includes('péter') ? 'Alelnök' :
            p.full_name?.toLowerCase().includes('róbert') ? 'Alelnök' :
            'Elnökségi tag'
          ),
          service_location_name: p.service_location_name,
          business_activity: p.business_activity,
          private_email: p.private_email || p.account_email,
          avatar_url: p.avatar_url || null,
          bio: p.bio || null
        });
      });
    }

    const merged = [...dbMembers];
    fallbacks.forEach((fb) => {
      const isAlreadyInDb = dbMembers.some((dbm) => {
        const dbmName = (dbm.full_name || '').toLowerCase();
        const fbName = fb.full_name.toLowerCase();
        const parts = fbName.split(' ');
        // Ha a vezetéknév vagy keresztnév (min 4 karakter) egyezik a DB-ben lévővel
        return parts.some((part) => part.length > 3 && dbmName.includes(part));
      });
      if (!isAlreadyInDb) {
        merged.push(fb);
      }
    });

    // Rendezzük a kártyákat: Elnök elöl, utána a többiek névsorban
    return merged.sort((a, b) => {
      const isAElnok = a.custom_title?.toLowerCase().includes('elnök') && !a.custom_title?.toLowerCase().includes('alelnök');
      const isBElnok = b.custom_title?.toLowerCase().includes('elnök') && !b.custom_title?.toLowerCase().includes('alelnök');
      if (isAElnok && !isBElnok) return -1;
      if (!isAElnok && isBElnok) return 1;
      return a.full_name.localeCompare(b.full_name, 'hu');
    });
  } catch (err) {
    console.warn('[db] listPublicBoardMembers hiba:', err);
  }

  // Hiba esetén az összes fallback
  return fallbacks.sort((a, b) => {
    const isAElnok = a.custom_title?.toLowerCase().includes('elnök') && !a.custom_title?.toLowerCase().includes('alelnök');
    const isBElnok = b.custom_title?.toLowerCase().includes('elnök') && !b.custom_title?.toLowerCase().includes('alelnök');
    if (isAElnok && !isBElnok) return -1;
    if (!isAElnok && isBElnok) return 1;
    return a.full_name.localeCompare(b.full_name, 'hu');
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

export const sendNewsletterViaResend = async ({ fromEmail, recipients, subject, htmlContent }) => {
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
        htmlContent
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


