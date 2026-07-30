import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, UserPlus, FileText, ArrowRight } from 'lucide-react';

import { ORGANIZATION } from '../config/organization';
import { listDuesRates } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { PageHeader, EmptyState, Spinner, ErrorBlock } from '../components/ui';
import { formatHuf } from '../lib/format';

/*
  A korábbi verzió itt konkrét összegeket írt ki (24 000 / 36 000 / 15 000 Ft),
  amiket senki nem hagyott jóvá, és két másik fájlban is szerepeltek. Most a
  tagdíjtételek az adatbázisból jönnek (dues_rates tábla), az elnökség tölti
  fel őket. Amíg nincs bevitt tétel, nem jelenik meg összeg — nem tippelünk.

  Szintén kikerült: az "elnök hamarosan felveszi Önnel a kapcsolatot" típusú
  alert nevesített személlyel.
*/

const DuesTable = () => {
  const { data, loading, error, reload } = useAsyncData(() => listDuesRates());
  const rates = data || [];

  if (loading) return <Spinner />;
  if (error) return <ErrorBlock message={error} onRetry={reload} />;

  if (rates.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="A tagdíjtételek még nincsenek közzétéve"
        description="A tagdíjakat az elnökség rögzíti a belső felületen. Amíg nincs jóváhagyott tétel, itt szándékosan nem jelenik meg összeg."
      />
    );
  }

  // Év szerint csoportosítva, a legfrissebb elöl.
  const byYear = rates.reduce((acc, rate) => {
    acc[rate.year] = acc[rate.year] || [];
    acc[rate.year].push(rate);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="space-y-6 max-w-full">
      {years.map((year) => (
        <div key={year} className="space-y-3">
          <h3 className="font-display text-lg font-bold text-ink-900">{year}. évi tagdíjak</h3>

          <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-sand-300 bg-white p-2 sm:p-4 custom-scrollbar">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <caption className="sr-only">{year}. évi tagdíjtételek</caption>
              <thead>
                <tr className="border-b border-sand-400 text-left">
                  <th scope="col" className="py-2.5 pr-2 sm:pr-4 font-bold text-ink-700">
                    Kategória
                  </th>
                  <th scope="col" className="py-2.5 pr-2 sm:pr-4 font-bold text-wine-800">
                    Összeg
                  </th>
                  <th scope="col" className="py-2.5 font-bold text-ink-700">
                    Megjegyzés
                  </th>
                </tr>
              </thead>
              <tbody>
                {byYear[year].map((rate) => (
                  <tr key={rate.id} className="border-b border-sand-200 last:border-0">
                    <td className="py-3 pr-2 sm:pr-4 font-bold text-ink-900 whitespace-nowrap">{rate.label}</td>
                    <td className="py-3 pr-2 sm:pr-4 font-bold text-wine-700 whitespace-nowrap">{formatHuf(rate.amount_huf)}</td>
                    <td className="py-3 text-ink-600 text-xs">{rate.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export const MembershipPage = () => (
  <div className="container-page py-12 sm:py-16 max-w-full overflow-hidden">
    <PageHeader
      eyebrow="Csatlakozás"
      title="Tagság"
      description={`Tagsági formák, tagdíjak és a csatlakozás menete a ${ORGANIZATION.shortName} Egyesületben.`}
    />

    <div className="mt-10 grid gap-8 lg:grid-cols-3 max-w-full">
      <div className="space-y-8 lg:col-span-2 min-w-0">
        <section>
          <h2 className="font-display text-2xl text-ink-900">Tagdíjak</h2>
          <div className="mt-4">
            <DuesTable />
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-900">A csatlakozás menete</h2>
          <ol className="mt-4 max-w-prose space-y-4">
            {[
              {
                title: 'Fiók létrehozása',
                text: 'Regisztrálj a belépési oldalon. Add meg az elérhetőségeidet és a szolgáltatásod adatait.'
              },
              {
                title: 'Elnökségi elbírálás',
                text: 'A regisztrációt az elnökség áttekinti, és beállítja a tagsági kategóriát.'
              },
              {
                title: 'Tagdíj rendezése',
                text: 'A jóváhagyás után a tagi portálon látod az esedékes tagdíjat, és ott töltheted fel az átutalási igazolást.'
              }
            ].map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wine-100 font-display text-sm font-semibold text-wine-600"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-display text-base text-ink-900">{step.title}</h3>
                  <p className="mt-0.5 text-sm text-ink-600">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Oldalsáv */}
      <aside className="lg:col-span-1">
        <div className="surface p-6">
          <UserPlus className="mb-3 h-6 w-6 text-wine-600" aria-hidden="true" />
          <h2 className="font-display text-lg text-ink-900">Jelentkezés</h2>
          <p className="mt-2 text-sm text-ink-600">
            A csatlakozás fiókregisztrációval indul. A regisztráció önmagában még nem jelent tagságot — azt az
            elnökség hagyja jóvá.
          </p>
          <Link to="/belepes" className="btn-primary mt-5 w-full">
            Regisztráció és belépés
          </Link>

          {/* Banki adatok csak akkor, ha tényleg be van állítva */}
          {ORGANIZATION.bankAccount && (
            <div className="mt-6 border-t border-sand-400 pt-5">
              <h3 className="text-xs font-medium uppercase tracking-wide text-ink-500">Tagdíj utalása</h3>
              {ORGANIZATION.bankName && <p className="mt-1.5 text-sm text-ink-900">{ORGANIZATION.bankName}</p>}
              <p className="mt-0.5 font-mono text-sm text-wine-600">{ORGANIZATION.bankAccount}</p>
            </div>
          )}

          {/* Hivatalos Alapszabály link */}
          <div className="mt-6 border-t border-sand-400 pt-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-wine-800 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-wine-600" />
              Hivatalos Dokumentumok
            </h3>
            <p className="text-xs text-ink-600">
              Az egyesület bírósági bejegyzésű Alapszabálya és városszépítő programfüzete nyilvánosan megtekinthető:
            </p>
            <Link to="/dokumentumok" className="btn-secondary btn-sm w-full text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-wine-50">
              Alapszabály Megtekintése
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  </div>
);
