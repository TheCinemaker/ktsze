import React from 'react';
import { HeaderLogo } from './HeaderLogo';
import { Mail, Phone, MapPin, FileText, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Footer = ({ setActiveTab }) => {
  const { members } = useAuth();
  const president = members.find(m => m.custom_title?.toLowerCase().includes('elnök') || m.member_category === 'Elnökségi tag') || members[0];

  return (
    <footer className="bg-[#2C221E] text-[#FAF6F0] pt-14 pb-8 border-t-4 border-[#6B1D2F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-[#5D4037]">
          
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="bg-[#FAF6F0] p-3 rounded-lg inline-block">
              <HeaderLogo />
            </div>
            <p className="text-xs text-[#A39288] leading-relaxed">
              A Kőszegi Turisztikai Szövetség Egyesület a helyi turisztikai szolgáltatók, borászok és kulturális szereplők hivatalos szakmai szövetsége Kőszegen.
            </p>
            <p className="text-xs text-[#C5A880] font-serif italic">
              „Kőszeg virágzik – a város tisztul, szépül, él és újra vendéget vár.”
            </p>
          </div>

          {/* Col 2: Hivatalos Adatok */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold text-[#C5A880] tracking-wide">
              Egyesületi Adatok
            </h4>
            <ul className="space-y-2 text-xs text-[#E2D7C7]">
              <li><strong className="text-white">Név:</strong> Kőszegi Turisztikai Szövetség Egyesület</li>
              <li><strong className="text-white">Elnökség:</strong> {president ? (president.full_name + (president.custom_title ? ` (${president.custom_title})` : '')) : 'Regisztrált Vezetőség'}</li>
              <li><strong className="text-white">Adószám:</strong> 18889211-1-18</li>
              <li><strong className="text-white">Nyilvántartási szám:</strong> 18-02-0001234</li>
              <li><strong className="text-white">Bankszámla:</strong> OTP 11747051-20019948</li>
            </ul>
          </div>

          {/* Col 3: Kapcsolat & Székhely */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold text-[#C5A880] tracking-wide">
              Kapcsolat & Titkárság
            </h4>
            <div className="space-y-2 text-xs text-[#E2D7C7]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>9730 Kőszeg, Rajnis utca 7.<br />(Jurisics Vár szomszédsága)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C5A880] shrink-0" />
                <a href={`mailto:${president?.account_email || 'info@koszegiturizmus.hu'}`} className="hover:text-[#C5A880] transition-colors">
                  {president?.account_email || 'info@koszegiturizmus.hu'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>{president?.phone || '+36 94 563 001'}</span>
              </div>
            </div>
          </div>

          {/* Col 4: Dokumentumok & Gyorslinkek */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold text-[#C5A880] tracking-wide">
              Hivatalos Dokumentumok
            </h4>
            <ul className="space-y-2 text-xs text-[#E2D7C7]">
              <li>
                <button 
                  onClick={() => setActiveTab('docs-public')}
                  className="hover:text-[#C5A880] transition-colors flex items-center gap-1.5 bg-transparent border-0 text-[#E2D7C7] cursor-pointer p-0"
                >
                  <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
                  Polgármesteri Programfüzet (2026. Július)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('docs-public')}
                  className="hover:text-[#C5A880] transition-colors flex items-center gap-1.5 bg-transparent border-0 text-[#E2D7C7] cursor-pointer p-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                  Hatályos Alapszabály
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('membership')}
                  className="hover:text-[#C5A880] transition-colors flex items-center gap-1.5 bg-transparent border-0 text-[#E2D7C7] cursor-pointer p-0"
                >
                  <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
                  Kőszeg Virágzik Munkacsoport
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & Developer attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A39288] gap-4">
          <div>
            <p>© 2026 Kőszegi Turisztikai Szövetség Egyesület. Minden jog fenntartva.</p>
            <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">
              Software by <a href="mailto:admin@visitkoszeg.hu" className="text-[#C5A880] hover:underline font-semibold transition-colors">SA Software & Network Solutions</a>
            </p>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => setActiveTab('docs-public')}>Adatvédelem & Impresszum</span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => setActiveTab('login')}>Tagi Belépés</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
