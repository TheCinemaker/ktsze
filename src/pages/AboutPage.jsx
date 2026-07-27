import React from 'react';
import { Users, Flower2 } from 'lucide-react';

import { ORGANIZATION, formattedAddress } from '../config/organization';
import { listWorkgroups } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { PageHeader, EmptyState, Spinner, ErrorBlock, DetailRow } from '../components/ui';

/*
  A korábbi verzióból eltávolítva:
    - "Kőszeg Város Önkormányzatával (Básthy Béla Polgármester) szoros
      együttműködésben" — valós, megnevezett személy egy nem igazolt
      együttműködésben. Jogi kockázat.
    - "Polgármesteri Programfüzet (2026. Július)" gomb, ami egy üres irattárra
      mutatott.
    - Az elnökségi lista, ami a tagnyilvántartás összes olyan sorát kiírta,
      amelynek volt tisztségneve — így akár egy rendes tag is "Elnökségi
      tagként" jelent meg a nyilvános oldalon.

  Az elnökség bemutatása szándékosan NEM innen jön. Ahhoz a tagnyilvántartás
  személyes adatait kellene nyilvánosan kiadni, amit az RLS helyesen tilt.
  Ha nyilvános elnökségi bemutatót akarsz, azt hírként vagy dokumentumként
  tedd közzé, ellenőrzött tartalommal.
*/

export const AboutPage = () => {
  const { data: groups, loading, error, reload } = useAsyncData(listWorkgroups);
  const active = (groups || []).filter((g) => g.is_active);
  const address = formattedAddress();

  const hasLegalData = Boolean(
    address || ORGANIZATION.taxNumber || ORGANIZATION.registrationNumber || ORGANIZATION.courtRegistration
  );

  return (
    <div className="container-page py-12 sm:py-16">
      <PageHeader eyebrow="Egyesületünkről" title={ORGANIZATION.legalName} description={ORGANIZATION.mission} />

      {/* Hivatalos adatok — csak a kitöltött mezők */}
      {hasLegalData && (
        <section className="mt-12">
          <h2 className="font-display text-2xl text-ink-900">Hivatalos adatok</h2>
          <dl className="mt-4 max-w-2xl divide-y divide-sand-300 border-y border-sand-300">
            <DetailRow label="Székhely" value={address} />
            <DetailRow label="Adószám" value={ORGANIZATION.taxNumber} />
            <DetailRow label="Nyilvántartási szám" value={ORGANIZATION.registrationNumber} />
            <DetailRow label="Bejegyző bíróság" value={ORGANIZATION.courtRegistration} />
          </dl>
        </section>
      )}

      {/* Munkacsoportok */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Szakmai munka</p>
            <h2 className="mt-2 font-display text-2xl text-ink-900">Munkacsoportok</h2>
          </div>
        </div>

        <div className="mt-6">
          {loading && <Spinner />}
          {error && <ErrorBlock message={error} onRetry={reload} />}

          {!loading && !error && active.length === 0 && (
            <EmptyState
              icon={Flower2}
              title="Még nincs létrehozott munkacsoport"
              description="A munkacsoportokat az elnökség hozza létre a belső felületen. Amíg nincs egy sem, itt nem jelenik meg semmi."
            />
          )}

          {active.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {active.map((group) => (
                <article key={group.id} className="card p-6">
                  <Users className="mb-3 h-5 w-5 text-wine-600" aria-hidden="true" />
                  <h3 className="font-display text-lg text-ink-900">{group.name}</h3>

                  {group.leader_name && (
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-wine-600">
                      Vezető: {group.leader_name}
                    </p>
                  )}

                  {group.description && <p className="mt-3 text-sm text-ink-600">{group.description}</p>}

                  {group.latest_updates && (
                    <p className="mt-3 border-t border-sand-300 pt-3 text-sm text-ink-500">
                      {group.latest_updates}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
