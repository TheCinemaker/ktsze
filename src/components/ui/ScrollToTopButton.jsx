import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      type="button"
      aria-label="Ugrás az oldal tetejére"
      title="Ugrás az oldal tetejére"
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-wine-600 text-white shadow-xl border border-wine-400/30 transition-all duration-300 hover:bg-wine-700 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-wine-500 focus:ring-offset-2"
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};
