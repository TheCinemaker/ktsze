import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Newspaper, FileText, Users, Gavel,
  Target, Megaphone, Sparkles, Handshake, Mail, Quote
} from 'lucide-react';

import { ORGANIZATION, PRESS_RELEASE } from '../config/organization';
import { listPublishedNews, listWorkgroups } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { EmptyState, Spinner, ErrorBlock, FormattedText } from '../components/ui';
import { NewsCard } from '../components/public/NewsCard';
import { LogoMark } from '../components/layout/HeaderLogo';
import { KoszegSkyline } from '../components/public/KoszegSkyline';

/*
  A főoldal SEMMILYEN kitalált adatot nem tartalmaz.

  A cél-kártyák szövege az alapszabály II. pontjában rögzített egyesületi
  célokból származik; az elnöki idézet a hivatalos sajtóközleményből (lásd
  src/config/organization.js). A hírek és munkacsoportok az adatbázisból jönnek
  (üres állapottal), a bizalmi sáv azonosítói pedig a bírósági/NAV nyilvántartásból.
*/

/** Elegáns rovatcím: rövid arany hajszálvonal + ritkított verzál felirat. */
const Eyebrow = ({ children, light = false }) => (
  <span
    className={`inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] ${
      light ? 'text-gold-300' : 'text-wine-600'
    }`}
  >
    <span className={`h-px w-8 ${light ? 'bg-gold-400/70' : 'bg-gold-400'}`} aria-hidden="true" />
    {children}
  </span>
);

// Az egyesület céljai az alapszabály II. pontja alapján — tényszerű, nem kitalált.
const PURPOSES = [
  {
    icon: Target,
    title: 'Szakmai érdekképviselet',
    text: 'A kőszegi szálláshely-szolgáltatók, vendéglátók, borászok és turisztikai szereplők szakmai és gazdasági érdekeinek közös képviselete.'
  },
  {
    icon: Megaphone,
    title: 'Közös kommunikáció',
    text: 'Promóciós kampányok, kiadványok, fotó- és videótartalmak Kőszeg turisztikai vonzerejének és jó hírnevének erősítéséért.'
  },
  {
    icon: Sparkles,
    title: 'Programok & városszépítés',
    text: 'Turisztikai, kulturális, gasztronómiai, közösségi és városszépítő programok szervezése, támogatása és összehangolása.'
  },
  {
    icon: Handshake,
    title: 'Együttműködés',
    text: 'Partnerség Kőszeg Város Önkormányzatával, intézményekkel, civil szervezetekkel, vállalkozásokkal és szakmai partnerekkel.'
  }
];

const QUICK_LINKS = [
  { to: '/dokumentumok', icon: FileText, label: 'Dokumentumok', hint: 'Alapszabály és közzétett iratok' },
  { to: '/hatarozatok', icon: Gavel, label: 'Határozatok Tára', hint: 'Közgyűlési és elnökségi határozatok' },
  { to: '/kapcsolat', icon: Mail, label: 'Kapcsolat', hint: 'Írj nekünk, csatlakozz' }
];

const HeroSection = () => (
  <section className="relative overflow-hidden bg-gradient-to-b from-sand-200 via-sand-100 to-sand-50">
    <div className="relative z-10 container-page max-w-3xl pt-14 pb-36 sm:pt-20 sm:pb-44">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-card ring-1 ring-gold-300/60">
          <LogoMark className="h-7 w-7" />
        </span>
        <Eyebrow>{ORGANIZATION.tagline}</Eyebrow>
      </div>

      <h1 className="mt-6 font-display text-4xl leading-[1.08] text-wine-900 sm:text-5xl lg:text-6xl">
        Együtt Kőszeg<br className="hidden sm:block" /> turizmusáért
      </h1>

      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-600">
        A kőszegi szálláshelyek, vendéglátók, borászok és kulturális szolgáltatók szakmai
        összefogása — a város turisztikai vonzerejéért és a minőségi vendégélményért.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/tagsag" className="btn-gold btn-md shadow-lift">
          Csatlakozom az egyesülethez
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link to="/egyesulet" className="btn btn-md border-wine-300 bg-white text-wine-700 hover:bg-wine-50">
          Rólunk &amp; Vezetőség
        </Link>
      </div>
    </div>

    {/* Rajzolt kőszegi látkép a hero alján — teljes szélességű dekoratív sáv */}
    <KoszegSkyline className="pointer-events-none absolute inset-x-0 bottom-0 h-36 w-full sm:h-48" />
  </section>
);

