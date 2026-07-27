import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

const VARIANTS = {
  success: {
    Icon: CheckCircle2,
    bar: 'bg-[#2E7D32]',
    iconColor: 'text-[#2E7D32]',
    iconBg: 'bg-[#E8F5E9]',
    border: 'border-[#C8E6C9]'
  },
  error: {
    Icon: AlertTriangle,
    bar: 'bg-[#6B1D2F]',
    iconColor: 'text-[#6B1D2F]',
    iconBg: 'bg-[#F7EBEF]',
    border: 'border-[#D9AAB6]'
  },
  info: {
    Icon: Info,
    bar: 'bg-[#C5A880]',
    iconColor: 'text-[#7A5B2E]',
    iconBg: 'bg-[#FAF3E8]',
    border: 'border-[#E5D2B8]'
  }
};

const DEFAULT_DURATION = { success: 4000, info: 4000, error: 9000 };

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
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const ms = duration ?? DEFAULT_DURATION[variant] ?? 4000;
      setToasts((prev) => [...prev.slice(-3), { id, message, variant, title }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), ms)
      );
      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (message, options) => notify(message, { ...options, variant: 'success' }),
    error: (message, options) => notify(message, { ...options, variant: 'error' }),
    info: (message, options) => notify(message, { ...options, variant: 'info' })
  };

  // Kilépéskor ne maradjanak árva időzítők
  const timersRef = timers;
  useEffect(() => () => timersRef.current.forEach(clearTimeout), [timersRef]);

  return (
    <ToastContext.Provider value={{ toast, notify, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
};

const ToastViewport = ({ toasts, dismiss }) => (
  <div
    aria-live="polite"
    aria-atomic="false"
    className="fixed z-[100] bottom-4 right-4 left-4 sm:left-auto sm:w-[26rem] flex flex-col gap-3 pointer-events-none"
  >
    {toasts.map((t) => {
      const variant = VARIANTS[t.variant] || VARIANTS.info;
      const { Icon } = variant;
      return (
        <div
          key={t.id}
          role={t.variant === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto flex items-stretch overflow-hidden rounded-xl border ${variant.border} bg-white shadow-xl shadow-black/10 animate-toast-in`}
        >
          <div className={`w-1.5 shrink-0 ${variant.bar}`} />

          <div className="flex items-start gap-3 p-4 flex-1 min-w-0">
            <div className={`shrink-0 p-1.5 rounded-lg ${variant.iconBg}`}>
              <Icon className={`w-4 h-4 ${variant.iconColor}`} />
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="font-serif text-sm font-bold text-[#2C221E] leading-snug">
                {t.title ||
                  (t.variant === 'success' ? 'Sikeres mentés' : t.variant === 'error' ? 'Hiba történt' : 'Tájékoztatás')}
              </div>
              <div className="text-xs text-[#63534B] leading-relaxed break-words whitespace-pre-line">{t.message}</div>
            </div>

            <button
              onClick={() => dismiss(t.id)}
              aria-label="Értesítés bezárása"
              className="shrink-0 p-1 -m-1 text-[#A39288] hover:text-[#6B1D2F] rounded border-0 bg-transparent cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
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
