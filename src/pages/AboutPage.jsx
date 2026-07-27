import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Flower2, Award, Crown } from 'lucide-react';

import { ORGANIZATION, formattedAddress } from '../config/organization';
import { listWorkgroups, listPublicBoardMembers } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { PageHeader, EmptyState, Spinner, ErrorBlock, DetailRow } from '../components/ui';

export const AboutPage = () => {
  const { data: groups, loading, error, reload } = useAsyncData(listWorkgroups);
  const { data: boardMembers, loading: boardLoading } = useAsyncData(listPublicBoardMembers);
  const active = (groups || []).filter((g) => g.is_active);
  const address = formattedAddress();

  const hasLegalData = Boolean(
    address || ORGANIZATION.taxNumber || ORGANIZATION.registrationNumber || ORGANIZATION.courtRegistration
  );

  return (
    <div className="container-page py-12 sm:py-16">
      <PageHeader eyebrow="Egyesületünkről" title={ORGANIZATION.legalName} description={ORGANIZATION.mission} />

      {/* Elnökség & Vezetőség */}
      <section className="mt-12">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-wine-600" aria-hidden="true" />
          <h2 className="font-display text-2xl text-ink-900">Elnökség &amp; Tisztségviselők</h2>
        </div>
        <p className="mt-1 text-sm text-ink-600">
          Az egyesület hivatalosan megválasztott elnöksége és tisztségviselői.
        </p>

        <div className="mt-6">
          {boardLoading && <Spinner />}

          {!boardLoading && (!boardMembers || boardMembers.length === 0) && (
            <div className="rounded-xl border border-dashed border-sand-400 p-6 text-center text-sm text-ink-600">
              Az elnökségi és tisztségviselői adatok frissítés alatt. Az elnökség az adminisztrációs felületen adhat meg tisztségneveket (pl. Elnök, Alelnök).
            </div>
          )}

          {boardMembers && boardMembers.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {boardMembers.map((member) => (
                <div key={member.id} className="card p-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg font-bold text-wine-700">
                      {member.full_name || 'Tisztségviselő'}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-wine-100 text-wine-700">
                      <Award className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-ink-900">
                    {member.custom_title || 'Elnökségi Tag'}
                  </div>
                  {(member.service_location_name || member.business_activity) && (
                    <div className="text-xs text-ink-600">
                      {member.service_location_name || member.business_activity}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hivatalos adatok — csak a kitöltött mezők */}
      {hasLegalData && (
        <section className="mt-14">
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
          <Link to="/munkacsoportok" className="btn-secondary btn-sm">
            Csatlakozási lehetőségek
          </Link>
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
                  <h3 className="font-display text-lg text-ink-900">
                    <Link
                      to={`/munkacsoportok/${group.slug}`}
                      className="rounded transition-colors hover:text-wine-600"
                    >
                      {group.name}
                    </Link>
                  </h3>

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