const Purposes = () => (
  <section className="section bg-sand-50">
    <div className="container-page space-y-10">
      <div className="max-w-2xl">
        <Eyebrow>Amiért dolgozunk</Eyebrow>
        <h2 className="mt-3 font-display text-3xl text-ink-900 sm:text-4xl">Céljaink</h2>
        <p className="mt-3 text-base text-ink-600">
          Az egyesület az alapszabályban rögzített célok mentén, a helyi turisztikai szereplők
          összefogásával dolgozik Kőszegért.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PURPOSES.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className="group rounded-xl border border-sand-300 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-lift"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-300 bg-gold-50 text-wine-700">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-5 font-display text-lg text-ink-900">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{text}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const PresidentQuote = () => (
  <section className="relative overflow-hidden bg-wine-900 text-white">
    {/* Kőszegi címer halvány vízjelként */}
    <div
      className="pointer-events-none absolute -right-8 top-1/2 hidden -translate-y-1/2 opacity-[0.07] md:block"
      aria-hidden="true"
    >
      <img src="/koszeg_cimer.png" alt="" className="h-72 w-auto" />
    </div>

    <div className="relative container-page py-16 sm:py-20">
      <div className="max-w-3xl">
        <Quote className="h-9 w-9 text-gold-400" aria-hidden="true" />
        <blockquote className="mt-5 font-display text-2xl italic leading-relaxed text-sand-50 sm:text-3xl">
          „{PRESS_RELEASE.quote.text}"
        </blockquote>
        <div className="mt-6 flex items-center gap-3">
          <span className="h-px w-10 bg-gold-400" aria-hidden="true" />
          <span className="text-sm font-semibold uppercase tracking-[0.12em] text-gold-300">
            {PRESS_RELEASE.quote.author}
          </span>
        </div>
      </div>
    </div>
  </section>
);

const LatestNews = () => {
  const { data: news, loading, error, reload } = useAsyncData(listPublishedNews);
  const items = (news || []).slice(0, 3);

  return (
    <section className="section bg-sand-100">
      <div className="container-page space-y-8">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4 pb-5">
            <div>
              <Eyebrow>Friss tartalom</Eyebrow>
              <h2 className="mt-3 font-display text-3xl text-ink-900">Legutóbbi hírek</h2>
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
    <section className="section bg-sand-50">
      <div className="container-page space-y-8">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4 pb-5">
            <div>
              <Eyebrow>Szakmai munka</Eyebrow>
              <h2 className="mt-3 font-display text-3xl text-ink-900">Munkacsoportok</h2>
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
              <article key={group.id} className="card p-6 transition-all duration-200 hover:border-gold-300 hover:shadow-lift">
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

const MembershipCta = () => (
  <section className="bg-wine-700 text-white">
    <div className="container-page py-16">
      <div className="rounded-2xl border border-gold-400/30 bg-wine-800/40 p-8 sm:p-10">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="max-w-2xl space-y-2">
            <Eyebrow light>Fogjunk össze Kőszegért</Eyebrow>
            <h2 className="mt-2 font-display text-2xl text-white sm:text-3xl">
              Csatlakozz vállalkozásoddal a kőszegi összefogáshoz
            </h2>
            <p className="text-sm leading-relaxed text-sand-100/90">
              Szálláshely, vendéglátóhely, borászat vagy kulturális szolgáltató: a szövetség tagjaként
              közös felületen, közös hanggal jelenhetsz meg, és részt vehetsz a város turisztikai fejlesztéseiben.
            </p>
          </div>
          <Link to="/tagsag" className="btn-gold btn-md shrink-0 shadow-lift">
            Tagsági feltételek
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const QuickLinks = () => (
  <section className="section bg-sand-100">
    <div className="container-page">
      <div className="grid gap-5 md:grid-cols-3">
        {QUICK_LINKS.map(({ to, icon: Icon, label, hint }) => (
          <Link
            key={to}
            to={to}
            className="group block rounded-xl border border-sand-300 bg-white p-6 shadow-card transition-all duration-200 hover:border-gold-300 hover:shadow-lift"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-300 bg-gold-50 text-wine-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-lg text-ink-900">{label}</h3>
                <p className="text-xs text-ink-500">{hint}</p>
              </div>
              <ArrowRight
                className="ml-auto h-4 w-4 text-wine-600 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export const HomePage = () => (
  <>
    <HeroSection />
    <Purposes />
    <PresidentQuote />
    <LatestNews />
    <Workgroups />
    <MembershipCta />
    <QuickLinks />
  </>
);
