import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeaderLogo } from '../components/layout/HeaderLogo';
import { Lock, Mail, Key, ShieldCheck, ArrowRight, UserCheck, Building2, Crown } from 'lucide-react';

export const LoginPage = ({ setActiveTab }) => {
  const { loginAs } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (email.includes('admin')) {
      loginAs('admin');
      setActiveTab('admin-dashboard');
    } else {
      loginAs('member');
      setActiveTab('member-dashboard');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 bg-[#FAF6F0]">
      <div className="max-w-md w-full space-y-6">
        
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="inline-block p-3 bg-[#F3ECE0] rounded-2xl border border-[#C5A880] mb-2">
            <HeaderLogo />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2C221E]">
            Egyesületi Tagi & Admin Portál
          </h2>
          <p className="text-xs text-[#63534B]">
            Bejelentkezés a Kőszegi Turisztikai Szövetség zárt rendszerébe
          </p>
        </div>

        {/* Demo Quick Logins Box */}
        <div className="bg-[#F3ECE0] p-4 rounded-xl border border-[#C5A880] space-y-2">
          <div className="text-[0.7rem] text-[#6B1D2F] uppercase font-bold tracking-wider flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Gyors Demo Belépés (Elnökségi Bemutató)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { loginAs('member'); setActiveTab('member-dashboard'); }}
              className="btn-wine text-xs justify-center py-2.5 px-2"
            >
              <Building2 className="w-4 h-4" />
              Tag Belépés (Hotel)
            </button>
            <button
              onClick={() => { loginAs('admin'); setActiveTab('admin-dashboard'); }}
              className="btn-outline-brown text-xs justify-center py-2.5 px-2 bg-white"
            >
              <Crown className="w-4 h-4 text-[#6B1D2F]" />
              Admin Belépés
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2D7C7] shadow-sm space-y-4">
          <form onSubmit={handleCustomLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#2C221E] mb-1">E-mail Cím</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#63534B] absolute left-3 top-3" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tag@jurisicsvarhotel.hu"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#E2D7C7] bg-[#FAF6F0] text-[#2C221E] focus:outline-none focus:border-[#6B1D2F]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#2C221E] mb-1">Jelszó</label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#63534B] absolute left-3 top-3" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#E2D7C7] bg-[#FAF6F0] text-[#2C221E] focus:outline-none focus:border-[#6B1D2F]"
                />
              </div>
            </div>

            <button type="submit" className="btn-wine w-full justify-center py-3 text-xs uppercase font-bold tracking-wider">
              Bejelentkezés
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#63534B]">
            Még nem egyesületi tag? <button onClick={() => setActiveTab('membership')} className="text-[#6B1D2F] font-bold underline bg-transparent border-0 cursor-pointer">Csatlakozási nyilatkozat kitöltése</button>
          </div>
        </div>

      </div>
    </div>
  );
};
