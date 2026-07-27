import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper, FileText, Users } from 'lucide-react';

import { ORGANIZATION } from '../config/organization';
import { listPublishedNews, listWorkgroups } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { EmptyState, Spinner, ErrorBlock } from '../components/ui';
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
    <div className="container-page py-16 sm:py-24">
      <div className="max-w-3xl space-y-6">
        <p className="eyebrow">{ORGANIZATION.tagline}</p>

        <h1 className="font-display text-4xl text-ink-900 sm:text-5xl">{ORGANIZATION.legalName}</h1>

        <p className="prose-body text-lg">{ORGANIZATION.mission}</p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/hirek" className="btn-primary">
            Hírek és programok
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to="/tagsag" className="btn-secondary">
            Tagság és csatlakozás
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const QuickLinks = () => {
  const links = [
    {
      to: '/hirek',
      icon: Newspaper,
      title: 'Hírek és programok',
      text: 'Az egyesület közleményei, felhívásai és készülő programjai.'
    },
    {
      to: '/dokumentumok',
      icon: FileText,
      title: 'Nyilvános dokumentumok',
      text: 'Alapszabály, beszámolók és egyéb közzétett iratok.'
    },
    {
      to: '/tagsag',
      icon: Users,
      title: 'Tagság',
      text: 'Tagsági formák, tagdíjak és a csatlakozás menete.'
    }
  ];

  return (
    <section className="section">
      <div className="container-page grid gap-5 sm:grid-cols-3">
        {links.map(({ to, icon: Icon, title, text }) => (
          <Link key={to} to={to} className="card-hover group block p-6">
            <Icon className="mb-3 h-6 w-6 text-wine-600" aria-hidden="true" />
            <h2 className="font-display text-lg text-ink-900">{title}</h2>
            <p className="mt-1.5 text-sm text-ink-600">{text}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-wine-600">
              Megnyitom
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

const LatestNews = () => {
  const { data: news, loading, error, reload } = useAsyncData(listPublishedNews);
  const items = (news || []).slice(0, 3);

  return (
    <section className="section border-t border-sand-400 bg-sand-50">
      <div className="container-page space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Friss tartalom</p>
            <h2 className="mt-2 font-display text-3xl text-ink-900">Legutóbbi hírek</h2>
          </div>
          {items.length > 0 && (
            <Link to="/hirek" className="btn-secondary btn-sm">
              Összes hír
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
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

  // Ha nincs munkacsoport, a szakaszt egyáltalán nem jelenítjük meg — nincs
  // értelme egy üres blokknak a főoldalon.
  if (loading || active.length === 0) return null;

  return (
    <section className="section border-t border-sand-400">
      <div className="container-page space-y-8">
        <div>
          <p className="eyebrow">Szakmai munka</p>
          <h2 className="mt-2 font-display text-3xl text-ink-900">Munkacsoportok</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {active.map((group) => (
            <article key={group.id} className="card p-6">
              <h3 className="font-display text-lg text-ink-900">{group.name}</h3>
              {group.leader_name && (
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-wine-600">
                  Vezető: {group.leader_name}
                </p>
              )}
              {group.description && <p className="mt-3 text-sm text-ink-600">{group.description}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export const HomePage = () => (
  <>
    <HeroSection />
    <QuickLinks />
    <LatestNews />
    <Workgroups />
  </>
);
