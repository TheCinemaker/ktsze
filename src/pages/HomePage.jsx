import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Newspaper,
  FileText,
  Users,
  Compass,
  Radio,
  MousePointer2
} from 'lucide-react';

import { ORGANIZATION } from '../config/organization';
import { listPublishedNews, listWorkgroups, getWorkgroupStats, listMyWorkgroupMemberships } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { useAuth } from '../context/AuthContext';
import { EmptyState, Spinner, ErrorBlock, SectionHeading } from '../components/ui';
import { NewsCard } from '../components/public/NewsCard';
import { WorkgroupCard } from '../components/workgroups/WorkgroupCard';
import { useCountUp, useSpotlight } from '../lib/motion';

/* ===========================================================================
   Élő számláló

   FONTOS: minden szám valós lekérdezésből jön. Amíg nincs adat, nincs szám —
   nem írunk ki kitalált „40+ tagvállalkozás" jellegű értéket.
   =========================================================================== */
const LiveStat = ({ value, label, suffix = '', accent = 'gold' }) => {
  const [ref, shown] = useCountUp(value);
  const tone = {
    gold: 'text-champagne-400',
    jade: 'text-mint-400',
    wine: 'text-blush-400'
  }[accent];

  return (
    <div ref={ref} className="group relative">
      <div className={`font-display text-4xl font-semibold tabular-nums sm:text-5xl ${tone}`}>
        {shown}
        {suffix}
      </div>
      <div className="mt-1.5 font-mono text-2xs uppercase tracking-[0.2em] text-ivory-500">{label}</div>
    </div>
  );
};

/* ===========================================================================
   Hero

   Éjszakai felület a nappali oldal tetején. Ez a kontraszt a legrégebbi
   luxus-fogás a nyomdából: a sötét, telített felület felnagyítja mellette a
   fehér papír tisztaságát — és fordítva.
   =========================================================================== */
