import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cookie } from 'lucide-react';

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
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-40 animate-slide-up">
      <div className="surface p-5 bg-ink-900 text-sand-100 rounded-2xl shadow-overlay border border-sand-700/30 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-wine-600 text-white">
            <Cookie className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-sm font-bold text-white">Sütik &amp; Adatvédelem</h3>
            <p className="text-xs text-sand-300 leading-relaxed">
              Az oldal kizárólag technikai szempontból elengedhetetlen sütiket (bejelentkezési munkamenet) használ. Reklám- vagy nyomkövető sütiket nem alkalmazunk.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-sand-800">
          <Link
            to="/adatvedelem"
            className="text-xs text-sand-300 underline underline-offset-2 hover:text-white transition-colors"
          >
            Tájékoztató
          </Link>
          <button
            type="button"
            onClick={handleAccept}
            className="btn-primary btn-sm py-1.5 px-4 text-xs font-semibold"
          >
            Rendben, elfogadom
          </button>
        </div>
      </div>
    </div>
  );
};
