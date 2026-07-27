import React from 'react';
import { Link } from 'react-router-dom';
import { HeaderLogo } from './HeaderLogo';
import { ORGANIZATION, formattedAddress, socialLinks } from '../../config/organization';

// A lábléc CSAK azt írja ki, ami a src/config/organization.js-ben tényleg
// be van állítva. Üres mező -> nem jelenik meg semmi a helyén.
// Korábban itt egy beégetett bankszámlaszám szerepelt; az kikerült.

const NAV = [
  { to: '/egyesulet', label: 'Egyesületünk' },
  { to: '/munkacsoportok', label: 'Munkacsoportok' },
  { to: '/hirek', label: 'Hírek' },
  { to: '/dokumentumok', label: 'Dokumentumok' },
  { to: '/tagsag', label: 'Tagság' },
  { to: '/kapcsolat', label: 'Kapcsolat' }
];

export const Footer = () => {
  const address = formattedAddress();
  const socials = socialLinks();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-sand-400 bg-sand-200">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Azonosítás */}
          <div className="space-y-4">
            <HeaderLogo />
            <p className="max-w-sm text-sm text-ink-600">{ORGANIZATION.legalName}</p>

            {socials.length > 0 && (
              <ul className="flex flex-wrap gap-3">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded text-sm text-wine-600 underline decoration-wine-300 underline-offset-2 hover:decoration-wine-600"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Navigáció */}
          <nav aria-label="Lábléc navigáció">
            <h2 className="font-display text-base text-ink-900">Oldalak</h2>
            <ul className="mt-3 space-y-2">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="rounded text-sm text-ink-600 transition-colors hover:text-wine-600">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kapcsolat — csak a kitöltött adatok */}
          <div>
            <h2 className="font-display text-base text-ink-900">Elérhetőség</h2>
            {address || ORGANIZATION.email || ORGANIZATION.phone ? (
              <ul className="mt-3 space-y-2 text-sm text-ink-600">
                {address && <li>{address}</li>}
                {ORGANIZATION.email && (
                  <li>
                    <a href={`mailto:${ORGANIZATION.email}`} className="rounded hover:text-wine-600">
                      {ORGANIZATION.email}
                    </a>
                  </li>
                )}
                {ORGANIZATION.phone && (
                  <li>
                    <a href={`tel:${ORGANIZATION.phone.replace(/\s/g, '')}`} className="rounded hover:text-wine-600">
                      {ORGANIZATION.phone}
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-500">
                Az elérhetőségek feltöltése folyamatban.
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-sand-400 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {ORGANIZATION.legalName}
          </p>
          <p>
            Designed by{' '}
            <a
              href="mailto:avar.szilveszter@gmail.com"
              className="font-medium text-wine-600 underline decoration-wine-300 underline-offset-2 hover:decoration-wine-600"
            >
              SA Software &amp; Network Solutions
            </a>
          </p>
          {ORGANIZATION.taxNumber && <p>Adószám: {ORGANIZATION.taxNumber}</p>}
        </div>
      </div>
    </footer>
  );
};
