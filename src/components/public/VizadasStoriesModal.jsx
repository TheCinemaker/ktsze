import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Share2, Clock, Droplets, Camera } from 'lucide-react';

export const VizadasStoriesModal = ({ isOpen, onClose, logs = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likes, setLikes] = useState({});

  if (!isOpen) return null;

  // CSAK AZOK A BEJEGYZÉSEK JELENNEK MEG A REELS-BEN, AKIK RÉSZLETESEN KITÖLTÖTTÉK ÉS TETTEK FEL SZELFIT!
  // Az 1-kattintásos fotó nélküli gyorsöntözések kiszűrésre kerülnek.
  const storyLogs = (logs || []).filter((l) => Boolean(l.photo_url));

  const currentLog = storyLogs[currentIndex];
  const isLiked = currentLog?.id ? likes[currentLog.id] : false;

  const toggleLike = (e) => {
    e.stopPropagation();
    if (!currentLog?.id) return;
    setLikes((prev) => ({
      ...prev,
      [currentLog.id]: !prev[currentLog.id]
    }));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    if (storyLogs.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % storyLogs.length);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (storyLogs.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + storyLogs.length) % storyLogs.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-0 sm:p-4 animate-fade-in select-none">
      {/* Bezárás gomb */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 rounded-full bg-white/20 p-3 text-white hover:bg-white/40 transition-colors shadow-lg"
      >
        <X className="h-6 w-6" />
      </button>

      {/* HA MÉG NICS FELTÖLTÖTT SZELFI: ELEGÁNS ÜRES ÁLLAPOT A MODALBAN */}
      {storyLogs.length === 0 ? (
        <div className="relative w-full sm:max-w-md p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-white text-center space-y-4 shadow-2xl">
          <div className="h-16 w-16 mx-auto rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 border border-rose-500/40">
            <Camera className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg">Még nincs beküldött szelfis öntözés!</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Öntözz meg egy fát, tölts fel egy szelfit és írj hozzá egy megjegyzést, hogy megjelenj a Kőszegi Vízadás Stories-ban!
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md"
          >
            Értettem, meglocsolok egy fát!
          </button>
        </div>
      ) : (
        /* Story Kártya Mobil Konténer (MANUÁLIS GÖRGETÉS / LÉPTETÉS) */
        <div className="relative w-full sm:max-w-md h-full sm:h-[840px] max-h-full sm:rounded-3xl overflow-hidden bg-zinc-950 flex flex-col justify-between shadow-2xl">
          {/* Story sávok a tetején (Lapjelző) */}
          <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5 pointer-events-none">
            {storyLogs.map((log, idx) => (
              <div
                key={log.id || idx}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'bg-white shadow-md' : idx < currentIndex ? 'bg-white/60' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Story Fejléc: Kőszeg Város Címere + Felhasználó Info */}
          <div className="absolute top-7 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md p-2 px-3 rounded-full border border-white/20">
              <img src="/koszeg_cimer.png" alt="Kőszeg Város Címere" className="h-8 w-auto object-contain drop-shadow" />
              <div className="text-white text-xs">
                <div className="font-extrabold truncate max-w-[140px]">
                  {currentLog.user_name && currentLog.user_name !== 'Kőszegi Önkéntes' ? currentLog.user_name : 'Kőszegi Vízadó'}
                </div>
                <div className="text-[10px] text-zinc-300 flex items-center gap-1 font-semibold">
                  <Clock className="h-3 w-3 text-emerald-400" />
                  {new Date(currentLog.created_at).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div className="bg-emerald-600/90 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-full shadow-md backdrop-blur-md flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5" />
              Vízadás Kőszegen
            </div>
          </div>

          {/* Háttérkép (Szelfi / Fotó) */}
          <img
            src={currentLog.photo_url}
            alt={currentLog.user_name}
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Átmenetes árnyékolás alul és felül */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none" />

          {/* BALRA / JOBBRA LÉPTETŐ GOMBOK (Manuális lapozás) */}
          {storyLogs.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/70 transition-all backdrop-blur-xs"
                title="Előző story"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/70 transition-all backdrop-blur-xs"
                title="Következő story"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Alsó Info Sáv & Interakciók */}
          <div className="relative z-30 p-5 mt-auto space-y-3 text-white pointer-events-auto">
            {currentLog.notes && (
              <p className="text-xs sm:text-sm font-medium italic bg-black/65 p-3.5 rounded-2xl border border-white/15 backdrop-blur-md text-zinc-100 shadow-lg">
                "{currentLog.notes}"
              </p>
            )}

            <div className="pt-1">
              <button
                type="button"
                onClick={toggleLike}
                className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg border ${
                  isLiked
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-md'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
                <span>{isLiked ? 'Tetszik! (1)' : 'Tetszik ez az öntözés'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
