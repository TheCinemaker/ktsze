import React from 'react';
import { Mail, Phone, MapPin, Info } from 'lucide-react';

import { ORGANIZATION, formattedAddress, socialLinks, hasContactDetails } from '../config/organization';
import { PageHeader, EmptyState, DetailRow } from '../components/ui';

/*
  A korábbi verzió itt beégetett bankszámlaszámot és kitalált elérhetőségeket
  írt ki. Most minden a src/config/organization.js-ből jön, ami alapból üres —
  amit nem töltöttél ki, az meg sem jelenik.

  Kapcsolati űrlap szándékosan NINCS: ahhoz szerveroldali e-mail küldés kell
  (Supabase Edge Function vagy Netlify Form). Egy űrlap, ami látszólag elküldi
  az üzenetet, de valójában semmit nem tesz, rosszabb, mint ha nincs is.
*/

export const ContactPage = () => {
  const address = formattedAddress();
  const socials = socialLinks();

  return (
    <div className="container-page py-12 sm:py-16">
      <PageHeader
        eyebrow="Kapcsolat"
        title="Elérhetőségeink"
        description={`A ${ORGANIZATION.legalName} hivatalos elérhetőségei.`}
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {hasContactDetails() ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {ORGANIZATION.email && (
                <div className="card p-5">
                  <Mail className="mb-2.5 h-5 w-5 text-wine-600" aria-hidden="true" />
                  <h2 className="font-display text-base text-ink-900">E-mail</h2>
                  <a
                    href={`mailto:${ORGANIZATION.email}`}
                    className="mt-1 inline-block rounded text-sm text-wine-600 hover:underline"
                  >
                    {ORGANIZATION.email}
                  </a>
                </div>
              )}

              {ORGANIZATION.phone && (
                <div className="card p-5">
                  <Phone className="mb-2.5 h-5 w-5 text-wine-600" aria-hidden="true" />
                  <h2 className="font-display text-base text-ink-900">Telefon</h2>
                  <a
                    href={`tel:${ORGANIZATION.phone.replace(/\s/g, '')}`}
                    className="mt-1 inline-block rounded text-sm text-wine-600 hover:underline"
                  >
                    {ORGANIZATION.phone}
                  </a>
                </div>
              )}

              {address && (
                <div className="card p-5 sm:col-span-2">
                  <MapPin className="mb-2.5 h-5 w-5 text-wine-600" aria-hidden="true" />
                  <h2 className="font-display text-base text-ink-900">Székhely</h2>
                  <p className="mt-1 text-sm text-ink-600">{address}</p>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={Info}
              title="Az elérhetőségek feltöltése folyamatban"
              description="Az egyesületi kapcsolati adatok a src/config/organization.js fájlban állíthatók be. Szándékosan nincs itt kitalált e-mail cím vagy telefonszám."
            />
          )}

          {socials.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-lg text-ink-900">Kövess minket</h2>
              <ul className="mt-3 flex flex-wrap gap-3">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Hivatalos azonosítók */}
        <aside>
          {(ORGANIZATION.taxNumber || ORGANIZATION.registrationNumber || ORGANIZATION.bankAccount) && (
            <div className="surface p-6">
              <h2 className="font-display text-lg text-ink-900">Hivatalos adatok</h2>
              <dl className="mt-3 divide-y divide-sand-300">
                <DetailRow label="Adószám" value={ORGANIZATION.taxNumber} />
                <DetailRow label="Nyilvántartási szám" value={ORGANIZATION.registrationNumber} />
                <DetailRow label="Bankszámla" value={ORGANIZATION.bankAccount} />
              </dl>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
