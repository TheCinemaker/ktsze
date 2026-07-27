import React, { useState } from 'react';
import { CheckCircle2, FileText, Download, Building2, UtensilsCrossed, Wine, Users2, Flower2, Sparkles } from 'lucide-react';

export const MembershipInfo = ({ setActiveTab }) => {
  const [showAppModal, setShowAppModal] = useState(false);
  const [showViragzikModal, setShowViragzikModal] = useState(false);

  const benefits = [
    "Szakmai érdekképviselet Kőszeg Város Önkormányzatánál és a Jurisics-vár Művelődési Központnál.",
    "Részvétel a „Kőszeg virágzik” városszépítő és kaspó örökbefogadási programban.",
    "Megjelenés az őszi forgalomnövelő kampányokban, kuponfüzetben és a Kőszegi Esték sorozatban.",
    "Díjmentes részvétel a szeptemberi B2B Szakmai Nyílt Napon és Média Study Tour-on.",
    "Digitális segítségnyújtás (edukációs akciónapok a beállítások és online felületek kezeléséhez)."
  ];

  const categories = [
    {
      title: "Magánszálláshelyek & Vendégházak",
      icon: Building2,
      fee: "24 000 Ft / év",
      desc: "Kőszegi és környékbeli magánszállások, aparthotelek számára."
    },
    {
      title: "Hotelek, Éttermek & Borászatok",
      icon: UtensilsCrossed,
      fee: "36 000 Ft / év",
      desc: "Közepes és nagyobb turisztikai vállalkozások, borkészítők részére."
    },
    {
      title: "Pártoló Tagok & Civil Szervezetek",
      icon: Users2,
      fee: "15 000 Ft / év",
      desc: "Magánszemélyek és partner egyesületek, akik támogatják céljainkat."
    }
  ];

  return (
    <section className="py-16 bg-[#FAF6F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Special Banner: Kőszeg Virágzik Munkacsoport */}
        <div className="bg-[#6B1D2F] text-white rounded-2xl p-6 sm:p-8 border-2 border-[#C5A880] shadow-xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-[#FAF3E8] text-[#7A5B2E] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Flower2 className="w-4 h-4 text-[#6B1D2F]" />
              Kiemelt Kezdeményezés • 2026
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Csatlakozz a „Kőszeg virágzik” Munkacsoporthoz!
            </h3>
            <p className="text-xs sm:text-sm text-[#F7EBEF] max-w-2xl leading-relaxed">
              Örökbefogadható kaspók, virágládák és virágos sarkok gondozása Kőszeg belvárosában. Várjuk azon vállalkozók és lakosok jelentkezését, akik tenni szeretnének városunk szebbé tételéért!
            </p>
          </div>

          <button 
            onClick={() => setShowViragzikModal(true)}
            className="btn-wine bg-[#FAF6F0] text-[#6B1D2F] hover:bg-[#F3ECE0] border-[#FAF6F0] text-xs font-bold uppercase tracking-wider shrink-0 py-3 px-6 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-[#6B1D2F]" />
            Jelentkezés a Munkacsoportba
          </button>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-block px-3 py-1 bg-[#F7EBEF] text-[#6B1D2F] border border-[#D9AAB6] rounded-full text-xs font-semibold uppercase tracking-wider">
            Csatlakozás az Egyesülethez
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
            Legyen Ön is a Kőszegi Turizmus Aktív Formálója!
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A880] mx-auto my-3"></div>
          <p className="text-[#63534B] text-base leading-relaxed">
            Várjuk sorainkba mindazon kőszegi és kőszeg-hegyaljai turisztikai szolgáltatókat, akik elkötelezettek a minőségi vendéglátás és a közös fejlődés mellett.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="bg-white rounded-2xl p-8 border border-[#E2D7C7] shadow-sm mb-12">
          <h3 className="font-serif text-2xl font-bold text-[#2C221E] mb-6">
            Miért Érdemes Csatlakozni Egyesületünkhöz?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E2D7C7]">
                <CheckCircle2 className="w-5 h-5 text-[#6B1D2F] shrink-0 mt-0.5" />
                <span className="text-xs text-[#2C221E] font-medium leading-relaxed">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dues Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="card-editorial flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-[#F7EBEF] text-[#6B1D2F] rounded-xl flex items-center justify-center border border-[#D9AAB6]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-[#2C221E]">
                    {cat.title}
                  </h4>
                  <p className="text-xs text-[#63534B]">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E2D7C7]">
                  <div className="text-xs text-[#63534B] uppercase tracking-wider">Éves Tagdíj</div>
                  <div className="font-serif text-2xl font-bold text-[#6B1D2F] mt-1">
                    {cat.fee}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Download & Apply CTA */}
        <div className="bg-[#F3ECE0] rounded-2xl p-8 border-2 border-[#C5A880] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-2xl font-bold text-[#2C221E]">
              Belépési Nyilatkozat Letöltése
            </h3>
            <p className="text-xs text-[#63534B]">
              Töltse ki a belépési kérelmet, juttassa el egyesületünkhöz, és az elnökség soron következő ülésén elbírálja azt.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button 
              onClick={() => setShowAppModal(true)}
              className="btn-wine text-xs uppercase tracking-wider font-semibold"
            >
              <Download className="w-4 h-4" />
              Nyilatkozat Kitöltése
            </button>
            <button 
              onClick={() => setActiveTab('login')}
              className="btn-outline-brown text-xs uppercase tracking-wider font-semibold"
            >
              Már Tag Vagyok (Belépés)
            </button>
          </div>
        </div>

        {/* Kőszeg Virágzik Modal */}
        {showViragzikModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#FAF6F0] rounded-2xl max-w-lg w-full p-6 border-2 border-[#C5A880] shadow-2xl relative">
              <h3 className="font-serif text-2xl font-bold text-[#2C221E] mb-2 flex items-center gap-2">
                <Flower2 className="w-6 h-6 text-[#6B1D2F]" />
                Jelentkezés: „Kőszeg virágzik” Munkacsoport
              </h3>
              <p className="text-xs text-[#63534B] mb-4">
                Kérjük, adja meg adatait! Drescher Gábor elnök és a munkacsoport-vezető felveszi Önnel a kapcsolatot a kaspó örökbefogadás és virágosítás koordinálása céljából.
              </p>
              
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#2C221E] font-semibold mb-1">Vállalkozás v. Család Neve *</label>
                  <input type="text" placeholder="Pl. Jurisics Vár Étterem / Kovács Család" className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]" />
                </div>
                <div>
                  <label className="block text-[#2C221E] font-semibold mb-1">Kapcsolattartó Neve *</label>
                  <input type="text" placeholder="Kovács János" className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]" />
                </div>
                <div>
                  <label className="block text-[#2C221E] font-semibold mb-1">E-mail Cím *</label>
                  <input type="email" placeholder="janos@partner.hu" className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]" />
                </div>
                <div>
                  <label className="block text-[#2C221E] font-semibold mb-1">Mivel szeretne hozzájárulni?</label>
                  <select className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]">
                    <option>Főtéri kaspó / virágláda örökbefogadása</option>
                    <option>Saját üzlet / panzió előtti virágos sarok gondozása</option>
                    <option>Locsolási és gyomlálási segítségnyújtás</option>
                    <option>Növény- és virágfelajánlás</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button 
                  onClick={() => setShowViragzikModal(false)}
                  className="btn-outline-brown text-xs"
                >
                  Mégse
                </button>
                <button 
                  onClick={() => {
                    alert("Köszönjük jelentkezését! Drescher Gábor elnök és a munkacsoport vezetője hamarosan felveszi Önnel a kapcsolatot.");
                    setShowViragzikModal(false);
                  }}
                  className="btn-wine text-xs"
                >
                  Jelentkezés Beküldése
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Application Modal */}
        {showAppModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#FAF6F0] rounded-2xl max-w-lg w-full p-6 border-2 border-[#C5A880] shadow-2xl relative">
              <h3 className="font-serif text-xl font-bold text-[#2C221E] mb-2">
                Taggá Válási Nyilatkozat Kérelem
              </h3>
              <p className="text-xs text-[#63534B] mb-4">
                Kérjük, adja meg elérhetőségeit. Az egyesületi titkárság felveszi Önnel a kapcsolatot a belépési nyilatkozat aláírása kapcsán.
              </p>
              
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#2C221E] font-semibold mb-1">Vállalkozás / Szervezet Neve</label>
                  <input type="text" placeholder="Pl. Kőszegi Vár Panzió Kft." className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]" />
                </div>
                <div>
                  <label className="block text-[#2C221E] font-semibold mb-1">Kapcsolattartó Neve</label>
                  <input type="text" placeholder="Kovács János" className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]" />
                </div>
                <div>
                  <label className="block text-[#2C221E] font-semibold mb-1">E-mail Cím</label>
                  <input type="email" placeholder="info@kovacspanzio.hu" className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]" />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button 
                  onClick={() => setShowAppModal(false)}
                  className="btn-outline-brown text-xs"
                >
                  Mégse
                </button>
                <button 
                  onClick={() => {
                    alert("Köszönjük! Kérelmét rögzítettük. Munkatársunk hamarosan keresni fogja.");
                    setShowAppModal(false);
                  }}
                  className="btn-wine text-xs"
                >
                  Kérelem Beküldése
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
