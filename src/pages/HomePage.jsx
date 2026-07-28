import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper, FileText, Users } from 'lucide-react';

import { ORGANIZATION } from '../config/organization';
import { listPublishedNews, listWorkgroups } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { EmptyState, Spinner, ErrorBlock, FormattedText } from '../components/ui';
import { NewsCard } from '../components/public/NewsCard';

/*
  Ez az oldal SEMMILYEN kitalált adatot nem tartalmaz.

  A korábbi verzióból eltávolítva:
    - "15+ éves szakmai múlt", "40+ tagvállalkozás", "100% közhasznú működés"
      (mind találgatás volt, miközben a tagnyilvántartó nullán állt)
    - "Kőszegi Turisztikai Stratégia 2026–2030" mint létező dokumentum
    - külső Unsplash fotó, ami nem is Kőszeget ábrázolta

  Amit itt látsz, az mind az adatbázisból jön. Ha nincs benne adat, üres
  állapot jelenik meg — nem példatartalom.
*/

const HeroSection = () => (
  <section className="border-b border-sand-400 bg-sand-100">
    <div className="container-page py-16 sm:py-20">
      <div className="max-w-3xl space-y-4">
        <p className="eyebrow">{ORGANIZATION.tagline}</p>

        <h1 className="font-display text-4xl text-ink-900 sm:text-5xl">{ORGANIZATION.legalName}</h1>

        <p className="prose-body text-lg">{ORGANIZATION.mission}</p>
      </div>
    </div>
  </section>
);

const LatestNews = () => {
  const { data: news, loading, error, reload } = useAsyncData(listPublishedNews);
  const items = (news || []).slice(0, 3);

  return (
    <section className="section bg-sand-50">
      <div className="container-page space-y-8">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4 pb-4">
            <div>
              <p className="eyebrow">Friss tartalom</p>
              <h2 className="mt-1 font-display text-3xl text-ink-900">Legutóbbi hírek</h2>
            </div>
            {items.length > 0 && (
              <Link to="/hirek" className="btn-secondary btn-sm">
                Összes hír
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>
          <hr className="border-sand-400" />
        </div>

        {loading && <Spinner />}
        {error && <ErrorBlock message={error} onRetry={reload} />}

        {!loading && !error && items.length === 0 && (
          <EmptyState
            icon={Newspaper}
            title="Még nincs közzétett hír"
            description="Az elnökség a belső felületen tud híreket és programokat közzétenni. Amíg nincs egy sem, ez a szakasz üresen marad."
          />
        )}

        {items.length > 0 && (
          <div className="grid gap-5 md:grid-cols-3">
            {items.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const Workgroups = () => {
  const { data: groups, loading } = useAsyncData(listWorkgroups);
  const active = (groups || []).filter((g) => g.is_active);

  return (
    <section className="section bg-sand-100">
      <div className="container-page space-y-8">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4 pb-4">
            <div>
              <p className="eyebrow">Szakmai munka</p>
              <h2 className="mt-1 font-display text-3xl text-ink-900">Munkacsoportok</h2>
              <p className="mt-2 max-w-prose text-base text-ink-600">
                Az egyesület munkája munkacsoportokban zajlik, és bárki jelentkezhet, aki részt vállalna.
              </p>
            </div>
            <Link to="/munkacsoportok" className="btn-primary btn-sm">
              Csatlakozás
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <hr className="border-sand-400" />
        </div>

        {loading && <Spinner />}

        {!loading && active.length === 0 && (
          <EmptyState
            icon={Users}
            title="Munkacsoportok előkészítés alatt"
            description="Az elnökségi admin felületen hozhatók létre új egyesületi munkacsoportok."
          />
        )}

        {active.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {active.map((group) => (
              <article key={group.id} className="card p-6">
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
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const TwoTiles = () => (
  <section className="section bg-sand-50">
    <div className="container-page">
      <div>
        <hr className="border-sand-400 mb-8" />
        <div className="grid gap-6 md:grid-cols-2">
          {/* Csempe 1: Tagsági formák */}
          <Link to="/tagsag" className="card-hover group block p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-wine-100 text-wine-700">
                <Users className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <span className="eyebrow">Egyesületi tagság</span>
                <h2 className="font-display text-xl text-ink-900">Tagsági formák &amp; feltételek</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-600">
              Ismerje meg a rendes és pártoló tagság feltételeit, az éves tagdíjakat és a csatlakozás menetét.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-wine-600">
              Részletek és csatlakozás
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </Link>

          {/* Csempe 2: Nyilvános dokumentumok */}
          <Link to="/dokumentumok" className="card-hover group block p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-wine-100 text-wine-700">
                <FileText className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <span className="eyebrow">Dokumentumtár</span>
                <h2 className="font-display text-xl text-ink-900">Nyilvános dokumentumok &amp; Alapszabály</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-600">
              Böngéssze az egyesület közzétett alapszabályát, pénzügyi beszámolóit és közgyűlési dokumentumait.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-wine-600">
              Dokumentumok megtekintése
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export const HomePage = () => (
  <>
    <HeroSection />
    <LatestNews />
    <Workgroups />
    <TwoTiles />
  </>
);
