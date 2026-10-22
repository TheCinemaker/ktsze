import React, { useState } from 'react';
import { Plus, Trash2, Pencil, Gavel, Link2 } from 'lucide-react';

import {
  listResolutions,
  createResolution,
  updateResolution,
  deleteResolution,
  listDocuments
} from '../../lib/db';
import { useAsyncData } from '../../lib/useAsyncData';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  EmptyState, LoadingBlock, ErrorBlock, Modal, ConfirmDialog,
  TextInput, TextArea, Select, Checkbox, Spinner
} from '../ui';

const BODY_TYPE_OPTIONS = [
  { value: 'elnokseg', label: 'Elnökségi határozat' },
  { value: 'kozgyules', label: 'Közgyűlési határozat' }
];

const BODY_TYPE_LABELS = {
  elnokseg: 'Elnökségi',
  kozgyules: 'Közgyűlési'
};

const EMPTY = {
  resolution_no: '',
  body_type: 'elnokseg',
  decision_date: '',
  subject: '',
  decision_text: '',
  effect: '',
  votes_for: '',
  votes_against: '',
  votes_abstain: '',
  is_published: true,
  document_id: ''
};

const ResolutionModal = ({ open, onClose, onSaved, editing, documents }) => {
  const { profile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(editing ? { ...EMPTY, ...normalize(editing) } : EMPTY);
  const [pending, setPending] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSave = async () => {
    if (!form.resolution_no.trim() || !form.decision_date || !form.subject.trim()) {
      toast.error('A határozatszám, a dátum és a tárgy kötelező.');
      return;
    }
    setPending(true);
    try {
      if (editing) {
        await updateResolution(editing.id, form);
        toast.success('A határozatot módosítottuk.');
      } else {
        await createResolution(form, profile?.id || null);
        toast.success('A határozatot rögzítettük.');
      }
      await onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  const docOptions = [
    { value: '', label: '— Nincs csatolt jegyzőkönyv —' },
    ...documents.map((d) => ({ value: d.id, label: d.title }))
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? 'Határozat módosítása' : 'Új határozat rögzítése'}
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
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Határozatszám"
            required
            value={form.resolution_no}
            onChange={set('resolution_no')}
            hint="Pl. 2/2026. (VI. 30.)"
          />
          <TextInput label="Dátum" type="date" required value={form.decision_date} onChange={set('decision_date')} />
        </div>

        <Select label="Testület" required value={form.body_type} onChange={set('body_type')} options={BODY_TYPE_OPTIONS} />

        <TextInput label="Tárgy" required value={form.subject} onChange={set('subject')} hint="Rövid, beszédes cím." />

        <TextArea label="A határozat tartalma" value={form.decision_text} onChange={set('decision_text')} rows={4} />

        <TextInput label="Hatály" value={form.effect} onChange={set('effect')} hint="Pl. azonnali, vagy a bejegyzéstől." />

        <div className="grid gap-4 sm:grid-cols-3">
          <TextInput label="Igen" type="number" min="0" value={form.votes_for} onChange={set('votes_for')} />
          <TextInput label="Nem" type="number" min="0" value={form.votes_against} onChange={set('votes_against')} />
          <TextInput label="Tartózkodott" type="number" min="0" value={form.votes_abstain} onChange={set('votes_abstain')} />
        </div>

        <Select
          label="Csatolt jegyzőkönyv"
          value={form.document_id}
          onChange={set('document_id')}
          options={docOptions}
          hint="A dokumentumok közé feltöltött kapcsolódó jegyzőkönyv (opcionális)."
        />

        <Checkbox
          label="Nyilvánosan megjelenjen"
          hint="Ha kikapcsolod, csak az elnökség látja. A közzétett határozatot bárki olvashatja a Határozatok tárában."
          checked={form.is_published}
          onChange={(e) => setForm((prev) => ({ ...prev, is_published: e.target.checked }))}
        />
      </div>
    </Modal>
  );
};

/** DB sor -> űrlapmező (null -> '' a controlled inputokhoz). */
function normalize(row) {
  return {
    resolution_no: row.resolution_no ?? '',
    body_type: row.body_type ?? 'elnokseg',
    decision_date: row.decision_date ?? '',
    subject: row.subject ?? '',
    decision_text: row.decision_text ?? '',
    effect: row.effect ?? '',
    votes_for: row.votes_for ?? '',
    votes_against: row.votes_against ?? '',
    votes_abstain: row.votes_abstain ?? '',
    is_published: row.is_published ?? true,
    document_id: row.document_id ?? ''
  };
}

export const ResolutionsAdmin = () => {
  const toast = useToast();
  const { data, loading, error, reload } = useAsyncData(() => listResolutions(false));
  const { data: docs } = useAsyncData(() => listDocuments());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletePending, setDeletePending] = useState(false);

  const resolutions = data || [];
  const documents = docs || [];

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setEditorOpen(true);
  };

  const handleDelete = async () => {
    setDeletePending(true);
    try {
      await deleteResolution(deleting.id);
      toast.success('A határozatot töröltük.');
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
        <p className="text-sm text-ink-500">{resolutions.length} határozat</p>
        <button type="button" onClick={openNew} className="btn-primary btn-sm">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Új határozat
        </button>
      </div>

      {resolutions.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title="A Határozatok tára még üres"
          description="Az alapszabály XIV. pontja szerint a határozatokat sorszámozva kell nyilvántartani. Rögzítsd itt a közgyűlési és elnökségi határozatokat."
          action={
            <button type="button" onClick={openNew} className="btn-primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Első határozat rögzítése
            </button>
          }
        />
      ) : (
        <ul className="divide-y divide-sand-300 overflow-hidden rounded-xl border border-sand-400 bg-white">
          {resolutions.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge-neutral font-mono">{r.resolution_no}</span>
                  <span className="badge-neutral">{BODY_TYPE_LABELS[r.body_type] || r.body_type}</span>
                  <span className="text-xs text-ink-500">{r.decision_date}</span>
                  {!r.is_published && <span className="badge-caution">Nem nyilvános</span>}
                  {r.document_id && (
                    <span className="inline-flex items-center gap-1 text-xs text-wine-700">
                      <Link2 className="h-3 w-3" /> jegyzőkönyv
                    </span>
                  )}
                </div>
                <h3 className="mt-1 font-display text-base text-ink-900">{r.subject}</h3>
                {r.decision_text && <p className="mt-1 text-sm text-ink-600 line-clamp-2">{r.decision_text}</p>}
                {(r.votes_for != null || r.votes_against != null || r.votes_abstain != null) && (
                  <p className="mt-1 text-xs text-ink-500">
                    Szavazás — igen: {r.votes_for ?? '–'} · nem: {r.votes_against ?? '–'} · tart.: {r.votes_abstain ?? '–'}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-1.5">
                <button type="button" onClick={() => openEdit(r)} className="btn-secondary btn-sm" aria-label="Szerkesztés">
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => setDeleting(r)} className="btn-danger btn-sm" aria-label="Törlés">
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editorOpen && (
        <ResolutionModal
          open
          editing={editing}
          documents={documents}
          onClose={() => setEditorOpen(false)}
          onSaved={reload}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        pending={deletePending}
        title="Határozat törlése"
        message={`Biztosan törlöd a(z) „${deleting?.resolution_no}” határozatot?`}
      />
    </div>
  );
};
