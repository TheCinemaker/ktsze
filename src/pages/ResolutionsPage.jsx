import React, { useMemo, useState } from 'react';
import { Gavel, Loader2, FileText } from 'lucide-react';

import { listResolutions, listDocuments, getDocumentUrl } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { PageHeader, EmptyState, LoadingBlock, ErrorBlock } from '../components/ui';
import { SEO } from '../components/ui/SEO';
import { useToast } from '../context/ToastContext';

const BODY_TYPE_LABELS = {
  elnokseg: 'Elnökségi',
  kozgyules: 'Közgyűlési'
};

const FILTERS = [
  { value: 'all', label: 'Összes' },
  { value: 'kozgyules', label: 'Közgyűlési' },
  { value: 'elnokseg', label: 'Elnökségi' }
];

/** Aláírt linken megnyitja a kapcsolódó (nyilvános) jegyzőkönyvet. */
const AttachedDocButton = ({ doc }) => {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  if (!doc) return null;

  const open = async () => {
    setBusy(true);
    try {
      const url = await getDocumentUrl(doc);
      if (!url) {
        toast.info('Ehhez a jegyzőkönyvhöz nincs letölthető fájl.');
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" onClick={open} disabled={busy} className="btn-secondary btn-sm text-xs font-bold flex items-center gap-1.5">
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5 text-wine-700" />}
      Kapcsolódó jegyzőkönyv
    </button>
  );
};

export const ResolutionsPage = () => {
  const { data, loading, error, reload } = useAsyncData(() => listResolutions(true));
  // A nyilvános dokumentumokat is betöltjük, hogy a csatolt jegyzőkönyvet meg lehessen nyitni.
  const { data: docsData } = useAsyncData(() => listDocuments(['public']));
  const [filter, setFilter] = useState('all');

  const resolutions = data || [];
  const docsById = useMemo(() => {
    const map = {};
    (docsData || []).forEach((d) => {
      map[d.id] = d;
    });
    return map;
  }, [docsData]);

  const filtered = useMemo(
    () => (filter === 'all' ? resolutions : resolutions.filter((r) => r.body_type === filter)),
    [resolutions, filter]
  );

  return (
    <div className="container-page py-12 sm:py-16 space-y-10">
      <SEO
        title="Határozatok Tára"
        description="A Kőszegi Turisztikai Szövetség Egyesület közgyűlési és elnökségi határozatainak nyilvános, sorszámozott nyilvántartása."
      />

      <PageHeader
        eyebrow="Nyilvánosság & Átláthatóság"
        title="Határozatok Tára"
        description="Az egyesület közgyűlési és elnökségi határozatainak sorszámozott nyilvántartása, az alapszabály XIV. pontja szerint közzétéve."
      />

      {/* Szűrő */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`tab ${filter === f.value ? 'tab-active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={Gavel}
          title="Nincs közzétett határozat"
          description="A közgyűlési és elnökségi határozatokat az elnökség folyamatosan teszi közzé ezen a felületen."
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((r) => {
            const hasVotes = r.votes_for != null || r.votes_against != null || r.votes_abstain != null;
            return (
              <article key={r.id} className="card p-6 sm:p-7 bg-white border border-sand-300 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-wine-700 text-white px-3 py-1 text-xs font-bold">
                    <Gavel className="h-3.5 w-3.5" />
                    {r.resolution_no}
                  </span>
                  <span className="inline-block rounded-full bg-wine-100 text-wine-800 px-3 py-1 text-xs font-bold">
                    {BODY_TYPE_LABELS[r.body_type] || r.body_type}
                  </span>
                  <span className="text-xs font-semibold text-ink-500">{r.decision_date}</span>
                </div>

                <h2 className="font-display text-xl font-bold text-ink-900">{r.subject}</h2>

                {r.decision_text && (
                  <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">{r.decision_text}</p>
                )}

                <div className="pt-3 border-t border-sand-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ink-500">
                    {r.effect && (
                      <span>
                        <span className="font-semibold text-ink-700">Hatály:</span> {r.effect}
                      </span>
                    )}
                    {hasVotes && (
                      <span>
                        <span className="font-semibold text-ink-700">Szavazás:</span> igen {r.votes_for ?? '–'} · nem{' '}
                        {r.votes_against ?? '–'} · tart. {r.votes_abstain ?? '–'}
                      </span>
                    )}
                  </div>
                  {r.document_id && docsById[r.document_id] && <AttachedDocButton doc={docsById[r.document_id]} />}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
