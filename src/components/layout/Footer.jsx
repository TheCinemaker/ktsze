import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, Phone, MapPin } from 'lucide-react';

import { HeaderLogo } from './HeaderLogo';
import { ORGANIZATION, formattedAddress, socialLinks } from '../../config/organization';

/* =============================================================================
   Lábléc

   Sötét sáv, ami az egész oldalt lezárja. A világos témában is sötét marad —
   ez klasszikus szerkesztőségi megoldás: a lap „alja” súlyt kap, és a
   tartalom nem folyik el a semmibe.
   ============================================================================= */

const NAV_GROUPS = [
  {
    title: 'Egyesület',
    links: [
      { to: '/egyesulet', label: 'Bemutatkozás' },
      { to: '/munkacsoportok', label: 'Munkacsoportok' },
      { to: '/hirek', label: 'Hírek és programok' },
      { to: '/dokumentumok', label: 'Dokumentumok' }
    ]
  },
  {
    title: 'Csatlakozás',
    links: [
      { to: '/tagsag', label: 'Tagság és tagdíjak' },
      { to: '/belepes', label: 'Belépés / regisztráció' },
      { to: '/kapcsolat', label: 'Kapcsolat' },
      { to: '/adatvedelem', label: 'Adatvédelem' }
    ]
  }
];

export const Footer = () => {
  const address = formattedAddress();
  const socials = socialLinks();
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate mt-auto overflow-hidden dark">
      {/* Saját sötét háttér, a témától függetlenül */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-sand-100" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, oklch(var(--g-500) / 0.55) 25%, oklch(var(--w-500) / 0.45) 75%, transparent)'
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -left-24 -top-32 -z-10 h-96 w-96 rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, oklch(var(--w-500) / 0.28), transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 right-0 -z-10 h-96 w-96 rounded-full blur-[130px]"
        style={{ background: 'radial-gradient(circle, oklch(var(--g-500) / 0.16), transparent 70%)' }}
      />

      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Azonosítás */}
          <div className="space-y-5 lg:col-span-5">
            <HeaderLogo />

            <p className="max-w-sm font-display text-2xl leading-snug text-ink-900">
              {ORGANIZATION.tagline}
            </p>

            <p className="max-w-sm text-sm text-ink-500">{ORGANIZATION.legalName}</p>

            {socials.length > 0 && (
              <ul className="flex flex-wrap gap-2 pt-1">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 rounded-xl border border-sand-400 px-3 py-1.5
                                 text-xs text-ink-600 transition-all duration-300 hover:border-gold-500 hover:text-ink-900"
                    >
                      {s.label}
                      <ArrowUpRight
                        className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Navigáció */}
          {NAV_GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title} className="lg:col-span-2">
              <h2 className="text-2xs font-semibold uppercase tracking-[0.18em] text-gold-500">
                {group.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      viewTransition
                      className="text-sm text-ink-500 transition-colors duration-300 hover:text-ink-900"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Elérhetőség — csak a kitöltött mezők */}
          <div className="lg:col-span-3">
            <h2 className="text-2xs font-semibold uppercase tracking-[0.18em] text-gold-500">
              Elérhetőség
            </h2>

            {address || ORGANIZATION.email || ORGANIZATION.phone ? (
              <ul className="mt-4 space-y-3 text-sm text-ink-500">
                {address && (
                  <li className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                    <span>{address}</span>
                  </li>
                )}
                {ORGANIZATION.email && (
                  <li className="flex items-start gap-2.5">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                    <a href={`mailto:${ORGANIZATION.email}`} className="break-all transition-colors hover:text-ink-900">
                      {ORGANIZATION.email}
                    </a>
                  </li>
                )}
                {ORGANIZATION.phone && (
                  <li className="flex items-start gap-2.5">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                    <a
                      href={`tel:${ORGANIZATION.phone.replace(/\s/g, '')}`}
                      className="transition-colors hover:text-ink-900"
                    >
                      {ORGANIZATION.phone}
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-ink-500">Az elérhetőségek feltöltése folyamatban.</p>
            )}
          </div>
        </div>

        {/* Alsó sáv */}
        <div className="mt-14 flex flex-col gap-3 border-t border-sand-300 pt-7 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {ORGANIZATION.shortName}
            {ORGANIZATION.taxNumber ? ` · Adószám: ${ORGANIZATION.taxNumber}` : ''}
          </p>

          <p>
            Fejlesztette:{' '}
            <a
              href="mailto:avar.szilveszter@gmail.com"
              className="font-medium text-gold-500 underline decoration-gold-500/40 underline-offset-4 transition-colors hover:text-gold-700"
            >
              SA Software &amp; Network Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
