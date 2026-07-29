import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

/* =============================================================================
   Téma: világos / sötét / rendszer

   A `system` az alapértelmezett, mert az a legjobb első benyomás: az oldal
   olyan, amilyet a felhasználó a gépén beállított. A választás localStorage-ba
   kerül — ez a rendszer EGYETLEN localStorage-használata, és szándékos:
   megjelenési beállítás, nem adat. Az egyesületi adatok továbbra is kizárólag
   a Supabase-ben élnek.
   ============================================================================= */

const ThemeContext = createContext(null);
const STORAGE_KEY = 'ktsze-theme';

const readStored = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
  } catch {
    return 'system';
  }
};

/** A ténylegesen alkalmazandó téma feloldása. */
const resolve = (preference) => {
  if (preference !== 'system') return preference;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }) => {
  const [preference, setPreference] = useState(readStored);
  const [resolved, setResolved] = useState(() => resolve(readStored()));

  // Az osztály felvitele a <html> elemre — a Tailwind `darkMode: 'class'` ezt nézi.
  useEffect(() => {
    const next = resolve(preference);
    setResolved(next);

    const root = document.documentElement;
    root.classList.toggle('dark', next === 'dark');

    // A böngésző UI-ja (címsor, görgetősáv) is kövesse a témát.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#12101a' : '#FAF7F1');

    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      /* privát böngészés — a téma ilyenkor csak a munkamenetre él */
    }
  }, [preference]);

  // Ha „rendszer” van kiválasztva, kövessük az operációs rendszer váltását élőben.
  useEffect(() => {
    if (preference !== 'system') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const next = mq.matches ? 'dark' : 'light';
      setResolved(next);
      document.documentElement.classList.toggle('dark', next === 'dark');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preference]);

  /** Körbeforgat: rendszer -> világos -> sötét -> rendszer */
  const cycle = useCallback(() => {
    setPreference((prev) => (prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system'));
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setTheme: setPreference, cycle, isDark: resolved === 'dark' }),
    [preference, resolved, cycle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { preference: 'system', resolved: 'light', setTheme: () => {}, cycle: () => {}, isDark: false };
  }
  return ctx;
};
