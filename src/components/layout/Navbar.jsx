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
  { to: '/viragos-koszeg', label: '🌸 Kőszeg Virágzik' },
  { to: '/hirek', label: 'Hírek' },
  { to: '/tagsag', label: 'Tagság' }
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
    } catch (err) {
      toast.error(err.message);
    }
  };

  const linkClass = ({ isActive }) =>
    `rounded-lg px-2 py-1.5 xl:px-3 text-xs xl:text-sm font-semibold transition-all whitespace-nowrap ${
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
          <div className={`flex items-center justify-between gap-2 xl:gap-4 transition-all duration-300 ${scrolled ? 'h-14' : 'h-16'}`}>
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

            <div className="hidden shrink-0 items-center gap-2 xl:gap-3 lg:flex">
              {/* Cmd+K Gyorskereső gomb (Kompakt ikonos változat a tökéletes illeszkedésért) */}
              <button
                type="button"
                onClick={() => setCmdOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-sand-300 bg-sand-50/80 px-2.5 py-1 text-xs font-semibold text-ink-700 transition-all hover:border-wine-400 hover:bg-wine-50 hover:text-wine-700 hover:shadow-xs"
                title="Gyorskereső parancspaletta nyitása (Ctrl+K)"
              >
                <Search className="h-4 w-4 text-wine-600" />
                <span className="hidden xl:inline">Keresés...</span>
                <kbd className="hidden xl:inline-block rounded border border-sand-300 bg-white px-1.5 py-0.5 text-[10px] font-mono text-ink-400">
                  Ctrl K
                </kbd>
              </button>

              {isAuthenticated ? (
                <>
                  {can('admin.access') && (
                    <NavLink to="/elnokseg" className="btn-secondary btn-sm py-1.5 px-2.5 text-xs whitespace-nowrap">
                      <ShieldCheck className="h-4 w-4 text-wine-600" aria-hidden="true" />
                      Elnökség
                    </NavLink>
                  )}
                  <NavLink to="/tagi" className="btn-secondary btn-sm py-1.5 px-2.5 text-xs whitespace-nowrap">
                    <LayoutDashboard className="h-4 w-4 text-wine-600" aria-hidden="true" />
                    Tagi portál
                  </NavLink>
                  <button type="button" onClick={handleLogout} className="btn-ghost btn-sm py-1.5 px-2.5 text-xs whitespace-nowrap">
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Kilépés
                  </button>
                </>
              ) : (
                <NavLink to="/belepes" className="btn-primary btn-sm py-1.5 px-3 text-xs whitespace-nowrap">
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Belépés
                </NavLink>
              )}
            </div>

            {/* Mobil kapcsoló & kereső gomb */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setCmdOpen(true)}
                className="btn-secondary btn-sm p-2"
                title="Keresés..."
              >
                <Search className="h-5 w-5 text-wine-600" />
              </button>

              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? 'Menü bezárása' : 'Menü megnyitása'}
                className="btn-secondary btn-sm"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobil menü */}
        {mobileOpen && (
          <div id="mobile-menu" className="border-t border-sand-400 bg-sand-100 lg:hidden">
            <div className="container-page space-y-1 py-3">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setCmdOpen(true);
                }}
                className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-ink-800 border border-sand-300 shadow-xs"
              >
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-wine-600" />
                  Keresés a portálon…
                </span>
                <span className="text-xs text-ink-400 font-mono">Ctrl+K</span>
              </button>

              {PUBLIC_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                      isActive ? 'bg-wine-50 text-wine-600 font-bold' : 'text-ink-800 hover:bg-sand-200'
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
                      <NavLink to="/elnokseg" onClick={() => setMobileOpen(false)} className="btn-secondary w-full">
                        <ShieldCheck className="h-4 w-4 text-wine-600" aria-hidden="true" />
                        Elnökségi felület
                      </NavLink>
                    )}
                    <NavLink to="/tagi" onClick={() => setMobileOpen(false)} className="btn-secondary w-full">
                      <LayoutDashboard className="h-4 w-4 text-wine-600" aria-hidden="true" />
                      Tagi portál
                    </NavLink>
                    <button type="button" onClick={handleLogout} className="btn-ghost w-full">
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Kilépés
                    </button>
                  </>
                ) : (
                  <NavLink to="/belepes" onClick={() => setMobileOpen(false)} className="btn-primary w-full">
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
    </>
  );
};