const HeroSection = ({ workgroupCount, memberCount, newsCount }) => {
  const spotlightRef = useSpotlight();

  return (
    <section
      ref={spotlightRef}
      className="surface-noir grain spotlight relative isolate -mt-[4.75rem] overflow-hidden
                 rounded-b-[2.5rem] sm:rounded-b-[4rem]"
    >
      {/* Aurora: három elmosott folt, lassan sodródva. Nem videó, nem kép —
          három elem a GPU-n, néhány száz bájt. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora animate-drift bg-[radial-gradient(circle_at_22%_28%,oklch(var(--wine-500)/0.55),transparent_45%)]" />
        <div className="aurora animate-drift-slow bg-[radial-gradient(circle_at_78%_18%,oklch(var(--gold-500)/0.35),transparent_42%)]" />
        <div className="aurora animate-drift bg-[radial-gradient(circle_at_58%_88%,oklch(var(--jade-500)/0.22),transparent_46%)]" />
      </div>

      {/* Hajszálrács — épp csak sejthető szerkezet a mélységért. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]
                   [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
                   [background-size:88px_88px]
                   [mask-image:radial-gradient(120%_90%_at_50%_0%,#000_25%,transparent_75%)]"
      />

      <div className="container-page relative z-10 pb-16 pt-32 sm:pb-24 sm:pt-40 lg:pb-28 lg:pt-44">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* --- Bal oszlop: a mondanivaló --- */}
          <div className="lg:col-span-7 xl:col-span-7">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-champagne-500/30 bg-champagne-500/10 px-3.5 py-1.5 font-mono text-2xs uppercase tracking-[0.2em] text-champagne-300 backdrop-blur-md">
                Kőszeg · Vas vármegye
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-mint-500/25 bg-mint-500/10 px-3.5 py-1.5 font-mono text-2xs uppercase tracking-[0.2em] text-mint-400 backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-mint-400" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint-400" />
                </span>
                Élő adatkapcsolat
              </span>
            </div>

            <h1 className="mt-8 font-display text-6xl font-medium leading-[0.98]">
              <span className="text-ivory-fade block">Kőszeg turisztikai</span>
              <span className="text-ivory-fade block">szereplőinek</span>
              <span className="text-gold-foil block italic [font-variation-settings:'WONK'_1,'SOFT'_40]">
                szakmai szövetsége
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ivory-400">
              {ORGANIZATION.mission}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link to="/munkacsoportok" className="btn-gold btn-lg group">
                <Compass className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
                Munkacsoportok felfedezése
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>

              <Link
                to="/egyesulet"
                className="btn btn-lg group border-white/15 bg-white/[0.06] text-ivory-100
                           backdrop-blur-xl transition-all duration-500 hover:border-white/30 hover:bg-white/[0.12]"
              >
                Egyesületünk &amp; elnökség
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>

          {/* --- Jobb oszlop: adatpanel ---
              Nem díszlet: mindhárom szám az adatbázis aktuális állapota. */}
          <div className="lg:col-span-5 xl:col-span-4 xl:col-start-9">
            <div className="sheen-border relative h-full rounded-4xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-2xl sm:p-8">
              <div className="flex items-center gap-2 font-mono text-2xs uppercase tracking-[0.2em] text-ivory-500">
                <Radio className="h-3.5 w-3.5 text-mint-400" aria-hidden="true" />
                Az egyesület most
              </div>

              <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-8">
                <LiveStat value={workgroupCount} label="Munkacsoport" accent="gold" />
                <LiveStat value={memberCount} label="Csoporttagság" accent="jade" />
                <LiveStat value={newsCount} label="Közzétett hír" accent="wine" />
                <div>
                  <div className="font-display text-4xl font-semibold text-ivory-300 sm:text-5xl">
                    24<span className="text-ivory-400">/</span>7
                  </div>
                  <div className="mt-1.5 font-mono text-2xs uppercase tracking-[0.2em] text-ivory-500">
                    Tagi portál
                  </div>
                </div>
              </div>

              <hr className="rule-gold my-7" />

              <p className="text-sm leading-relaxed text-ivory-400">
                A számok élő adatbázisból frissülnek. A tagi és elnökségi felület
                folyamatosan elérhető, a támogatások állapota valós időben látszik.
              </p>
            </div>
          </div>
        </div>

        {/* Görgetési jelzés — halk, de megadja a lap ritmusát. */}
        <div
          aria-hidden="true"
          className="mt-16 hidden items-center gap-3 font-mono text-2xs uppercase tracking-[0.2em] text-ivory-400 lg:flex"
        >
          <MousePointer2 className="h-3.5 w-3.5 animate-float" />
          Görgess tovább
          <span className="h-px w-24 bg-gradient-to-r from-ivory-500 to-transparent" />
        </div>
      </div>
    </section>
  );
};

/* ===========================================================================
   Kinetikus szalag

   Egyetlen vízszintes sáv, ami sosem áll meg. A kettőzött tartalom miatt a
   -50%-os eltolás pontosan visszaér a kiindulópontra, így a hurok láthatatlan.
   =========================================================================== */
const SCOPE = [
  'Szálláshelyek',
  'Vendéglátás',
  'Borászatok',
  'Kulturális programok',
  'Jurisics vár',
  'Írottkő',
  'Digitális Kőszeg',
  'Okosturizmus'
];

const Ribbon = () => (
  <div className="marquee-mask border-y border-sand-300 bg-sand-50 py-4">
    {/*
      A tartalom pontosan kétszer szerepel, és a köz KÖZÖS a tételekkel
      (pr-8), nem a sávon ül gap-ként. Így a -50%-os eltolás milliméterre
      visszaér a kiindulópontra — egy sáv szintű gap fél résnyit csúsztatna,
      és a hurok minden körben megrándulna.
    */}
    <div className="marquee-track items-center" aria-hidden="true">
      {[0, 1].map((copy) => (
        <React.Fragment key={copy}>
          {SCOPE.map((word) => (
            <span key={`${copy}-${word}`} className="flex shrink-0 items-center gap-8 pr-8">
              <span className="font-display text-lg italic text-ink-500">{word}</span>
              <span className="h-1 w-1 rounded-full bg-gold-500" />
            </span>
          ))}
        </React.Fragment>
      ))}
    </div>
    <span className="sr-only">
      Az egyesület tevékenységi köre: {SCOPE.join(', ')}.
    </span>
  </div>
);

/* ===========================================================================
   Szerkesztőségi bevezető

   Aszimmetrikus rács: a bal oldalon egy nagy, sorszámozott állítás, jobbra a
   kifejtés. A „01 —" sorszámozás a nyomtatott magazinok fogása; itt tartja
   össze a lap felső harmadát.
   =========================================================================== */
