import React from 'react';

/** Az egyesületi embléma — vektoros, külső betöltés nélkül azonnal megjelenik. */
export const LogoMark = ({ className = 'h-9 w-9' }) => (
  <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Kőszegi Turisztikai Szövetség embléma">
    <circle cx="50" cy="50" r="46" fill="#FAF6F0" stroke="#C5A880" strokeWidth="1.5" />
    <g stroke="#6B1D2F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M30 68V48l6-4v24M36 44h6v24M42 44v-6l4-4 4 4v6M50 44h12v24M62 44V34l4-4 4 4v34" />
    </g>
    <path d="M46 34V22l4 4v8z" fill="#6B1D2F" />
    <path
      d="M18 68c14-6 27-6 32 0 5-6 18-6 32 0"
      stroke="#521422"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const HeaderLogo = ({ variant = 'full', className = '' }) => (
  <span className={`flex select-none items-center gap-2.5 ${className}`}>
    <LogoMark className="h-9 w-9 shrink-0" />

    {variant === 'full' && (
      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-semibold tracking-tight text-wine-600">Kőszegi</span>
        <span className="mt-1 text-[0.7rem] font-medium uppercase tracking-[0.13em] text-ink-600">
          Turisztikai Szövetség
        </span>
      </span>
    )}
  </span>
);
