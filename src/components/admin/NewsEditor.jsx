import React, { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Newspaper, Eye, EyeOff, ImagePlus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

import { listAllNews, createNews, updateNews, deleteNews } from '../../lib/db';
import { supabase } from '../../lib/supabaseClient';
import { useAsyncData } from '../../lib/useAsyncData';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  EmptyState, LoadingBlock, ErrorBlock, Modal, ConfirmDialog,
  TextInput, TextArea, Checkbox, Spinner
} from '../ui';
import { coverUrl, formatDate } from '../../lib/format';

const EMPTY = { title: '', category: '', excerpt: '', body: '', cover_path: '', is_published: false };
const MAX_COVER_BYTES = 4 * 1024 * 1024;

const NewsModal = ({ item, open, onClose, onSaved }) => {
  const { profile } = useAuth();
  const toast = useToast();
  const isNew = !item?.id;
  const fileRef = useRef(null);

  const [form, setForm] = useState(item ? { ...EMPTY, ...item } : EMPTY);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleCover = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > MAX_COVER_BYTES) {
      toast.error('A kép túl nagy — legfeljebb 4 MB tölthető fel.');
      return;
    }

    setUploading(true);
    try {
      const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'jpg';
      const path = `hirek/${Date.now()}.${extension}`;
      const { error } = await supabase.storage
        .from('public-media')
        .upload(path, file, { upsert: true, contentType: file.type || undefined });
      if (error) throw new Error(error.message);

      setForm((prev) => ({ ...prev, cover_path: path }));
      toast.success('A borítóképet feltöltöttük. Ne felejtsd elmenteni a hírt.');
    } catch (err) {
      toast.error(`A kép feltöltése nem sikerült: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('A hír címét meg kell adni.');
      return;
    }
    setPending(true);
    try {
      if (isNew) await createNews(form, profile?.id || null);
      else await updateNews(item.id, form);
      toast.success(isNew ? 'A hír létrejött.' : 'A hírt elmentettük.');
      await onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  const preview = coverUrl(form.cover_path);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isNew ? 'Új hír' : 'Hír szerkesztése'}
      size="lg"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={pending}>
            Mégsem
          </button>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={pending}>
            {pending ? <Spinner label="Mentés…" className="text-current" /> : 'Mentés'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <TextInput label="Cím" required value={form.title} onChange={set('title')} />

        <TextInput
          label="Kategória"
          value={form.category || ''}
          onChange={set('category')}
          hint="Szabadon írható, pl. Felhívás, Program, Közgyűlés. A szűrő ezekből épül fel."
        />

        <TextArea
          label="Rövid összefoglaló"
          value={form.excerpt || ''}
          onChange={set('excerpt')}
          rows={2}
          hint="Ez látszik a listában és a főoldalon."
        />

        <TextArea
          label="Szöveg"
          value={form.body || ''}
          onChange={set('body')}
          rows={9}
          hint="Az üres sorral elválasztott részek külön bekezdésként jelennek meg."
        />

        {/* Borítókép */}
        <div>
          <p className="label">Borítókép</p>
          {preview && (
            <img
              src={preview}
              alt=""
              className="mb-3 h-40 w-full rounded-lg border border-sand-400 object-cover"
            />
          )}
          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleCover} className="hidden" tabIndex={-1} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn-secondary btn-sm"
            >
              {uploading ? (
                <Spinner label="Feltöltés…" />
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                  {form.cover_path ? 'Kép cseréje' : 'Kép feltöltése'}
                </>
              )}
            </button>
            {form.cover_path && (
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, cover_path: '' }))}
                className="btn-danger btn-sm"
              >
                Kép eltávolítása
              </button>
            )}
          </div>
        </div>

        <Checkbox
          label="Közzétéve"
          hint="Amíg nincs bepipálva, a hír csak itt látszik, a nyilvános oldalon nem."
          checked={Boolean(form.is_published)}
          onChange={(e) => setForm((prev) => ({ ...prev, is_published: e.target.checked }))}
        />
      </div>
    </Modal>
  );
};

export const NewsEditor = () => {
  const toast = useToast();
  const { data, loading, error, reload } = useAsyncData(listAllNews);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletePending, setDeletePending] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const items = data || [];

  const togglePublish = async (item) => {
    setTogglingId(item.id);
    try {
      await updateNews(item.id, { is_published: !item.is_published });
      toast.success(item.is_published ? 'A hírt elrejtettük.' : 'A hírt közzétettük.');
      await reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    setDeletePending(true);
    try {
      await deleteNews(deleting.id);
      toast.success('A hírt töröltük.');
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
        <p className="text-sm text-ink-500">
          {items.length} bejegyzés — ebből {items.filter((i) => i.is_published).length} közzétéve
        </p>
        <button type="button" onClick={() => setEditing(EMPTY)} className="btn-primary btn-sm">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Új hír
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="Még nincs egyetlen hír sem"
          description="Itt tudod közzétenni az egyesület közleményeit, felhívásait és programjait. Amíg nincs bejegyzés, a nyilvános oldalon üres állapot látszik."
          action={
            <button type="button" onClick={() => setEditing(EMPTY)} className="btn-primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Első hír létrehozása
            </button>
          }
        />
      ) : (
        <ul className="divide-y divide-sand-300 overflow-hidden rounded-xl border border-sand-400 bg-paper">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-base text-ink-900">{item.title}</h3>
                  {item.is_published ? (
                    <span className="badge-positive">Közzétéve</span>
                  ) : (
                    <span className="badge-caution">Vázlat</span>
                  )}
                  {item.category && <span className="badge-neutral">{item.category}</span>}
                </div>

                <p className="mt-1 text-xs text-ink-500">
                  {item.is_published && item.published_at
                    ? `Közzétéve: ${formatDate(item.published_at)}`
                    : `Létrehozva: ${formatDate(item.created_at)}`}
                </p>

                {item.excerpt && <p className="mt-2 text-sm text-ink-600">{item.excerpt}</p>}
              </div>

              <div className="flex shrink-0 flex-wrap gap-1.5">
                <Link
                  to={`/hirek/${item.slug}`}
                  className="btn-secondary btn-sm"
                  aria-label={`${item.title} megnyitása`}
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>

                <button
                  type="button"
                  onClick={() => togglePublish(item)}
                  disabled={togglingId === item.id}
                  className="btn-secondary btn-sm"
                  aria-label={item.is_published ? `${item.title} elrejtése` : `${item.title} közzététele`}
                >
                  {item.is_published ? (
                    <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setEditing(item)}
                  className="btn-secondary btn-sm"
                  aria-label={`${item.title} szerkesztése`}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleting(item)}
                  className="btn-danger btn-sm"
                  aria-label={`${item.title} törlése`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <NewsModal key={editing.id || 'new'} item={editing} open onClose={() => setEditing(null)} onSaved={reload} />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        pending={deletePending}
        title="Hír törlése"
        message={`Biztosan törlöd a(z) „${deleting?.title}” bejegyzést? A művelet nem vonható vissza.`}
      />
    </div>
  );
};
