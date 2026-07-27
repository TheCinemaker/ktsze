import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_NEWS_PROJECTS, 
  INITIAL_MEMBERS, 
  INITIAL_DOCUMENTS, 
  INITIAL_DRIVE_FOLDERS 
} from '../mock/initialData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Current user state (default: guest, can switch between guest, member [Jurisics Vár Hotel], and admin)
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState('guest'); // 'guest', 'member', 'admin'

  // Application Data States (synced in memory / localStorage fallback)
  const [newsProjects, setNewsProjects] = useState(() => {
    const saved = localStorage.getItem('ktsze_news');
    return saved ? JSON.parse(saved) : INITIAL_NEWS_PROJECTS;
  });

  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('ktsze_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('ktsze_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [driveFolders, setDriveFolders] = useState(() => {
    const saved = localStorage.getItem('ktsze_drive');
    return saved ? JSON.parse(saved) : INITIAL_DRIVE_FOLDERS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ktsze_news', JSON.stringify(newsProjects));
  }, [newsProjects]);

  useEffect(() => {
    localStorage.setItem('ktsze_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('ktsze_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('ktsze_drive', JSON.stringify(driveFolders));
  }, [driveFolders]);

  // Auth Functions
  const loginAs = (selectedRole) => {
    if (selectedRole === 'admin') {
      const adminUser = members.find(m => m.role === 'admin') || members[0];
      setCurrentUser(adminUser);
      setRole('admin');
    } else if (selectedRole === 'member') {
      const memberUser = members.find(m => m.role === 'member') || members[1];
      setCurrentUser(memberUser);
      setRole('member');
    } else {
      setCurrentUser(null);
      setRole('guest');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setRole('guest');
  };

  // Data Manipulation Handlers
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

  const addDocument = (newDoc) => {
    const doc = {
      ...newDoc,
      id: `doc-${Date.now()}`,
      uploaded_at: new Date().toISOString().split('T')[0]
    };
    setDocuments(prev => [doc, ...prev]);
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
      loginAs,
      logout,
      newsProjects,
      addNewsProject,
      members,
      updateMemberDuesStatus,
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
