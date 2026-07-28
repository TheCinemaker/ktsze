// =============================================================================
//  Mozgás — a keveske JS, ami nem oldható meg tiszta CSS-ből.
//
//  Alapelv: ami megy CSS-ben, az CSS-ben megy (a megjelenő animációkat az
//  index.css scroll-driven `animation-timeline: view()` szabálya hajtja, nem
//  IntersectionObserver). Ide csak az kerül, amihez tényleg mutatóeszköz-
//  vagy időadat kell.
//
//  Mindegyik segéd tiszteletben tartja a prefers-reduced-motion beállítást.
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Kurzort követő fényfolt. A --mx/--my CSS-változót írja az elemen; a
 * megjelenítést a `.spotlight` osztály végzi.
 *
 * Csak precíz mutatóeszköznél (egér) aktív: érintőképernyőn nincs "hover",
 * ott az effekt csak fölösleges munka lenne.
 */
export const useSpotlight = () => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(pointer: fine)').matches) return undefined;

    let frame = 0;
    const onMove = (event) => {
      if (frame) return; // egy frame-en belül egyszer írunk, nem eseményenként
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
        el.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
      });
    };

    el.addEventListener('pointermove', onMove);
    return () => {
      el.removeEventListener('pointermove', onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
};

/**
 * Finom 3D-billenés a kurzor felé. A `.tilt` osztállyal együtt működik.
 * @param {number} max maximális kitérés fokban
 */
export const useTilt = (max = 5) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return undefined;

    let frame = 0;
    const onMove = (event) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = el.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        el.style.setProperty('--ry', `${px * max * 2}deg`);
        el.style.setProperty('--rx', `${-py * max * 2}deg`);
      });
    };
    const onLeave = () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [max]);

  return ref;
};

/**
 * Számláló, ami akkor indul, amikor az elem képbe ér.
 *
 * Kifutási görbe: 1 - (1-t)^4 — gyorsan indul, lassan áll be. Ez az, amitől
 * "megérkezik" a szám, nem pedig csak lineárisan felpörög.
 *
 * @returns {[React.RefObject, number]} ref az elemre, és az aktuális érték
 */
export const useCountUp = (target, duration = 1400) => {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (prefersReducedMotion()) {
      setValue(target);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // A nullán nem indulunk el: az adat aszinkron érkezik, és egy
        // lefutott 0 → 0 animáció után a valódi érték csak beugrana.
        // Ilyenkor a figyelő életben marad, és a target változásakor
        // az effekt újra lefut.
        if (!entries[0].isIntersecting || started.current || target <= 0) return;
        started.current = true;
        observer.disconnect();

        const t0 = performance.now();
        const step = (now) => {
          const t = Math.min((now - t0) / duration, 1);
          setValue(Math.round(target * (1 - Math.pow(1 - t, 4))));
          if (t < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  // Ha az adat később érkezik meg (async betöltés), a már lefutott számláló
  // ne ragadjon be a régi értéken.
  useEffect(() => {
    if (started.current) setValue(target);
  }, [target]);

  return [ref, value];
};

/**
 * Görgetés iránya és mélysége — a lebegő navigáció ettől húzódik össze,
 * illetve rejtőzik el lefelé görgetéskor.
 */
export const useScrollDirection = (threshold = 12) => {
  const [state, setState] = useState({ scrolled: false, hidden: false });
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const delta = y - lastY.current;

        setState((prev) => {
          const scrolled = y > 24;
          // Az irányváltást küszöbhöz kötjük, hogy a fejléc ne villogjon
          // apró mozdulatokra — a `scrolled` viszont mindig pontos legyen,
          // különben egy már legörgetve betöltött oldalon üvegtelen maradna.
          const hidden =
            Math.abs(delta) < threshold ? prev.hidden : delta > 0 && y > 320;
          if (prev.scrolled === scrolled && prev.hidden === hidden) return prev;
          return { scrolled, hidden };
        });

        if (Math.abs(delta) >= threshold) lastY.current = y;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return state;
};

/**
 * Mágneses gomb: a mutató felé húzódik, elengedéskor visszaugrik.
 * Kis kitérés (alap 6px) — a hatás akkor működik, ha épp csak érezhető.
 */
export const useMagnetic = (strength = 6) => {
  const ref = useRef(null);

  const reset = useCallback(() => {
    if (ref.current) ref.current.style.transform = '';
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return undefined;

    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
    };
    const onLeave = () => {
      el.style.transform = '';
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);

  return [ref, reset];
};
