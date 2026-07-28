import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, LayoutDashboard, ShieldCheck, Sun, Moon, Monitor, Search } from 'lucide-react';

import { HeaderLogo } from './HeaderLogo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

const PUBLIC_LINKS = [
  { to: '/', label: 'Főoldal' },
  { to: '/egyesulet', label: 'Egyesületünk' },
  { to: '/munkacsoportok', label: 'Munkacsoportok' },
  { to: '/hirek', label: 'Hírek' },
  { to: '/dokumentumok', label: 'Dokumentumok' },
  { to: '/tagsag', label: 'Tagság' },
  { to: '/kapcsolat', label: 'Kapcsolat' }
];

/* -----------------------------------------------------------------------------
   Téma-kapcsoló — három állapot egy gombon
----------------------------------------------------------------------------- */
const ThemeToggle = ({ compact = false }) => {
  const { preference, cycle } = useTheme();

  const config = {
    light: { Icon: Sun, label: 'Világos téma', next: 'sötétre' },
    dark: { Icon: Moon, label: 'Sötét téma', next: 'rendszerre' },
    system: { Icon: Monitor, label: 'Rendszer szerinti téma', next: 'világosra' }
  }[preference];

  const { Icon } = config;

  return (
    <button
      type="button"
      onClick={cycle}
      title={`${config.label} — kattints a váltáshoz (${config.next})`}
      aria-label={`${config.label}. Kattints a váltáshoz.`}
      className={`group relative grid place-items-center rounded-xl border border-sand-400 text-ink-600
                  transition-all duration-300 ease-swift hover:border-gold-500 hover:text-wine-600
                  ${compact ? 'h-10 w-10' : 'h-9 w-9'}`}
      style={{ backgroundColor: 'oklch(var(--s-50) / 0.55)' }}
    >
      <Icon className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:rotate-[18deg]" aria-hidden="true" />
    </button>
  );
};

