import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Newspaper, FileText, Users, Sparkles, Flower2 } from 'lucide-react';

import { ORGANIZATION } from '../config/organization';
import { listPublishedNews, listWorkgroups, getWorkgroupStats } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { EmptyState, ErrorBlock } from '../components/ui';
import { Aurora, GridField, Reveal, TiltCard, AnimatedNumber, SkeletonCard } from '../components/ui/effects';
import { NewsCard } from '../components/public/NewsCard';

/*
  Ez az oldal SEMMILYEN kitalált adatot nem tartalmaz.

  Minden szám, hír és munkacsoport az adatbázisból jön. Ha nincs benne adat,
  üres állapot jelenik meg — soha nem példatartalom, és soha nem kitalált
  statisztika. A számlálók a tényleges rekordokat mutatják.
*/

/* -----------------------------------------------------------------------------
   Hero — nagy szerif tipográfia, sodródó fény, finom rácsháló
----------------------------------------------------------------------------- */
const Hero = ({ groupCount, memberCount, newsCount }) => (
  <section className="relative isolate overflow-hidden">
    <Aurora />
    <GridField />

    <div className="container-page relative py-24 sm:py-32 lg:py-40">
      <div className="max-w-4xl">
        <Reveal>
          <span className="eyebrow">{ORGANIZATION.tagline}</span>
        </Reveal>

        <Reveal delay={1}>
          <h1 className="display-hero mt-7 text-5xl sm:text-6xl lg:text-7xl">
            Kőszeg
            <span className="block text-gold-sheen">turisztikai</span>
            <span className="block italic">összefogása</span>
          </h1>
        </Reveal>

        <Reveal delay={2}>
          <p className="prose-body mt-8 text-lg">{ORGANIZATION.mission}</p>
        </Reveal>

        <Reveal delay={3}>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/munkacsoportok" viewTransition className="btn-primary btn-lg btn-sheen">
              Csatlakozom egy munkacsoporthoz
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/hirek" viewTransition className="btn-secondary btn-lg">
              Hírek és programok
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Élő számlálók — kizárólag valós rekordszámok */}
      {(groupCount > 0 || memberCount > 0 || newsCount > 0) && (
        <Reveal delay={3}>
          <dl className="mt-20 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-sand-400 sm:grid-cols-3">
            {[
              { label: 'Aktív munkacsoport', value: groupCount },
              { label: 'Csoporttagság', value: memberCount },
              { label: 'Közzétett hír', value: newsCount }
            ]
              .filter((stat) => stat.value > 0)
              .map((stat) => (
                <div
                  key={stat.label}
                  className="px-6 py-7"
                  style={{ backgroundColor: 'oklch(var(--s-50) / 0.5)' }}
                >
                  <dd className="font-display text-4xl text-ink-900">
                    <AnimatedNumber value={stat.value} />
                  </dd>
                  <dt className="mt-1.5 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                    {stat.label}
                  </dt>
                </div>
              ))}
          </dl>
        </Reveal>
      )}
    </div>

    {/* Lezáró hajszálvonal */}
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-px"
      style={{
        background:
          'linear-gradient(90deg, transparent, oklch(var(--g-500) / 0.4) 30%, oklch(var(--w-500) / 0.35) 70%, transparent)'
      }}
    />
  </section>
);

