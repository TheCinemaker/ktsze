import React, { useState, useRef } from 'react';
import { Wallet, Upload, FileCheck2, Copy, Check } from 'lucide-react';

import { ORGANIZATION } from '../../config/organization';
import { listOwnDues, uploadDuesProof, getDuesProofUrl } from '../../lib/db';
import { useAsyncData } from '../../lib/useAsyncData';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { EmptyState, LoadingBlock, ErrorBlock, Spinner } from '../ui';
import { formatHuf, formatDateShort } from '../../lib/format';

const STATUS = {
  paid: { label: 'Rendezve', cls: 'badge-positive' },
  pending: { label: 'Függőben', cls: 'badge-caution' },
  overdue: { label: 'Késedelmes', cls: 'badge-wine' },
  waived: { label: 'Elengedve', cls: 'badge-neutral' }
};

const MAX_PROOF_BYTES = 5 * 1024 * 1024;

/** Banki adatok — csak ha tényleg be van állítva a config-ban. */
const BankDetails = () => {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  if (!ORGANIZATION.bankAccount) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ORGANIZATION.bankAccount);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.info('A vágólapra másolás nem sikerült. Jelöld ki és másold kézzel.');
    }
  };

  return (
    <div className="surface p-5">
      <h3 className="font-display text-base text-ink-900">Utalási adatok</h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-500">Kedvezményezett</dt>
          <dd className="text-ink-900">{ORGANIZATION.legalName}</dd>
        </div>
        {ORGANIZATION.bankName && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-500">Bank</dt>
            <dd className="text-ink-900">{ORGANIZATION.bankName}</dd>
          </div>
        )}
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-500">Számlaszám</dt>
          <dd className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-wine-600">{ORGANIZATION.bankAccount}</span>
            <button type="button" onClick={copy} className="btn-secondary btn-sm">
              {copied ? (
                <Check className="h-3.5 w-3.5 text-positive-600" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {copied ? 'Másolva' : 'Másolás'}
            </button>
          </dd>
        </div>
      </dl>
    </div>
  );
};

const DuesRow = ({ dues, onUploaded }) => {
  const { profile } = useAuth();
  const toast = useToast();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [openingProof, setOpeningProof] = useState(false);

  const status = STATUS[dues.status] || STATUS.pending;
  const amount = formatHuf(dues.amount_huf);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // ugyanaz a fájl újra kiválasztható legyen
    if (!file) return;

    if (file.size > MAX_PROOF_BYTES) {
      toast.error('A fájl túl nagy — legfeljebb 5 MB tölthető fel.');
      return;
    }

    setUploading(true);
    try {
      await uploadDuesProof(profile.id, dues.year, file);
      toast.success('Az igazolást feltöltöttük. Az elnökség ellenőrzés után jelöli rendezettnek.');
      await onUploaded();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const openProof = async () => {
    setOpeningProof(true);
    try {
      const url = await getDuesProofUrl(dues.proof_path);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOpeningProof(false);
    }
  };

  return (
    <li className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-lg text-ink-900">{dues.year}. évi tagdíj</h3>
          <span className={status.cls}>{status.label}</span>
        </div>

        <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-600">
          {amount && (
            <div className="flex gap-1.5">
              <dt className="text-ink-500">Összeg:</dt>
              <dd className="font-medium text-ink-900">{amount}</dd>
            </div>
          )}
          {dues.due_date && (
            <div className="flex gap-1.5">
              <dt className="text-ink-500">Határidő:</dt>
              <dd>{formatDateShort(dues.due_date)}</dd>
            </div>
          )}
          {dues.paid_at && (
            <div className="flex gap-1.5">
              <dt className="text-ink-500">Rendezve:</dt>
              <dd>{formatDateShort(dues.paid_at)}</dd>
            </div>
          )}
        </dl>

        {dues.notes && <p className="mt-2 text-sm text-ink-500">{dues.notes}</p>}
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        {dues.proof_path && (
          <button type="button" onClick={openProof} disabled={openingProof} className="btn-secondary btn-sm">
            <FileCheck2 className="h-4 w-4 text-positive-600" aria-hidden="true" />
            Igazolás
          </button>
        )}

        {dues.status !== 'paid' && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFile}
              className="hidden"
              tabIndex={-1}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="btn-primary btn-sm"
            >
              {uploading ? (
                <Spinner label="Feltöltés…" className="text-white" />
              ) : (
                <>
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  {dues.proof_path ? 'Új igazolás' : 'Igazolás feltöltése'}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </li>
  );
};

export const MembershipDues = () => {
  const { profile } = useAuth();
  const { data, loading, error, reload } = useAsyncData(() => listOwnDues(profile.id), [profile?.id], {
    enabled: Boolean(profile?.id)
  });

  const dues = data || [];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {loading && <LoadingBlock />}
        {error && <ErrorBlock message={error} onRetry={reload} />}

        {!loading &&
          !error &&
          (dues.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Még nincs kiírt tagdíj"
              description="A tagdíjat az elnökség írja ki a belső felületen. Amint megtörtént, itt fog megjelenni, és ide tudod feltölteni az átutalási igazolást."
            />
          ) : (
            <ul className="divide-y divide-sand-300 overflow-hidden rounded-xl border border-sand-400 bg-white">
              {dues.map((item) => (
                <DuesRow key={item.id} dues={item} onUploaded={reload} />
              ))}
            </ul>
          ))}
      </div>

      <aside className="space-y-5">
        <BankDetails />
        <p className="text-xs text-ink-500">
          A feltöltött igazolást csak te és az elnökség láthatja. A „rendezve” állapotot az elnökség állítja be
          ellenőrzés után — ezt a tag maga nem tudja módosítani.
        </p>
      </aside>
    </div>
  );
};
