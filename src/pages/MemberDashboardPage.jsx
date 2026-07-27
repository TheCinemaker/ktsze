import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MembershipDues } from '../components/member/MembershipDues';
import { DocumentVault } from '../components/member/DocumentVault';
import { DriveConnector } from '../components/member/DriveConnector';
import { CreditCard, FileText, FolderGit2, Building2, LogOut } from 'lucide-react';

export const MemberDashboardPage = ({ setActiveTab }) => {
  const { currentUser, logout } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('dues');

  return (
    <div className="py-10 bg-[#FAF6F0] min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-[#F3ECE0] rounded-2xl p-6 sm:p-8 border border-[#E2D7C7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#6B1D2F] text-white rounded-2xl flex items-center justify-center font-serif text-2xl font-bold shadow-md">
              {currentUser?.organization_name?.charAt(0) || "T"}
            </div>
            <div>
              <div className="text-xs font-semibold text-[#6B1D2F] uppercase tracking-wider">
                Egyesületi Tagi Portál
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C221E]">
                {currentUser?.organization_name || "Jurisics Vár Hotel & Étterem"}
              </h1>
              <p className="text-xs text-[#63534B]">
                Képviselő: <strong className="text-[#2C221E]">{currentUser?.full_name || "Nagy István"}</strong> ({currentUser?.email})
              </p>
            </div>
          </div>

          <button 
            onClick={() => { logout(); setActiveTab('home'); }}
            className="btn-outline-brown text-xs uppercase tracking-wider font-semibold shrink-0"
          >
            <LogOut className="w-4 h-4 text-[#6B1D2F]" />
            Kijelentkezés
          </button>
        </div>

        {/* Member Sub-Navigation */}
        <div className="flex border-b border-[#E2D7C7] space-x-2">
          <button
            onClick={() => setActiveSubTab('dues')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'dues'
                ? 'border-[#6B1D2F] text-[#6B1D2F]'
                : 'border-transparent text-[#63534B] hover:text-[#2C221E]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Tagdíj Kezelés
          </button>

          <button
            onClick={() => setActiveSubTab('docs')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'docs'
                ? 'border-[#6B1D2F] text-[#6B1D2F]'
                : 'border-transparent text-[#63534B] hover:text-[#2C221E]'
            }`}
          >
            <FileText className="w-4 h-4" />
            Belső Dokumentumtár
          </button>

          <button
            onClick={() => setActiveSubTab('drive')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'drive'
                ? 'border-[#6B1D2F] text-[#6B1D2F]'
                : 'border-transparent text-[#63534B] hover:text-[#2C221E]'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            Google Drive Mappák
          </button>
        </div>

        {/* Tab Content */}
        {activeSubTab === 'dues' && <MembershipDues />}
        {activeSubTab === 'docs' && <DocumentVault />}
        {activeSubTab === 'drive' && <DriveConnector />}

      </div>
    </div>
  );
};
