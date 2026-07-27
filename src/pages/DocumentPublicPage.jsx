import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, ShieldCheck, Lock, Eye } from 'lucide-react';

export const DocumentPublicPage = () => {
  const { documents } = useAuth();
  const publicDocs = documents.filter(d => d.access_level === 'public');

  return (
    <div className="py-12 bg-[#FAF6F0] min-h-[70vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-3">
          <div className="inline-block px-3 py-1 bg-[#F7EBEF] text-[#6B1D2F] border border-[#D9AAB6] rounded-full text-xs font-semibold uppercase tracking-wider">
            Publikus Dokumentumok
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
            Hivatalos Egyesületi Irattár & Alapszabály
          </h1>
          <p className="text-[#63534B] text-sm max-w-2xl mx-auto">
            A Kőszegi Turisztikai Szövetség Egyesület nyilvánosan hozzáférhető alapszabálya, közhasznúsági beszámolói és hivatalos dokumentumai.
          </p>
        </div>

        <div className="space-y-4">
          {publicDocs.map((doc) => (
            <div key={doc.id} className="bg-white p-6 rounded-2xl border border-[#E2D7C7] hover:border-[#C5A880] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="badge-wine uppercase text-[0.65rem] font-bold">
                    {doc.category}
                  </span>
                  <span className="text-xs text-[#63534B]">Feltöltve: {doc.uploaded_at} • {doc.file_size}</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#2C221E] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#6B1D2F]" />
                  {doc.title}
                </h3>
                <p className="text-xs text-[#63534B]">
                  {doc.description}
                </p>
              </div>

              <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                <button 
                  onClick={() => alert(`Dokumentum megtekintése: ${doc.title}`)}
                  className="btn-wine-outline text-xs py-2 px-3"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Megtekintés
                </button>
                <button 
                  onClick={() => alert(`Letöltés elindult: ${doc.title}`)}
                  className="btn-wine text-xs py-2 px-3"
                >
                  <Download className="w-3.5 h-3.5" />
                  Letöltés (PDF)
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-[#F3ECE0] rounded-2xl border border-[#C5A880] text-center space-y-2">
          <div className="font-serif text-lg font-bold text-[#2C221E]">
            További Belső Jegyzőkönyveket Keres?
          </div>
          <p className="text-xs text-[#63534B]">
            Az egyesület belső közgyűlési jegyzőkönyvei és pénzügyi beszámolói a tagi bejelentkezés után érhetők el.
          </p>
        </div>

      </div>
    </div>
  );
};
