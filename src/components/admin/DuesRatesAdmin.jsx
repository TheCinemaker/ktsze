import React, { useState } from 'react';
import { Plus, Trash2, Wallet } from 'lucide-react';

import { listDuesRates, createDuesRate, deleteDuesRate } from '../../lib/db';
import { useAsyncData } from '../../lib/useAsyncData';
import { useToast } from '../../context/ToastContext';
import { EmptyState, LoadingBlock, ErrorBlock, Modal, ConfirmDialog, TextInput, Spinner } from '../ui';
import { formatHuf } from '../../lib/format';

/*
  A tagdíjtételek innen kerülnek a nyilvános Tagság oldalra.

  Ez a tábla azért létezik, hogy ne legyen beégetett összeg a kódban. A korábbi
  verzióban a 24 000 / 36 000 / 15 000 Ft három különböző fájlban szerepelt
  hardkódoltan, jóváhagyás nélkül.
*/

const RateModal = ({ open, onClose, onSaved }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    label: '',
    amount_huf: '',
    note: ''
  });
  const [pending, setPending] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSave = async () => {
    if (!form.label.trim()) {
      toast.error('A kategória megnevezését meg kell adni.');
      return;
    }
    if (form.amount_huf === '' || Number(form.amount_huf) < 0) {
      toast.error('Adj meg egy érvényes összeget.');
      return;
    }

    setPending(true);
    try {
      await createDuesRate(form);
      toast.success('A tagdíjtételt elmentettük.');
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
      title="Új tagdíjtétel"
      description="Ez az összeg a nyilvános Tagság oldalon is megjelenik."
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
        <div className="grid gap-4 sm:grid-cols-3">
          <TextInput label="Év" type="number" required value={form.year} onChange={set('year')} />
          <div className="sm:col-span-2">
            <TextInput
              label="Kategória"
              required
              value={form.label}
              onChange={set('label')}
              hint="Pl. Rendes tag — szállásadó"
            />
          </div>
        </div>

        <TextInput
          label="Összeg (Ft)"
          type="number"
          min="0"
          required
          value={form.amount_huf}
          onChange={set('amount_huf')}
        />

        <TextInput label="Megjegyzés" value={form.note} onChange={set('note')} />
      </div>
    </Modal>
  );
};

export const DuesRatesAdmin = () => {
  const toast = useToast();
  const { data, loading, error, reload } = useAsyncData(() => listDuesRates());
  const [addOpen, setAddOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deletePending, setDeletePending] = useState(false);

  const rates = data || [];

  const handleDelete = async () => {
    setDeletePending(true);
    try {
      await deleteDuesRate(deleting.id);
      toast.success('A tagdíjtételt töröltük.');
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
        <div>
          <h2 className="font-display text-xl text-ink-900">Tagdíjtételek</h2>
          <p className="mt-0.5 text-sm text-ink-500">
            Amíg nincs itt tétel, a nyilvános oldalon szándékosan nem jelenik meg összeg.
          </p>
        </div>
        <button type="button" onClick={() => setAddOpen(true)} className="btn-primary btn-sm">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Új tétel
        </button>
      </div>

      {rates.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Még nincs rögzített tagdíj"
          description="Vidd fel a közgyűlés által jóváhagyott összegeket. Csak azt írd be, ami hivatalosan elfogadott."
          action={
            <button type="button" onClick={() => setAddOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Első tétel felvitele
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-sand-400 bg-white">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <caption className="sr-only">Tagdíjtételek</caption>
            <thead className="bg-sand-50">
              <tr className="border-b border-sand-400 text-left">
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">Év</th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">Kategória</th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">Összeg</th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">Megjegyzés</th>
                <th scope="col" className="px-4 py-3 text-right font-medium text-ink-600">Művelet</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr key={rate.id} className="border-b border-sand-300 last:border-0">
                  <td className="px-4 py-3 text-ink-900">{rate.year}</td>
                  <td className="px-4 py-3 text-ink-900">{rate.label}</td>
                  <td className="px-4 py-3 font-medium text-wine-600">{formatHuf(rate.amount_huf)}</td>
                  <td className="px-4 py-3 text-ink-600">{rate.note || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setDeleting(rate)}
                      className="btn-danger btn-sm"
                      aria-label={`${rate.label} törlése`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {addOpen && <RateModal open onClose={() => setAddOpen(false)} onSaved={reload} />}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        pending={deletePending}
        title="Tagdíjtétel törlése"
        message={`Biztosan törlöd a(z) „${deleting?.label}” tételt (${deleting?.year})?`}
      />
    </div>
  );
};
