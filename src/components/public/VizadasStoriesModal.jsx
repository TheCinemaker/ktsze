import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Share2, MapPin, Droplets, Clock } from 'lucide-react';

export const VizadasStoriesModal = ({ isOpen, onClose, logs = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likes, setLikes] = useState({});
  const [isPaused, setIsPaused] = useState(false);

  // Filter logs with photos for the story viewer
  const storyLogs = logs.filter((l) => l.photo_url);

  useEffect(() => {
    if (!isOpen || storyLogs.length === 0 || isPaused) return;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % storyLogs.length);
    }, 5000); // Auto-advance 5 seconds per story

    return () => clearTimeout(timer);
  }, [isOpen, currentIndex, storyLogs.length, isPaused]);

  if (!isOpen || storyLogs.length === 0) return null;

  const currentLog = storyLogs[currentIndex];
  const isLiked = likes[currentLog?.id];

  const toggleLike = (e) => {
    e.stopPropagation();
    setLikes((prev) => ({
      ...prev,
      [currentLog.id]: !prev[currentLog.id]
    }));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % storyLogs.length);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + storyLogs.length) % storyLogs.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-0 sm:p-4 animate-fade-in">
      {/* Bezárás gomb */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 rounded-full bg-white/20 p-3 text-white hover:bg-white/40 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Story Kártya Mobil Konténer (9:16 Arány) */}
      <div
        className="relative w-full sm:max-w-md h-full sm:h-[840px] max-h-full sm:rounded-3xl overflow-hidden bg-zinc-950 flex flex-col justify-between shadow-2xl select-none"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Instagram sávok a tetején */}
        <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5">
          {storyLogs.map((log, idx) => (
            <div key={log.id || idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  idx < currentIndex
                    ? 'w-full'
                    : idx === currentIndex
                    ? isPaused
                      ? 'w-1/2'
                      : 'w-full animate-pulse'
                    : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Story Fejléc: Kőszeg Címer + Felhasználó Info */}
        <div className="absolute top-7 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md p-2 px-3 rounded-full border border-white/20">
            <img src="/koszeg_cimer.png" alt="Kőszeg Város Címere" className="h-8 w-auto object-contain" />
            <div className="text-white text-xs">
              <div className="font-extrabold truncate max-w-[150px]">
                {currentLog.user_name && currentLog.user_name !== 'Kőszegi Önkéntes' ? currentLog.user_name : 'Önkéntes Vízadó'}
              </div>
              <div className="text-[10px] text-zinc-300 flex items-center gap-1 font-semibold">
                <Clock className="h-3 w-3" />
                {new Date(currentLog.created_at).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          <div className="bg-emerald-600/90 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-full shadow-md backdrop-blur-md flex items-center gap-1">
            <Droplets className="h-3.5 w-3.5" />
            Vízadás Kőszegen
          </div>
        </div>

        {/* Háttérkép (Teljes Story Foto) */}
        <img
          src={currentLog.photo_url}
          alt={currentLog.user_name}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Sötét színátmenet alul és felül */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none" />

        {/* Bal / Jobb kattintási zónák Story léptetéshez */}
        <div className="absolute inset-0 flex z-20">
          <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
        </div>

        {/* Alsó Info Sáv & Interakciók */}
        <div className="relative z-30 p-5 mt-auto space-y-3 text-white pointer-events-auto">
          {currentLog.notes && (
            <p className="text-xs sm:text-sm font-medium italic bg-black/60 p-3 rounded-2xl border border-white/10 backdrop-blur-md text-zinc-100">
              "{currentLog.notes}"
            </p>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={toggleLike}
              className={`flex-1 py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg border ${
                isLiked
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-md'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
              <span>{isLiked ? 'Tetszik! (1)' : 'Tetszik'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Vízadás Kőszegen',
                    text: 'Segítsünk Kőszeg szomjazó fáinak!',
                    url: window.location.href
                  });
                } else {
                  alert('Hivatkozás másolva a vágólapra!');
                }
              }}
              className="py-3 px-4 rounded-2xl font-extrabold text-xs bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95"
            >
              <Share2 className="h-5 w-5" />
              <span>Megosztom</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
