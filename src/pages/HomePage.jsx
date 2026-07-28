import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper, FileText, Users, Sparkles, Compass, ShieldCheck, Heart } from 'lucide-react';

import { ORGANIZATION } from '../config/organization';
import { listPublishedNews, listWorkgroups, getWorkgroupStats, listMyWorkgroupMemberships } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { useAuth } from '../context/AuthContext';
import { EmptyState, Spinner, ErrorBlock, FormattedText } from '../components/ui';
import { NewsCard } from '../components/public/NewsCard';
import { WorkgroupCard } from '../components/workgroups/WorkgroupCard';

const HeroSection = () => (
  <section className="container-page py-6 sm:py-8">
    <div className="glass-hero rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden border border-wine-700/40">
      {/* Ragyogó Ambient Fénygömbök a Háttérben */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-wine-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-400/30 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-300 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          <span>Smart Tourism Platform</span>
        </div>

        <h1 className="font-display text-4xl text-white sm:text-6xl font-bold tracking-tight leading-tight">
          {ORGANIZATION.legalName}
        </h1>

        <p className="text-lg text-sand-200 leading-relaxed font-normal max-w-2xl">
          {ORGANIZATION.mission}
        </p>

        <div className="pt-4 flex flex-wrap items-center gap-4">
          <Link
            to="/munkacsoportok"
            className="btn py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-wine-950 font-bold rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all flex items-center gap-2 border-0"
          >
            <Compass className="h-4 w-4" />
            Munkacsoportok felfedezése
          </Link>
          <Link
            to="/egyesulet"
            className="btn py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
          >
            Egyesületről
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const LatestNews = () => {
  const { data: news, loading, error, reload } = useAsyncData(listPublishedNews);
  const items = (news || []).slice(0, 3);

  return (
    <section className="section bg-sand-50/60 relative py-8">
      <div className="container-page space-y-6">
        {/* Odaragasztott Glass Sticky Fejléc a Híreknél */}
        <div className="sticky top-[68px] z-30 bg-white/85 backdrop-blur-xl py-3.5 px-5 border border-sand-300/70 rounded-2xl shadow-xs transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-wine-100/80 text-wine-700">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <p className="eyebrow text-[10px]">Friss hírek &amp; Események</p>
              <h2 className="font-display text-xl sm:text-2xl text-ink-900 font-bold">Legutóbbi hírek</h2>
            </div>
          </div>

          {items.length > 0 && (
            <Link to="/hirek" className="btn-secondary btn-sm rounded-lg font-bold">
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
          <div className="grid gap-6 md:grid-cols-3 pt-2">
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
  const { profile } = useAuth();
  const { data: groups, loading, reload: reloadGroups } = useAsyncData(listWorkgroups);
  const stats = useAsyncData(getWorkgroupStats, [], { initialData: {} });
  const memberships = useAsyncData(
    () => listMyWorkgroupMemberships(profile?.id),
    [profile?.id],
    { enabled: Boolean(profile?.id), initialData: [] }
  );

  const active = (groups || []).filter((g) => g.is_active);

  const reloadAll = () => {
    reloadGroups();
    stats.reload();
    memberships.reload();
  };

  return (
    <section className="section bg-sand-100/50 relative py-8">
      <div className="container-page space-y-6">
        {/* Odaragasztott Glass Sticky Fejléc a Munkacsoportoknál */}
        <div className="sticky top-[68px] z-30 bg-white/85 backdrop-blur-xl py-3.5 px-5 border border-sand-300/70 rounded-2xl shadow-xs transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="eyebrow text-[10px]">Szakmai Összefogás</p>
              <h2 className="font-display text-xl sm:text-2xl text-ink-900 font-bold">Munkacsoportok</h2>
            </div>
          </div>

          <Link to="/munkacsoportok" className="btn-primary btn-sm bg-wine-700 hover:bg-wine-800 rounded-lg font-bold">
            Csatlakozás
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-2">
            {active.map((group) => {
              const groupStats = (stats.data || {})[group.id];
              const membership = (memberships.data || []).find((m) => m.workgroup_id === group.id);
              return (
                <WorkgroupCard
                  key={group.id}
                  workgroup={group}
                  stats={groupStats}
                  membership={membership}
                  onChanged={reloadAll}
                />
              );
            })}
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
