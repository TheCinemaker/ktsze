import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const CIRCUMFERENCE = 2 * Math.PI * 21;

/**
 * Visszaugrás a lap tetejére.
 *
 * A gomb egyben haladásjelző is: a köré rajzolt aranygyűrű mutatja, hol
 * tartunk az oldalon. Ugyanaz az elem két információt hordoz, ahelyett hogy
 * két külön dolog versengene a figyelemért a képernyő sarkában.
 */
export const ScrollToTopButton = () => {
  const [progress, setProgress] = useState(0);
  const visible = progress > 0.06;

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Ugrás az oldal tetejére"
      title="Ugrás az oldal tetejére"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`group fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full
                  border border-sand-300 bg-paper/80 text-ink-700 shadow-lift backdrop-blur-xl
                  transition-all duration-500 ease-lux hover:text-wine-600
                  ${visible ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-90 opacity-0'}`}
    >
      <svg
        viewBox="0 0 48 48"
        className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r="21"
          fill="none"
          stroke="oklch(var(--sand-300))"
          strokeWidth="1.5"
        />
        <circle
          cx="24"
          cy="24"
          r="21"
          fill="none"
          stroke="oklch(var(--gold-500))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
        />
      </svg>

      <ArrowUp
        className="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
    </button>
  );
};
