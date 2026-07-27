import React, { useState } from 'react';
import { HeaderLogo } from './HeaderLogo';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Lock, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X, 
  Building,
  Building2,
  Eye,
  Crown,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { currentUser, role, loginAs, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Főoldal' },
    { id: 'about', label: 'Egyesületről' },
    { id: 'news', label: 'Programok & Hírek' },
    { id: 'docs-public', label: 'Alapszabály & Irattár' },
    { id: 'membership', label: 'Tagsági Információk' },
    { id: 'contact', label: 'Kapcsolat' },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF6F0]/95 backdrop-blur-md border-b border-[#E2D7C7] shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-16">
          
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('home')} 
            className="text-left focus:outline-none bg-transparent border-0 cursor-pointer p-0"
          >
            <HeaderLogo />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border-0 bg-transparent cursor-pointer ${
                  activeTab === item.id 
                    ? 'text-[#6B1D2F] font-bold bg-[#F7EBEF]' 
                    : 'text-[#2C221E] hover:text-[#6B1D2F] hover:bg-[#F3ECE0]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden lg:flex items-center gap-2.5">
            {role === 'guest' ? (
              <button
                onClick={() => handleNavClick('login')}
                className="btn-wine text-xs uppercase tracking-wider font-bold py-2 px-3.5"
              >
                <Lock className="w-3.5 h-3.5" />
                Tagi & Admin Belépés
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick(role === 'admin' ? 'admin-dashboard' : 'member-dashboard')}
                  className={`btn-wine text-xs uppercase tracking-wider font-bold py-2 px-3.5 ${
                    activeTab.includes('dashboard') ? 'ring-2 ring-[#C5A880]' : ''
                  }`}
                >
                  {role === 'admin' ? <Crown className="w-3.5 h-3.5" /> : <Building className="w-3.5 h-3.5" />}
                  {role === 'admin' ? 'Admin Portál' : 'Tagi Portál'}
                </button>

                <button
                  onClick={logout}
                  className="p-1.5 text-[#63534B] hover:text-[#6B1D2F] hover:bg-[#F3ECE0] rounded-lg transition-colors border-0 bg-transparent cursor-pointer"
                  title="Kijelentkezés"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#2C221E] hover:bg-[#F3ECE0] rounded-md border-0 bg-transparent cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF6F0] border-b border-[#E2D7C7] px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm font-semibold border-0 bg-transparent cursor-pointer ${
                activeTab === item.id 
                  ? 'text-[#6B1D2F] font-bold bg-[#F7EBEF]' 
                  : 'text-[#2C221E] hover:bg-[#F3ECE0]'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-3 border-t border-[#E2D7C7] flex flex-col gap-2">
            <div className="text-[0.68rem] text-[#63534B] font-semibold px-1 uppercase tracking-wider">Szerepkör (Demo)</div>
            <div className="grid grid-cols-3 gap-1.5">
              <button 
                onClick={() => { loginAs('guest'); setMobileMenuOpen(false); }}
                className={`py-1.5 text-xs rounded-md border text-center cursor-pointer flex items-center justify-center gap-1 ${role === 'guest' ? 'bg-[#6B1D2F] text-white font-bold' : 'bg-white text-[#2C221E] border-[#E2D7C7]'}`}
              >
                <Eye className="w-3 h-3" /> Látogató
              </button>
              <button 
                onClick={() => { loginAs('member'); setMobileMenuOpen(false); handleNavClick('member-dashboard'); }}
                className={`py-1.5 text-xs rounded-md border text-center cursor-pointer flex items-center justify-center gap-1 ${role === 'member' ? 'bg-[#6B1D2F] text-white font-bold' : 'bg-white text-[#2C221E] border-[#E2D7C7]'}`}
              >
                <Building2 className="w-3 h-3" /> Tag
              </button>
              <button 
                onClick={() => { loginAs('admin'); setMobileMenuOpen(false); handleNavClick('admin-dashboard'); }}
                className={`py-1.5 text-xs rounded-md border text-center cursor-pointer flex items-center justify-center gap-1 ${role === 'admin' ? 'bg-[#6B1D2F] text-white font-bold' : 'bg-white text-[#2C221E] border-[#E2D7C7]'}`}
              >
                <Crown className="w-3 h-3" /> Admin
              </button>
            </div>

            {role === 'guest' ? (
              <button
                onClick={() => handleNavClick('login')}
                className="btn-wine w-full justify-center mt-2 py-2.5 text-xs"
              >
                Tagi Belépés
              </button>
            ) : (
              <button
                onClick={() => handleNavClick(role === 'admin' ? 'admin-dashboard' : 'member-dashboard')}
                className="btn-wine w-full justify-center mt-2 py-2.5 text-xs"
              >
                {role === 'admin' ? 'Megnyitás: Admin Portál' : 'Megnyitás: Tagi Portál'}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
