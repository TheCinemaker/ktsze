import React from 'react';

export const HeaderLogo = ({ variant = 'full', className = '' }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Redesigned 2026 Elegant Emblem SVG */}
      <svg 
        width="46" 
        height="46" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-105"
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

        {/* Subtle Grape Leaf / Heart Heritage Emblem */}
        <path 
          d="M50 78 C46 72, 40 70, 40 66 C40 62, 45 61, 50 65 C55 61, 60 62, 60 66 C60 70, 54 72, 50 78 Z" 
          fill="#6B1D2F" 
          opacity="0.85"
        />
      </svg>

      {/* Typography */}
      {variant === 'full' && (
        <div className="flex flex-col text-left">
          <span 
            className="font-serif text-xl tracking-wider font-bold leading-none" 
            style={{ color: '#6B1D2F' }}
          >
            KŐSZEGI
          </span>
          <span 
            className="text-[0.68rem] tracking-[0.18em] uppercase font-semibold mt-1" 
            style={{ color: '#2C221E' }}
          >
            Turisztikai Szövetség
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="h-[1px] w-3 bg-[#C5A880]"></span>
            <span className="text-[0.58rem] tracking-[0.2em] uppercase font-medium text-[#63534B]">
              Egyesület
            </span>
            <span className="h-[1px] w-3 bg-[#C5A880]"></span>
          </div>
        </div>
      )}
    </div>
  );
};
