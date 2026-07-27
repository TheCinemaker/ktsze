import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Tag, ArrowRight, X, Sparkles, FileText, CheckCircle2, Building2 } from 'lucide-react';

export const ProjectsNews = () => {
  const { newsProjects } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('Minden');
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const categories = ['Minden', 'Turisztikai Fejlesztés', 'Közgyűlés', 'Pályázat'];

  const filteredItems = selectedCategory === 'Minden'
    ? newsProjects
    : newsProjects.filter(item => item.category === selectedCategory || item.type === selectedCategory.toLowerCase());

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FAF6F0] border-t border-[#E2D7C7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4 sm:gap-6">
          <div>
            <div className="inline-block px-3 py-1 bg-[#F7EBEF] text-[#6B1D2F] border border-[#D9AAB6] rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              Egyesületi Élet & Fejlesztések
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#2C221E]">
              Készülő Programok & Hírek
            </h2>
            <p className="text-[#63534B] text-xs sm:text-sm mt-1 max-w-xl">
              Tájékoztató felület az Egyesület által előkészítés alatt álló turisztikai koncepciókról, nyertes pályázatokról és hivatalos közleményekről.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#6B1D2F] text-white border-[#6B1D2F]'
                    : 'bg-white text-[#2C221E] border-[#E2D7C7] hover:bg-[#F3ECE0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const hasError = imageErrors[item.id];
              return (
                <article 
                  key={item.id}
                  className="card-editorial flex flex-col justify-between group cursor-pointer"
                  onClick={() => setActiveModalItem(item)}
                >
                  <div className="space-y-4">
                    
                    {/* Image / Fallback Placeholder Banner */}
                    <div className="rounded-xl overflow-hidden h-44 -mx-1 -mt-1 mb-2 relative bg-[#F3ECE0] border border-[#E2D7C7]">
                      {!hasError && item.image ? (
                        <img 
                          src={item.image} 
                          alt=""
                          onError={() => handleImageError(item.id)}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F7EBEF] to-[#F3ECE0] text-[#6B1D2F] p-4 text-center">
                          <Building2 className="w-8 h-8 mb-1" />
                          <span className="font-serif font-bold text-xs">Kőszegi Turisztikai Szövetség</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="badge-wine uppercase text-[0.65rem] font-bold">
                          {item.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#63534B]">
                      <span className="flex items-center gap-1 text-[#6B1D2F] font-semibold">
                        <Tag className="w-3.5 h-3.5" />
                        {item.category}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
                        {item.date}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C221E] group-hover:text-[#6B1D2F] transition-colors leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#63534B] line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#E2D7C7] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#6B1D2F] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Részletes Tájékoztató <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[0.65rem] text-[#A39288] uppercase tracking-wider">KTSzE Hivatalos</span>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-full p-8 text-center bg-white rounded-xl border border-dashed border-[#C5A880]">
              <FileText className="w-8 h-8 text-[#C5A880] mx-auto mb-2" />
              <h4 className="font-serif text-lg font-bold text-[#2C221E]">
                Még nincsenek feltöltött hírek vagy közlemények
              </h4>
              <p className="text-xs text-[#63534B] max-w-md mx-auto mt-1">
                Az egyesületi híreket és közleményeket az Adminisztrációs Kezelőfelületen töltheti fel a Hírek & CMS menüpontban.
              </p>
            </div>
          )}
        </div>

        {/* Full Article Modal */}
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#FAF6F0] rounded-2xl max-w-2xl w-full p-6 sm:p-8 border-2 border-[#C5A880] shadow-2xl relative max-h-[90vh] overflow-y-auto">
              
              <button 
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 p-2 text-[#63534B] hover:text-[#6B1D2F] rounded-full hover:bg-[#F3ECE0] border-0 bg-transparent cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="badge-wine uppercase text-xs font-bold">
                    {activeModalItem.type}
                  </span>
                  <span className="text-xs text-[#63534B] font-semibold">
                    {activeModalItem.category} • {activeModalItem.date}
                  </span>
                </div>

                <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#2C221E]">
                  {activeModalItem.title}
                </h2>

                <div className="p-4 bg-[#F3ECE0] rounded-xl border-l-4 border-[#6B1D2F]">
                  <p className="text-xs sm:text-sm font-medium text-[#2C221E] italic">
                    "{activeModalItem.summary}"
                  </p>
                </div>

                <div className="prose prose-sm max-w-none text-[#2C221E] whitespace-pre-line leading-relaxed text-xs sm:text-sm pt-2">
                  {activeModalItem.content}
                </div>

                <div className="pt-6 border-t border-[#E2D7C7] flex justify-between items-center text-xs text-[#63534B]">
                  <span>Kiadta: Kőszegi Turisztikai Szövetség Egyesület</span>
                  <button 
                    onClick={() => setActiveModalItem(null)}
                    className="btn-wine text-xs"
                  >
                    Bezárás
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
