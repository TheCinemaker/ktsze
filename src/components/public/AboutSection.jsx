import React from 'react';
import { Target, Compass, Landmark, ShieldCheck, HeartHandshake, Award } from 'lucide-react';

export const AboutSection = ({ setActiveTab }) => {
  const boardMembers = [
    {
      name: "Dr. Kőszegi László",
      role: "Az Egyesület Elnöke",
      organization: "Jurisics Vár Kulturális Központ",
      bio: "Több mint 20 éve dolgozik a kőszegi turizmus és kulturális örökségvédelmi feladatok összehangolásán."
    },
    {
      name: "Horváth Ágnes",
      role: "Alelnök (Szálláshelyi Tagozat)",
      organization: "Írottkő Panzió",
      bio: "A kőszegi magán- és hotelturizmus érdekképviseletét vezeti az egyesületben."
    },
    {
      name: "Bujdosó Péter",
      role: "Elnökségi Tag (Gasztronómia & Borászat)",
      organization: "Kőszegi Borműhely",
      bio: "A kőszegi borvidék és a helyi gasztronómia turisztikai beágyazottságáért felel."
    }
  ];

  return (
    <section className="py-16 bg-[#FAF6F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-block px-3 py-1 bg-[#F7EBEF] text-[#6B1D2F] border border-[#D9AAB6] rounded-full text-xs font-semibold uppercase tracking-wider">
            Egyesületünkről
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
            A Kőszegi Turisztikai Szövetség Egyesület Küldetése
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A880] mx-auto my-3"></div>
          <p className="text-[#63534B] text-base leading-relaxed">
            Egyesületünk független, nem profit-orientált civil szervezet, amely összefogja Kőszeg város turisztikai szolgáltatóit, szakmai érdekeit képviseli és felvállalja a helyi turizmus hosszú távú, fenntartható fejlesztését.
          </p>
        </div>

        {/* 3 Core Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          <div className="card-editorial space-y-4">
            <div className="w-12 h-12 bg-[#F7EBEF] text-[#6B1D2F] rounded-lg flex items-center justify-center border border-[#D9AAB6]">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#2C221E]">
              Szakmai Érdekképviselet
            </h3>
            <p className="text-sm text-[#63534B] leading-relaxed">
              Összefogjuk a helyi szállásadókat, borászokat és éttermeket. Párbeszédet tartunk fent az önkormányzattal és a nemzeti turisztikai szervekkel.
            </p>
          </div>

          <div className="card-editorial space-y-4">
            <div className="w-12 h-12 bg-[#F7EBEF] text-[#6B1D2F] rounded-lg flex items-center justify-center border border-[#D9AAB6]">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#2C221E]">
              Stratégiai Tervezés
            </h3>
            <p className="text-sm text-[#63534B] leading-relaxed">
              Előkészítjük a kőszegi turisztikai fejlesztési koncepciókat, közös pályázatokat nyújtunk be a tagság fejlődése érdekében.
            </p>
          </div>

          <div className="card-editorial space-y-4">
            <div className="w-12 h-12 bg-[#F7EBEF] text-[#6B1D2F] rounded-lg flex items-center justify-center border border-[#D9AAB6]">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#2C221E]">
              Örökségvédelem & Minőség
            </h3>
            <p className="text-sm text-[#63534B] leading-relaxed">
              Kőszeg egyedülálló történelmi belvárosának, kőszegi borának és natúrparki értékeinek védelme, fenntartható bemutatása.
            </p>
          </div>

        </div>

        {/* Board of Directors / Elnökség */}
        <div className="bg-[#F3ECE0] rounded-2xl p-8 border border-[#E2D7C7]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#2C221E]">
                Az Egyesület Elnöksége
              </h3>
              <p className="text-sm text-[#63534B] mt-1">
                A tagság által megválasztott tisztségviselők (2024–2028-as ciklus)
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('docs-public')}
              className="btn-wine-outline text-xs uppercase tracking-wider font-semibold self-start md:self-auto"
            >
              Közgyűlési Jegyzőkönyvek & Beszámolók
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boardMembers.map((member, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-[#E2D7C7] space-y-2 shadow-sm">
                <div className="font-serif text-lg font-bold text-[#6B1D2F]">
                  {member.name}
                </div>
                <div className="text-xs font-semibold text-[#2C221E]">
                  {member.role}
                </div>
                <div className="text-xs text-[#6B1D2F] font-medium">
                  {member.organization}
                </div>
                <p className="text-xs text-[#63534B] pt-2 border-t border-[#FAF6F0] leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
