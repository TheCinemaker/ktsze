import React, { useState } from 'react';
import { Shield, ArrowRight, BookOpen, Award, Users, Landmark } from 'lucide-react';

export const HeroSection = ({ setActiveTab }) => {
  const [heroImageError, setHeroImageError] = useState(false);

  return (
    <section className="relative bg-[#FAF6F0] pt-8 sm:pt-14 pb-16 sm:pb-20 overflow-hidden border-b border-[#E2D7C7]">
      {/* Decorative Warm Background Accents */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 sm:w-96 h-80 sm:h-96 bg-[#F3ECE0] rounded-full blur-3xl opacity-70 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 sm:w-80 h-64 sm:h-80 bg-[#F7EBEF] rounded-full blur-3xl opacity-60 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Text */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 bg-[#F7EBEF] border border-[#D9AAB6] px-3.5 py-1.5 rounded-full">
              <Shield className="w-4 h-4 text-[#6B1D2F]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B1D2F]">
                Hivatalos Egyesületi Portál • 2026
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#2C221E] leading-[1.15]">
              A Kőszegi Turizmus <br />
              <span className="text-[#6B1D2F]">Szakmai Összefogása</span>
            </h1>

            <p className="text-sm sm:text-base text-[#63534B] leading-relaxed max-w-2xl font-normal">
              A Kőszegi Turisztikai Szövetség Egyesület a kőszegi szállásadók, vendéglátók, borászok és kulturális szereplők közös szövetsége. Célunk Kőszeg történelmi és természetrajzi értékeinek méltó képviselete, a turisztikai fejlesztési stratégiák koordinálása és tagjaink szakmai támogatása.
            </p>

            {/* Key Pillars */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2 border-t border-[#E2D7C7] max-w-xl">
              <div className="space-y-0.5 sm:space-y-1">
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#6B1D2F]">15+</div>
                <div className="text-[0.7rem] sm:text-xs text-[#63534B]">Éves Szakmai Múlt</div>
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#6B1D2F]">40+</div>
                <div className="text-[0.7rem] sm:text-xs text-[#63534B]">Egyesületi Tagvállalkozás</div>
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#6B1D2F]">100%</div>
                <div className="text-[0.7rem] sm:text-xs text-[#63534B]">Közhasznú Működés</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={() => setActiveTab('news')}
                className="btn-wine text-xs sm:text-sm py-3 px-6 shadow-sm w-full sm:w-auto"
              >
                <span>Készülő Programok & Hírek</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setActiveTab('docs-public')}
                className="btn-outline-brown text-xs sm:text-sm py-3 px-6 w-full sm:w-auto"
              >
                <BookOpen className="w-4 h-4 text-[#6B1D2F]" />
                <span>Alapszabály & Beszámolók</span>
              </button>
            </div>

          </div>

          {/* Right Column: High Quality Heritage Card Visual */}
          <div className="lg:col-span-5 mt-4 lg:mt-0">
            <div className="relative">
              
              {/* Main Image Frame with Gold Border Accent */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-[#C5A880] group bg-[#F3ECE0]">
                {!heroImageError ? (
                  <img 
                    src="https://images.unsplash.com/photo-1548625361-185b376d8b37?auto=format&fit=crop&w=1000&q=80" 
                    alt="Kőszeg Történelmi Belvárosa" 
                    onError={() => setHeroImageError(true)}
                    className="w-full h-80 sm:h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-80 sm:h-[400px] bg-gradient-to-br from-[#6B1D2F] to-[#2C221E] text-white flex flex-col items-center justify-center p-8 text-center">
                    <Landmark className="w-16 h-16 text-[#C5A880] mb-3" />
                    <h3 className="font-serif text-2xl font-bold">Kőszegi Turisztikai Szövetség</h3>
                    <p className="text-xs text-[#E2D7C7] mt-2 max-w-xs">Történelmi és Természeti Örökségünk Védelmében</p>
                  </div>
                )}
                
                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C221E]/80 via-transparent to-transparent pointer-events-none"></div>

                {/* Floating Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 p-3.5 sm:p-4 bg-[#FAF6F0]/95 backdrop-blur-md rounded-xl border border-[#C5A880]/50 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-2.5 bg-[#6B1D2F] text-white rounded-lg shrink-0">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-xs sm:text-sm font-bold text-[#2C221E]">
                        Kőszegi Turisztikai Stratégia 2026–2030
                      </h4>
                      <p className="text-[0.7rem] text-[#63534B] mt-0.5">
                        Előkészítés alatt álló egyesületi fejlesztési munkaterv.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
