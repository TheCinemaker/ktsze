// =============================================================================
//  Értesítések — az alert() helyett.
//
//  A korábbi verzióban 14 helyen volt böngésző-alert, és több helyen "sikeres
//  mentés" üzenet jelent meg olyankor is, amikor az adatbázis visszadobta a
//  kérést. Itt a hibaüzenet hosszabban látszik, mint a siker, és a szövege a
//  Supabase valódi hibájából származik.
// =============================================================================

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const VARIANTS = {
  success: {
    Icon: CheckCircle2,
    accent: 'bg-positive-600',
    iconColor: 'text-positive-600',
    iconBg: 'bg-positive-50',
    border: 'border-positive-300',
    defaultTitle: 'Sikeres mentés'
  },
  error: {
    Icon: AlertTriangle,
    accent: 'bg-wine-600',
    iconColor: 'text-wine-600',
    iconBg: 'bg-wine-100',
    border: 'border-wine-300',
    defaultTitle: 'Hiba történt'
  },
  info: {
    Icon: Info,
    accent: 'bg-sand-500',
    iconColor: 'text-caution-600',
    iconBg: 'bg-caution-50',
    border: 'border-caution-300',
    defaultTitle: 'Tájékoztatás'
  }
};

// A hibát hosszabban hagyjuk kint — azt el kell tudni olvasni.
const DURATIONS = { success: 4000, info: 5000, error: 11000 };
const MAX_VISIBLE = 3;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (message, { variant = 'info', title, duration } = {}) => {
      if (!message) return null;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const ms = duration ?? DURATIONS[variant] ?? 5000;

      setToasts((prev) => [...prev, { id, message: String(message), variant, title }].slice(-MAX_VISIBLE));
      timers.current.set(id, setTimeout(() => dismiss(id), ms));
      return id;
    },
    [dismiss]
  );

  // Lecsatoláskor ne maradjanak árva időzítők.
  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach(clearTimeout);
      map.clear();
    };
  }, []);

  const value = useMemo(() => {
    const toast = {
      success: (message, options) => notify(message, { ...options, variant: 'success' }),
      error: (message, options) => notify(message, { ...options, variant: 'error' }),
      info: (message, options) => notify(message, { ...options, variant: 'info' })
    };
    return { toast, notify, dismiss };
  }, [notify, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
};

const ToastViewport = ({ toasts, dismiss }) => (
  <div
    aria-live="polite"
    aria-atomic="false"
    className="pointer-events-none fixed bottom-4 left-4 right-4 z-[100] flex flex-col gap-2.5 sm:left-auto sm:w-[25rem]"
  >
    {toasts.map((t) => {
      const variant = VARIANTS[t.variant] || VARIANTS.info;
      const { Icon } = variant;
      return (
        <div
          key={t.id}
          role={t.variant === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto flex items-stretch overflow-hidden rounded-xl border bg-paper shadow-overlay animate-slide-up ${variant.border}`}
        >
          <div className={`w-1 shrink-0 ${variant.accent}`} aria-hidden="true" />

          <div className="flex min-w-0 flex-1 items-start gap-3 p-4">
            <div className={`shrink-0 rounded-lg p-1.5 ${variant.iconBg}`}>
              <Icon className={`h-4 w-4 ${variant.iconColor}`} aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-display text-base leading-snug text-ink-900">
                {t.title || variant.defaultTitle}
              </div>
              <div className="mt-0.5 whitespace-pre-line break-words text-sm text-ink-600">{t.message}</div>
            </div>

            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Értesítés bezárása"
              className="-m-1 shrink-0 cursor-pointer rounded border-0 bg-transparent p-1 text-ink-400 transition-colors hover:text-wine-600"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      );
    })}
  </div>
);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast csak ToastProvider-en belül használható.');
  return ctx.toast;
};
