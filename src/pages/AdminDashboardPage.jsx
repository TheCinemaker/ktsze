import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MemberManagement } from '../components/admin/MemberManagement';
import { NewsEditor } from '../components/admin/NewsEditor';
import { AdminSettings } from '../components/admin/AdminSettings';
import { Users, FileEdit, Database, ShieldAlert, LogOut, Crown } from 'lucide-react';

export const AdminDashboardPage = ({ setActiveTab }) => {
  const { currentUser, logout } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('members');

  return (
    <div className="py-10 bg-[#FAF6F0] min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-[#2C221E] text-white rounded-2xl p-6 sm:p-8 border-2 border-[#6B1D2F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#6B1D2F] text-white rounded-2xl flex items-center justify-center font-serif text-2xl font-bold border border-[#C5A880]">
              <Crown className="w-7 h-7 text-[#C5A880]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#C5A880] uppercase tracking-wider">
                Elnökségi Adminisztrátori Portál
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF6F0]">
                Kőszegi Turisztikai Szövetség Titkárság
              </h1>
              <p className="text-xs text-[#A39288]">
                Bejelentkezve: <strong className="text-white">{currentUser?.full_name || "Elnökség Admin"}</strong> (Jogosultság: Teljes Rendszergazda)
              </p>
            </div>
          </div>

          <button 
            onClick={() => { logout(); setActiveTab('home'); }}
            className="btn-outline-brown text-xs bg-[#5D4037] text-white border-[#C5A880] hover:bg-[#3E2723]"
          >
            <LogOut className="w-4 h-4" />
            Kijelentkezés
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex border-b border-[#E2D7C7] space-x-2">
          <button
            onClick={() => setActiveSubTab('members')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'members'
                ? 'border-[#6B1D2F] text-[#6B1D2F]'
                : 'border-transparent text-[#63534B] hover:text-[#2C221E]'
            }`}
          >
            <Users className="w-4 h-4" />
            Tagnyilvántartó & Tagdíjak
          </button>

          <button
            onClick={() => setActiveSubTab('cms')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'cms'
                ? 'border-[#6B1D2F] text-[#6B1D2F]'
                : 'border-transparent text-[#63534B] hover:text-[#2C221E]'
            }`}
          >
            <FileEdit className="w-4 h-4" />
            Hírek & Projektek CMS
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'settings'
                ? 'border-[#6B1D2F] text-[#6B1D2F]'
                : 'border-transparent text-[#63534B] hover:text-[#2C221E]'
            }`}
          >
            <Database className="w-4 h-4" />
            Rendszerbeállítások
          </button>
        </div>

        {/* Tab Content */}
        {activeSubTab === 'members' && <MemberManagement />}
        {activeSubTab === 'cms' && <NewsEditor />}
        {activeSubTab === 'settings' && <AdminSettings />}

      </div>
    </div>
  );
};
