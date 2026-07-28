import React from 'react';

/**
 * Az egyesületi embléma — vektoros, külső betöltés nélkül azonnal megjelenik.
 *
 * A színek CSS-változókból jönnek, nem beégetett hexből: így az embléma
 * ugyanúgy átvált sötét témára, mint a felület többi része. A körvonal
 * gradiens-ívén ül egy vékony aranycsillanás — ez az a részlet, ami nagy
 * méretben is elbírja a nagyítást.
 */
export const LogoMark = ({ className = 'h-9 w-9' }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    role="img"
    aria-label="Kőszegi Turisztikai Szövetség embléma"
  >
    <defs>
      <linearGradient id="ktsze-ring" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="oklch(var(--gold-300))" />
        <stop offset="45%" stopColor="oklch(var(--gold-500))" />
        <stop offset="100%" stopColor="oklch(var(--gold-700))" />
      </linearGradient>
      <linearGradient id="ktsze-field" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="oklch(var(--noir-800))" />
        <stop offset="100%" stopColor="oklch(var(--noir-950))" />
      </linearGradient>
    </defs>

    <circle cx="50" cy="50" r="45" fill="url(#ktsze-field)" />
    <circle cx="50" cy="50" r="45" fill="none" stroke="url(#ktsze-ring)" strokeWidth="1.6" />
    <circle cx="50" cy="50" r="40" fill="none" stroke="oklch(var(--gold-500) / 0.28)" strokeWidth="0.6" />

    {/* Várossziluett: a várfal és a torony — a Jurisics tér karaktere. */}
    <g
      stroke="url(#ktsze-ring)"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      <path d="M30 68V48l6-4v24M36 44h6v24M42 44v-6l4-4 4 4v6M50 44h12v24M62 44V34l4-4 4 4v34" />
    </g>

    {/* Zászló a tornyon */}
    <path d="M46 34V22l4 4v8z" fill="oklch(var(--gold-400))" />

    {/* Kettős dombvonal: Írottkő és a szőlőhegy */}
    <path
      d="M16 70c14-6 27-6 34 0 7-6 20-6 34 0"
      stroke="oklch(var(--wine-500))"
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
      opacity="0.9"
    />
  </svg>
);

/**
 * @param {'full'|'mark'} variant  teljes szöveges logó vagy csak az embléma
 * @param {boolean} compact        görgetés közben a szöveg összehúzódik
 */
export const HeaderLogo = ({ variant = 'full', compact = false, className = '' }) => (
  <span className={`flex select-none items-center gap-2.5 ${className}`}>
    <LogoMark
      className={`shrink-0 transition-all duration-500 ease-lux ${compact ? 'h-8 w-8' : 'h-10 w-10'}`}
    />

    {variant === 'full' && (
      <span
        className={`flex flex-col leading-none transition-all duration-500 ease-lux
                    ${compact ? 'max-w-0 -translate-x-1 opacity-0 sm:max-w-[14rem] sm:translate-x-0 sm:opacity-100' : 'max-w-[14rem]'}
                    overflow-hidden whitespace-nowrap`}
      >
        <span className="font-display text-[1.05rem] font-semibold tracking-tight text-ink-900">
          Kőszegi
        </span>
        <span className="mt-1 font-mono text-[0.6rem] font-medium uppercase tracking-[0.2em] text-wine-600">
          Turisztikai Szövetség
        </span>
      </span>
    )}
  </span>
);
