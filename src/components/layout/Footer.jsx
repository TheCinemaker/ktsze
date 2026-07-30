import React from 'react';
import { Link } from 'react-router-dom';
import { HeaderLogo } from './HeaderLogo';
import { ORGANIZATION, formattedAddress, socialLinks } from '../../config/organization';

export const Footer = () => {
  const address = formattedAddress();
  const socials = socialLinks();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-sand-400 bg-sand-200">
      <div className="container-page py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-sand-300 pb-8">
          {/* Logo & Egyesületi Név */}
          <div className="space-y-2">
            <HeaderLogo />
            <p className="text-sm font-medium text-ink-700">{ORGANIZATION.legalName}</p>
            <p className="text-xs text-ink-500">Digitális Kőszeg Program | Okos Turisztikai Portál</p>
          </div>

          {/* Gyorshivatkozások & Jogi elemek */}
          <nav aria-label="Lábléc navigáció" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-ink-700">
            <Link to="/dokumentumok" className="hover:text-wine-700 transition-colors">
              Hivatalos Dokumentumok
            </Link>
            <Link to="/kapcsolat" className="hover:text-wine-700 transition-colors">
              Kapcsolat &amp; Visszajelzés
            </Link>
            <Link to="/adatvedelem" className="hover:text-wine-700 transition-colors">
              Adatvédelem &amp; GDPR
            </Link>
            <Link to="/belepes" className="hover:text-wine-700 font-bold text-wine-800 transition-colors">
              Zárt Tagi Portál
            </Link>
          </nav>
        </div>

        {/* Alsó copyright, Cégjelzés & Közösségi hivatkozások */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-500">
          <p>© {year} {ORGANIZATION.shortName}. Minden jog fenntartva.</p>
          <p>
            Fejlesztette és üzemelteti:{' '}
            <a
              href="mailto:avar.szilveszter@gmail.com"
              className="font-medium text-wine-700 underline decoration-wine-300 underline-offset-2 hover:text-wine-900"
            >
              SA Software &amp; Network Solutions
            </a>
          </p>
          {socials.length > 0 && (
            <ul className="flex items-center gap-4">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-wine-700 transition-colors"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
};
