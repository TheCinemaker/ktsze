import React from 'react';
import { HeaderLogo } from './HeaderLogo';
import { Mail, Phone, MapPin, FileText, ShieldCheck, User } from 'lucide-react';

export const Footer = ({ setActiveTab }) => {
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
              <li><strong className="text-white">Elnök:</strong> Drescher Gábor</li>
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
                <a href="mailto:elnok@koszegiturizmus.hu" className="hover:text-[#C5A880] transition-colors">
                  elnok@koszegiturizmus.hu
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>+36 94 563 001</span>
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

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A39288] gap-4">
          <p>© 2026 Kőszegi Turisztikai Szövetség Egyesület. Minden jog fenntartva.</p>
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