const Manifesto = () => (
  <section className="section container-page">
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="reveal lg:col-span-5">
        <span className="eyebrow">
          <span className="font-mono text-gold-600">01</span>
          <span className="h-px w-6 bg-gold-500/60" />
          Miért vagyunk
        </span>
        <h2 className="mt-5 font-display text-4xl leading-[1.08]">
          Egy város akkor erős,{' '}
          <em className="font-normal text-wine-600 [font-variation-settings:'WONK'_1]">
            ha a szereplői egy irányba néznek.
          </em>
        </h2>
      </div>

      <div className="reveal lg:col-span-6 lg:col-start-7">
        <p className="text-lg leading-relaxed text-ink-600">
          {ORGANIZATION.tagline}. Az egyesület összeköti a szálláshelyeket, a vendéglátókat,
          a borászokat és a kulturális szolgáltatókat — közös hangot, közös adatokat és
          közös fejlesztéseket adva nekik.
        </p>

        <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-sand-300 bg-sand-300 sm:grid-cols-3">
          {[
            { t: 'Nyílt működés', d: 'Alapszabály és beszámolók egy helyen, bárki számára.' },
            { t: 'Munkacsoportok', d: 'Konkrét feladat, felelős vezető, látható előrehaladás.' },
            { t: 'Digitális alap', d: 'Saját tagi platform, élő adatokkal és online támogatással.' }
          ].map((item) => (
            <div key={item.t} className="bg-sand-100 p-5">
              <dt className="font-display text-base text-ink-900">{item.t}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-ink-500">{item.d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
);

/* =========================================================================== */
const LatestNews = ({ news, loading, error, reload }) => {
  const items = (news || []).slice(0, 3);

  return (
    <section className="section bg-sand-50">
      <div className="container-page">
        <SectionHeading
          index="02"
          eyebrow="Friss hírek és események"
          title="Ami most történik"
          action={
            items.length > 0 && (
              <Link to="/hirek" className="btn-secondary group rounded-full">
                Összes hír
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            )
          }
        />

        <div className="mt-12">
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
            <div className="reveal-stagger grid gap-6 md:grid-cols-3">
              {items.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/* =========================================================================== */
const Workgroups = ({ groups, loading, stats, memberships, onChanged }) => {
  const active = (groups || []).filter((g) => g.is_active);

  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading
          index="03"
          eyebrow="Szakmai összefogás"
          title="Munkacsoportok"
          description="Minden csoport mögött egy konkrét feladat és egy felelős vezető áll. Bármelyikhez lehet csatlakozni, és a futó projektek támogatása is nyitott."
          action={
            <Link to="/munkacsoportok" className="btn-primary group rounded-full">
              Csatlakozás
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          }
        />

        <div className="mt-12">
          {loading && <Spinner />}

          {!loading && active.length === 0 && (
            <EmptyState
              icon={Users}
              title="Munkacsoportok előkészítés alatt"
              description="Az elnökségi admin felületen hozhatók létre új egyesületi munkacsoportok."
            />
          )}

          {active.length > 0 && (
            <div className="reveal-stagger grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {active.map((group) => (
                <WorkgroupCard
                  key={group.id}
                  workgroup={group}
                  stats={(stats || {})[group.id]}
                  membership={(memberships || []).find((m) => m.workgroup_id === group.id)}
                  onChanged={onChanged}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/* ===========================================================================
   Kapuk — két nagy, tapintható csempe
   =========================================================================== */
const Gate = ({ to, eyebrow, title, description, icon: Icon, cta }) => {
  const ref = useSpotlight();

  return (
    <Link
      ref={ref}
      to={to}
      className="card-hover spotlight group relative flex flex-col overflow-hidden p-8 sm:p-10"
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-sand-300
                     bg-sand-200 text-wine-600 transition-all duration-500 ease-lux
                     group-hover:border-gold-400/50 group-hover:bg-wine-50 group-hover:text-wine-500"
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <ArrowUpRight
          className="h-6 w-6 text-ink-300 transition-all duration-500 ease-lux
                     group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-wine-600"
          aria-hidden="true"
        />
      </div>

      <span className="eyebrow mt-8">{eyebrow}</span>
      <h3 className="mt-2.5 font-display text-2xl text-ink-900">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-500">{description}</p>

      <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-wine-600">
        {cta}
        <span className="h-px w-8 bg-wine-500/50 transition-all duration-500 ease-lux group-hover:w-14" />
      </span>
    </Link>
  );
};

const Gates = () => (
  <section className="section bg-sand-50">
    <div className="container-page">
      <SectionHeading index="04" eyebrow="Belépési pontok" title="Csatlakozás és átláthatóság" />
      <div className="reveal-stagger mt-12 grid gap-6 md:grid-cols-2">
        <Gate
          to="/tagsag"
          icon={Users}
          eyebrow="Egyesületi tagság"
          title="Tagsági formák és feltételek"
          description="Rendes és pártoló tagság, éves tagdíjak, a csatlakozás menete — pontosan, kerülőút nélkül."
          cta="Részletek és csatlakozás"
        />
        <Gate
          to="/dokumentumok"
          icon={FileText}
          eyebrow="Dokumentumtár"
          title="Alapszabály és beszámolók"
          description="Az egyesület közzétett alapszabálya, pénzügyi beszámolói és közgyűlési dokumentumai."
          cta="Dokumentumok megtekintése"
        />
      </div>
    </div>
  </section>
);

/* ===========================================================================
   Záró felhívás — a hero éjszakai felületének visszatérése, keretbe zárva.
   =========================================================================== */
const ClosingCall = () => {
  const ref = useSpotlight();

  return (
    <section className="container-page pb-20 pt-4">
      <div
        ref={ref}
        className="surface-noir grain spotlight relative isolate overflow-hidden rounded-4xl px-8 py-16 text-center sm:px-16 sm:py-20"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="aurora animate-drift-slow bg-[radial-gradient(circle_at_30%_50%,oklch(var(--wine-500)/0.45),transparent_45%)]" />
          <div className="aurora animate-drift bg-[radial-gradient(circle_at_75%_40%,oklch(var(--gold-500)/0.3),transparent_45%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl">
          <span className="eyebrow text-champagne-400">Kőszeg, közösen</span>
          <h2 className="text-ivory-fade mt-5 font-display text-5xl leading-[1.02]">
            Dolgozzon velünk a város turizmusán
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-ivory-400">
            Szálláshely, vendéglátóhely, borászat vagy kulturális szolgáltató — a szövetség
            tagjaként közös felületen, közös hanggal jelenhet meg.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/tagsag" className="btn-gold btn-lg">
              Tagság feltételei
            </Link>
            <Link
              to="/kapcsolat"
              className="btn btn-lg border-white/15 bg-white/[0.06] text-ivory-100 backdrop-blur-xl hover:bg-white/[0.12]"
            >
              Kapcsolatfelvétel
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/* =========================================================================== */
export const HomePage = () => {
  const { profile } = useAuth();
  const { data: groups, loading: groupsLoading, reload: reloadGroups } = useAsyncData(listWorkgroups);
  const stats = useAsyncData(getWorkgroupStats, [], { initialData: {} });
  const news = useAsyncData(listPublishedNews, [], { initialData: [] });
  const memberships = useAsyncData(
    () => listMyWorkgroupMemberships(profile?.id),
    [profile?.id],
    { enabled: Boolean(profile?.id), initialData: [] }
  );

  const activeGroups = (groups || []).filter((g) => g.is_active);
  // Az összes jóváhagyott csoporttagság összege — valós, lekérdezett érték.
  const memberCount = Object.values(stats.data || {}).reduce((sum, s) => sum + (s?.approved || 0), 0);

  const reloadAll = () => {
    reloadGroups();
    stats.reload();
    memberships.reload();
  };

  return (
    <>
      <HeroSection
        workgroupCount={activeGroups.length}
        memberCount={memberCount}
        newsCount={(news.data || []).length}
      />
      <Ribbon />
      <Manifesto />
      <LatestNews news={news.data} loading={news.loading} error={news.error} reload={news.reload} />
      <Workgroups
        groups={groups}
        loading={groupsLoading}
        stats={stats.data}
        memberships={memberships.data}
        onChanged={reloadAll}
      />
      <Gates />
      <ClosingCall />
    </>
  );
};
