import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_DRIVE_FOLDERS } from '../mock/initialData';
import { supabase, isSupabaseConfigured, describeError } from '../lib/supabaseClient';

const AuthContext = createContext();

// One-time total localStorage purge of legacy mock keys
if (typeof window !== 'undefined' && !localStorage.getItem('ktsze_v4_purged')) {
  localStorage.clear();
  localStorage.setItem('ktsze_v4_purged', 'true');
}

const readLocal = (key, filterFn) => {
  const saved = localStorage.getItem(key);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? (filterFn ? parsed.filter(filterFn) : parsed) : [];
  } catch {
    return [];
  }
};

const slugify = (value, fallback) =>
  (value || fallback || 'elem')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || fallback || 'elem';

const duesAmountFor = (category, activity) => {
  if (category === 'Pártoló tag') return 15000;
  return activity === 'szállásadó' || activity === 'vendéglős' ? 36000 : 24000;
};

// --- DB sor <-> app objektum leképezés -------------------------------------

const rowToMember = (row) => ({
  ...row,
  workgroups: row.workgroups || [],
  dues_2026: {
    status: row.dues_status || 'pending',
    amount: row.dues_amount ?? duesAmountFor(row.member_category, row.business_activity),
    paid_at: row.dues_paid_at || null
  }
});

const memberToRow = (m) => ({
  account_email: m.account_email,
  full_name: m.full_name || '',
  home_address: m.home_address || '',
  phone: m.phone || '',
  private_email: m.private_email || '',
  member_category: m.member_category || 'Rendes tag',
  business_activity: m.business_activity || 'szolgáltató',
  service_location_name: m.service_location_name || m.full_name || '',
  service_street: m.service_street || '',
  service_house_number: m.service_house_number || '',
  service_contacts: m.service_contacts || m.phone || '',
  custom_title: m.custom_title || '',
  role: m.role || 'member',
  joined_date: m.joined_date || new Date().toISOString().split('T')[0],
  workgroups: m.workgroups || [],
  dues_status: m.dues_2026?.status || 'pending',
  dues_amount: m.dues_2026?.amount ?? duesAmountFor(m.member_category, m.business_activity),
  dues_paid_at: m.dues_2026?.paid_at || null
});

const workgroupToRow = (w) => ({
  name: w.name,
  slug: w.slug,
  leader_name: w.leader_name || '',
  description: w.description || '',
  latest_updates: w.latest_updates || '',
  image_url: w.image_url || '',
  is_active: w.is_active !== false
});

const documentToRow = (d) => ({
  title: d.title,
  slug: d.slug,
  category: d.category || 'Általános',
  access_level: d.access_level || 'members',
  file_url: d.file_url && d.file_url !== '#' ? d.file_url : null,
  file_size: d.file_size || '',
  file_type: d.file_type || 'PDF',
  description: d.description || '',
  uploaded_at: d.uploaded_at || new Date().toISOString().split('T')[0]
});

