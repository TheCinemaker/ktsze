import React from 'react';

export const HeaderLogo = ({ variant = 'full', className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Redesigned Compact Elegant Emblem SVG */}
      <svg 
        width="38" 
        height="38" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-105 shrink-0"
      >
        {/* Outer Circular Frame */}
        <circle cx="50" cy="50" r="46" stroke="#C5A880" strokeWidth="1.5" fill="#FAF6F0" />
        <circle cx="50" cy="50" r="42" stroke="#6B1D2F" strokeWidth="1" strokeDasharray="2 2" />

        {/* Castle Silhouette & Tower Motif */}
        <path 
          d="M30 68V48L36 44V68M36 44H42V68M42 44V38L46 34L50 38V44M50 44H62V68M62 44V34L66 30L70 34V68" 
          stroke="#6B1D2F" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        {/* Tower Roof Spire */}
        <path d="M46 34L46 22L50 26V34" fill="#6B1D2F" />

        {/* Rolling Hills / Nature Curve */}
        <path 
          d="M 18 68 C 32 62, 45 62, 50 68 C 55 62, 68 62, 82 68" 
          stroke="#521422" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />

        {/* Grape Leaf / Heart Heritage Emblem */}
        <path 
          d="M50 78 C46 72, 40 70, 40 66 C40 62, 45 61, 50 65 C55 61, 60 62, 60 66 C60 70, 54 72, 50 78 Z" 
          fill="#6B1D2F" 
          opacity="0.85"
        />
      </svg>

      {/* Typography - Compact Formal Sans */}
      {variant === 'full' && (
        <div className="flex flex-col text-left">
          <span 
            className="font-bold text-base tracking-wider uppercase leading-none font-sans" 
            style={{ color: '#6B1D2F' }}
          >
            KŐSZEGI
          </span>
          <span 
            className="text-[0.6rem] tracking-[0.16em] uppercase font-bold mt-0.5 text-[#2C221E]"
          >
            Turisztikai Szövetség
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="h-[1px] w-2.5 bg-[#C5A880]"></span>
            <span className="text-[0.55rem] tracking-[0.18em] uppercase font-semibold text-[#63534B]">
              Egyesület
            </span>
            <span className="h-[1px] w-2.5 bg-[#C5A880]"></span>
          </div>
        </div>
      )}
    </div>
  );
};
