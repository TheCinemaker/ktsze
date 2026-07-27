import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FileText, Download, Search, Upload, Lock, ShieldCheck, Filter, Eye, Plus, Check } from 'lucide-react';

export const DocumentVault = () => {
  const { documents, addDocument, role } = useAuth();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Minden');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Doc Form (Admin only)
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Közgyűlés');
  const [newAccess, setNewAccess] = useState('members');
  const [newDesc, setNewDesc] = useState('');

  const categories = ['Minden', 'Munkaterv', 'Alapszabály', 'Közgyűlés', 'Pénzügyek', 'Szabályzatok'];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Minden' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const [saving, setSaving] = useState(false);

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    if (!newTitle) return;
    if (role !== 'admin') {
      toast.error('Csak egyesületi adminisztrátor tölthet fel hivatalos dokumentumot.', {
        title: 'Nincs jogosultság'
      });
      return;
    }
    setSaving(true);
    const result = await addDocument({
      title: newTitle,
      category: newCategory,
      access_level: newAccess,
      description: newDesc,
      file_size: '1.5 MB',
      file_url: '#'
    });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error, { title: 'A dokumentum nem került be az adatbázisba' });
      return;
    }
    setShowUploadModal(false);
    setNewTitle('');
    setNewDesc('');
    toast.success(`A(z) „${result.document.title}” dokumentum rögzítve a Supabase adatbázisban.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2D7C7] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#6B1D2F] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-[#6B1D2F]" />
            Hivatalos Egyesületi Irattár & Szabályzatok
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2C221E]">
            Dokumentumtár & Beszámolók
          </h2>
          <p className="text-xs text-[#63534B] mt-0.5">
            A hatályos Alapszabály, elnökségi munkatervek és jegyzőkönyvek megtekintése és letöltése.
          </p>
        </div>

        {/* Upload Button - ONLY VISIBLE TO ADMIN */}
        {role === 'admin' ? (
          <button 
            onClick={() => setShowUploadModal(true)}
            className="btn-wine text-xs uppercase tracking-wider font-bold self-start md:self-auto"
          >
            <Upload className="w-4 h-4" />
            Dokumentum Feltöltése (Admin)
          </button>
        ) : (
          <div className="p-3 bg-[#FAF3E8] border border-[#E5D2B8] rounded-xl text-xs text-[#7A5B2E] font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#6B1D2F]" />
            <span>Dokumentum feltöltési jog: Kizárólag Adminisztrátornak</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#F3ECE0] p-4 rounded-xl border border-[#E2D7C7] flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#63534B] absolute left-3 top-3" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Dokumentum keresése..." 
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E2D7C7] bg-white text-xs text-[#2C221E] focus:outline-none focus:border-[#6B1D2F]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#6B1D2F] text-white border-[#6B1D2F]'
                  : 'bg-white text-[#2C221E] border-[#E2D7C7] hover:bg-[#FAF6F0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Document List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="bg-white p-5 rounded-xl border border-[#E2D7C7] hover:border-[#C5A880] shadow-sm transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="badge-wine uppercase text-[0.65rem] font-bold">
                  {doc.category}
                </span>
                <span className="text-[0.65rem] font-medium text-[#63534B] flex items-center gap-1">
                  {doc.access_level === 'public' ? (
                    <span className="text-green-700 font-bold">Publikus Elérés</span>
                  ) : (
                    <span className="text-[#6B1D2F] font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Csak Tagoknak
                    </span>
                  )}
                </span>
              </div>

              <h4 className="font-serif text-lg font-bold text-[#2C221E] flex items-start gap-2">
                <FileText className="w-5 h-5 text-[#6B1D2F] shrink-0 mt-0.5" />
                <span>{doc.title}</span>
              </h4>

              <p className="text-xs text-[#63534B] leading-relaxed">
                {doc.description || "Az egyesület hivatalos közzétett állománya."}
              </p>
            </div>

            <div className="pt-3 border-t border-[#FAF6F0] flex items-center justify-between text-xs text-[#63534B]">
              <span>Feltöltve: {doc.uploaded_at} • {doc.file_size}</span>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => toast.info(`Dokumentum megtekintése: ${doc.title}`)}
                  className="btn-wine-outline text-xs py-1 px-2.5"
                >
                  <Eye className="w-3.5 h-3.5" /> Megtekintés
                </button>
                <button 
                  onClick={() => toast.info(`Letöltés elindult: ${doc.title}`)}
                  className="btn-wine text-xs py-1 px-2.5"
                >
                  <Download className="w-3.5 h-3.5" /> Letöltés
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Upload Modal */}
      {showUploadModal && role === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-md w-full p-6 border-2 border-[#C5A880] shadow-2xl relative">
            <h3 className="font-serif text-xl font-bold text-[#2C221E] mb-4">
              Új Egyesületi Dokumentum Feltöltése (Admin)
            </h3>

            <form onSubmit={handleCreateDocument} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2C221E] mb-1">Dokumentum Címe *</label>
                <input 
                  type="text" 
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Pl. 2026. Évi II. Rendes Taggyűlési Jegyzőkönyv"
                  className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C221E] mb-1">Kategória</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                >
                  <option value="Munkaterv">Munkaterv</option>
                  <option value="Közgyűlés">Közgyűlés</option>
                  <option value="Alapszabály">Alapszabály</option>
                  <option value="Pénzügyek">Pénzügyek</option>
                  <option value="Szabályzatok">Szabályzatok</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2C221E] mb-1">Hozzáférési Szint</label>
                <select 
                  value={newAccess}
                  onChange={(e) => setNewAccess(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                >
                  <option value="members">Csak Egyesületi Tagoknak</option>
                  <option value="public">Publikus (Mindenki láthatja)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2C221E] mb-1">Rövid Leírás</label>
                <textarea 
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Tartalom rövid összefoglalása..."
                  className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                ></textarea>
              </div>

              <div className="border-2 border-dashed border-[#E2D7C7] rounded-lg p-4 text-center bg-white cursor-pointer">
                <Upload className="w-6 h-6 text-[#6B1D2F] mx-auto mb-1" />
                <span className="text-[0.7rem] text-[#63534B]">Tallózzon ki egy PDF fájlt a gépéről</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn-outline-brown text-xs">
                  Mégse
                </button>
                <button type="submit" disabled={saving} className="btn-wine text-xs disabled:opacity-60">
                  {saving ? 'Mentés az adatbázisba…' : 'Feltöltés Rögzítése'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