const newsToRow = (n) => ({
  title: n.title,
  slug: n.slug,
  type: n.type || 'hír',
  category: n.category || '',
  summary: n.summary || '',
  content: n.content || n.summary || '',
  image: n.image || '',
  is_published: n.is_published !== false,
  published_at: n.published_at || new Date().toISOString()
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState('guest'); // 'guest', 'member', 'patron', 'admin'
  const [syncState, setSyncState] = useState({ status: 'idle', error: null });

  const [members, setMembers] = useState(() => readLocal('ktsze_members', (m) => m.id));
  const [workgroups, setWorkgroups] = useState(() => readLocal('ktsze_workgroups'));
  const [newsProjects, setNewsProjects] = useState(() => readLocal('ktsze_news'));
  const [documents, setDocuments] = useState(() => readLocal('ktsze_documents'));
  const [driveFolders, setDriveFolders] = useState(() => {
    const saved = localStorage.getItem('ktsze_drive');
    return saved ? JSON.parse(saved) : INITIAL_DRIVE_FOLDERS;
  });

  /**
   * Egységes írás Supabase-be.
   * A supabase-js builder NEM Promise (nincs rajta `.catch()`), ezért `await` +
   * `error` vizsgálat kell. A hibát felszínre hozzuk, nem nyeljük el.
   */
  const runWrite = useCallback(async (label, buildQuery) => {
    if (!isSupabaseConfigured()) {
      const error = 'Supabase nincs konfigurálva (hiányzó URL vagy anon kulcs).';
      setSyncState({ status: 'error', error });
      return { ok: false, error };
    }
    setSyncState({ status: 'saving', error: null });
    try {
      const { data, error } = await buildQuery();
      if (error) {
        const message = describeError(error);
        console.error(`[Supabase] ${label} sikertelen:`, error);
        setSyncState({ status: 'error', error: message });
        return { ok: false, error: message, data: null };
      }
      setSyncState({ status: 'saved', error: null });
      return { ok: true, error: null, data };
    } catch (err) {
      const message = err?.message || String(err);
      console.error(`[Supabase] ${label} kivétel:`, err);
      setSyncState({ status: 'error', error: message });
      return { ok: false, error: message, data: null };
    }
  }, []);

  // --- Kezdeti betöltés: a Supabase az igazság forrása -----------------------
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;

    (async () => {
      const [profilesRes, workgroupsRes, documentsRes, newsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('workgroups').select('*').order('created_at', { ascending: false }),
        supabase.from('documents').select('*').order('created_at', { ascending: false }),
        supabase.from('news_projects').select('*').order('published_at', { ascending: false })
      ]);
      if (cancelled) return;

      const firstError = [profilesRes, workgroupsRes, documentsRes, newsRes].find((r) => r.error)?.error;
      if (firstError) {
        console.error('[Supabase] betöltési hiba:', firstError);
        setSyncState({ status: 'error', error: describeError(firstError) });
      }

      if (!profilesRes.error) setMembers(profilesRes.data.map(rowToMember));
      if (!workgroupsRes.error) setWorkgroups(workgroupsRes.data);
      if (!documentsRes.error) setDocuments(documentsRes.data);
      if (!newsRes.error) setNewsProjects(newsRes.data);

      // Egyszeri migráció: ami korábban csak a localStorage-ban ragadt, most felmegy.
      if (!localStorage.getItem('ktsze_migrated_to_db')) {
        const localMembers = readLocal('ktsze_members', (m) => m.account_email);
        const localWorkgroups = readLocal('ktsze_workgroups', (w) => w.name);
        let migrated = false;

        if (!profilesRes.error && profilesRes.data.length === 0 && localMembers.length > 0) {
          const { error } = await supabase
            .from('profiles')
            .upsert(localMembers.map(memberToRow), { onConflict: 'account_email' })
            .select();
          if (error) console.error('[Supabase] tag-migráció hiba:', error);
          else migrated = true;
        }
        if (!workgroupsRes.error && workgroupsRes.data.length === 0 && localWorkgroups.length > 0) {
          const { error } = await supabase
            .from('workgroups')
            .upsert(
              localWorkgroups.map((w) => workgroupToRow({ ...w, slug: w.slug || slugify(w.name) })),
              { onConflict: 'slug' }
            )
            .select();
          if (error) console.error('[Supabase] munkacsoport-migráció hiba:', error);
          else migrated = true;
        }

        localStorage.setItem('ktsze_migrated_to_db', 'true');
        if (migrated && !cancelled) {
          const [p, w] = await Promise.all([
            supabase.from('profiles').select('*'),
            supabase.from('workgroups').select('*')
          ]);
          if (cancelled) return;
          if (!p.error) setMembers(p.data.map(rowToMember));
          if (!w.error) setWorkgroups(w.data);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // --- Helyi gyorsítótár (offline nézet) -----------------------------------
  useEffect(() => {
    localStorage.setItem('ktsze_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('ktsze_workgroups', JSON.stringify(workgroups));
  }, [workgroups]);

  useEffect(() => {
    localStorage.setItem('ktsze_news', JSON.stringify(newsProjects));
  }, [newsProjects]);

  useEffect(() => {
    localStorage.setItem('ktsze_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('ktsze_drive', JSON.stringify(driveFolders));
  }, [driveFolders]);

  // --- Auth ----------------------------------------------------------------
  const SUPER_ADMIN = {
    id: 'super-admin-1',
    account_email: 'admin@visitkoszeg.hu',
    full_name: 'SuperAdmin (SA Software)',
    custom_title: 'Rendszergazda & Fejlesztő',
    member_category: 'Elnökségi tag',
    role: 'admin',
    phone: '+36 30 555 7788'
  };

  const loginWithCredentials = (emailOrUsername, passwordInput) => {
    const inputClean = (emailOrUsername || '').toLowerCase().trim();

    if ((inputClean === 'admin' || inputClean === 'admin@visitkoszeg.hu') && passwordInput === 'Nyanyuska_0169') {
      setCurrentUser(SUPER_ADMIN);
      setRole('admin');
      return { success: true, user: SUPER_ADMIN };
    }

    const foundUser = members.find(
      (m) =>
        m.account_email?.toLowerCase().trim() === inputClean ||
        m.private_email?.toLowerCase().trim() === inputClean
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      setRole(foundUser.role || 'member');
      return { success: true, user: foundUser };
    }

    return { success: false, message: 'Érvénytelen bejelentkezési adatok! Helyes Superadmin: admin / Nyanyuska_0169' };
  };

  const loginAs = (selectedRole) => {
    if (selectedRole === 'admin') {
      setCurrentUser(SUPER_ADMIN);
      setRole('admin');
    } else {
      setCurrentUser(null);
      setRole('guest');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setRole('guest');
  };

  // --- Tagok ---------------------------------------------------------------

  /** Egy profil mentése a DB-be, majd a visszakapott (valódi UUID-s) sor beállítása. */
  const saveMember = useCallback(
    async (member) => {
      const result = await runWrite('profil mentés', () =>
        supabase.from('profiles').upsert(memberToRow(member), { onConflict: 'account_email' }).select().single()
      );

      if (!result.ok) return result;

      const saved = rowToMember(result.data);
      setMembers((prev) => {
        const others = prev.filter(
          (m) =>
            m.id !== member.id &&
            m.id !== saved.id &&
            (m.account_email || '').toLowerCase().trim() !== (saved.account_email || '').toLowerCase().trim()
        );
        return [saved, ...others];
      });
      setCurrentUser((prev) => (prev && prev.id === member.id ? saved : prev));
      return { ok: true, error: null, member: saved };
    },
    [runWrite]
  );

  const registerMember = async (registrationData) => {
    const emailClean = (registrationData.account_email || '').toLowerCase().trim();
    const existing = members.find((m) => (m.account_email || '').toLowerCase().trim() === emailClean);
    const category = registrationData.member_category || 'Rendes tag';

    const newProfile = {
      id: existing?.id,
      ...registrationData,
      member_category: category,
      custom_title: registrationData.custom_title || existing?.custom_title || '',
      business_activity: registrationData.business_activity || 'szolgáltató',
      workgroups: registrationData.workgroups || existing?.workgroups || [],
      role: existing?.role || (category === 'Pártoló tag' ? 'patron' : 'member'),
      joined_date: existing?.joined_date || new Date().toISOString().split('T')[0],
      dues_2026: {
        status: existing?.dues_2026?.status || 'pending',
        amount: duesAmountFor(category, registrationData.business_activity),
        paid_at: existing?.dues_2026?.paid_at || null
      }
    };

    const result = await saveMember(newProfile);
    if (!result.ok) return result;

    setCurrentUser(result.member);
    setRole(result.member.role);
    return result;
  };

  const updateMemberProfile = async (profileId, updatedData) => {
    const existing = members.find((m) => m.id === profileId);
    if (!existing) return { ok: false, error: 'A tag nem található.' };
    return saveMember({ ...existing, ...updatedData });
  };

  const updateMemberRoleAndTitle = async (memberId, { role: newRole, member_category, custom_title }) => {
    const existing = members.find((m) => m.id === memberId);
    if (!existing) return { ok: false, error: 'A tag nem található.' };

    const result = await saveMember({
      ...existing,
      role: newRole !== undefined ? newRole : existing.role,
      member_category: member_category !== undefined ? member_category : existing.member_category,
      custom_title: custom_title !== undefined ? custom_title : existing.custom_title
    });
    if (result.ok && currentUser?.id === memberId) setRole(result.member.role);
    return result;
  };

  const updateMemberDuesStatus = async (memberId, status, paidAt = null) => {
    const existing = members.find((m) => m.id === memberId);
    if (!existing) return { ok: false, error: 'A tag nem található.' };

    return saveMember({
      ...existing,
      dues_2026: {
        ...existing.dues_2026,
        status,
        paid_at: status === 'paid' ? paidAt || new Date().toISOString().split('T')[0] : null
      }
    });
  };

  // --- Munkacsoportok ------------------------------------------------------

  const addWorkgroup = async (newGroup) => {
    const row = workgroupToRow({ ...newGroup, slug: slugify(newGroup.name, 'munkacsoport'), is_active: true });
    const result = await runWrite('munkacsoport létrehozás', () =>
      supabase.from('workgroups').upsert(row, { onConflict: 'slug' }).select().single()
    );
    if (!result.ok) return result;

    setWorkgroups((prev) => [result.data, ...prev.filter((w) => w.slug !== result.data.slug)]);
    return { ok: true, error: null, workgroup: result.data };
  };

  const updateWorkgroup = async (workgroupId, updatedData) => {
    const existing = workgroups.find((w) => w.id === workgroupId);
    if (!existing) return { ok: false, error: 'A munkacsoport nem található.' };

    // Átnevezéskor a slug is változik, ezért az azonosítás MINDIG a stabil id-n megy,
    // nem az újraszámolt slugon (az még nem létezik a DB-ben → 0 sor frissülne).
    const merged = { ...existing, ...updatedData, slug: slugify(updatedData.name || existing.name, existing.slug) };
    const result = await runWrite('munkacsoport módosítás', () =>
      supabase.from('workgroups').update(workgroupToRow(merged)).eq('id', workgroupId).select().single()
    );
    if (!result.ok) return result;

    setWorkgroups((prev) => prev.map((w) => (w.id === workgroupId ? result.data : w)));
    return { ok: true, error: null, workgroup: result.data };
  };

  // --- Dokumentumok --------------------------------------------------------

  const addDocument = async (newDoc) => {
    if (role !== 'admin') {
      return { ok: false, error: 'Csak egyesületi adminisztrátor tölthet fel hivatalos dokumentumot!' };
    }
    const row = documentToRow({ ...newDoc, slug: slugify(newDoc.title, 'dokumentum') });
    const result = await runWrite('dokumentum rögzítés', () =>
      supabase.from('documents').upsert(row, { onConflict: 'slug' }).select().single()
    );
    if (!result.ok) return result;

    setDocuments((prev) => [result.data, ...prev.filter((d) => d.slug !== result.data.slug)]);
    return { ok: true, error: null, document: result.data };
  };

  // --- Hírek & projektek ---------------------------------------------------

  const addNewsProject = async (newItem) => {
    const row = newsToRow({ ...newItem, slug: slugify(newItem.title, 'hir') });
    const result = await runWrite('hír mentés', () =>
      supabase.from('news_projects').upsert(row, { onConflict: 'slug' }).select().single()
    );
    if (!result.ok) return result;

    setNewsProjects((prev) => [result.data, ...prev.filter((n) => n.slug !== result.data.slug)]);
    return { ok: true, error: null, news: result.data };
  };

  // --- Drive (csak helyi demó) ---------------------------------------------

  const addFileToDriveFolder = (folderId, fileName, fileSize) => {
    setDriveFolders((prev) =>
      prev.map((folder) => {
        if (folder.id !== folderId) return folder;
        const newFile = { name: fileName, size: fileSize, modified: new Date().toISOString().split('T')[0] };
        return {
          ...folder,
          files_count: folder.files_count + 1,
          last_synced: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString().slice(0, 5)}`,
          files: [newFile, ...folder.files]
        };
      })
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        syncState,
        loginWithCredentials,
        loginAs,
        logout,
        registerMember,
        updateMemberProfile,
        updateMemberRoleAndTitle,
        members,
        updateMemberDuesStatus,
        workgroups,
        addWorkgroup,
        updateWorkgroup,
        newsProjects,
        addNewsProject,
        documents,
        addDocument,
        driveFolders,
        addFileToDriveFolder
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
