import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/* =============================================================================
   Felső betöltési sáv

   Oldalváltáskor egy vékony arany-bordó csík fut végig a képernyő tetején.
   Apróság, de sokat számít: visszajelzést ad arról, hogy a kattintás
   megtörtént — enélkül lassúnak érződik a felület, még ha nem is az.
   ============================================================================= */

export const RouteProgress = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    setVisible(true);
    setProgress(18);

    // Szakaszos, lassuló előrehaladás — nem hazudunk pontos százalékot.
    timers.current.push(setTimeout(() => setProgress(62), 90));
    timers.current.push(setTimeout(() => setProgress(88), 220));
    timers.current.push(setTimeout(() => setProgress(100), 380));
    timers.current.push(setTimeout(() => setVisible(false), 620));
    timers.current.push(setTimeout(() => setProgress(0), 900));

    return () => timers.current.forEach(clearTimeout);
  }, [location.pathname]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[130] h-0.5"
    >
      <div
        className="h-full origin-left transition-all duration-300 ease-swift"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          background:
            'linear-gradient(90deg, oklch(var(--w-600)), oklch(var(--g-500)) 55%, oklch(var(--w-500)))',
          boxShadow: '0 0 12px oklch(var(--g-500) / 0.6)'
        }}
      />
    </div>
  );
};
