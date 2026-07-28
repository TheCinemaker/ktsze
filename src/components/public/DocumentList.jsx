import React, { useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { getDocumentUrl } from '../../lib/db';
import { useToast } from '../../context/ToastContext';
import { formatFileSize } from '../../lib/format';

const ACCESS_LABELS = {
  public: 'Nyilvános',
  members: 'Tagoknak',
  board: 'Elnökségi',
  admin: 'Rendszergazda'
};

/**
 * Dokumentumlista letöltéssel.
 *
 * A korábbi verzió `alert("Letöltés elindult")`-ot mutatott, és a fájl nem
 * ment sehova. Itt valódi, időlimitált aláírt URL nyílik meg a Storage-ból.
 * Ha egy rekordhoz nincs feltöltött fájl, azt kiírjuk — nem tettetjük, hogy van.
 */
export const DocumentList = ({ documents, showAccessLevel = false, emptyState }) => {
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);

  if (!documents || documents.length === 0) return emptyState ?? null;

  const handleOpen = async (doc) => {
    setBusyId(doc.id);
    try {
      const url = await getDocumentUrl(doc);
      if (!url) {
        toast.info('Ehhez a dokumentumhoz még nincs feltöltött fájl.');
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ul className="divide-y divide-sand-300 overflow-hidden rounded-xl border border-sand-400 bg-paper">
      {documents.map((doc) => {
        const size = formatFileSize(doc.file_size);
        const hasFile = Boolean(doc.storage_path || doc.drive_url);
        const busy = busyId === doc.id;

        return (
          <li key={doc.id} className="flex flex-wrap items-start gap-4 p-4 sm:p-5">
            <div className="mt-0.5 shrink-0 rounded-lg bg-sand-200 p-2">
              <FileText className="h-5 w-5 text-wine-600" aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base text-ink-900">{doc.title}</h3>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-500">
                {doc.category && <span className="badge-neutral">{doc.category}</span>}
                {showAccessLevel && doc.access_level && (
                  <span className="badge-neutral">{ACCESS_LABELS[doc.access_level] || doc.access_level}</span>
                )}
                {size && <span>{size}</span>}
                {!hasFile && <span className="badge-caution">Nincs feltöltött fájl</span>}
              </div>

              {doc.description && <p className="mt-2 text-sm text-ink-600">{doc.description}</p>}
            </div>

            <button
              type="button"
              onClick={() => handleOpen(doc)}
              disabled={!hasFile || busy}
              className="btn-secondary btn-sm shrink-0"
              aria-label={`${doc.title} megnyitása`}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="h-4 w-4" aria-hidden="true" />
              )}
              Megnyitom
            </button>
          </li>
        );
      })}
    </ul>
  );
};
