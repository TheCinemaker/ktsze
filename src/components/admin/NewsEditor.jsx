import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FileEdit, Plus, Sparkles, Image, Check, Trash2 } from 'lucide-react';

export const NewsEditor = () => {
  const { newsProjects, addNewsProject } = useAuth();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('hír');
  const [category, setCategory] = useState('Turisztikai Fejlesztés');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !summary) return;
    setSaving(true);
    const result = await addNewsProject({
      title,
      type,
      category,
      summary,
      content: content || summary,
      image: "https://images.unsplash.com/photo-1548625361-185b376d8b37?auto=format&fit=crop&w=1000&q=80"
    });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error, { title: 'A tartalom nem került be az adatbázisba' });
      return;
    }
    setShowModal(false);
    setTitle('');
    setSummary('');
    setContent('');
    toast.success(`A(z) „${result.news.title}” ${result.news.type} publikálva és elmentve.`);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2D7C7] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#63534B] uppercase tracking-wider mb-1">
            <FileEdit className="w-4 h-4 text-[#6B1D2F]" />
            Tartalomkezelő (CMS)
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2C221E]">
            Hírek & Készülő Projektek Kezelése
          </h2>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="btn-wine text-xs uppercase tracking-wider font-semibold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Új Közlemény Közzététele
        </button>
      </div>

      {/* Existing items list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {newsProjects.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-xl border border-[#E2D7C7] space-y-3">
            <div className="flex items-center justify-between">
              <span className="badge-wine text-[0.65rem] uppercase font-bold">
                {item.type} • {item.category}
              </span>
              <span className="text-[0.68rem] text-[#63534B]">{item.date}</span>
            </div>

            <h4 className="font-serif text-lg font-bold text-[#2C221E]">
              {item.title}
            </h4>

            <p className="text-xs text-[#63534B] line-clamp-2">
              {item.summary}
            </p>

            <div className="pt-2 border-t border-[#FAF6F0] flex justify-between text-xs text-[#6B1D2F] font-semibold">
              <span>Státusz: Publikálva</span>
              <span>KTSzE Hivatalos</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-lg w-full p-6 border-2 border-[#C5A880] shadow-2xl relative">
            <h3 className="font-serif text-xl font-bold text-[#2C221E] mb-4">
              Új Egyesületi Közlemény v. Projekt Publikálása
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2C221E] mb-1">Közlemény Címe *</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Pl. Új kőszegi turisztikai térképek nyomtatása"
                  className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2C221E] mb-1">Típus</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                  >
                    <option value="hír">Hír</option>
                    <option value="projekt">Fejlesztési Projekt</option>
                    <option value="pályázat">Pályázat</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#2C221E] mb-1">Kategória</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                  >
                    <option value="Turisztikai Fejlesztés">Turisztikai Fejlesztés</option>
                    <option value="Közgyűlés">Közgyűlés</option>
                    <option value="Pályázat">Pályázat</option>
                    <option value="Egyesület">Egyesület</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2C221E] mb-1">Rövid Összefoglaló *</label>
                <textarea 
                  rows={2}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Kártyán megjelenő rövid összefoglalás..."
                  className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-[#2C221E] mb-1">Részletes Tartalom</label>
                <textarea 
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="A teljes közlemény szövege..."
                  className="w-full p-2.5 rounded border border-[#E2D7C7] bg-white text-[#2C221E]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline-brown text-xs">
                  Mégse
                </button>
                <button type="submit" disabled={saving} className="btn-wine text-xs disabled:opacity-60">
                  {saving ? 'Mentés az adatbázisba…' : 'Publikálás'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
