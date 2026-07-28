// =============================================================================
//  Témaváltás — világos ("Porcelán") és sötét ("Éjféli pince").
//
//  A tényleges színek NEM itt vannak, hanem az index.css OKLCH tokenjeiben.
//  Ez a modul mindössze egy dolgot csinál: beállítja a <html data-theme>
//  attribútumot. Ettől vált színt az egész alkalmazás — beleértve azokat a
//  komponenseket is, amelyekhez soha nem nyúltunk hozzá.
//
//  A váltás a View Transitions API-val egy körkörös feltárulás, ami pontosan
//  a megnyomott gombból indul. Ha a böngésző nem tudja, sima váltás lesz —
//  a funkció így sehol nem törik el, csak kevésbé látványos.
// =============================================================================

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'ktsze-theme';
const ThemeContext = createContext(null);

/** Az index.html-ben futó boot-script már beállította — innen olvassuk vissza. */
const readInitialTheme = () => {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readInitialTheme);

  // A böngésző felületi elemei (mobil címsáv, űrlapvezérlők) is kövessék.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#131011' : '#FAF6F0');
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* privát böngészés: a téma ilyenkor csak a munkamenetre él */
    }
  }, [theme]);

  // Rendszerbeállítás követése — de csak addig, amíg a felhasználó nem
  // döntött maga. A saját döntés mindig erősebb, mint az OS beállítása.
  useEffect(() => {
    let stored = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      /* nem elérhető tároló */
    }
    if (stored) return undefined;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  /**
   * @param {{ clientX: number, clientY: number }} [origin]
   *        A kattintás helye — innen tárul fel az új téma.
   */
  const toggle = useCallback(
    (origin) => {
      const next = theme === 'dark' ? 'light' : 'dark';
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!document.startViewTransition || reduced) {
        setTheme(next);
        return;
      }

      const x = origin?.clientX ?? window.innerWidth - 64;
      const y = origin?.clientY ?? 48;
      // A kör sugara a legtávolabbi sarokig érjen, különben marad kitakaratlan folt.
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

      const transition = document.startViewTransition(() => {
        // flushSync nélkül is jó: a setState a tranzakción belül fut le.
        setTheme(next);
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          {
            duration: 620,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      });
    },
    [theme]
  );

  const value = useMemo(() => ({ theme, isDark: theme === 'dark', toggle, setTheme }), [theme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme csak ThemeProvider-en belül használható.');
  return ctx;
};
