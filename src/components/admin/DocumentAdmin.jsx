import React, { useState, useRef } from 'react';
import { Plus, Trash2, FileText, Upload, Download } from 'lucide-react';

import { listDocuments, createDocument, deleteDocument, getDocumentUrl } from '../../lib/db';
import { useAsyncData } from '../../lib/useAsyncData';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  EmptyState, LoadingBlock, ErrorBlock, Modal, ConfirmDialog,
  TextInput, TextArea, Select, Spinner
} from '../ui';
/** Aláírt, időlimitált linken nyitja meg a fájlt. */
const DocumentOpenButton = ({ doc }) => {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const hasFile = Boolean(doc.storage_path || doc.drive_url);

  const open = async () => {
    setBusy(true);
    try {
      const url = await getDocumentUrl(doc);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={open}
      disabled={!hasFile || busy}
      className="btn-secondary btn-sm"
      aria-label={`${doc.title} megnyitása`}
    >
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
};

const ACCESS_OPTIONS = [
  { value: 'public', label: 'Nyilvános — bárki láthatja' },
  { value: 'members', label: 'Tagoknak — belépés szükséges' },
  { value: 'board', label: 'Elnökségi — csak az elnökség' },
  { value: 'admin', label: 'Rendszergazda' }
];

const MAX_DOC_BYTES = 20 * 1024 * 1024;

const UploadModal = ({ open, onClose, onSaved }) => {
  const { profile } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);

  const [form, setForm] = useState({ title: '', category: '', description: '', access_level: 'members' });
  const [file, setFile] = useState(null);
  const [pending, setPending] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleFile = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_DOC_BYTES) {
      toast.error('A fájl túl nagy — legfeljebb 20 MB tölthető fel.');
      event.target.value = '';
      return;
    }
    setFile(selected);
    // Ha még nincs cím, a fájlnévből ajánlunk egyet.
    if (!form.title.trim()) {
      setForm((prev) => ({ ...prev, title: selected.name.replace(/\.[^.]+$/, '') }));
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('A dokumentum címét meg kell adni.');
      return;
    }
    setPending(true);
    try {
      await createDocument(form, file, profile?.id || null);
      toast.success(file ? 'A dokumentumot feltöltöttük.' : 'A dokumentum rekord létrejött (fájl nélkül).');
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
      title="Dokumentum feltöltése"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={pending}>
            Mégsem
          </button>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={pending}>
            {pending ? <Spinner label="Feltöltés…" className="text-white" /> : 'Feltöltés'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Fájlválasztó */}
        <div>
          <p className="label">Fájl</p>
          <input
            ref={fileRef}
            type="file"
            onChange={handleFile}
            className="hidden"
            tabIndex={-1}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.odt,.ods,image/*"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary btn-sm">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Fájl kiválasztása
            </button>
            {file ? (
              <span className="text-sm text-ink-900">{file.name}</span>
            ) : (
              <span className="text-sm text-ink-500">Nincs kiválasztva</span>
            )}
          </div>
          <p className="hint">
            Legfeljebb 20 MB. Fájl nélkül is létrehozható a rekord — ilyenkor a listában jelezzük, hogy nincs
            letölthető állomány.
          </p>
        </div>

        <TextInput label="Cím" required value={form.title} onChange={set('title')} />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Kategória"
            value={form.category}
            onChange={set('category')}
            hint="Pl. Alapszabály, Beszámoló, Jegyzőkönyv."
          />
          <Select
            label="Kinek látható"
            value={form.access_level}
            onChange={set('access_level')}
            options={ACCESS_OPTIONS}
          />
        </div>

        <TextArea label="Leírás" value={form.description} onChange={set('description')} rows={2} />
      </div>
    </Modal>
  );
};

export const DocumentAdmin = () => {
  const toast = useToast();
  const { data, loading, error, reload } = useAsyncData(() => listDocuments());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deletePending, setDeletePending] = useState(false);

  const documents = data || [];

  const handleDelete = async () => {
    setDeletePending(true);
    try {
      await deleteDocument(deleting);
      toast.success('A dokumentumot töröltük.');
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
        <p className="text-sm text-ink-500">{documents.length} dokumentum</p>
        <button type="button" onClick={() => setUploadOpen(true)} className="btn-primary btn-sm">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Dokumentum feltöltése
        </button>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Az irattár még üres"
          description="Ide kerülnek az alapszabály, a beszámolók és a jegyzőkönyvek. Feltöltésnél állítsd be, kinek legyen látható."
          action={
            <button type="button" onClick={() => setUploadOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Első dokumentum feltöltése
            </button>
          }
        />
      ) : (
        <ul className="divide-y divide-sand-300 overflow-hidden rounded-xl border border-sand-400 bg-white">
          {documents.map((doc) => (
            <li key={doc.id} className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-base text-ink-900">{doc.title}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-500">
                  {doc.category && <span className="badge-neutral">{doc.category}</span>}
                  <span className="badge-neutral">
                    {ACCESS_OPTIONS.find((o) => o.value === doc.access_level)?.label.split(' —')[0] ||
                      doc.access_level}
                  </span>
                  {!doc.storage_path && !doc.drive_url && (
                    <span className="badge-caution">Nincs feltöltött fájl</span>
                  )}
                </div>
                {doc.description && <p className="mt-2 text-sm text-ink-600">{doc.description}</p>}
              </div>

              <div className="flex shrink-0 gap-1.5">
                <DocumentOpenButton doc={doc} />
                <button
                  type="button"
                  onClick={() => setDeleting(doc)}
                  className="btn-danger btn-sm"
                  aria-label={`${doc.title} törlése`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {uploadOpen && <UploadModal open onClose={() => setUploadOpen(false)} onSaved={reload} />}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        pending={deletePending}
        title="Dokumentum törlése"
        message={`Biztosan törlöd a(z) „${deleting?.title}” dokumentumot? A feltöltött fájl is törlődik.`}
      />
    </div>
  );
};
