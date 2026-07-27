import React from 'react';
import { Target, Compass, Landmark, ShieldCheck, HeartHandshake, Award, Flower2, Sparkles, Building2 } from 'lucide-react';

export const AboutSection = ({ setActiveTab }) => {
  const boardMembers = [
    {
      name: "Drescher Gábor",
      role: "Az Egyesület Elnöke",
      organization: "Kőszegi Turisztikai Szövetség Egyesület",
      bio: "A kőszegi turisztikai szereplők szakmai összefogásáért és az önkormányzati stratégiai együttműködésekért felel."
    },
    {
      name: "Szalók Adrienn",
      role: "Vezetőségi Tag / Képviselő",
      organization: "KTSZE Elnökség",
      bio: "A városszépítő munkacsoportok és a helyi vállalkozói közösségi kezdeményezések koordinátora."
    },
    {
      name: "Szekér Zoltán",
      role: "Turisztikai Menedzser",
      organization: "Jurisics-vár Művelődési Központ & Várszínház",
      bio: "Az őszi forgalomnövelő kampányok, a Kőszegi Esték és a B2B szakmai nyílt napok turisztikai felelőse."
    }
  ];

  const initiatives = [
    {
      title: "„Kőszeg Virágzik” Munkacsoport",
      desc: "Főtéri kaspók és virágládák örökbefogadása, virágos sarkok gondozása a városi kertész szakmai irányításával.",
      icon: Flower2
    },
    {
      title: "Őszi Forgalomnövelő Kampányok",
      desc: "Aktív & gasztronómiai programkínálat, Kőszegi Esték zenés sorozat, kuponfüzet és digitális csomagok.",
      icon: Sparkles
    },
    {
      title: "B2B Nyílt Nap & Média Study Tour",
      desc: "Szeptemberi szakmai nyílt nap a Jurisics Vár és a kőszegi turisztikai attrakciók bemutatására a partnerhálózat felé.",
      icon: Building2
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
            Kőszegi Turisztikai Szövetség Egyesület
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A880] mx-auto my-3"></div>
          <p className="text-[#63534B] text-base leading-relaxed font-serif italic text-lg">
            „Kőszeg virágzik – a város tisztul, szépül, él és újra vendéget vár.”
          </p>
        </div>

        {/* Real Board Members */}
        <div className="bg-[#F3ECE0] rounded-2xl p-8 border border-[#E2D7C7] mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#2C221E]">
                Az Egyesület Vezetősége & Szakmai Partnerei
              </h3>
              <p className="text-sm text-[#63534B] mt-1">
                Kőszeg Város Önkormányzatával és a Jurisics-vár Művelődési Központtal szoros együttműködésben.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('docs-public')}
              className="btn-wine-outline text-xs uppercase tracking-wider font-semibold self-start md:self-auto"
            >
              Polgármesteri Programfüzet (2026. Július)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boardMembers.map((member, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-[#E2D7C7] space-y-2 shadow-sm">
                <div className="font-serif text-xl font-bold text-[#6B1D2F]">
                  {member.name}
                </div>
                <div className="text-xs font-bold text-[#2C221E]">
                  {member.role}
                </div>
                <div className="text-xs text-[#6B1D2F] font-semibold">
                  {member.organization}
                </div>
                <p className="text-xs text-[#63534B] pt-2 border-t border-[#FAF6F0] leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Active Initiatives from July 2026 Action Plan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {initiatives.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="card-editorial space-y-4">
                <div className="w-12 h-12 bg-[#F7EBEF] text-[#6B1D2F] rounded-xl flex items-center justify-center border border-[#D9AAB6]">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#2C221E]">
                  {item.title}
                </h3>
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
