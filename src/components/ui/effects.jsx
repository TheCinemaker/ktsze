import React, { useRef, useEffect, useState, useCallback } from 'react';

/* =============================================================================
   Vizuális effektek

   Vezérelv: minden effekt DÍSZÍTÉS, soha nem feltétele a tartalom
   megjelenésének. Ha egy böngésző nem tudja, vagy a felhasználó kikapcsolta a
   mozgást, a tartalom akkor is ott van, olvashatóan.
   ============================================================================= */

/** Kikapcsolta-e a felhasználó a mozgást a rendszerében? */
export const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
};

/* -----------------------------------------------------------------------------
   Aurora — lassan sodródó fényfoltok

   Három nagy, erősen elmosott folt kering egymáson. Ez adja a hősszekciónak a
   mélységet: nem lapos színfelület, hanem világító tér. CSS-ből megy, nem
   canvasból — így nem fogyaszt akkumulátort és nem blokkolja a fő szálat.
----------------------------------------------------------------------------- */
export const Aurora = ({ className = '' }) => {
  const reduced = usePrefersReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity: 'var(--aurora-opacity)' }}
    >
      <div
        className={`absolute -left-[15%] -top-[35%] h-[75vh] w-[75vh] rounded-full blur-[110px] ${
          reduced ? '' : 'animate-drift'
        }`}
        style={{ background: 'radial-gradient(circle, oklch(var(--w-500) / 0.5), transparent 68%)' }}
      />
      <div
        className={`absolute -right-[12%] top-[8%] h-[62vh] w-[62vh] rounded-full blur-[120px] ${
          reduced ? '' : 'animate-drift-slow'
        }`}
        style={{ background: 'radial-gradient(circle, oklch(var(--g-500) / 0.4), transparent 68%)' }}
      />
      <div
        className={`absolute bottom-[-30%] left-[28%] h-[58vh] w-[58vh] rounded-full blur-[130px] ${
          reduced ? '' : 'animate-drift'
        }`}
        style={{
          background: 'radial-gradient(circle, oklch(var(--w-700) / 0.42), transparent 70%)',
          animationDelay: '-11s'
        }}
      />
    </div>
  );
};

/* -----------------------------------------------------------------------------
   Rácsháló — halvány technikai réteg

   Finom vonalháló, ami a szélek felé elhalványul. Ettől lesz „mérnöki” a
   felület a puha fényfoltok mellett — a luxus és a technika kettőssége.
----------------------------------------------------------------------------- */
export const GridField = ({ className = '', size = 64 }) => (
  <div
    aria-hidden="true"
    className={`pointer-events-none absolute inset-0 ${className}`}
    style={{
      backgroundImage: `linear-gradient(to right, oklch(var(--i-900) / 0.055) 1px, transparent 1px),
                        linear-gradient(to bottom, oklch(var(--i-900) / 0.055) 1px, transparent 1px)`,
      backgroundSize: `${size}px ${size}px`,
      maskImage: 'radial-gradient(ellipse 78% 62% at 50% 42%, black, transparent 100%)',
      WebkitMaskImage: 'radial-gradient(ellipse 78% 62% at 50% 42%, black, transparent 100%)'
    }}
  />
);

/* -----------------------------------------------------------------------------
   Spotlight — az egeret követő fényfolt

   A CSS oldja meg a rajzolást; itt csak két változót írunk. A pointermove-ot
   requestAnimationFrame-re fűzzük, hogy 120 Hz-es egérnél se legyen belőle
   fölösleges munka.
----------------------------------------------------------------------------- */
export const Spotlight = ({ as: Tag = 'div', className = '', children, ...rest }) => {
  const ref = useRef(null);
  const frame = useRef(0);

  const onPointerMove = useCallback((event) => {
    const node = ref.current;
    if (!node) return;
    if (frame.current) return;

    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const rect = node.getBoundingClientRect();
      node.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      node.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  }, []);

  useEffect(() => () => frame.current && cancelAnimationFrame(frame.current), []);

  return (
    <Tag ref={ref} onPointerMove={onPointerMove} className={`spotlight ${className}`} {...rest}>
      {children}
    </Tag>
  );
};

/* -----------------------------------------------------------------------------
   Reveal — görgetésre megjelenés

   Elsődlegesen a natív `animation-timeline: view()` végzi (lásd index.css),
   ami a fő szálon kívül fut. Ez a komponens csak a késleltetést és a
   szemantikus burkolót adja.
----------------------------------------------------------------------------- */
export const Reveal = ({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) => (
  <Tag
    className={`reveal ${delay ? `reveal-delay-${delay}` : ''} ${className}`}
    {...rest}
  >
    {children}
  </Tag>
);

/* -----------------------------------------------------------------------------
   AnimatedNumber — felfutó számláló

   Akkor indul, amikor a szám tényleg láthatóvá válik. Mozgáscsökkentésnél
   azonnal a végértéket mutatja.
----------------------------------------------------------------------------- */
export const AnimatedNumber = ({ value = 0, duration = 1400, className = '', format }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const target = Number(value) || 0;

    if (reduced) {
      setDisplay(target);
      return undefined;
    }

    const node = ref.current;
    if (!node) return undefined;

    let raf = 0;
    let started = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started) return;
        started = true;

        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          // easeOutExpo — gyorsan indul, finoman áll meg
          const eased = t === 1 ? 1 : 1 - 2 ** (-10 * t);
          setDisplay(Math.round(target * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value, duration, reduced]);

  return (
    <span ref={ref} className={`tabular ${className}`}>
      {format ? format(display) : display}
    </span>
  );
};

/* -----------------------------------------------------------------------------
   TiltCard — enyhe térbeli dőlés az egér felé

   Nagyon visszafogott (max ~6 fok). A luxus nem a látványos mozgásban van,
   hanem abban, hogy a felület reagál — épp csak érzékelhetően.
----------------------------------------------------------------------------- */
export const TiltCard = ({ className = '', children, max = 6, ...rest }) => {
  const ref = useRef(null);
  const frame = useRef(0);
  const reduced = usePrefersReducedMotion();

  const onMove = useCallback(
    (event) => {
      if (reduced) return;
      const node = ref.current;
      if (!node || frame.current) return;

      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const rect = node.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        node.style.transform = `perspective(1000px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(0)`;
        node.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        node.style.setProperty('--my', `${event.clientY - rect.top}px`);
      });
    },
    [max, reduced]
  );

  const onLeave = useCallback(() => {
    const node = ref.current;
    if (node) node.style.transform = '';
  }, []);

  useEffect(() => () => frame.current && cancelAnimationFrame(frame.current), []);

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`spotlight transition-transform duration-500 ease-spring ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

/* -----------------------------------------------------------------------------
   Skeleton — betöltési váz

   Pörgő ikon helyett a tartalom alakját mutatjuk. Így az oldal nem „ugrik”
   betöltéskor, és gyorsabbnak is érződik.
----------------------------------------------------------------------------- */
export const Skeleton = ({ className = '' }) => (
  <div
    aria-hidden="true"
    className={`relative overflow-hidden rounded-lg bg-sand-300/60 ${className}`}
  >
    <div
      className="absolute inset-0 -translate-x-full animate-shimmer"
      style={{ background: 'linear-gradient(90deg, transparent, oklch(var(--s-50) / 0.5), transparent)' }}
    />
  </div>
);

export const SkeletonCard = () => (
  <div className="card space-y-4 p-6">
    <Skeleton className="h-10 w-10 rounded-xl" />
    <Skeleton className="h-5 w-2/3" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
    <Skeleton className="mt-6 h-9 w-32 rounded-lg" />
  </div>
);
