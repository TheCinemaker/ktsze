import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Home, Users, Newspaper, FileText, Wallet, Mail, LogIn, LogOut,
  LayoutDashboard, ShieldCheck, Sun, Moon, Monitor, CornerDownLeft, Command
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

/* =============================================================================
   Parancspaletta — Ctrl/Cmd + K

   Egy billentyűvel bárhová. Ez ma már alapelvárás minden komoly felületen:
   az egérrel navigálás lassú, ha valaki napi szinten használja a rendszert.

   Ékezetfüggetlen keresés: a „munkacsoport” a „Munkacsoportok”-ra is illeszkedik,
   és a „kozseg” is megtalálja a „Kőszeg”-et.
   ============================================================================= */

const normalize = (text) =>
  (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const navigate = useNavigate();
  const { isAuthenticated, can, logout } = useAuth();
  const { setTheme, preference } = useTheme();
  const toast = useToast();
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const commands = useMemo(() => {
    const go = (to) => () => navigate(to);

    const items = [
      { id: 'home', label: 'Főoldal', hint: 'Nyitóoldal', icon: Home, group: 'Navigáció', run: go('/') },
      { id: 'about', label: 'Egyesületünk', hint: 'Bemutatkozás, hivatalos adatok', icon: Users, group: 'Navigáció', run: go('/egyesulet') },
      { id: 'wg', label: 'Munkacsoportok', hint: 'Csatlakozás, projektek', icon: Users, group: 'Navigáció', run: go('/munkacsoportok') },
      { id: 'news', label: 'Hírek', hint: 'Közlemények és programok', icon: Newspaper, group: 'Navigáció', run: go('/hirek') },
      { id: 'docs', label: 'Dokumentumok', hint: 'Nyilvános iratok', icon: FileText, group: 'Navigáció', run: go('/dokumentumok') },
      { id: 'join', label: 'Tagság', hint: 'Tagdíjak, csatlakozás', icon: Wallet, group: 'Navigáció', run: go('/tagsag') },
      { id: 'contact', label: 'Kapcsolat', hint: 'Elérhetőségek', icon: Mail, group: 'Navigáció', run: go('/kapcsolat') }
    ];

    if (isAuthenticated) {
      items.push({
        id: 'member', label: 'Tagi portál', hint: 'Tagdíj, csoportjaim, adatlap',
        icon: LayoutDashboard, group: 'Fiók', run: go('/tagi')
      });
      if (can('admin.access')) {
        items.push({
          id: 'admin', label: 'Elnökségi felület', hint: 'Tagok, hírek, jelentkezések',
          icon: ShieldCheck, group: 'Fiók', run: go('/elnokseg')
        });
      }
      items.push({
        id: 'logout', label: 'Kilépés', hint: 'Munkamenet lezárása', icon: LogOut, group: 'Fiók',
        run: async () => {
          try {
            await logout();
            navigate('/');
            toast.info('Kiléptél a rendszerből.');
          } catch (err) {
            toast.error(err.message);
          }
        }
      });
    } else {
      items.push({ id: 'login', label: 'Belépés', hint: 'Tagi és elnökségi hozzáférés', icon: LogIn, group: 'Fiók', run: go('/belepes') });
    }

    items.push(
      { id: 't-light', label: 'Világos téma', hint: preference === 'light' ? 'Aktív' : 'Elefántcsont', icon: Sun, group: 'Megjelenés', run: () => setTheme('light') },
      { id: 't-dark', label: 'Sötét téma', hint: preference === 'dark' ? 'Aktív' : 'Éjfél', icon: Moon, group: 'Megjelenés', run: () => setTheme('dark') },
      { id: 't-sys', label: 'Rendszer szerint', hint: preference === 'system' ? 'Aktív' : 'Operációs rendszer beállítása', icon: Monitor, group: 'Megjelenés', run: () => setTheme('system') }
    );

    return items;
  }, [isAuthenticated, can, navigate, logout, toast, setTheme, preference]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return commands;
    return commands.filter((c) => normalize(`${c.label} ${c.hint} ${c.group}`).includes(q));
  }, [commands, query]);

  // Csoportosított megjelenítés, de a billentyűzetes mozgás a lapos listán megy.
  const grouped = useMemo(() => {
    const map = new Map();
    results.forEach((item) => {
      const list = map.get(item.group) || [];
      list.push(item);
      map.set(item.group, list);
    });
    return [...map.entries()];
  }, [results]);

  // Globális gyorsbillentyű
  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    setQuery('');
    setActive(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);

  // A kiválasztott elem mindig maradjon látótérben
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const runCommand = useCallback(
    async (item) => {
      setOpen(false);
      await item.run();
    },
    []
  );

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => (i + 1) % Math.max(results.length, 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (i - 1 + results.length) % Math.max(results.length, 1));
    }
    if (event.key === 'Enter' && results[active]) {
      event.preventDefault();
      runCommand(results[active]);
    }
  };

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[12vh] animate-fade-in">
      <button
        type="button"
        aria-label="Bezárás"
        tabIndex={-1}
        onClick={() => setOpen(false)}
        className="fixed inset-0 h-full w-full cursor-default border-0 bg-sand-100/40 backdrop-blur-md"
        style={{ backgroundColor: 'oklch(var(--i-900) / 0.42)' }}
      />

      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Parancspaletta"
        onKeyDown={onKeyDown}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-sand-400 shadow-overlay animate-slide-up glass-strong"
      >
        {/* Keresőmező */}
        <div className="flex items-center gap-3 border-b border-sand-400 px-4">
          <Search className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ugrás oldalra, téma váltása…"
            aria-label="Keresés a parancsok között"
            className="w-full border-0 bg-transparent py-4 text-base text-ink-900 outline-none placeholder:text-ink-400"
          />
          <kbd className="hidden shrink-0 rounded-md border border-sand-400 bg-sand-200 px-1.5 py-0.5 font-mono text-2xs text-ink-500 sm:block">
            ESC
          </kbd>
        </div>

        {/* Találatok */}
        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-ink-500">Nincs találat erre: „{query}”</p>
          ) : (
            grouped.map(([group, items]) => (
              <div key={group} className="mb-1">
                <p className="px-3 pb-1 pt-2 text-2xs font-semibold uppercase tracking-[0.16em] text-ink-400">
                  {group}
                </p>
                {items.map((item) => {
                  flatIndex += 1;
                  const index = flatIndex;
                  const isActive = index === active;
                  const { icon: Icon } = item;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-active={isActive}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => runCommand(item)}
                      className={`flex w-full items-center gap-3 rounded-xl border-0 px-3 py-2.5 text-left transition-colors duration-150 ${
                        isActive ? 'bg-wine-600/12 text-ink-900' : 'bg-transparent text-ink-600'
                      }`}
                    >
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-colors ${
                          isActive ? 'border-gold-500 bg-sand-50/70 text-wine-600' : 'border-sand-400 text-ink-500'
                        }`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink-900">{item.label}</span>
                        <span className="block truncate text-xs text-ink-500">{item.hint}</span>
                      </span>

                      {isActive && (
                        <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Lábléc */}
        <div className="flex items-center justify-between border-t border-sand-400 px-4 py-2.5 text-2xs text-ink-500">
          <span className="flex items-center gap-1.5">
            <Command className="h-3 w-3" aria-hidden="true" />
            Kőszegi Turisztikai Szövetség
          </span>
          <span className="hidden items-center gap-3 sm:flex">
            <span>↑↓ mozgás</span>
            <span>↵ megnyitás</span>
          </span>
        </div>
      </div>
    </div>
  );
};
