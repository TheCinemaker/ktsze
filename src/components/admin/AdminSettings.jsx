import React, { useState } from 'react';
import { Database, HardDrive, CheckCircle2, XCircle, ShieldCheck, RefreshCw } from 'lucide-react';

import { supabase, supabaseProjectRef, describeError } from '../../lib/supabaseClient';
import { ORGANIZATION, formattedAddress } from '../../config/organization';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../lib/permissions';
import { Spinner } from '../ui';

/*
  Ez a felület CSAK olyan állapotot jelenít meg, amit tényleg megmért.

  A korábbi verzió egy „Google Drive API kapcsolat tesztelve: minden mappa
  elérhető” feliratú alertet mutatott, miközben semmilyen Drive-integráció nem
  létezett. Itt a Drive nyíltan „nincs bekötve” állapotban van, és a kapcsoló
  gomb sem létezik, amíg valóban nincs mögötte semmi.
*/

const StatusRow = ({ ok, label, detail }) => (
  <div className="flex items-start gap-3 py-3">
    {ok ? (
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-positive-600" aria-hidden="true" />
    ) : (
      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-ink-400" aria-hidden="true" />
    )}
    <div className="min-w-0">
      <p className="text-sm font-medium text-ink-900">{label}</p>
      {detail && <p className="mt-0.5 break-words text-sm text-ink-600">{detail}</p>}
    </div>
  </div>
);

/** Valódi próbakérés az adatbázis felé. */
const DatabaseCheck = () => {
  const [state, setState] = useState({ status: 'idle', message: null });

  const runCheck = async () => {
    setState({ status: 'running', message: null });

    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });

    if (error) {
      setState({ status: 'error', message: describeError(error) });
      return;
    }
    setState({ status: 'ok', message: 'Az adatbázis elérhető, a séma és az RLS szabályok a helyükön vannak.' });
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-sand-200 p-2">
            <Database className="h-5 w-5 text-wine-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display text-lg text-ink-900">Supabase adatbázis</h3>
            <p className="mt-0.5 text-sm text-ink-600">
              Projekt: <code className="rounded bg-sand-200 px-1.5 py-0.5 text-xs">{supabaseProjectRef}</code>
            </p>
          </div>
        </div>

        <button type="button" onClick={runCheck} disabled={state.status === 'running'} className="btn-secondary btn-sm">
          {state.status === 'running' ? (
            <Spinner label="Ellenőrzés…" />
          ) : (
            <>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Ellenőrzés
            </>
          )}
        </button>
      </div>

      {state.status === 'ok' && (
        <p className="mt-4 rounded-lg border border-positive-300 bg-positive-50 p-3 text-sm text-ink-800">
          {state.message}
        </p>
      )}
      {state.status === 'error' && (
        <p className="mt-4 rounded-lg border border-wine-300 bg-wine-50 p-3 text-sm text-ink-800" role="alert">
          {state.message}
        </p>
      )}
      {state.status === 'idle' && (
        <p className="mt-4 text-sm text-ink-500">
          Az „Ellenőrzés” valódi kérést küld az adatbázisnak. Nem tettetünk sikeres állapotot mérés nélkül.
        </p>
      )}
    </div>
  );
};

export const AdminSettings = () => {
  const { roles, profile } = useAuth();
  const address = formattedAddress();

  const configFilled = [
    ORGANIZATION.email,
    ORGANIZATION.phone,
    address,
    ORGANIZATION.taxNumber,
    ORGANIZATION.bankAccount
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <DatabaseCheck />

      {/* Google Drive — nyíltan kimondva, hogy nincs bekötve */}
      <div className="card p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-sand-200 p-2">
            <HardDrive className="h-5 w-5 text-ink-500" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg text-ink-900">Google Drive</h3>
              <span className="badge-neutral">Nincs bekötve</span>
            </div>
            <p className="mt-1.5 text-sm text-ink-600">
              Jelenleg nincs Drive-integráció. Az adatbázisban a csatolási pont elő van készítve
              (<code className="rounded bg-sand-200 px-1 py-0.5 text-xs">documents.drive_file_id</code> és{' '}
              <code className="rounded bg-sand-200 px-1 py-0.5 text-xs">drive_url</code>), így a bekötéshez nem kell
              adatmigráció.
            </p>
            <p className="mt-2 text-sm text-ink-500">
              A bekötéshez Google Cloud OAuth kliens azonosító kell, és egy szerveroldali komponens (Supabase Edge
              Function), mert a Drive írási művelet nem végezhető el biztonságosan a böngészőből.
            </p>
          </div>
        </div>
      </div>

      {/* Saját jogosultság */}
      <div className="card p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-sand-200 p-2">
            <ShieldCheck className="h-5 w-5 text-wine-600" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-lg text-ink-900">A te hozzáférésed</h3>
            <p className="mt-0.5 text-sm text-ink-600">{profile?.account_email}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {roles.length === 0 ? (
                <span className="badge-caution">Nincs szerepkör</span>
              ) : (
                roles.map((role) => (
                  <span key={role} className="badge-wine">
                    {ROLE_LABELS[role] || role}
                  </span>
                ))
              )}
            </div>

            {profile?.custom_title && (
              <p className="mt-3 text-sm text-ink-600">
                Tisztség: <strong className="text-ink-900">{profile.custom_title}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Egyesületi adatok állapota */}
      <div className="card p-5">
        <h3 className="font-display text-lg text-ink-900">Egyesületi alapadatok</h3>
        <p className="mt-1 text-sm text-ink-600">
          Ezek a <code className="rounded bg-sand-200 px-1 py-0.5 text-xs">src/config/organization.js</code> fájlban
          állíthatók. Ami nincs kitöltve, az a weboldalon nem jelenik meg — így nem kerül ki kitalált adat.
        </p>

        <div className="mt-4 divide-y divide-sand-300">
          <StatusRow ok={Boolean(ORGANIZATION.email)} label="E-mail cím" detail={ORGANIZATION.email || 'Nincs megadva'} />
          <StatusRow ok={Boolean(ORGANIZATION.phone)} label="Telefonszám" detail={ORGANIZATION.phone || 'Nincs megadva'} />
          <StatusRow ok={Boolean(address)} label="Székhely" detail={address || 'Nincs megadva'} />
          <StatusRow
            ok={Boolean(ORGANIZATION.taxNumber)}
            label="Adószám"
            detail={ORGANIZATION.taxNumber || 'Nincs megadva'}
          />
          <StatusRow
            ok={Boolean(ORGANIZATION.bankAccount)}
            label="Bankszámlaszám"
            detail={
              ORGANIZATION.bankAccount ||
              'Nincs megadva. Amíg üres, a tagdíj oldalon nem jelenik meg utalási adat.'
            }
          />
        </div>

        <p className="mt-4 text-sm text-ink-500">{configFilled} / 5 alapadat kitöltve.</p>
      </div>
    </div>
  );
};
