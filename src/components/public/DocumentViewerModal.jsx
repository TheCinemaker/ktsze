import React, { useState } from 'react';
import { FileText, Download, X, Search, Check, Copy, Printer, ShieldCheck, Sparkles } from 'lucide-react';
import { Modal } from '../ui';

export const DocumentViewerModal = ({ doc, open, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!doc) return null;

  const handleCopyText = () => {
    navigator.clipboard.writeText(doc.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${doc.title}</title>
          <style>
            body { font-family: sans-serif; line-height: 1.6; padding: 40px; color: #1e1b26; }
            h1 { color: #701a2e; border-bottom: 2px solid #701a2e; padding-bottom: 10px; }
            pre { font-family: inherit; white-space: pre-wrap; word-wrap: break-word; }
            .meta { color: #666; font-size: 13px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>${doc.title}</h1>
          <div class="meta">Kelt: ${doc.date} | ${doc.category}</div>
          <pre>${doc.fullText}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={doc.title}
      description={`${doc.category} • ${doc.date}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Fejléc sáv & Akciógombok */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-sand-50 border border-sand-300">
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full bg-wine-700 text-white px-3 py-1 text-xs font-bold shadow-xs">
              {doc.badge || doc.category}
            </span>
            <span className="text-xs text-ink-500 font-semibold">{doc.date}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="btn-secondary btn-sm text-xs font-bold flex items-center gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-positive-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Kimásolva!' : 'Szöveg Másolása'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="btn-secondary btn-sm text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              Nyomtatás
            </button>

            <a
              href={doc.downloadUrl || doc.txtUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary btn-sm text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Letöltés ({doc.fileSize || 'TXT/PDF'})
            </a>
          </div>
        </div>

        {/* Kiemelt információk (ha vannak) */}
        {doc.highlights && doc.highlights.length > 0 && (
          <div className="rounded-xl border border-wine-200 bg-wine-50/50 p-4 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-wine-800 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-wine-600" />
              Kiemelt Főbb Rendelkezések / Pontok:
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-ink-800 font-medium">
              {doc.highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-wine-700 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Keresőmező a dokumentum szövegében */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Keresés a dokumentum szövegében…"
            className="input pl-9 text-xs"
          />
        </div>

        {/* Dokumentum Szöveg Törzs */}
        <div className="max-h-[55vh] overflow-y-auto p-5 rounded-2xl bg-white border border-sand-300 shadow-inner custom-scrollbar space-y-3 font-serif text-sm leading-relaxed text-ink-900 selection:bg-wine-100 selection:text-wine-900">
          {searchQuery.trim() ? (
            <div>
              <p className="text-xs font-sans text-ink-500 mb-3 font-bold">
                Találatok a(z) "{searchQuery}" keresőszóra:
              </p>
              {doc.fullText
                .split('\n')
                .filter((line) => line.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((line, i) => (
                  <p key={i} className="my-1.5 p-2 rounded bg-gold-50 border-l-2 border-gold-400 font-sans text-xs">
                    {line}
                  </p>
                ))}
            </div>
          ) : (
            doc.fullText.split('\n\n').map((paragraph, i) => {
              const isHeading =
                paragraph.startsWith('I.') ||
                paragraph.startsWith('II.') ||
                paragraph.startsWith('III.') ||
                paragraph.startsWith('IV.') ||
                paragraph.startsWith('V.') ||
                paragraph.startsWith('VI.') ||
                paragraph.startsWith('VII.') ||
                paragraph.startsWith('VIII.') ||
                paragraph.startsWith('IX.') ||
                paragraph.startsWith('X.') ||
                paragraph.startsWith('XI.') ||
                paragraph.startsWith('XII.') ||
                paragraph.startsWith('XIII.') ||
                paragraph.startsWith('XIV.') ||
                paragraph.startsWith('XV.') ||
                paragraph.startsWith('XVI.') ||
                paragraph.startsWith('ALAPGONDOLAT') ||
                paragraph.startsWith('JAVASOLT FŐ MOTTÓ') ||
                paragraph.match(/^[0-9]+\.\s/);

              return (
                <div key={i} className={isHeading ? 'font-sans font-bold text-wine-900 pt-3 border-t border-sand-200 first:pt-0 first:border-0 text-base' : ''}>
                  {paragraph.split('\n').map((line, j) => (
                    <p key={j} className={line.startsWith('•') ? 'pl-4 my-1 font-sans text-xs' : 'my-1'}>
                      {line}
                    </p>
                  ))}
                </div>
              );
            })
          )}
        </div>

        {/* Lábléc gomb */}
        <div className="flex justify-end pt-2 border-t border-sand-200">
          <button type="button" onClick={onClose} className="btn-secondary btn-sm font-bold">
            Bezárás
          </button>
        </div>
      </div>
    </Modal>
  );
};
