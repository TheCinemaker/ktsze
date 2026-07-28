// =============================================================================
//  Újrahasznosított felületi elemek.
//
//  Cél: az akadálymentesség egy helyen legyen megoldva (label összekötése,
//  aria attribútumok, fókuszcsapda), ne komponensenként elfelejtve.
// =============================================================================

import React, { useId, useEffect, useRef, useCallback } from 'react';
import { Loader2, Inbox, AlertTriangle, X, ChevronDown } from 'lucide-react';

/* ---------------------------------------------------------------------------
   Töltés / hiba / üres állapot
   --------------------------------------------------------------------------- */

export const Spinner = ({ label = 'Betöltés…', className = '' }) => (
  <span className={`inline-flex items-center gap-2 text-sm text-ink-500 ${className}`} role="status">
    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
    {label}
  </span>
);

export const LoadingBlock = ({ label = 'Betöltés…' }) => (
  <div className="flex items-center justify-center py-14">
    <Spinner label={label} />
  </div>
);

export const ErrorBlock = ({ message, onRetry }) => (
  <div className="card border-wine-300 bg-wine-50 p-5" role="alert">
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-wine-600 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0 space-y-2">
        <h3 className="font-display text-lg text-ink-900">Nem sikerült betölteni</h3>
        <p className="text-sm text-ink-600 break-words">{message}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-secondary btn-sm">
            Újrapróbálom
          </button>
        )}
      </div>
    </div>
  </div>
);

/**
 * Üres állapot. Ez a hallucináció ellenszere: ha nincs adat, ezt mutatjuk,
 * NEM kitalált példatartalmat.
 */
export const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => (
  <div className="rounded-xl border border-dashed border-sand-400 bg-sand-50 px-6 py-12 text-center">
    <Icon className="mx-auto mb-3 h-7 w-7 text-sand-500" aria-hidden="true" />
    <h3 className="font-display text-lg text-ink-900">{title}</h3>
    {description && <p className="mx-auto mt-1.5 max-w-md text-sm text-ink-600">{description}</p>}
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </div>
);

/* ---------------------------------------------------------------------------
   Űrlapelemek — a label mindig htmlFor-ral kötődik az inputhoz
   --------------------------------------------------------------------------- */

export const Field = ({ label, hint, error, required, children, htmlFor }) => {
  const generatedId = useId();
  const id = htmlFor || generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {required && (
          <span className="ml-0.5 text-wine-600" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children({
        id,
        'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
        'aria-invalid': error ? true : undefined,
        required
      })}

      {hint && !error && (
        <p id={hintId} className="hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-wine-600">
          {error}
        </p>
      )}
    </div>
  );
};

export const TextInput = ({ label, hint, error, required, className = '', ...rest }) => (
  <Field label={label} hint={hint} error={error} required={required}>
    {(a11y) => (
      <input {...a11y} {...rest} className={`input ${error ? 'input-invalid' : ''} ${className}`} />
    )}
  </Field>
);

export const TextArea = ({ label, hint, error, required, rows = 4, className = '', ...rest }) => (
  <Field label={label} hint={hint} error={error} required={required}>
    {(a11y) => (
      <textarea
        {...a11y}
        {...rest}
        rows={rows}
        className={`input resize-y ${error ? 'input-invalid' : ''} ${className}`}
      />
    )}
  </Field>
);

export const Select = ({ label, hint, error, required, options = [], placeholder, className = '', ...rest }) => (
  <Field label={label} hint={hint} error={error} required={required}>
    {(a11y) => (
      <div className="relative">
        <select {...a11y} {...rest} className={`input appearance-none pr-9 ${className}`}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
          aria-hidden="true"
        />
      </div>
    )}
  </Field>
);

export const Checkbox = ({ label, hint, checked, onChange, ...rest }) => {
  const id = useId();
  return (
    <div className="flex items-start gap-2.5">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-sand-400 text-wine-600 focus:ring-wine-100"
        {...rest}
      />
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-ink-800">
          {label}
        </label>
        {hint && <p className="text-xs text-ink-500">{hint}</p>}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------------
   Modal — Escape-re zár, fókuszt csapdába ejt, visszaadja a fókuszt
   --------------------------------------------------------------------------- */

export const Modal = ({ open, onClose, title, description, children, footer, size = 'md' }) => {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  const titleId = useId();

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocused.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const timer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector(
        'input:not([type="hidden"]), textarea, select, button'
      );
      (target || panelRef.current)?.focus();
    }, 30);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      <button
        type="button"
        aria-label="Bezárás"
        onClick={onClose}
        className="fixed inset-0 h-full w-full cursor-default border-0 bg-ink-900/45 backdrop-blur-sm"
        tabIndex={-1}
      />

      <div className="relative flex min-h-full items-center justify-center p-4">
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className={`card w-full ${widths[size]} animate-slide-up shadow-overlay`}
        >
          <div className="flex items-start justify-between gap-4 border-b border-sand-400 px-5 py-4">
            <div className="min-w-0">
              <h2 id={titleId} className="font-display text-xl text-ink-900">
                {title}
              </h2>
              {description && <p className="mt-1 text-sm text-ink-600">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Bezárás"
              className="-m-1 shrink-0 cursor-pointer rounded border-0 bg-transparent p-1 text-ink-400 transition-colors hover:text-wine-600"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="px-5 py-5">{children}</div>

          {footer && (
            <div className="flex flex-wrap justify-end gap-2 border-t border-sand-400 bg-sand-50 px-5 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/** Megerősítő párbeszéd — a window.confirm helyett. */
export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Igen, törlöm', pending }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <button type="button" className="btn-secondary" onClick={onClose} disabled={pending}>
          Mégsem
        </button>
        <button type="button" className="btn-primary" onClick={onConfirm} disabled={pending}>
          {pending ? <Spinner label="Folyamatban…" className="text-white" /> : confirmLabel}
        </button>
      </>
    }
  >
    <p className="text-sm text-ink-600">{message}</p>
  </Modal>
);

/* ---------------------------------------------------------------------------
   Oldalfejléc
   --------------------------------------------------------------------------- */

export const PageHeader = ({ eyebrow, title, description, actions, centered = false }) => (
  <div
    className={`space-y-3 ${centered ? 'mx-auto max-w-3xl text-center' : 'flex flex-col gap-4 md:flex-row md:items-end md:justify-between'}`}
  >
    <div className="space-y-2.5">
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">{title}</h1>
      {description && (
        <p className={`text-base text-ink-600 ${centered ? 'mx-auto max-w-prose' : 'max-w-prose'}`}>
          {description}
        </p>
      )}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
  </div>
);

/** Címke–érték pár, üres értéknél nem jelenik meg semmi. */
export const DetailRow = ({ label, value, children }) => {
  const content = children ?? value;
  if (content === null || content === undefined || content === '') return null;
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-1.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="text-sm text-ink-900">{content}</dd>
    </div>
  );
};

/**
 * Automatikus hivatkozásfelismerő és törésbiztos szövegintegrátor.
 * Felismeri az URL-eket (http://, https://, www.), és kattintható linkké alakítja őket.
 * A long URL-ek a 'break-all' / 'break-words' CSS osztállyal SOHA nem lógnak ki a kártyából!
 */
export const FormattedText = ({ children, className = '' }) => {
  if (!children || typeof children !== 'string') return children;

  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  const parts = children.split(urlRegex);

  return (
    <span className={`break-words [overflow-wrap:anywhere] ${className}`}>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          const href = part.startsWith('http') ? part : `https://${part}`;
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-wine-600 underline underline-offset-2 hover:text-wine-800 break-all transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </span>
  );
};
