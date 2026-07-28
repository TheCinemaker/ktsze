import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Flower2, Award, Crown, Mail, User } from 'lucide-react';

import { ORGANIZATION, formattedAddress, BOARD_MEMBERS_BIO } from '../config/organization';
import { listWorkgroups, listPublicBoardMembers } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { PageHeader, EmptyState, Spinner, ErrorBlock, DetailRow, FormattedText } from '../components/ui';
import { SEO } from '../components/ui/SEO';

const getMemberBio = (member) => {
  if (member.bio) return member.bio;
  const nameLower = (member.full_name || '').toLowerCase();
  const emailLower = (member.private_email || '').toLowerCase();

  if (nameLower.includes('szilveszter') || emailLower.includes('szilveszter')) {
    return BOARD_MEMBERS_BIO.szilveszter?.bio;
  }
  if (member.custom_title?.toLowerCase().includes('elnök')) {
    return BOARD_MEMBERS_BIO.elnok?.bio;
  }
  return 'Az egyesület elnökségi tagja, aki aktív szerepet vállal Kőszeg turisztikai és szakmai fejlődésének támogatásában.';
};

const getMemberPhoto = (member) => {
  if (member.avatar_url) return member.avatar_url;
  const nameLower = (member.full_name || '').toLowerCase();
  const emailLower = (member.private_email || '').toLowerCase();

  if (nameLower.includes('szilveszter') || emailLower.includes('szilveszter')) {
    return BOARD_MEMBERS_BIO.szilveszter?.photoUrl;
  }
  return null;
};

const getMemberMotto = (member) => {
  if (member.motto) return member.motto;
  const nameLower = (member.full_name || '').toLowerCase();
  const emailLower = (member.private_email || '').toLowerCase();

  if (nameLower.includes('szilveszter') || emailLower.includes('szilveszter')) {
    return BOARD_MEMBERS_BIO.szilveszter?.motto;
  }
  return null;
};

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
      <SEO
        title="Egyesületünkről &amp; Vezetőség"
        description="Ismerje meg a Kőszegi Turisztikai Szövetség Egyesület elnökségét, tisztségviselőit, hivatalos adatait és szakmai munkacsoportjait."
      />
      <PageHeader eyebrow="Egyesületünkről" title={ORGANIZATION.legalName} description={ORGANIZATION.mission} />

      {/* Elnökség & Vezetőség */}
      <section className="mt-12">
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-wine-600" aria-hidden="true" />
          <h2 className="font-display text-2xl text-ink-900">Elnökség &amp; Tisztségviselők</h2>
        </div>
        <p className="mt-1 text-sm text-ink-600">
          Az egyesület hivatalosan megválasztott elnöksége, tisztségviselői és szakmai vezetői.
        </p>

        <div className="mt-6">
          {boardLoading && <Spinner />}

          {!boardLoading && (!boardMembers || boardMembers.length === 0) && (
            <div className="rounded-xl border border-dashed border-sand-400 p-6 text-center text-sm text-ink-600">
              Az elnökségi és tisztségviselői adatok frissítés alatt. Az elnökség az adminisztrációs felületen adhat meg tisztségneveket (pl. Elnök, Alelnök).
            </div>
          )}

          {boardMembers && boardMembers.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {boardMembers.map((member) => (
                <article
                  key={member.id}
                  className="card overflow-hidden flex flex-col justify-between p-0 transition-all duration-300 hover:shadow-xl border border-sand-300 bg-white group"
                >
                  {/* Portré kép / Helykitöltő header */}
                  <div className="relative h-72 w-full bg-sand-200 overflow-hidden flex items-center justify-center border-b border-sand-300">
                    {getMemberPhoto(member) ? (
                      <img
                        src={getMemberPhoto(member)}
                        alt={member.full_name}
                        className="h-full w-full object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center space-y-2 text-wine-800/70">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-wine-100 text-wine-800 text-2xl font-bold font-display shadow-inner">
                          {member.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'TK'}
                        </div>
                        <span className="text-xs font-medium text-ink-500">Portré feltöltésre vár</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 rounded-full bg-wine-700/90 text-white p-1.5 shadow">
                      <Award className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Tartalom & Bemutatkozás */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="inline-block rounded-full bg-wine-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-wine-800">
                        {member.custom_title || 'Elnökségi Tag'}
                      </span>
                      <h3 className="font-display text-xl font-bold text-ink-900">
                        {member.full_name}
                      </h3>
                      {(member.service_location_name || member.business_activity) && (
                        <p className="text-xs font-medium text-wine-700">
                          {member.service_location_name || member.business_activity}
                        </p>
                      )}

                      {getMemberMotto(member) && (
                        <blockquote className="text-xs italic font-medium text-wine-900 bg-sand-100 p-2.5 rounded-lg border-l-2 border-wine-600 my-2">
                          {getMemberMotto(member)}
                        </blockquote>
                      )}

                      <p className="text-xs leading-relaxed text-ink-600 pt-2 border-t border-sand-200">
                        {getMemberBio(member)}
                      </p>
                    </div>

                    {/* Elérhetőség */}
                    {member.private_email && (
                      <div className="pt-3 border-t border-sand-200">
                        <a
                          href={`mailto:${member.private_email}`}
                          className="inline-flex items-center gap-2 text-xs font-medium text-wine-700 hover:text-wine-900 transition-colors"
                        >
                          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                          {member.private_email}
                        </a>
                      </div>
                    )}
                  </div>
                </article>
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

                  {group.description && (
                    <div className="mt-3 text-sm text-ink-600">
                      <FormattedText>{group.description}</FormattedText>
                    </div>
                  )}

                  {group.latest_updates && (
                    <div className="mt-3 border-t border-sand-300 pt-3 text-sm text-ink-500">
                      <FormattedText>{group.latest_updates}</FormattedText>
                    </div>
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
