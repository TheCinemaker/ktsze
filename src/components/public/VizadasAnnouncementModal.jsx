import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, X, Sparkles, Heart } from 'lucide-react';

export const VizadasAnnouncementModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Ellenőrizzük, hogy ebben a munkamenetben látta-e már a felugró ablakot
    const hasSeenModal = sessionStorage.getItem('ktsze_vizadas_modal_seen');
    if (!hasSeenModal) {
      // 1.2 másodperc múlva lágyan felugrik
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('ktsze_vizadas_modal_seen', 'true');
    setIsOpen(false);
  };

  const handleGoToVizadas = () => {
    sessionStorage.setItem('ktsze_vizadas_modal_seen', 'true');
    setIsOpen(false);
    navigate('/viragos-koszeg');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/70 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border-2 border-emerald-400 animate-scale-up space-y-0"
        role="dialog"
        aria-modal="true"
      >
        {/* Bezárás gomb */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors focus:outline-none"
          aria-label="Bezárás"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Kép légiós borító */}
        <div className="relative h-56 w-full overflow-hidden bg-emerald-900">
          <img
            src="/vizadas_photo.jpg"
            alt="Vízadás Kőszegen Önkéntes Faöntözés"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/30 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 space-y-1 text-white">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-xs font-extrabold shadow-md">
              <Droplets className="h-3.5 w-3.5 text-emerald-200" />
              POLGÁRMESTERI &amp; FŐKERTÉSZI FELHÍVÁS 🌳
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-extrabold leading-tight text-white drop-shadow-md">
              ÖNKENÉTES FAÖNTÖZÉS — „VÍZADÁS” KŐSZEGEN!
            </h3>
          </div>
        </div>

        {/* Tartalom */}
        <div className="p-6 space-y-5 text-ink-800 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 leading-relaxed">
            <p className="font-bold text-emerald-950">
              Pintér Gábor főkertész és Básthy Béla polgármester kéréssel fordul minden segítő szándékú kőszegihez!
            </p>
            <p className="text-ink-700">
              A nagy hőségben a házatok előtt vagy közelében található fiatal fákat segítsétek öntözéssel! Akár egyetlen vödör víz is életmentő lehet a szomjazó fáknak.
            </p>
          </div>

          {/* Gombok */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleGoToVizadas}
              className="w-full text-base font-extrabold rounded-2xl py-4 px-6 flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl transition-all transform active:scale-95 border-b-4 border-emerald-800"
            >
              <Droplets className="h-6 w-6 text-emerald-200" />
              <span>💧 Csatlakozom a Vízadáshoz! (Kattints ide)</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-full text-xs font-bold text-ink-500 hover:text-ink-800 py-2 transition-colors text-center"
            >
              Mégse / Később megnézem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
