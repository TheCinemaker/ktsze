import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, LayoutDashboard, ShieldCheck, Sun, Moon, ArrowUpRight } from 'lucide-react';
import { HeaderLogo } from './HeaderLogo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { useScrollDirection } from '../../lib/motion';

const PUBLIC_LINKS = [
  { to: '/', label: 'Főoldal' },
  { to: '/egyesulet', label: 'Egyesületünk' },
  { to: '/munkacsoportok', label: 'Munkacsoportok' },
  { to: '/hirek', label: 'Hírek' },
  { to: '/dokumentumok', label: 'Dokumentumok' },
  { to: '/tagsag', label: 'Tagság' },
  { to: '/kapcsolat', label: 'Kapcsolat' }
];

/* ---------------------------------------------------------------------------
   Téma-kapcsoló

   Az esemény koordinátáját továbbadjuk: a View Transition köre pontosan a
   megnyomott gombból tárul fel, nem a képernyő közepéből. Ez a kis részlet
   köti össze a mozdulatot az eredményével.
   --------------------------------------------------------------------------- */
const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={(e) => toggle({ clientX: e.clientX, clientY: e.clientY })}
      aria-label={isDark ? 'Váltás világos témára' : 'Váltás sötét témára'}
      title={isDark ? 'Világos téma' : 'Sötét téma'}
      className={`group relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full
                  border border-sand-400 bg-paper text-ink-600 transition-all duration-500 ease-lux
                  hover:border-gold-400 hover:text-gold-600 ${className}`}
    >
      {/* A két ikon egymáson ül és elforogva vált — nincs ugrás, nincs elrendezés-váltás. */}
      <Sun
        className={`absolute h-[1.05rem] w-[1.05rem] transition-all duration-500 ease-lux
                    ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'}`}
        aria-hidden="true"
      />
      <Moon
        className={`absolute h-[1.05rem] w-[1.05rem] transition-all duration-500 ease-lux
                    ${isDark ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
        aria-hidden="true"
      />
    </button>
  );
};

/* ---------------------------------------------------------------------------
   Csúszó aktív-jelölő

   Nem minden linknek van saját háttere, hanem EGY pirula csúszik a helyére.
   Ettől lesz a navigáció folytonos mozgás, nem pedig ki-be kapcsoló dobozok
   sorozata. A pozíciót méréssel kapjuk, hogy tetszőleges szöveghosszal jó legyen.
   --------------------------------------------------------------------------- */
const DesktopLinks = () => {
  const { pathname } = useLocation();
  const listRef = useRef(null);
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });

  const measure = useCallback(() => {
    const list = listRef.current;
    // A NavLink az aktív elemre magától kiteszi az aria-current="page"-et,
    // így nem kell külön jelölőattribútumot vezetnünk.
    const active = list?.querySelector('a[aria-current="page"]');
    if (!list || !active) {
      setPill((p) => ({ ...p, ready: false }));
      return;
    }
    setPill({ left: active.offsetLeft, width: active.offsetWidth, ready: true });
  }, []);

  useLayoutEffect(() => {
    measure();
    // A webfont később érkezik meg, mint az első mérés — utána újramérünk,
    // különben a pirula a fallback betűtípus szélességén ragad.
    document.fonts?.ready.then(measure);

    const observer = new ResizeObserver(measure);
    if (listRef.current) observer.observe(listRef.current);
    return () => observer.disconnect();
  }, [pathname, measure]);

  return (
    <div ref={listRef} className="relative hidden items-center gap-0.5 lg:flex">
      <span
        aria-hidden="true"
        className="absolute inset-y-1 rounded-full bg-wine-100 transition-[left,width,opacity] duration-500 ease-lux"
        style={{ left: pill.left, width: pill.width, opacity: pill.ready ? 1 : 0 }}
      />
      {PUBLIC_LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/'}
          className={({ isActive }) =>
            `relative z-10 rounded-full px-3.5 py-2 text-sm transition-colors duration-300 ${
              isActive ? 'font-medium text-wine-700' : 'text-ink-600 hover:text-ink-900'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  );
};

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, profile, roleLabel, can, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { scrolled, hidden } = useScrollDirection();

  useEffect(() => setMobileOpen(false), [location.pathname]);

  // Nyitott mobilmenü mögött ne lehessen görgetni, és Escape zárja be.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setMobileOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.info('Kiléptél a rendszerből.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const displayName = profile?.full_name || profile?.service_location_name || profile?.account_email;

  return (
    <>
      {/* Olvasási haladás: hajszálvékony arany vonal, tisztán CSS-ből
          (scroll-driven animation), nulla JS-eseménykezelővel. */}
      <div
        aria-hidden="true"
        className="scroll-progress fixed inset-x-0 top-0 z-[60] h-[2px] origin-left scale-x-0
                   bg-gradient-to-r from-wine-500 via-gold-500 to-jade-500"
      />

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-lux
                    ${hidden && !mobileOpen ? '-translate-y-[130%]' : 'translate-y-0'}`}
      >
        <a
          href="#main"
          className="sr-only-focusable absolute left-6 top-6 z-50 rounded-lg bg-wine-600 px-3 py-2 text-sm text-paper"
        >
          Ugrás a tartalomra
        </a>

        <nav className="container-page" aria-label="Fő navigáció">
          {/*
            Lebegő sziget. Görgetés nélkül szinte súlytalan; amint elindul a
            tartalom, összehúzódik és üvegessé válik — így a navigáció maga
            jelzi, hogy elhagytuk a lap tetejét.
          */}
          <div
            className={`mt-3 flex items-center justify-between gap-4 rounded-full border px-3 py-2
                        transition-all duration-500 ease-lux sm:mt-4 sm:px-4
                        ${
                          scrolled
                            ? 'border-sand-300/80 bg-paper/72 shadow-lift backdrop-blur-2xl backdrop-saturate-150'
                            : 'border-transparent bg-transparent shadow-none'
                        }`}
          >
            <Link
              to="/"
              className="shrink-0 rounded-full transition-transform duration-500 ease-lux hover:scale-[1.03]"
              aria-label="Főoldal"
            >
              <HeaderLogo compact={scrolled} />
            </Link>

            <DesktopLinks />

            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />

              <div className="hidden items-center gap-2 lg:flex">
                {isAuthenticated ? (
                  <>
                    {can('admin.access') && (
                      <NavLink to="/elnokseg" className="btn-secondary btn-sm rounded-full">
                        <ShieldCheck className="h-4 w-4 text-wine-600" aria-hidden="true" />
                        Elnökség
                      </NavLink>
                    )}
                    <NavLink to="/tagi" className="btn-secondary btn-sm rounded-full">
                      <LayoutDashboard className="h-4 w-4 text-wine-600" aria-hidden="true" />
                      Tagi portál
                    </NavLink>
                    <button type="button" onClick={handleLogout} className="btn-ghost btn-sm rounded-full">
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Kilépés
                    </button>
                  </>
                ) : (
                  <NavLink to="/belepes" className="btn-primary btn-sm rounded-full pr-3">
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    Belépés
                  </NavLink>
                )}
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? 'Menü bezárása' : 'Menü megnyitása'}
                className="grid h-9 w-9 place-items-center rounded-full border border-sand-400 bg-paper
                           text-ink-800 transition-colors hover:border-wine-400 hover:text-wine-600 lg:hidden"
              >
                {mobileOpen ? (
                  <X className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
                ) : (
                  <Menu className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobil menü: teljes képernyős lap, nem lenyíló doboz. Kevés elem,
          nagy tipográfia, lépcsőzött érkezés. */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-40 animate-fade-in overflow-y-auto bg-sand-100/95 backdrop-blur-2xl lg:hidden"
        >
          <div className="container-page grain relative flex min-h-full flex-col justify-between pb-10 pt-28">
            <div>
              {PUBLIC_LINKS.map((link, i) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  style={{ animationDelay: `${i * 45}ms` }}
                  className={({ isActive }) =>
                    `group flex animate-slide-up items-center justify-between border-b border-sand-300 py-4
                     font-display text-3xl transition-colors ${
                       isActive ? 'text-wine-600' : 'text-ink-900 hover:text-wine-600'
                     }`
                  }
                >
                  {link.label}
                  <ArrowUpRight
                    className="h-5 w-5 text-ink-300 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-wine-600"
                    aria-hidden="true"
                  />
                </NavLink>
              ))}
            </div>

            <div className="mt-10 space-y-2.5">
              {isAuthenticated ? (
                <>
                  {displayName && (
                    <p className="pb-1 font-mono text-2xs uppercase tracking-widest text-ink-500">
                      {displayName}
                      {roleLabel ? ` · ${roleLabel}` : ''}
                    </p>
                  )}
                  {can('admin.access') && (
                    <NavLink to="/elnokseg" className="btn-secondary w-full">
                      <ShieldCheck className="h-4 w-4 text-wine-600" aria-hidden="true" />
                      Elnökségi felület
                    </NavLink>
                  )}
                  <NavLink to="/tagi" className="btn-secondary w-full">
                    <LayoutDashboard className="h-4 w-4 text-wine-600" aria-hidden="true" />
                    Tagi portál
                  </NavLink>
                  <button type="button" onClick={handleLogout} className="btn-ghost w-full">
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Kilépés
                  </button>
                </>
              ) : (
                <NavLink to="/belepes" className="btn-primary btn-lg w-full">
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Belépés a tagi portálra
                </NavLink>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