/* -----------------------------------------------------------------------------
   Parancspaletta-indító gomb
----------------------------------------------------------------------------- */
const CommandHint = () => {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/mac|iphone|ipad/i.test(navigator.userAgent));
  }, []);

  const open = () => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true })
    );
  };

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Gyorskeresés megnyitása"
      className="group hidden items-center gap-2.5 rounded-xl border border-sand-400 py-2 pl-3 pr-2
                 text-xs text-ink-500 transition-all duration-300 ease-swift
                 hover:border-gold-500 hover:text-ink-900 xl:flex"
      style={{ backgroundColor: 'oklch(var(--s-50) / 0.55)' }}
    >
      <Search className="h-3.5 w-3.5" aria-hidden="true" />
      <span>Gyorskeresés</span>
      <kbd className="rounded-md border border-sand-400 bg-sand-200 px-1.5 py-0.5 font-mono text-2xs text-ink-500">
        {isMac ? '⌘' : 'Ctrl'} K
      </kbd>
    </button>
  );
};

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, profile, roleLabel, can, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const navRef = useRef(null);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  // A fejléc görgetéskor összehúzódik és üveglappá válik.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    <header
      ref={navRef}
      className={`sticky top-0 z-50 transition-all duration-500 ease-swift ${
        scrolled ? 'glass-strong border-b border-sand-400 shadow-card' : 'border-b border-transparent'
      }`}
    >
      <a
        href="#main"
        className="sr-only-focusable absolute left-5 top-3 z-50 rounded-xl bg-wine-600 px-4 py-2 text-sm text-white"
      >
        Ugrás a tartalomra
      </a>

      <nav className="container-page" aria-label="Fő navigáció">
        <div
          className={`flex items-center justify-between gap-6 transition-all duration-500 ease-swift ${
            scrolled ? 'h-16' : 'h-20'
          }`}
        >
          <Link to="/" className="shrink-0 rounded-xl" aria-label="Főoldal">
            <HeaderLogo />
          </Link>

          {/* Asztali menü — a kapszula maga is üveglap */}
          <div className="hidden items-center rounded-2xl border border-sand-400 p-1 lg:flex"
               style={{ backgroundColor: 'oklch(var(--s-50) / 0.4)' }}>
            {PUBLIC_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                viewTransition
                className={({ isActive }) =>
                  `relative rounded-xl px-3.5 py-2 text-sm font-medium transition-colors duration-300 ${
                    isActive ? 'text-wine-600' : 'text-ink-600 hover:text-ink-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-xl border border-gold-500/40"
                        style={{ backgroundColor: 'oklch(var(--w-600) / 0.10)' }}
                      />
                    )}
                    <span className="relative">{link.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Jobb oldali műveletek */}
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <CommandHint />
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {can('admin.access') && (
                  <NavLink to="/elnokseg" viewTransition className="btn-secondary btn-sm">
                    <ShieldCheck className="h-4 w-4 text-wine-600" aria-hidden="true" />
                    Elnökség
                  </NavLink>
                )}
                <NavLink to="/tagi" viewTransition className="btn-secondary btn-sm">
                  <LayoutDashboard className="h-4 w-4 text-wine-600" aria-hidden="true" />
                  Portál
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Kilépés"
                  className="grid h-9 w-9 place-items-center rounded-xl border border-transparent text-ink-500
                             transition-colors duration-300 hover:border-wine-300 hover:text-wine-600"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                </button>
              </>
            ) : (
              <NavLink to="/belepes" viewTransition className="btn-primary btn-sm btn-sheen">
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Belépés
              </NavLink>
            )}
          </div>

          {/* Mobil */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle compact />
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? 'Menü bezárása' : 'Menü megnyitása'}
              className="grid h-10 w-10 place-items-center rounded-xl border border-sand-400 text-ink-900
                         transition-colors duration-300 hover:border-gold-500"
              style={{ backgroundColor: 'oklch(var(--s-50) / 0.55)' }}
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Alsó arany hajszálvonal — csak görgetés után */}
      <div
        aria-hidden="true"
        className={`h-px w-full transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background:
            'linear-gradient(90deg, transparent, oklch(var(--g-500) / 0.5) 30%, oklch(var(--w-500) / 0.4) 70%, transparent)'
        }}
      />

      {/* Mobil menü */}
      {mobileOpen && (
        <div id="mobile-menu" className="glass-strong border-t border-sand-400 lg:hidden">
          <div className="container-page space-y-1 py-4">
            {PUBLIC_LINKS.map((link, index) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                viewTransition
                style={{ animationDelay: `${index * 30}ms` }}
                className={({ isActive }) =>
                  `block animate-slide-up rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                    isActive ? 'border border-gold-500/40 bg-wine-600/10 text-wine-600' : 'text-ink-800'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-4 space-y-2 border-t border-sand-400 pt-4">
              {isAuthenticated ? (
                <>
                  {displayName && (
                    <p className="px-4 pb-1 text-xs text-ink-500">
                      {displayName}
                      {roleLabel ? ` — ${roleLabel}` : ''}
                    </p>
                  )}
                  {can('admin.access') && (
                    <NavLink to="/elnokseg" viewTransition className="btn-secondary w-full">
                      <ShieldCheck className="h-4 w-4 text-wine-600" aria-hidden="true" />
                      Elnökségi felület
                    </NavLink>
                  )}
                  <NavLink to="/tagi" viewTransition className="btn-secondary w-full">
                    <LayoutDashboard className="h-4 w-4 text-wine-600" aria-hidden="true" />
                    Tagi portál
                  </NavLink>
                  <button type="button" onClick={handleLogout} className="btn-ghost w-full">
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Kilépés
                  </button>
                </>
              ) : (
                <NavLink to="/belepes" viewTransition className="btn-primary w-full">
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Belépés
                </NavLink>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
