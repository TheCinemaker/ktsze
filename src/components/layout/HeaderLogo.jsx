import React from 'react';

/* =============================================================================
   Embléma

   Vektoros, külső betöltés nélkül — nincs villanás, nincs elmozduló elrendezés.
   A rajz szándékosan geometrikus és egyvonalas: a torony és a domborzat
   absztrakciója, nem illusztráció. A címerpajzs helyett kör, mert az
   semlegesebb és jobban áll a modern tipográfia mellett.
   ============================================================================= */

export const LogoMark = ({ className = 'h-10 w-10', animated = true }) => (
  <span className={`relative inline-grid shrink-0 place-items-center ${className}`}>
    {/* Halvány fénykör a jel mögött — sötét témában ez adja a „világít” érzetet */}
    <span
      aria-hidden="true"
      className="absolute inset-0 rounded-full opacity-70 blur-md"
      style={{ background: 'radial-gradient(circle, oklch(var(--g-500) / 0.32), transparent 70%)' }}
    />

    <svg
      viewBox="0 0 100 100"
      className="relative h-full w-full"
      role="img"
      aria-label="Kőszegi Turisztikai Szövetség embléma"
    >
      <defs>
        <linearGradient id="ktsze-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(var(--g-300))" />
          <stop offset="50%" stopColor="oklch(var(--g-500))" />
          <stop offset="100%" stopColor="oklch(var(--g-700))" />
        </linearGradient>
        <linearGradient id="ktsze-wine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(var(--w-500))" />
          <stop offset="100%" stopColor="oklch(var(--w-700))" />
        </linearGradient>
      </defs>

      {/* Külső gyűrű */}
      <circle cx="50" cy="50" r="46.5" fill="none" stroke="url(#ktsze-gold)" strokeWidth="1.6" />

      {/* Belső szaggatott gyűrű — finom, csak közelről látszik */}
      <circle
        cx="50"
        cy="50"
        r="41"
        fill="none"
        stroke="oklch(var(--g-500) / 0.35)"
        strokeWidth="0.8"
        strokeDasharray="1 5"
        strokeLinecap="round"
        className={animated ? 'origin-center motion-safe:animate-spin-slow' : ''}
        style={animated ? { animationDuration: '48s' } : undefined}
      />

      {/* Várossziluett: tornyok */}
      <g
        stroke="url(#ktsze-wine)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M31 69V49l6-4.5V69M37 44.5h6.5V69M43.5 44.5v-6.5L48 33.5l4.5 4.5v6.5M52.5 44.5H64V69M64 44.5V34l4.5-4.5L73 34v35" />
      </g>

      {/* Toronycsúcs */}
      <path d="M46 33.5V21l4.5 4.5v8z" fill="oklch(var(--w-600))" />

      {/* Domborzat — a Kőszegi-hegység vonala */}
      <path
        d="M17 69c15-7 28-7 33 0 5-7 19-7 33 0"
        fill="none"
        stroke="url(#ktsze-gold)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  </span>
);

export const HeaderLogo = ({ variant = 'full', className = '' }) => (
  <span className={`group flex select-none items-center gap-3 ${className}`}>
    <LogoMark className="h-10 w-10 transition-transform duration-500 ease-spring group-hover:scale-105" />

    {variant === 'full' && (
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-medium tracking-tight text-ink-900">
          Kőszegi
        </span>
        <span className="mt-1 text-2xs font-semibold uppercase tracking-[0.19em] text-ink-500 transition-colors duration-300 group-hover:text-wine-600">
          Turisztikai Szövetség
        </span>
      </span>
    )}
  </span>
);
