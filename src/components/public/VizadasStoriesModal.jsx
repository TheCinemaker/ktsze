import React, { useState, useRef } from 'react';
import { X, Heart, Share2, Droplets, Camera, Award, MapPin } from 'lucide-react';

export const VizadasStoriesModal = ({ isOpen, onClose, logs = [], onShareStory }) => {
  const [likes, setLikes] = useState({});
  const containerRef = useRef(null);

  if (!isOpen) return null;

  // CSAK AZOK A BEJEGYZÉSEK JELENNEK MEG A REELS-BEN, AKIK RÉSZLETESEN KITÖLTÖTTÉK ÉS TETTEK FEL SZELFIT, ÉS AZ ELMÚLT 24 ÓRÁBAN TÖRTÉNT!
  const storyLogs = (logs || []).filter((l) => {
    if (!l.photo_url) return false;
    const diffHours = (Date.now() - new Date(l.created_at).getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  });

  const toggleLike = (e, logId) => {
    e.stopPropagation();
    setLikes((prev) => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-0 sm:p-4 select-none">
      <style>{`
        .reels-container::-webkit-scrollbar {
          display: none;
        }
        .reels-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
          scroll-behavior: smooth;
        }
        .reels-slide {
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
      `}</style>

      {/* Bezárás gomb */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 border border-white/20 transition-all shadow-lg active:scale-95"
      >
        <X className="h-6 w-6" />
      </button>

      {storyLogs.length === 0 ? (
        <div className="relative w-full sm:max-w-md p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-white text-center space-y-4 shadow-2xl">
          <div className="h-16 w-16 mx-auto rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 border border-rose-500/40">
            <Camera className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg">Még nincs beküldött szelfis öntözés!</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Öntözz meg egy fát, tölts fel egy szelfit és írj hozzá egy megjegyzést, hogy megjelenj a Kőszegi Vízadás Reels-ben!
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
        /* Reels Mobil-szerű Konténer */
        <div className="relative w-full sm:max-w-[420px] h-full sm:h-[820px] max-h-full sm:rounded-3xl overflow-hidden bg-black flex flex-col justify-between shadow-2xl border border-zinc-800">
          
          {/* Függőleges scroll snap container */}
          <div 
            ref={containerRef}
            className="reels-container w-full h-full overflow-y-scroll snap-y snap-mandatory"
          >
            {storyLogs.map((log, idx) => {
              const isLiked = likes[log.id] || false;
              const formattedTime = new Date(log.created_at).toLocaleDateString('hu-HU', {
                month: 'short',
                day: 'numeric'
              }) + ' ' + new Date(log.created_at).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });

              return (
                <div 
                  key={log.id || idx}
                  className="reels-slide w-full h-full snap-start snap-always shrink-0 relative flex flex-col justify-between"
                >
                  {/* Háttérkép */}
                  <img
                    src={log.photo_url}
                    alt={log.user_name}
                    className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                  />

                  {/* Sötét színátmenetes rétegek a jobb olvashatóságért */}
                  <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />
                  <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none z-10" />

                  {/* Felső lapjelző csík */}
                  <div className="absolute top-3 left-4 right-4 z-20 flex gap-1 pointer-events-none">
                    <div className="h-0.5 w-full bg-white/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                        style={{ width: `${((idx + 1) / storyLogs.length) * 100}%` }} 
                      />
                    </div>
                  </div>

                  {/* Felső profil fejléc */}
                  <div className="absolute top-7 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full border border-white/40 overflow-hidden bg-emerald-800 flex items-center justify-center shadow-md">
                        <img 
                          src="/koszeg_cimer.png" 
                          alt="Kőszeg Város" 
                          className="h-7 w-auto object-contain" 
                        />
                      </div>
                      <div className="text-white text-xs drop-shadow-md">
                        <span className="font-extrabold block">
                          {log.user_name && log.user_name !== 'Kőszegi Önkéntes' ? log.user_name : 'Kőszegi Vízadó'}
                        </span>
                        <span className="text-[10px] text-zinc-300 font-medium block">
                          {formattedTime}
                        </span>
                      </div>
                    </div>

                    <span className="bg-emerald-600/90 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-md backdrop-blur-md uppercase tracking-wider">
                      {log.action_type === 'gondozas'
                        ? 'Gondozás'
                        : log.action_type === 'gyomlalas' || log.action_type === 'kapalas'
                        ? 'Gyomlálás'
                        : log.action_type === 'ultetes'
                        ? 'Újraültetés'
                        : log.action_type === 'tisztitas'
                        ? 'Takarítás'
                        : 'Öntözés'}
                    </span>
                  </div>

                  {/* Jobb oldali lebegő interakciós sáv (Insta Reels stílus) */}
                  <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-5">
                    {/* Liter jelző */}
                    <div className="flex flex-col items-center">
                      <div className="w-11 h-11 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-sky-400 backdrop-blur-md shadow-lg">
                        <Droplets className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] text-white font-extrabold mt-1 drop-shadow-md">
                        {log.water_liters || 15}L
                      </span>
                    </div>

                    {/* Like gomb */}
                    <button
                      type="button"
                      onClick={(e) => toggleLike(e, log.id)}
                      className="flex flex-col items-center group"
                    >
                      <div className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all backdrop-blur-md shadow-lg active:scale-90 ${
                        isLiked 
                          ? 'bg-rose-600 border-rose-500 text-white animate-heart-beat' 
                          : 'bg-black/50 border-white/20 text-white hover:bg-black/75'
                      }`}>
                        <Heart className={`h-5 w-5 ${isLiked ? 'fill-white' : ''}`} />
                      </div>
                      <span className="text-[10px] text-white font-bold mt-1 drop-shadow-md">
                        {isLiked ? 1 : 'Tetszik'}
                      </span>
                    </button>

                    {/* Letölthető megosztó kártya */}
                    {onShareStory && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareStory({
                            photoUrl: log.photo_url,
                            userName: log.user_name || 'Kőszegi Vízadó Polgár',
                            locationName: log.spot_title || 'Kőszeg Belváros',
                            actionType: log.action_type
                          });
                        }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-11 h-11 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-amber-400 hover:bg-black/75 transition-all backdrop-blur-md shadow-lg active:scale-90">
                          <Share2 className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] text-white font-bold mt-1 drop-shadow-md">
                          Megosztás
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Alsó infó feliratok és leírás */}
                  <div className="absolute left-4 right-20 bottom-8 z-20 text-white space-y-2 pointer-events-none">
                    <div className="flex items-center gap-1.5 text-xs font-bold bg-black/45 backdrop-blur-xs p-2 rounded-xl border border-white/10 self-start w-fit">
                      <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{log.spot_title || 'Kőszegi Virágláda'}</span>
                    </div>

                    {log.notes && (
                      <p className="text-xs sm:text-sm font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pr-2 line-clamp-4">
                        "{log.notes}"
                      </p>
                    )}

                    <div className="text-[10px] text-emerald-300 font-extrabold flex items-center gap-1.5 uppercase tracking-wider">
                      <Award className="h-3.5 w-3.5" />
                      <span>#VízadásKőszeg #KőszegVirágzik</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Swipe Jelző lebegő felirat */}
          <div className="absolute inset-x-0 bottom-3 text-center text-[10px] text-white/40 pointer-events-none z-20 animate-pulse">
            Görgess lefelé a következő bejegyzéshez
          </div>
        </div>
      )}
    </div>
  );
};
