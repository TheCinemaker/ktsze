import React, { useState, useMemo } from 'react';
import { Check, X, Clock, Users, Search, Trash2 } from 'lucide-react';

import { listAllWorkgroupMemberships, listWorkgroups, decideWorkgroupMembership, leaveWorkgroup } from '../../lib/db';
import { useAsyncData } from '../../lib/useAsyncData';
import { useToast } from '../../context/ToastContext';
import { EmptyState, LoadingBlock, ErrorBlock, Modal, ConfirmDialog, TextArea, Select, Spinner } from '../ui';
import { formatDateShort } from '../../lib/format';

const STATUS_FILTERS = [
  { value: 'pending', label: 'Elbírálásra vár' },
  { value: 'approved', label: 'Jóváhagyott tagok' },
  { value: 'rejected', label: 'Elutasított' },
  { value: 'all', label: 'Összes' }
];

const STATUS_BADGE = {
  approved: { label: 'Jóváhagyott', cls: 'badge-positive' },
  pending: { label: 'Elbírálás alatt', cls: 'badge-caution' },
  rejected: { label: 'Elutasítva', cls: 'badge-neutral' }
};

/** Elutasítás indoklással — a jelentkező látja a tagi portálján. */
const RejectModal = ({ membership, open, onClose, onDone }) => {
  const toast = useToast();
  const [note, setNote] = useState('');
  const [pending, setPending] = useState(false);

  const person = membership.profiles?.full_name || membership.profiles?.account_email || 'a jelentkező';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Jelentkezés elutasítása"
      description={`${person} — ${membership.workgroups?.name || 'munkacsoport'}`}
      size="sm"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={pending}>
            Mégsem
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              try {
                await decideWorkgroupMembership(membership.id, 'rejected', note);
                toast.success('A jelentkezést elutasítottuk.');
                await onDone();
                onClose();
              } catch (err) {
                toast.error(err.message);
              } finally {
                setPending(false);
              }
            }}
          >
            {pending ? <Spinner label="Mentés…" className="text-white" /> : 'Elutasítom'}
          </button>
        </>
      }
    >
      <TextArea
        label="Indoklás"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        hint="Nem kötelező, de a jelentkező látni fogja a tagi portálján."
      />
    </Modal>
  );
};

export const WorkgroupApplications = () => {
  const toast = useToast();
  const memberships = useAsyncData(listAllWorkgroupMemberships);
  const groups = useAsyncData(listWorkgroups, [], { initialData: [] });

  const [statusFilter, setStatusFilter] = useState('pending');
  const [groupFilter, setGroupFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [rejecting, setRejecting] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [removePending, setRemovePending] = useState(false);

  const all = useMemo(() => memberships.data || [], [memberships.data]);

  const pendingCount = all.filter((m) => m.status === 'pending').length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((m) => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (groupFilter !== 'all' && m.workgroup_id !== groupFilter) return false;
      if (!q) return true;
      return [m.profiles?.full_name, m.profiles?.account_email, m.workgroups?.name]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [all, statusFilter, groupFilter, query]);

  const approve = async (membership) => {
    setBusyId(membership.id);
    try {
      await decideWorkgroupMembership(membership.id, 'approved');
      toast.success('A jelentkezést jóváhagytuk.');
      await memberships.reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (memberships.loading) return <LoadingBlock />;
  if (memberships.error) return <ErrorBlock message={memberships.error} onRetry={memberships.reload} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl text-ink-900">Munkacsoport-jelentkezések</h2>
        <p className="mt-0.5 text-sm text-ink-500">
          {pendingCount > 0
            ? `${pendingCount} jelentkezés vár elbírálásra.`
            : 'Jelenleg nincs elbírálásra váró jelentkezés.'}
        </p>
      </div>

      {/* Szűrők */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          label="Állapot"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={STATUS_FILTERS}
        />
        <Select
          label="Munkacsoport"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          options={[
            { value: 'all', label: 'Mindegyik' },
            ...(groups.data || []).map((g) => ({ value: g.id, label: g.name }))
          ]}
        />
        <div>
          <label htmlFor="wg-search" className="label">
            Keresés
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              aria-hidden="true"
            />
            <input
              id="wg-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Név vagy e-mail"
              className="input pl-9"
            />
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={statusFilter === 'pending' ? Clock : Users}
          title={all.length === 0 ? 'Még nincs egyetlen jelentkezés sem' : 'Nincs találat a szűrőkkel'}
          description={
            all.length === 0
              ? 'A jelentkezések a nyilvános Munkacsoportok oldalról érkeznek, ahol a látogatók a „Csatlakozom” gombbal jelentkezhetnek.'
              : 'Módosítsd a szűrőket, vagy válaszd az „Összes” állapotot.'
          }
        />
      ) : (
        <ul className="divide-y divide-sand-300 overflow-hidden rounded-xl border border-sand-400 bg-white">
          {visible.map((m) => {
            const badge = STATUS_BADGE[m.status] || STATUS_BADGE.pending;
            const person = m.profiles;

            return (
              <li key={m.id} className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base text-ink-900">
                      {person?.full_name || person?.account_email || '— névtelen —'}
                    </h3>
                    <span className={badge.cls}>{badge.label}</span>
                    <span className="badge-wine">{m.workgroups?.name || 'törölt csoport'}</span>
                  </div>

                  <p className="mt-1 text-xs text-ink-500">
                    {person?.account_email}
                    {person?.phone ? ` • ${person.phone}` : ''}
                    {person?.service_location_name ? ` • ${person.service_location_name}` : ''}
                  </p>

                  <p className="mt-1 text-xs text-ink-500">
                    Jelentkezett: {formatDateShort(m.requested_at)}
                    {m.decided_at ? ` • Elbírálva: ${formatDateShort(m.decided_at)}` : ''}
                  </p>

                  {m.message && (
                    <p className="mt-2 rounded-lg bg-sand-100 p-2.5 text-sm text-ink-600">{m.message}</p>
                  )}

                  {m.decision_note && (
                    <p className="mt-2 text-sm text-ink-500">Indoklás: {m.decision_note}</p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap gap-1.5">
                  {m.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => approve(m)}
                      disabled={busyId === m.id}
                      className="btn-primary btn-sm"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      Jóváhagyom
                    </button>
                  )}

                  {m.status === 'pending' && (
                    <button type="button" onClick={() => setRejecting(m)} className="btn-danger btn-sm">
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      Elutasítom
                    </button>
                  )}

                  {m.status === 'approved' && (
                    <button
                      type="button"
                      onClick={() => setRemoving(m)}
                      className="btn-danger btn-sm"
                      aria-label="Eltávolítás a csoportból"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {rejecting && (
        <RejectModal
          key={rejecting.id}
          membership={rejecting}
          open
          onClose={() => setRejecting(null)}
          onDone={memberships.reload}
        />
      )}

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        pending={removePending}
        title="Eltávolítás a munkacsoportból"
        message={`Biztosan eltávolítod ${
          removing?.profiles?.full_name || removing?.profiles?.account_email || 'a tagot'
        } a(z) „${removing?.workgroups?.name}” csoportból?`}
        confirmLabel="Igen, eltávolítom"
        onConfirm={async () => {
          setRemovePending(true);
          try {
            await leaveWorkgroup(removing.id);
            toast.success('A tagot eltávolítottuk a csoportból.');
            await memberships.reload();
            setRemoving(null);
          } catch (err) {
            toast.error(err.message);
          } finally {
            setRemovePending(false);
          }
        }}
      />
    </div>
  );
};
