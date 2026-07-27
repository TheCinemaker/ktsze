import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, RefreshCw, Copy, Check } from 'lucide-react';

import { supabase, supabaseProjectRef, describeError } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader, Spinner } from '../components/ui';

/*
  Diagnosztika: /diagnosztika

  Ez az oldal megmutatja, mit "gondol" az alkalmazás a belépett felhasználóról
  és a jogosultságairól. Ha valami nem látszik, ami látszania kellene, itt derül
  ki, hogy az adatbázisban vagy a kliensben van a baj — nem kell konzolt nyitni.

  Szándékosan mindenki eléri, aki be van léptetve: csak a SAJÁT adatait látja,
  és semmilyen művelet nem indul innen.
*/

const Row = ({ ok, label, value }) => (
  <div className="flex items-start gap-3 border-b border-sand-300 py-3 last:border-0">
    {ok ? (
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-positive-600" aria-hidden="true" />
    ) : (
      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-wine-600" aria-hidden="true" />
    )}
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-ink-900">{label}</p>
      <p className="mt-0.5 break-words font-mono text-xs text-ink-600">{value}</p>
    </div>
  </div>
);

/** Az adatbázis-oldali jogosultsági függvények tényleges hívása. */
const SqlChecks = () => {
  const [state, setState] = useState({ status: 'idle', rows: null, error: null });

  const run = async () => {
    setState({ status: 'running', rows: null, error: null });
    const checks = ['is_admin', 'can_manage_members', 'can_manage_content', 'is_board'];
    const rows = [];

    for (const fn of checks) {
      // eslint-disable-next-line no-await-in-loop
      const { data, error } = await supabase.rpc(fn);
      rows.push({
        fn,
        value: error ? null : data,
        error: error ? describeError(error) : null
      });
    }
    setState({ status: 'done', rows, error: null });
  };

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-ink-900">Adatbázis-oldali jogosultság</h2>
          <p className="mt-0.5 text-sm text-ink-600">
            Ez a valódi döntéshozó. Ha itt <code>false</code> van, a felület elrejtése nem a hiba oka —
            az adatbázis nem ad jogot.
          </p>
        </div>
        <button type="button" onClick={run} disabled={state.status === 'running'} className="btn-secondary btn-sm">
          {state.status === 'running' ? (
            <Spinner label="Mérés…" />
          ) : (
            <>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Lefuttatom
            </>
          )}
        </button>
      </div>

      {state.rows && (
        <div className="mt-4">
          {state.rows.map((r) => (
            <Row
              key={r.fn}
              ok={r.value === true}
              label={`${r.fn}()`}
              value={r.error ? `HIBA: ${r.error}` : String(r.value)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

/**
 * Valódi írási próba.
 *
 * Beszúr egy felismerhetően jelölt tesztsort, majd azonnal törli. Így nem
 * találgatunk: pontosan látszik, melyik táblán és milyen hibával akad el a
 * mentés a TE munkameneteddel.
 */
const WriteTests = () => {
  const [state, setState] = useState({ status: 'idle', rows: null });

  const TESTS = [
    {
      table: 'dues_rates',
      label: 'Tagdíjtételek',
      row: { year: 1900, label: '__teszt__', amount_huf: 0 }
    },
    {
      table: 'news',
      label: 'Hírek',
      row: { title: '__teszt__', slug: `__teszt__${Date.now()}`, is_published: false }
    },
    {
      table: 'workgroups',
      label: 'Munkacsoportok',
      row: { name: '__teszt__', slug: `__teszt__${Date.now()}` }
    },
    {
      table: 'documents',
      label: 'Dokumentumok',
      row: { title: '__teszt__', slug: `__teszt__${Date.now()}`, access_level: 'admin' }
    }
  ];

  const run = async () => {
    setState({ status: 'running', rows: null });
    const rows = [];

    for (const test of TESTS) {
      // eslint-disable-next-line no-await-in-loop
      const { data, error } = await supabase.from(test.table).insert(test.row).select('id').single();

      if (error) {
        rows.push({ ...test, ok: false, detail: `${error.code || 'hiba'}: ${error.message}` });
      } else {
        // Takarítás: a tesztsor azonnal megy ki.
        // eslint-disable-next-line no-await-in-loop
        const { error: delError } = await supabase.from(test.table).delete().eq('id', data.id);
        rows.push({
          ...test,
          ok: true,
          detail: delError
            ? `Beszúrás OK, de a törlés nem sikerült: ${delError.message} — a "__teszt__" sort kézzel töröld.`
            : 'Beszúrás és törlés is sikeres.'
        });
      }
    }

    setState({ status: 'done', rows });
  };

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-ink-900">Írási próba</h2>
          <p className="mt-0.5 text-sm text-ink-600">
            Beszúr egy „__teszt__” sort, majd rögtön törli. Ez mutatja meg, hol akad el valójában a mentés.
          </p>
        </div>
        <button type="button" onClick={run} disabled={state.status === 'running'} className="btn-secondary btn-sm">
          {state.status === 'running' ? (
            <Spinner label="Próba…" />
          ) : (
            <>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Lefuttatom
            </>
          )}
        </button>
      </div>

      {state.rows && (
        <div className="mt-4">
          {state.rows.map((r) => (
            <Row key={r.table} ok={r.ok} label={`${r.label} (${r.table})`} value={r.detail} />
          ))}
        </div>
      )}
    </section>
  );
};

export const DiagnosticsPage = () => {
  const { session, profile, roles, profileError, isAuthenticated, can, refreshProfile } = useAuth();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const PERMISSIONS = [
    'admin.access',
    'members.view',
    'members.edit',
    'roles.manage',
    'dues.view',
    'dues.manage',
    'duesRates.manage',
    'news.manage',
    'workgroups.manage',
    'documents.manage',
    'settings.view'
  ];

  const report = {
    projekt: supabaseProjectRef,
    beleptetve: isAuthenticated,
    email: session?.user?.email ?? null,
    user_id: session?.user?.id ?? null,
    profil_betoltve: Boolean(profile),
    profil_hiba: profileError,
    szerepkorok: roles,
    jogosultsagok: Object.fromEntries(PERMISSIONS.map((p) => [p, can(p)]))
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.info('A másolás nem sikerült. Jelöld ki és másold kézzel.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container-page py-16">
        <PageHeader title="Diagnosztika" description="Ehhez az oldalhoz be kell lépned." />
        <Link to="/belepes" className="btn-primary mt-6">
          Belépés
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page space-y-6 py-12">
      <PageHeader
        eyebrow="Hibakeresés"
        title="Diagnosztika"
        description="Mit lát az alkalmazás a fiókodról és a jogosultságaidról."
        actions={
          <>
            <button type="button" onClick={refreshProfile} className="btn-secondary btn-sm">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Profil újratöltése
            </button>
            <button type="button" onClick={copyReport} className="btn-secondary btn-sm">
              {copied ? (
                <Check className="h-4 w-4 text-positive-600" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? 'Kimásolva' : 'Jelentés másolása'}
            </button>
          </>
        }
      />

      {/* Munkamenet és profil */}
      <section className="card p-5">
        <h2 className="font-display text-lg text-ink-900">Munkamenet és profil</h2>
        <div className="mt-4">
          <Row ok={isAuthenticated} label="Beléptetve" value={String(isAuthenticated)} />
          <Row ok={Boolean(session?.user?.email)} label="E-mail" value={session?.user?.email || '—'} />
          <Row ok={Boolean(session?.user?.id)} label="Felhasználó azonosító" value={session?.user?.id || '—'} />
          <Row ok={Boolean(profile)} label="Profil betöltve" value={profile ? 'igen' : 'NEM'} />
          <Row
            ok={!profileError}
            label="Profil hiba"
            value={profileError || 'nincs'}
          />
          <Row ok={Boolean(profile?.custom_title)} label="Tisztségnév" value={profile?.custom_title || '— nincs beállítva —'} />
          <Row ok={true} label="Supabase projekt" value={supabaseProjectRef} />
        </div>
      </section>

      {/* Szerepkörök */}
      <section className="card p-5">
        <h2 className="font-display text-lg text-ink-900">Szerepkörök</h2>
        <p className="mt-0.5 text-sm text-ink-600">
          Ezek a <code>user_roles</code> táblából jönnek. Ha itt csak <code>member</code> áll, futtasd le a{' '}
          <code>supabase/05_force_admin.sql</code> szkriptet.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {roles.length === 0 ? (
            <span className="badge-caution">nincs egyetlen szerepkör sem</span>
          ) : (
            roles.map((r) => (
              <span key={r} className={r === 'admin' ? 'badge-positive' : 'badge-neutral'}>
                {r}
              </span>
            ))
          )}
        </div>
      </section>

      {/* Kliensoldali jogosultságok */}
      <section className="card p-5">
        <h2 className="font-display text-lg text-ink-900">Kliensoldali jogosultságok</h2>
        <p className="mt-0.5 text-sm text-ink-600">
          Ez dönti el, mely menüpontok és fülek látszanak.
        </p>
        <div className="mt-4">
          {PERMISSIONS.map((p) => (
            <Row key={p} ok={can(p)} label={p} value={String(can(p))} />
          ))}
        </div>
      </section>

      <SqlChecks />
      <WriteTests />

      <p className="text-sm text-ink-500">
        Ha az „admin.access” hamis, az elnökségi menüpont nem is jelenik meg — ilyenkor az adatbázisban kell
        beállítani a szerepkört, nem a felületen.
      </p>
    </div>
  );
};
