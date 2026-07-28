import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { LogoMark } from './HeaderLogo';
import { ORGANIZATION, formattedAddress, socialLinks } from '../../config/organization';

const COLUMNS = [
  {
    title: 'Egyesület',
    links: [
      { to: '/egyesulet', label: 'Egyesületünk' },
      { to: '/munkacsoportok', label: 'Munkacsoportok' },
      { to: '/tagsag', label: 'Tagság' }
    ]
  },
  {
    title: 'Nyilvánosság',
    links: [
      { to: '/hirek', label: 'Hírek' },
      { to: '/dokumentumok', label: 'Dokumentumok' },
      { to: '/adatvedelem', label: 'Adatvédelem és GDPR' }
    ]
  },
  {
    title: 'Belépés',
    links: [
      { to: '/kapcsolat', label: 'Kapcsolat' },
      { to: '/belepes', label: 'Zárt tagi portál' }
    ]
  }
];

export const Footer = () => {
  const address = formattedAddress();
  const socials = socialLinks();
  const year = new Date().getFullYear();

  return (
    // A lábléc ugyanazt az éjszakai felületet viseli, mint a hero: a lap
    // sötéttel nyit és sötéttel zár, közte világos a tartalom. Ez a keret
    // teszi „kiadvánnyá" az oldalt.
    <footer className="surface-noir grain relative isolate mt-auto overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="aurora animate-drift-slow bg-[radial-gradient(circle_at_15%_20%,oklch(var(--wine-500)/0.32),transparent_45%)]" />
        <div className="aurora animate-drift bg-[radial-gradient(circle_at_85%_80%,oklch(var(--gold-500)/0.2),transparent_45%)]" />
      </div>

      <div className="container-page relative z-10 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Márkablokk */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3.5">
              <LogoMark className="h-14 w-14" />
              <div>
                <p className="font-display text-xl leading-tight text-ivory-100">
                  {ORGANIZATION.shortName}
                </p>
                <p className="mt-1 font-mono text-2xs uppercase tracking-[0.2em] text-champagne-400">
                  Digitális Kőszeg program
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ivory-400">
              {ORGANIZATION.tagline}.
            </p>

            {(address || ORGANIZATION.email || ORGANIZATION.phone) && (
              <address className="mt-6 space-y-1 text-sm not-italic text-ivory-400">
                {address && <p>{address}</p>}
                {ORGANIZATION.email && (
                  <p>
                    <a
                      href={`mailto:${ORGANIZATION.email}`}
                      className="transition-colors hover:text-champagne-400"
                    >
                      {ORGANIZATION.email}
                    </a>
                  </p>
                )}
                {ORGANIZATION.phone && <p>{ORGANIZATION.phone}</p>}
              </address>
            )}
          </div>

          {/* Hivatkozásoszlopok */}
          <nav aria-label="Lábléc navigáció" className="grid gap-10 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h2 className="font-mono text-2xs uppercase tracking-[0.2em] text-ivory-500">
                  {col.title}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="group inline-flex items-center gap-1.5 text-sm text-ivory-200 transition-colors hover:text-champagne-400"
                      >
                        {link.label}
                        <ArrowUpRight
                          className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <hr className="rule-gold my-12" />

        <div className="flex flex-col gap-5 text-xs text-ivory-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {ORGANIZATION.legalName}. Minden jog fenntartva.
          </p>

          {socials.length > 0 && (
            <ul className="flex items-center gap-5">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-champagne-400"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <p>
            Fejlesztette és üzemelteti:{' '}
            <a
              href="mailto:avar.szilveszter@gmail.com"
              className="font-medium text-ivory-300 underline decoration-gold-500/40 underline-offset-4 transition-colors hover:text-champagne-400"
            >
              SA Software &amp; Network Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
