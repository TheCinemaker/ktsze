import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';

export const CookieBanner = () => {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('ktsze_cookie_consent');
    if (!consent) {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ktsze_cookie_consent', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div
      role="region"
      aria-label="Süti tájékoztató"
      className="fixed bottom-4 left-4 right-4 z-40 animate-slide-up sm:left-6 sm:right-auto sm:max-w-md"
    >
      {/* Éjszakai felület: a sáv így egyértelműen a tartalom FÖLÖTT lebeg,
          nem pedig annak részeként olvasódik. */}
      <div className="surface-noir grain relative isolate space-y-4 overflow-hidden rounded-3xl border border-white/10 p-5 shadow-overlay">
        <div className="flex items-start gap-3.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-champagne-500/25 bg-champagne-500/[0.12] text-champagne-400">
            <Cookie className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <h2 className="font-display text-base text-ivory-100">Sütik és adatvédelem</h2>
            <p className="text-xs leading-relaxed text-ivory-400">
              Az oldal kizárólag technikai szempontból elengedhetetlen sütiket (bejelentkezési
              munkamenet, téma beállítás) használ. Reklám- vagy nyomkövető sütiket nem alkalmazunk.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-white/10 pt-3.5">
          <Link
            to="/adatvedelem"
            className="text-xs text-ivory-400 underline decoration-champagne-500/40 underline-offset-4 transition-colors hover:text-champagne-400"
          >
            Tájékoztató
          </Link>
          <button type="button" onClick={handleAccept} className="btn-gold btn-sm">
            Rendben, elfogadom
          </button>
        </div>
      </div>
    </div>
  );
};
