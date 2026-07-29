import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, LayoutDashboard, ShieldCheck, Search } from 'lucide-react';
import { HeaderLogo } from './HeaderLogo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CommandPalette } from '../ui/CommandPalette';

const PUBLIC_LINKS = [
  { to: '/', label: 'Főoldal' },
  { to: '/egyesulet', label: 'Egyesületünk' },
  { to: '/munkacsoportok', label: 'Munkacsoportok' },
  { to: '/hirek', label: 'Hírek' },
  { to: '/dokumentumok', label: 'Dokumentumok' },
  { to: '/tagsag', label: 'Tagság' },
  { to: '/kapcsolat', label: 'Kapcsolat' }
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, profile, roleLabel, can, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // Oldalváltásnál csukjuk be a mobil menüt.
  useEffect(() => setMobileOpen(false), [location.pathname]);

  // Görgetésre válaszoló dinamikus zsugorodó header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cmd+K / Ctrl+K billentyűparancs figyelés
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
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

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-all ${
      isActive ? 'bg-wine-100/80 text-wine-800 font-bold shadow-xs' : 'text-ink-700 hover:bg-sand-200 hover:text-ink-900'
    }`;

  const displayName = profile?.full_name || profile?.service_location_name || profile?.account_email;

  return (
    <>
      <header className={`sticky top-0 z-40 border-b border-sand-300/80 bg-white/90 backdrop-blur-xl transition-all duration-300 ${scrolled ? 'py-1 shadow-md' : 'py-2 shadow-xs'}`}>
        {/* Billentyűzetes navigációhoz: átugrás a tartalomra */}
        <a
          href="#main"
          className="sr-only-focusable absolute left-4 top-3 z-50 rounded-lg bg-wine-600 px-3 py-2 text-sm text-white"
        >
          Ugrás a tartalomra
        </a>

        <nav className="container-page" aria-label="Fő navigáció">
          <div className={`flex items-center justify-between gap-4 transition-all duration-300 ${scrolled ? 'h-14' : 'h-16'}`}>
            <Link to="/" className="shrink-0 rounded-lg transition-transform hover:scale-105" aria-label="Főoldal">
              <HeaderLogo />
            </Link>

            {/* Asztali menü */}
            <div className="hidden items-center gap-0.5 lg:flex">
              {PUBLIC_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="hidden shrink-0 items-center gap-3 lg:flex">
              {/* Cmd+K Gyorskereső gomb */}
              <button
                type="button"
                onClick={() => setCmdOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-sand-300 bg-sand-50/80 px-3 py-1.5 text-xs font-semibold text-ink-600 transition-all hover:border-wine-400 hover:bg-white hover:text-wine-700 hover:shadow-sm"
                title="Gyorskereső nyitása (Ctrl+K)"
              >
                <Search className="h-3.5 w-3.5 text-wine-600" />
                <span>Keresés...</span>
                <kbd className="rounded border border-sand-300 bg-white px-1.5 py-0.5 text-[10px] font-mono text-ink-400">
                  Ctrl K
                </kbd>
              </button>
            {isAuthenticated ? (
              <>
                {can('admin.access') && (
                  <NavLink to="/elnokseg" className="btn-secondary btn-sm">
                    <ShieldCheck className="h-4 w-4 text-wine-600" aria-hidden="true" />
                    Elnökség
                  </NavLink>
                )}
                <NavLink to="/tagi" className="btn-secondary btn-sm">
                  <LayoutDashboard className="h-4 w-4 text-wine-600" aria-hidden="true" />
                  Tagi portál
                </NavLink>
                <button type="button" onClick={handleLogout} className="btn-ghost btn-sm">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Kilépés
                </button>
              </>
            ) : (
              <NavLink to="/belepes" className="btn-primary btn-sm">
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Belépés
              </NavLink>
            )}
          </div>

          {/* Mobil kapcsoló */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Menü bezárása' : 'Menü megnyitása'}
            className="btn-secondary btn-sm lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobil menü */}
      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-sand-400 bg-sand-100 lg:hidden">
          <div className="container-page space-y-1 py-3">
            {PUBLIC_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                    isActive ? 'bg-wine-50 text-wine-600' : 'text-ink-800 hover:bg-sand-200'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-3 space-y-2 border-t border-sand-400 pt-3">
              {isAuthenticated ? (
                <>
                  {displayName && (
                    <p className="px-3 text-xs text-ink-500">
                      {displayName}
                      {roleLabel ? ` — ${roleLabel}` : ''}
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
                <NavLink to="/belepes" className="btn-primary w-full">
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Belépés
                </NavLink>
              )}
            </div>
          </div>
        </div>
      )}
    </header>

    <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
  </>);
};
