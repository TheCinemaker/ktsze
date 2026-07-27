import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_NEWS_PROJECTS, 
  INITIAL_MEMBERS, 
  INITIAL_DOCUMENTS, 
  INITIAL_DRIVE_FOLDERS,
  INITIAL_WORKGROUPS 
} from '../mock/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext();

// One-time localStorage purge of legacy demo keys
if (typeof window !== 'undefined' && !localStorage.getItem('ktsze_v3_purged')) {
  localStorage.removeItem('ktsze_members');
  localStorage.removeItem('ktsze_workgroups');
  localStorage.removeItem('ktsze_news');
  localStorage.removeItem('ktsze_documents');
  localStorage.setItem('ktsze_v3_purged', 'true');
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState('guest'); // 'guest', 'member', 'patron', 'admin'

  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('ktsze_members');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      const cleanMembers = parsed.filter(m => 
        m.id && 
        !m.id.startsWith('m-') &&
        !m.account_email?.includes('partolotag.hu') &&
        !m.account_email?.includes('koszegiturizmus.hu') &&
        m.account_email !== 'farkas.peter@ibrahimhotel.hu' &&
        m.account_email !== 'voros.robert@portre.hu' &&
        m.account_email !== 'avar.szilveszter@sasoftware.hu' &&
        m.account_email !== 'szeker.zoltan@jurisicsvar.hu'
      );
      // Deduplicate by account_email
      const unique = [];
      const seen = new Set();
      for (const m of cleanMembers) {
        const key = (m.account_email || '').toLowerCase().trim();
        if (key && !seen.has(key)) {
          seen.add(key);
          unique.push(m);
        }
      }
      return unique;
    } catch {
      return [];
    }
  });

  const [workgroups, setWorkgroups] = useState(() => {
    const saved = localStorage.getItem('ktsze_workgroups');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.filter(w => !['wg-1', 'wg-2', 'wg-3'].includes(w.id));
    } catch {
      return [];
    }
  });

  const [newsProjects, setNewsProjects] = useState(() => {
    const saved = localStorage.getItem('ktsze_news');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.filter(n => !['np-1', 'np-2', 'np-3'].includes(n.id));
    } catch {
      return [];
    }
  });

  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('ktsze_documents');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.filter(d => !['doc-1', 'doc-2', 'doc-3'].includes(d.id));
    } catch {
      return [];
    }
  });

  const [driveFolders, setDriveFolders] = useState(() => {
    const saved = localStorage.getItem('ktsze_drive');
    return saved ? JSON.parse(saved) : INITIAL_DRIVE_FOLDERS;
  });

  // Sync profiles from Supabase DB if live
  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.from('profiles').select('*').then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setMembers(prev => {
            // Merge Supabase profiles with local ones, preferring Supabase
            const combinedMap = new Map();
            data.forEach(p => {
              combinedMap.set(p.account_email?.toLowerCase().trim(), {
                ...p,
                dues_2026: { status: 'pending', amount: 24000, paid_at: null }
              });
            });
            prev.forEach(m => {
              const key = m.account_email?.toLowerCase().trim();
              if (key && !combinedMap.has(key)) {
                combinedMap.set(key, m);
              }
            });
            return Array.from(combinedMap.values());
          });
        }
      }).catch(err => console.warn('Supabase fetch error:', err));
    }
  }, []);

  // Sync state to localStorage
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

  // Auth Functions with Superadmin Master Credential
  const loginWithCredentials = (emailOrUsername, passwordInput) => {
    const inputClean = (emailOrUsername || '').toLowerCase().trim();
    
    // Master Superadmin check (beégetve / ENV-ből)
    if ((inputClean === 'admin' || inputClean === 'admin@visitkoszeg.hu') && passwordInput === 'Nyanyuska_0169') {
      const superAdminUser = {
        id: 'super-admin-1',
        account_email: 'admin@visitkoszeg.hu',
        full_name: 'SuperAdmin (SA Software)',
        custom_title: 'Rendszergazda & Fejlesztő',
        member_category: 'Elnökségi tag',
        role: 'admin',
        phone: '+36 30 555 7788'
      };
      setCurrentUser(superAdminUser);
      setRole('admin');
      return { success: true, user: superAdminUser };
    }

    // Normal Member Login via Supabase / local profiles
    const foundUser = members.find(m => 
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
      const superAdminUser = {
        id: 'super-admin-1',
        account_email: 'admin@visitkoszeg.hu',
        full_name: 'SuperAdmin (SA Software)',
        custom_title: 'Rendszergazda & Fejlesztő',
        member_category: 'Elnökségi tag',
        role: 'admin',
        phone: '+36 30 555 7788'
      };
      setCurrentUser(superAdminUser);
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

  // Helper function to sync a member profile to Supabase DB
  const syncProfileToSupabase = (profile) => {
    if (isSupabaseConfigured() && profile.account_email) {
      supabase.from('profiles').upsert({
        account_email: profile.account_email,
        full_name: profile.full_name || '',
        home_address: profile.home_address || '',
        phone: profile.phone || '',
        private_email: profile.private_email || '',
        member_category: profile.member_category || 'Rendes tag',
        business_activity: profile.business_activity || 'szolgáltató',
        service_location_name: profile.service_location_name || profile.full_name || 'Szolgáltatás',
        service_street: profile.service_street || '',
        service_house_number: profile.service_house_number || '',
        service_contacts: profile.service_contacts || profile.phone || '',
        custom_title: profile.custom_title || '',
        role: profile.role || 'member',
        joined_date: profile.joined_date || new Date().toISOString().split('T')[0]
      }, { onConflict: 'account_email' }).then(({ data, error }) => {
        if (error) {
          console.error('Supabase profile sync error:', error);
        } else {
          console.log('Supabase profile synced successfully:', data);
        }
      }).catch(err => console.error('Supabase sync exception:', err));
    }
  };

  // Member Registration (Supabase Auth / Local State)
  const registerMember = (registrationData) => {
    const isPatron = registrationData.member_category === 'Pártoló tag';
    const emailClean = (registrationData.account_email || '').toLowerCase().trim();
    const existingMember = members.find(m => (m.account_email || '').toLowerCase().trim() === emailClean);

    const isFirstUser = members.length === 0 || (members.length === 1 && existingMember);

    const newProfile = {
      id: existingMember ? existingMember.id : `user-${Date.now()}`,
      account_email: registrationData.account_email,
      private_email: registrationData.private_email || '',
      full_name: registrationData.full_name,
      home_address: registrationData.home_address || '',
      phone: registrationData.phone,
      member_category: registrationData.member_category || (isFirstUser ? 'Elnökségi tag' : 'Rendes tag'),
      custom_title: registrationData.custom_title || (existingMember?.custom_title ? existingMember.custom_title : (isFirstUser ? 'Elnök' : '')),
      business_activity: registrationData.business_activity || 'szolgáltató',
      service_location_name: registrationData.service_location_name || 'Szolgáltatás',
      service_street: registrationData.service_street || '',
      service_house_number: registrationData.service_house_number || '',
      service_contacts: registrationData.service_contacts || registrationData.phone,
      workgroups: registrationData.workgroups || [],
      role: registrationData.role || (existingMember?.role ? existingMember.role : (isFirstUser ? 'admin' : (isPatron ? 'patron' : 'member'))),
      joined_date: existingMember?.joined_date || new Date().toISOString().split('T')[0],
      dues_2026: { 
        status: existingMember?.dues_2026?.status || "pending", 
        amount: isPatron ? 15000 : (registrationData.business_activity === 'szállásadó' || registrationData.business_activity === 'vendéglős' ? 36000 : 24000), 
        paid_at: existingMember?.dues_2026?.paid_at || null 
      }
    };

    setMembers(prev => {
      const filtered = prev.filter(m => (m.account_email || '').toLowerCase().trim() !== emailClean);
      return [newProfile, ...filtered];
    });

    setCurrentUser(newProfile);
    setRole(newProfile.role);

    // Sync directly to Supabase DB!
    syncProfileToSupabase(newProfile);

    return newProfile;
  };

  // Member Role & Custom Title Assignment (ADMIN FUNCTION)
  const updateMemberRoleAndTitle = (memberId, { role: newRole, member_category: newCategory, custom_title: newTitle }) => {
    setMembers(prev => prev.map(member => {
      if (member.id === memberId) {
        const updated = {
          ...member,
          role: newRole !== undefined ? newRole : member.role,
          member_category: newCategory !== undefined ? newCategory : member.member_category,
          custom_title: newTitle !== undefined ? newTitle : member.custom_title
        };
        if (currentUser?.id === memberId) {
          setCurrentUser(updated);
          setRole(updated.role);
        }
        syncProfileToSupabase(updated);
        return updated;
      }
      return member;
    }));
  };

  // Member Profile Update (Admin or Member editing)
  const updateMemberProfile = (profileId, updatedData) => {
    setMembers(prev => prev.map(m => {
      if (m.id === profileId) {
        const updated = { ...m, ...updatedData };
        syncProfileToSupabase(updated);
        return updated;
      }
      return m;
    }));
    if (currentUser?.id === profileId) {
      setCurrentUser(prev => ({ ...prev, ...updatedData }));
    }
  };

  // Admin Workgroup Management (Create / Rename / Update)
  const addWorkgroup = (newGroup) => {
    const created = {
      ...newGroup,
      id: `wg-${Date.now()}`,
      slug: newGroup.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      is_active: true,
      members: newGroup.members || []
    };
    setWorkgroups(prev => [created, ...prev]);
  };

  const updateWorkgroup = (workgroupId, updatedData) => {
    setWorkgroups(prev => prev.map(wg => {
      if (wg.id === workgroupId) {
        return {
          ...wg,
          ...updatedData,
          slug: updatedData.name ? updatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : wg.slug
        };
      }
      return wg;
    }));
  };

  // Member Dues Status Update (Admin tool)
  const updateMemberDuesStatus = (memberId, status, paidAt = null) => {
    setMembers(prev => prev.map(member => {
      if (member.id === memberId) {
        return {
          ...member,
          dues_2026: {
            ...member.dues_2026,
            status,
            paid_at: status === 'paid' ? (paidAt || new Date().toISOString().split('T')[0]) : null
          }
        };
      }
      return member;
    }));
  };

  // Document Management (ADMIN ONLY FOR UPLOAD)
  const addDocument = (newDoc) => {
    if (role !== 'admin') {
      alert("Hiba: Csak egyesületi adminisztrátor tölthet fel hivatalos dokumentumot!");
      return;
    }
    const doc = {
      ...newDoc,
      id: `doc-${Date.now()}`,
      uploaded_at: new Date().toISOString().split('T')[0]
    };
    setDocuments(prev => [doc, ...prev]);
  };

  // CMS News & Projects
  const addNewsProject = (newItem) => {
    const created = {
      ...newItem,
      id: `np-${Date.now()}`,
      slug: newItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      date: new Date().toISOString().split('T')[0],
      published_at: new Date().toISOString(),
      is_published: true
    };
    setNewsProjects(prev => [created, ...prev]);
  };

  const addFileToDriveFolder = (folderId, fileName, fileSize) => {
    setDriveFolders(prev => prev.map(folder => {
      if (folder.id === folderId) {
        const newFile = {
          name: fileName,
          size: fileSize,
          modified: new Date().toISOString().split('T')[0]
        };
        return {
          ...folder,
          files_count: folder.files_count + 1,
          last_synced: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString().slice(0,5)}`,
          files: [newFile, ...folder.files]
        };
      }
      return folder;
    }));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      role,
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
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
