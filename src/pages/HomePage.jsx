import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper, FileText, Users, Sparkles, Compass, ShieldCheck, Heart, Zap, Globe, Award } from 'lucide-react';

import { ORGANIZATION } from '../config/organization';
import { listPublishedNews, listWorkgroups, getWorkgroupStats, listMyWorkgroupMemberships } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { useAuth } from '../context/AuthContext';
import { EmptyState, Spinner, ErrorBlock, FormattedText } from '../components/ui';
import { NewsCard } from '../components/public/NewsCard';
import { WorkgroupCard } from '../components/workgroups/WorkgroupCard';

const HeroSection = () => (
  <section className="container-page py-6 sm:py-10">
    {/* High-Tech Luxury Glass Banner */}
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-wine-950 via-wine-900 to-amber-950 text-white p-8 sm:p-16 border border-amber-500/30 shadow-[0_20px_50px_rgba(35,8,15,0.6)] backdrop-blur-2xl">
      {/* Ragyogó Neongömbök & Mesh Gradiens */}
      <div className="absolute -top-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-amber-500/20 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -left-32 h-[30rem] w-[30rem] rounded-full bg-wine-500/30 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-emerald-500/10 blur-[90px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl space-y-8">
        {/* Élő Rendszer Status Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-400/40 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300 backdrop-blur-md shadow-inner">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Digital Kőszeg Hive 2026</span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span>Realtime Supabase Sync</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-sand-100 to-amber-200 bg-clip-text text-transparent">
            {ORGANIZATION.legalName}
          </h1>

          <p className="text-lg sm:text-xl text-sand-200 leading-relaxed font-normal max-w-3xl">
            {ORGANIZATION.mission}
          </p>
        </div>

        {/* Cselekvési Gombok & Lebegő Kártyák */}
        <div className="pt-2 flex flex-wrap items-center gap-4">
          <Link
            to="/munkacsoportok"
            className="btn py-4 px-8 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-wine-950 font-extrabold rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-base border-0 flex items-center gap-2.5"
          >
            <Compass className="h-5 w-5" />
            Munkacsoportok Felfedezése
          </Link>

          <Link
            to="/egyesulet"
            className="btn py-4 px-7 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/25 backdrop-blur-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-base flex items-center gap-2"
          >
            Egyesületekről &amp; Vezetőség
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 3 Luxus Statisztikai Kártya */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/15">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Award className="h-4 w-4" />
              <span>100% Okosturizmus</span>
            </div>
            <p className="text-xs text-sand-300">Digitális Kőszeg szoftverarchitektúra</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Zap className="h-4 w-4" />
              <span>Realtime Adatbázis</span>
            </div>
            <p className="text-xs text-sand-300">Azonnali Supabase élő szinkronizáció</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Globe className="h-4 w-4" />
              <span>Barion Crowdfunding</span>
            </div>
            <p className="text-xs text-sand-300">Közösségi projekt finanszírozás</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const LatestNews = () => {
  const { data: news, loading, error, reload } = useAsyncData(listPublishedNews);
  const items = (news || []).slice(0, 3);

  return (
    <section className="section bg-sand-50/70 relative py-10">
      <div className="container-page space-y-8">
        {/* Futurisztikus Neonsávú Glass Sticky Fejléc */}
        <div className="sticky top-[68px] z-30 bg-gradient-to-r from-wine-950/90 via-wine-900/90 to-amber-950/90 text-white backdrop-blur-2xl py-4 px-6 border border-amber-500/40 rounded-2xl shadow-[0_10px_30px_rgba(35,8,15,0.4)] transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">Friss hírek &amp; Események</p>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">Legutóbbi hírek</h2>
            </div>
          </div>

          {items.length > 0 && (
            <Link to="/hirek" className="btn py-2 px-4 bg-amber-500 hover:bg-amber-400 text-wine-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 border-0">
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
    <section className="section bg-sand-100/60 relative py-10">
      <div className="container-page space-y-8">
        {/* Futurisztikus Neonsávú Glass Sticky Fejléc */}
        <div className="sticky top-[68px] z-30 bg-gradient-to-r from-wine-950/90 via-wine-900/90 to-amber-950/90 text-white backdrop-blur-2xl py-4 px-6 border border-emerald-500/40 rounded-2xl shadow-[0_10px_30px_rgba(35,8,15,0.4)] transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">Szakmai Összefogás</p>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">Munkacsoportok</h2>
            </div>
          </div>

          <Link to="/munkacsoportok" className="btn py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-wine-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 border-0">
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
