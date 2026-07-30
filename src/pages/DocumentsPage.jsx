import React, { useState } from 'react';
import { FileText, Download, Eye, ShieldCheck, BookOpen, ArrowRight } from 'lucide-react';

import { listDocuments } from '../lib/db';
import { useAsyncData } from '../lib/useAsyncData';
import { PageHeader, EmptyState, LoadingBlock, ErrorBlock } from '../components/ui';
import { DocumentList } from '../components/public/DocumentList';
import { SEO } from '../components/ui/SEO';
import { FOUNDATIONAL_DOCUMENTS } from '../config/documentsData';
import { DocumentViewerModal } from '../components/public/DocumentViewerModal';

export const DocumentsPage = () => {
  const { data, loading, error, reload } = useAsyncData(() => listDocuments(['public']));
  const documents = data || [];
  const [selectedDoc, setSelectedDoc] = useState(null);

  return (
    <div className="container-page py-12 sm:py-16 space-y-12">
      <SEO
        title="Nyilvános Dokumentumok & Alapszabály"
        description="Tekintse meg és töltse le a Kőszegi Turisztikai Szövetség Egyesület hivatalos alapszabályát és stratégiai programfüzetét."
      />

      <PageHeader
        eyebrow="Nyilvánosság & Átláthatóság"
        title="Nyilvános Dokumentumok"
        description="Az egyesület hivatalos alapszabálya, stratégiai városszépítési programfüzete és nyilvánosan közzétett iratai egy helyen."
      />

      {/* 1. Kiemelt Alapító és Stratégiai Dokumentumok */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-wine-600" aria-hidden="true" />
          <h2 className="font-display text-2xl text-ink-900">Hivatalos &amp; Stratégiai Dokumentumok</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {FOUNDATIONAL_DOCUMENTS.map((doc) => (
            <article
              key={doc.id}
              className="card p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-300 border border-sand-300 bg-white hover:shadow-xl hover:border-wine-300 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block rounded-full bg-wine-100 text-wine-800 px-3 py-1 text-xs font-bold">
                    {doc.badge}
                  </span>
                  <span className="text-xs font-semibold text-ink-500">{doc.date}</span>
                </div>

                <h3 className="font-display text-xl font-bold text-ink-900 group-hover:text-wine-900 transition-colors">
                  {doc.title}
                </h3>

                <p className="text-xs text-ink-600 leading-relaxed font-medium">
                  {doc.description}
                </p>

                {doc.highlights && (
                  <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-wine-700">Főbb jellemzők:</div>
                    <ul className="space-y-1 text-xs text-ink-700">
                      {doc.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-wine-600 font-bold">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-sand-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(doc)}
                  className="btn-secondary btn-sm rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-wine-50 hover:text-wine-800"
                >
                  <Eye className="h-4 w-4 text-wine-700" />
                  Online Olvasás
                </button>

                <a
                  href={doc.downloadUrl || doc.txtUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary btn-sm rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="h-4 w-4" />
                  Letöltés ({doc.fileSize})
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. Egyéb Közzétett Nyilvános Dokumentumok */}
      <section className="pt-8 border-t border-sand-300 space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-wine-600" aria-hidden="true" />
          <h2 className="font-display text-2xl text-ink-900">További Közzétett Iratok</h2>
        </div>

        <div>
          {loading && <LoadingBlock />}
          {error && <ErrorBlock message={error} onRetry={reload} />}

          {!loading && !error && (
            <DocumentList
              documents={documents}
              emptyState={
                <EmptyState
                  icon={FileText}
                  title="További fájl feltöltve jelenleg nincs"
                  description="A fenti hivatalos alapszabály és programfüzet mellett a további határozatokat és beszámolókat az elnökség folyamatosan teszi közzé."
                />
              }
            />
          )}
        </div>
      </section>

      {/* Részletes Olvasó Modal */}
      {selectedDoc && (
        <DocumentViewerModal
          doc={selectedDoc}
          open={Boolean(selectedDoc)}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
};
