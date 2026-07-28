import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Flower2 } from 'lucide-react';

import { listWorkgroups, createWorkgroup, updateWorkgroup, deleteWorkgroup } from '../../lib/db';
import { useAsyncData } from '../../lib/useAsyncData';
import { useToast } from '../../context/ToastContext';
import { EmptyState, LoadingBlock, ErrorBlock, Modal, ConfirmDialog, TextInput, TextArea, Checkbox, Spinner } from '../ui';

const EMPTY = { name: '', description: '', leader_name: '', latest_updates: '', is_active: true, target_amount: 250000 };

const WorkgroupModal = ({ workgroup, open, onClose, onSaved }) => {
  const toast = useToast();
  const isNew = !workgroup?.id;
  const [form, setForm] = useState(workgroup ? { ...EMPTY, ...workgroup } : EMPTY);
  const [pending, setPending] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('A munkacsoport nevét meg kell adni.');
      return;
    }
    setPending(true);
    try {
      if (isNew) await createWorkgroup(form);
      else await updateWorkgroup(workgroup.id, form);
      toast.success(isNew ? 'A munkacsoport létrejött.' : 'A munkacsoportot elmentettük.');
      await onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isNew ? 'Új munkacsoport' : 'Munkacsoport szerkesztése'}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={pending}>
            Mégsem
          </button>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={pending}>
            {pending ? <Spinner label="Mentés…" className="text-white" /> : 'Mentés'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <TextInput label="Megnevezés" required value={form.name} onChange={set('name')} />

        <TextArea
          label="Mivel foglalkozik"
          value={form.description || ''}
          onChange={set('description')}
          rows={3}
        />

        <TextInput
          label="Vezető neve"
          value={form.leader_name || ''}
          onChange={set('leader_name')}
          hint="Üresen hagyható, ha még nincs kijelölve."
        />

        <TextInput
          label="Közösségi Finanszírozási Célösszeg (Ft)"
          type="number"
          step="10000"
          value={form.target_amount || 250000}
          onChange={set('target_amount')}
          hint="Az az összeg, amennyit a Barion modulon keresztül gyűjtenek (pl. 250 000 Ft)."
        />

        <TextArea
          label="Mire fordítjuk az összeget? (Támogatás célja)"
          value={form.campaign_goal || ''}
          onChange={set('campaign_goal')}
          rows={2}
          hint="Pontos leírás a támogatóknak (pl. 20 db új virágtartó kaspó beszerzése a belvárosban)."
        />

        <TextArea
          label="Friss információk"
          value={form.latest_updates || ''}
          onChange={set('latest_updates')}
          rows={2}
          hint="Rövid állapotfrissítés, ami a nyilvános oldalon is megjelenik."
        />

        <Checkbox
          label="Aktív munkacsoport"
          hint="Ha kikapcsolod, nem jelenik meg a nyilvános oldalon."
          checked={Boolean(form.is_active)}
          onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
        />
      </div>
    </Modal>
  );
};

export const WorkgroupAdmin = () => {
  const toast = useToast();
  const { data, loading, error, reload } = useAsyncData(listWorkgroups);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletePending, setDeletePending] = useState(false);

  const groups = data || [];

  const handleDelete = async () => {
    setDeletePending(true);
    try {
      await deleteWorkgroup(deleting.id);
      toast.success('A munkacsoportot töröltük.');
      await reload();
      setDeleting(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletePending(false);
    }
  };

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">{groups.length} munkacsoport</p>
        <button type="button" onClick={() => setEditing(EMPTY)} className="btn-primary btn-sm">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Új munkacsoport
        </button>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={Flower2}
          title="Még nincs munkacsoport"
          description="Hozd létre az elsőt. A létrehozott, aktív munkacsoportok automatikusan megjelennek a nyilvános oldalon."
          action={
            <button type="button" onClick={() => setEditing(EMPTY)} className="btn-primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Új munkacsoport
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <article key={group.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-lg text-ink-900">{group.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {group.is_active ? (
                      <span className="badge-positive">Aktív</span>
                    ) : (
                      <span className="badge-neutral">Rejtett</span>
                    )}
                    {group.leader_name && <span className="text-xs text-ink-500">Vezető: {group.leader_name}</span>}
                  </div>
                </div>

                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditing(group)}
                    className="btn-secondary btn-sm"
                    aria-label={`${group.name} szerkesztése`}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(group)}
                    className="btn-danger btn-sm"
                    aria-label={`${group.name} törlése`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {group.description && <p className="mt-3 text-sm text-ink-600">{group.description}</p>}
              {group.latest_updates && (
                <p className="mt-3 border-t border-sand-300 pt-3 text-sm text-ink-500">{group.latest_updates}</p>
              )}
            </article>
          ))}
        </div>
      )}

      {editing && (
        <WorkgroupModal
          key={editing.id || 'new'}
          workgroup={editing}
          open
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        pending={deletePending}
        title="Munkacsoport törlése"
        message={`Biztosan törlöd a(z) „${deleting?.name}” munkacsoportot? A művelet nem vonható vissza.`}
      />
    </div>
  );
};
