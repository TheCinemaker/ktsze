import React from 'react';

/**
 * Stilizált kőszegi látkép — kézzel rajzolt vektoros sziluett (nem fotó).
 * Elemek: szőlős dombok, a Hősök tornya, a Jurisics-vár bástyája, templomtorony
 * és polgárházak teteje, arany nappal. Az arculati palettából (bor + arany + homok)
 * dolgozik; dekoratív sávként a hero alján ül, és reszponzívan, teljes szélességben
 * skálázódik.
 */
export const KoszegSkyline = ({ className = '' }) => (
  <svg
    viewBox="0 0 1200 240"
    preserveAspectRatio="xMidYMax slice"
    className={className}
    role="img"
    aria-label="Kőszeg stilizált látképe: vár, templom és szőlős dombok"
  >
    {/* Nap */}
    <circle cx="615" cy="96" r="42" fill="#DCBE6E" opacity="0.85" />

    {/* Hátsó dombvonulat */}
    <path d="M0 196 C150 172 330 186 520 176 C720 166 940 188 1200 172 L1200 240 L0 240 Z" fill="#C5A880" opacity="0.55" />

    {/* --- Épület-sziluett (mély bor) --- */}
    <g fill="#521422">
      {/* Templom (bal) */}
      <rect x="250" y="150" width="78" height="52" />
      <rect x="300" y="108" width="30" height="94" />
      <polygon points="296,108 315,66 334,108" />
      <rect x="312" y="52" width="6" height="16" />
      <rect x="307" y="58" width="16" height="6" />

      {/* Polgárházak teteje */}
      <polygon points="150,202 150,176 182,152 214,176 214,202" />
      <polygon points="214,202 214,182 240,160 266,182 266,202" />

      {/* Hősök tornya (közép) — négyszögletes torony, csúcsos tető, zászló */}
      <rect x="548" y="96" width="60" height="106" />
      <polygon points="540,96 578,44 616,96" />
      <rect x="575" y="20" width="4" height="26" />
      <polygon points="579,22 606,30 579,38" fill="#C9A24B" />
      {/* oromzat fogak */}
      <rect x="548" y="92" width="12" height="10" />
      <rect x="572" y="92" width="12" height="10" />
      <rect x="596" y="92" width="12" height="10" />

      {/* Jurisics-vár bástyafala (jobb) */}
      <rect x="690" y="150" width="210" height="52" />
      {/* pártázat */}
      <rect x="690" y="142" width="22" height="10" />
      <rect x="726" y="142" width="22" height="10" />
      <rect x="762" y="142" width="22" height="10" />
      <rect x="798" y="142" width="22" height="10" />
      <rect x="834" y="142" width="22" height="10" />
      <rect x="870" y="142" width="22" height="10" />
      {/* kerek bástyatorony */}
      <rect x="878" y="118" width="46" height="84" />
      <path d="M878 118 a23 23 0 0 1 46 0 Z" />
      <polygon points="872,118 901,86 930,118" />

      {/* Jobb oldali polgárházak */}
      <polygon points="930,202 930,176 962,152 994,176 994,202" />
      <polygon points="994,202 994,182 1022,158 1050,182 1050,202" />
    </g>

    {/* Előtér-domb (legmélyebb bor) szőlősorokkal */}
    <path d="M0 212 C220 196 420 206 640 202 C860 198 1020 210 1200 200 L1200 240 L0 240 Z" fill="#3A0E18" />
    <g stroke="#C9A24B" strokeWidth="1.5" opacity="0.5">
      <line x1="60" y1="226" x2="160" y2="220" />
      <line x1="220" y1="228" x2="340" y2="222" />
      <line x1="420" y1="230" x2="560" y2="225" />
      <line x1="640" y1="230" x2="780" y2="226" />
      <line x1="860" y1="230" x2="1000" y2="224" />
      <line x1="1060" y1="228" x2="1160" y2="223" />
    </g>

    {/* Arany ablakfények */}
    <g fill="#DCBE6E">
      <rect x="566" y="120" width="8" height="12" rx="1" />
      <rect x="582" y="120" width="8" height="12" rx="1" />
      <rect x="566" y="146" width="8" height="12" rx="1" />
      <rect x="582" y="146" width="8" height="12" rx="1" />
      <rect x="306" y="128" width="7" height="11" rx="1" />
      <rect x="317" y="128" width="7" height="11" rx="1" />
    </g>
  </svg>
);