/* -----------------------------------------------------------------------------
   Bento rács — eltérő méretű csempék, mint egy szerkesztőségi címlap
----------------------------------------------------------------------------- */
const BentoLinks = ({ groupCount }) => (
  <section className="section">
    <div className="container-page">
      <div className="grid gap-4 md:grid-cols-6 lg:grid-cols-12">
        {/* Nagy csempe: munkacsoportok */}
        <Reveal className="md:col-span-6 lg:col-span-7">
          <TiltCard className="h-full" max={4}>
            <Link
              to="/munkacsoportok"
              viewTransition
              className="card-aura group relative flex h-full flex-col justify-between overflow-hidden p-8 sm:p-10"
            >
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                style={{ background: 'radial-gradient(circle, oklch(var(--w-500) / 0.22), transparent 70%)' }}
              />

              <div className="relative">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-gold-500/40 bg-wine-600/10">
                  <Users className="h-5 w-5 text-wine-600" aria-hidden="true" />
                </span>

                <h2 className="mt-7 font-display text-3xl text-ink-900 sm:text-4xl">
                  Munkacsoportok
                </h2>
                <p className="prose-body mt-4 max-w-md">
                  Az egyesület munkája munkacsoportokban zajlik — városszépítés, digitalizáció,
                  rendezvények. Bárki jelentkezhet, aki részt vállalna.
                </p>
              </div>

              <div className="relative mt-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-wine-600">
                  Csatlakozás
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
                {groupCount > 0 && (
                  <span className="badge-gold">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    {groupCount} aktív csoport
                  </span>
                )}
              </div>
            </Link>
          </TiltCard>
        </Reveal>

        {/* Két kisebb csempe egymás alatt */}
        <div className="grid gap-4 md:col-span-6 lg:col-span-5">
          {[
            {
              to: '/hirek',
              icon: Newspaper,
              title: 'Hírek és programok',
              text: 'Közlemények, felhívások, készülő események.'
            },
            {
              to: '/tagsag',
              icon: FileText,
              title: 'Tagság és dokumentumok',
              text: 'Tagdíjak, csatlakozás menete, nyilvános iratok.'
            }
          ].map((item, index) => (
            <Reveal key={item.to} delay={index + 1}>
              <Link
                to={item.to}
                viewTransition
                className="card-hover spotlight group flex items-start gap-5 p-7"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-sand-400 bg-sand-200/60 transition-colors duration-500 group-hover:border-gold-500">
                  <item.icon className="h-5 w-5 text-wine-600" aria-hidden="true" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-display text-xl text-ink-900">{item.title}</span>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-ink-400 transition-all duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-wine-600"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-2 block text-sm text-ink-600">{item.text}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* -----------------------------------------------------------------------------
   Legutóbbi hírek
----------------------------------------------------------------------------- */
const LatestNews = ({ news }) => {
  const items = (news.data || []).slice(0, 3);

  return (
    <section className="section relative border-t border-sand-400">
      <div className="container-page space-y-12">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow">Friss tartalom</span>
            <h2 className="mt-4 font-display text-3xl text-ink-900 sm:text-4xl">Legutóbbi hírek</h2>
          </div>
          {items.length > 0 && (
            <Link to="/hirek" viewTransition className="btn-secondary btn-sm">
              Összes hír
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
        </Reveal>

        {news.loading && (
          <div className="grid gap-6 md:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {news.error && <ErrorBlock message={news.error} onRetry={news.reload} />}

        {!news.loading && !news.error && items.length === 0 && (
          <EmptyState
            icon={Newspaper}
            title="Még nincs közzétett hír"
            description="Az elnökség a belső felületen tud híreket és programokat közzétenni. Amíg nincs egy sem, ez a szakasz üresen marad."
          />
        )}

        {items.length > 0 && (
          <div className="grid gap-6 md:grid-cols-3">
            {items.map((item, index) => (
              <Reveal key={item.id} delay={index + 1}>
                <NewsCard item={item} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* -----------------------------------------------------------------------------
   Munkacsoportok előnézete
----------------------------------------------------------------------------- */
const WorkgroupPreview = ({ groups, stats }) => {
  const active = (groups.data || []).filter((g) => g.is_active).slice(0, 3);
  if (groups.loading || active.length === 0) return null;

  return (
    <section className="section relative border-t border-sand-400">
      <div className="container-page space-y-12">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="eyebrow">Szakmai munka</span>
            <h2 className="mt-4 font-display text-3xl text-ink-900 sm:text-4xl">
              Ahol a munka valójában zajlik
            </h2>
            <p className="prose-body mt-4">
              Minden csoportnak saját vezetője, feladatköre és jelentkezési lehetősége van.
            </p>
          </div>
          <Link to="/munkacsoportok" viewTransition className="btn-primary btn-sm btn-sheen">
            Összes munkacsoport
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {active.map((group, index) => (
            <Reveal key={group.id} delay={index + 1}>
              <Link
                to={`/munkacsoportok/${group.slug}`}
                viewTransition
                className="card-hover spotlight group flex h-full flex-col p-7"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-sand-400 bg-wine-600/8 transition-colors duration-500 group-hover:border-gold-500">
                    <Flower2 className="h-5 w-5 text-wine-600" aria-hidden="true" />
                  </span>
                  {(stats.data || {})[group.id]?.approved > 0 && (
                    <span className="badge-neutral">
                      {(stats.data || {})[group.id].approved} tag
                    </span>
                  )}
                </div>

                <h3 className="mt-6 font-display text-xl text-ink-900">{group.name}</h3>

                {group.leader_name && (
                  <p className="mt-1.5 text-2xs font-semibold uppercase tracking-[0.1em] text-wine-600">
                    Vezető: {group.leader_name}
                  </p>
                )}

                {group.description && (
                  <p className="mt-4 line-clamp-4 flex-1 text-sm text-ink-600">{group.description}</p>
                )}

                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-wine-600">
                  Részletek
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-500 ease-spring group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* -----------------------------------------------------------------------------
   Záró felhívás
----------------------------------------------------------------------------- */
const ClosingCall = () => (
  <section className="section relative border-t border-sand-400">
    <div className="container-page">
      <Reveal>
        <div className="card-aura relative overflow-hidden px-8 py-16 text-center sm:px-16 sm:py-24">
          <Aurora className="opacity-60" />

          <div className="relative mx-auto max-w-2xl">
            <span className="eyebrow justify-center">Csatlakozás</span>

            <h2 className="mt-6 font-display text-3xl text-ink-900 sm:text-5xl">
              Kőszegért, <span className="italic text-gold-sheen">együtt</span>
            </h2>

            <p className="prose-body mx-auto mt-6">
              A regisztráció pár perc. Utána már jelentkezhetsz munkacsoportba, és láthatod a tagi
              felület tartalmait.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link to="/belepes" viewTransition className="btn-primary btn-lg btn-sheen">
                Fiók létrehozása
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/tagsag" viewTransition className="btn-secondary btn-lg">
                Tagsági feltételek
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

export const HomePage = () => {
  const news = useAsyncData(listPublishedNews);
  const groups = useAsyncData(listWorkgroups);
  const stats = useAsyncData(getWorkgroupStats, [], { initialData: {} });

  const activeGroups = (groups.data || []).filter((g) => g.is_active);
  const totalMemberships = Object.values(stats.data || {}).reduce(
    (sum, entry) => sum + (entry.approved || 0),
    0
  );

  return (
    <>
      <Hero
        groupCount={activeGroups.length}
        memberCount={totalMemberships}
        newsCount={(news.data || []).length}
      />
      <BentoLinks groupCount={activeGroups.length} />
      <LatestNews news={news} />
      <WorkgroupPreview groups={groups} stats={stats} />
      <ClosingCall />
    </>
  );
};
