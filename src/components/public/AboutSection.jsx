import React from 'react';
import { Target, Compass, Landmark, ShieldCheck, HeartHandshake, Award, Flower2, Sparkles, Building2, Laptop, Hotel, UtensilsCrossed } from 'lucide-react';

export const AboutSection = ({ setActiveTab }) => {
  const boardMembers = [
    {
      name: "Drescher Gábor",
      role: "Az Egyesület Elnöke",
      organization: "Kőszegi Turisztikai Szövetség Egyesület",
      icon: Award,
      bio: "A kőszegi turisztikai szereplők szakmai összefogásáért és az önkormányzati stratégiai együttműködésekért felel."
    },
    {
      name: "Szalók Adrienn",
      role: "Alelnök Asszony",
      organization: "KTSZE Elnökség",
      icon: Flower2,
      bio: "A városszépítő és „Kőszeg virágzik” munkacsoportok, valamint a virágosítási kezdeményezések felelőse."
    },
    {
      name: "Farkas Péter",
      role: "Alelnök",
      organization: "Ibrahim Boutique Hotel",
      icon: Hotel,
      bio: "A minőségi szálláshelyi tagozat, vendégélmény-csomagok és boutique turizmus képviselője."
    },
    {
      name: "Vörös Róbert",
      role: "Alelnök",
      organization: "Portré Étterem és Panzió",
      icon: UtensilsCrossed,
      bio: "A kőszegi gasztronómia, belvárosi vendéglátás és az őszi forgalomnövelő Kőszegi Esték felelőse."
    },
    {
      name: "Avar Szilveszter",
      role: "Alelnök",
      organization: "SA Software",
      icon: Laptop,
      bio: "A „Digitális Kőszegért” munkacsoport felelőse: egyesületi webes platform, tagi portál és digitális edukáció."
    },
    {
      name: "Szekér Zoltán",
      role: "Turisztikai Menedzser",
      organization: "Jurisics-vár Művelődési Központ & Várszínház",
      icon: Landmark,
      bio: "Az őszi programkínálat, a színházi kommunikáció és a szeptemberi B2B Nyílt Nap turisztikai koordinátora."
    }
  ];

  const initiatives = [
    {
      title: "„Kőszeg Virágzik” Munkacsoport",
      leader: "Szalók Adrienn Alelnök vezetésével",
      desc: "Főtéri kaspók és virágládák örökbefogadása, virágos sarkok gondozása a városi kertész szakmai irányításával.",
      icon: Flower2
    },
    {
      title: "„Digitális Kőszegért” Munkacsoport",
      leader: "Avar Szilveszter Alelnök (SA Software) vezetésével",
      desc: "Egyesületi digitális platform, tagi portál, kétirányú Google Drive integráció és B2B edukációs akciónapok.",
      icon: Laptop
    },
    {
      title: "Őszi Forgalomnövelés & B2B Nyílt Nap",
      leader: "Szekér Zoltán, Farkas Péter & Vörös Róbert Alelnökök",
      desc: "Aktív & gasztro csomagok, Kőszegi Esték sorozat, kuponfüzet és szeptemberi B2B Szakmai Nyílt Nap & Média Study Tour.",
      icon: Sparkles
    }
  ];

  return (
    <section className="py-16 bg-[#FAF6F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-block px-3.5 py-1 bg-[#F7EBEF] text-[#6B1D2F] border border-[#D9AAB6] rounded-full text-xs font-semibold uppercase tracking-wider">
            Egyesületünkről & Elnökségünkről
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
            A Kőszegi Turisztikai Szövetség Egyesület Vezetősége
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A880] mx-auto my-3"></div>
          <p className="text-[#63534B] text-base leading-relaxed font-serif italic text-lg">
            „Kőszeg virágzik – a város tisztul, szépül, él és újra vendéget vár.”
          </p>
        </div>

        {/* Real Board Members Grid */}
        <div className="bg-[#F3ECE0] rounded-2xl p-6 sm:p-8 border border-[#E2D7C7] mb-12 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#2C221E]">
                Az Egyesület Hivatalos Elnöksége (2026)
              </h3>
              <p className="text-xs sm:text-sm text-[#63534B] mt-1">
                Kőszeg Város Önkormányzatával (Básthy Béla Polgármester) és a Jurisics-vár Művelődési Központtal szoros együttműködésben.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('docs-public')}
              className="btn-wine-outline text-xs uppercase tracking-wider font-semibold self-start md:self-auto"
            >
              Polgármesteri Programfüzet (2026. Július)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boardMembers.map((member, idx) => {
              const Icon = member.icon || Award;
              return (
                <div key={idx} className="bg-white p-6 rounded-xl border border-[#E2D7C7] hover:border-[#C5A880] space-y-2 shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-xl font-bold text-[#6B1D2F]">
                      {member.name}
                    </span>
                    <div className="p-2 bg-[#F7EBEF] text-[#6B1D2F] rounded-lg border border-[#D9AAB6]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <div className="text-xs font-bold text-[#2C221E]">
                    {member.role}
                  </div>
                  <div className="text-xs text-[#6B1D2F] font-semibold">
                    {member.organization}
                  </div>
                  <p className="text-xs text-[#63534B] pt-2.5 border-t border-[#FAF6F0] leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3 Active Workgroups */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {initiatives.map((item, idx) => {
            const Icon = item.icon || Award;
            return (
              <div key={idx} className="card-editorial space-y-4">
                <div className="w-12 h-12 bg-[#F7EBEF] text-[#6B1D2F] rounded-xl flex items-center justify-center border border-[#D9AAB6]">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#2C221E]">
                    {item.title}
                  </h3>
                  <div className="text-xs text-[#6B1D2F] font-semibold mt-0.5">
                    {item.leader}
                  </div>
                </div>
                <p className="text-xs text-[#63534B] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
