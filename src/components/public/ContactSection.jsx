import React, { useState } from 'react';
import { MapPin, Mail, Phone, Clock, Send, CheckCircle } from 'lucide-react';

export const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <section className="py-16 bg-[#FAF6F0] border-t border-[#E2D7C7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-block px-3 py-1 bg-[#F7EBEF] text-[#6B1D2F] border border-[#D9AAB6] rounded-full text-xs font-semibold uppercase tracking-wider">
            Kapcsolat & Titkárság
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
            Lépjen Kapcsolatba az Egyesülettel!
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A880] mx-auto my-3"></div>
          <p className="text-[#63534B] text-base leading-relaxed">
            Kérdése van a taggá válásról, egyesületi projektekről vagy hivatalos megkereséssel élne elnökségünk felé? Titkárságunk készséggel áll rendelkezésére.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Info Card Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#F3ECE0] rounded-2xl p-8 border border-[#E2D7C7] space-y-6">
              
              <h3 className="font-serif text-xl font-bold text-[#2C221E] pb-2 border-b border-[#E2D7C7]">
                Hivatalos Elérhetőségek
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-[#6B1D2F] text-white rounded-lg shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#2C221E] block text-sm">Székhely & Titkárság:</strong>
                    <span className="text-[#63534B]">9730 Kőszeg, Rajnis utca 7.<br />(Jurisics Vár szomszédsága)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-[#6B1D2F] text-white rounded-lg shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#2C221E] block text-sm">E-mail:</strong>
                    <a href="mailto:info@koszegiturizmus.hu" className="text-[#6B1D2F] font-semibold hover:underline">
                      info@koszegiturizmus.hu
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-[#6B1D2F] text-white rounded-lg shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#2C221E] block text-sm">Telefon / Fax:</strong>
                    <span className="text-[#63534B]">+36 94 563 001</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-[#6B1D2F] text-white rounded-lg shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#2C221E] block text-sm">Ügyfélfogadási Idő:</strong>
                    <span className="text-[#63534B]">Hétfő – Csütörtök: 09:00 – 15:00<br />Péntek: 09:00 – 12:00</span>
                  </div>
                </div>
              </div>

              {/* Banking & Legal Card */}
              <div className="pt-4 border-t border-[#E2D7C7] text-xs text-[#63534B] space-y-1">
                <div><strong className="text-[#2C221E]">Adószám:</strong> 18889211-1-18</div>
                <div><strong className="text-[#2C221E]">Bankszámla:</strong> OTP Bank 11747051-20019948</div>
              </div>

            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-8 border border-[#E2D7C7] shadow-sm">
              <h3 className="font-serif text-2xl font-bold text-[#2C221E] mb-2">
                Üzenet Küldése az Elnökségnek
              </h3>
              <p className="text-xs text-[#63534B] mb-6">
                Az alábbi űrlap segítségével közvetlenül küldhet üzenetet a Kőszegi Turisztikai Szövetség Egyesületnek.
              </p>

              {submitted ? (
                <div className="p-6 bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl flex items-center gap-4 text-[#2E7D32]">
                  <CheckCircle className="w-8 h-8 shrink-0" />
                  <div>
                    <div className="font-bold text-sm">Üzenetét sikeresen rögzítettük!</div>
                    <div className="text-xs mt-0.5">Munkatársaink hamarosan válaszolnak a megadott e-mail címen.</div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-[#2C221E] mb-1">Az Ön Neve *</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Nagy István" 
                        className="w-full p-3 rounded-lg border border-[#E2D7C7] bg-[#FAF6F0] text-[#2C221E] focus:outline-none focus:border-[#6B1D2F]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#2C221E] mb-1">E-mail Címe *</label>
                      <input 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="istvan@partner.hu" 
                        className="w-full p-3 rounded-lg border border-[#E2D7C7] bg-[#FAF6F0] text-[#2C221E] focus:outline-none focus:border-[#6B1D2F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#2C221E] mb-1">Tárgy / Téma</label>
                    <input 
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="Pl. Taggá válási érdeklődés" 
                      className="w-full p-3 rounded-lg border border-[#E2D7C7] bg-[#FAF6F0] text-[#2C221E] focus:outline-none focus:border-[#6B1D2F]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#2C221E] mb-1">Üzenet *</label>
                    <textarea 
                      rows={5} 
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Írja le részletesen megkeresését..." 
                      className="w-full p-3 rounded-lg border border-[#E2D7C7] bg-[#FAF6F0] text-[#2C221E] focus:outline-none focus:border-[#6B1D2F]"
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-wine text-xs uppercase tracking-wider font-semibold py-3 px-6">
                    <Send className="w-4 h-4" />
                    Üzenet Elküldése
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
