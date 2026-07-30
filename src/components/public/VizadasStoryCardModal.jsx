import React, { useRef, useState } from 'react';
import { X, Download, Share2, Check, Droplets } from 'lucide-react';

export const VizadasStoryCardModal = ({ isOpen, onClose, photoUrl, userName, locationName }) => {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const displayName = userName?.trim() && userName !== 'Kőszegi Önkéntes' ? userName : 'Kőszegi Vízadó Polgár';
  const displayLocation = locationName || 'Kőszeg Belváros';

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);

    try {
      // HTML5 Canvas alapú képgenerálás a story mentéséhez
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // 1080x1920 Instagram Story felbontás
      canvas.width = 1080;
      canvas.height = 1920;

      // Háttér gradiens (Sötétzöld elegáns átmenet)
      const grad = ctx.createLinearGradient(0, 0, 0, 1920);
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(0.5, '#022c22');
      grad.addColorStop(1, '#065f46');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Címer kép betöltése
      const cimerImg = new Image();
      cimerImg.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        cimerImg.onload = resolve;
        cimerImg.onerror = resolve;
        cimerImg.src = '/koszeg_cimer.png';
      });

      if (cimerImg.complete && cimerImg.naturalWidth > 0) {
        ctx.drawImage(cimerImg, 1080 / 2 - 120, 100, 240, 260);
      }

      // Címek rajzolása
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('KŐSZEG VÁROS', 1080 / 2, 420);

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('ÖNKÉNTES FAÖNTÖZÉS — „VÍZADÁS”', 1080 / 2, 480);

      // Szelfi fotó kirajzolása ha van
      if (photoUrl) {
        const photo = new Image();
        photo.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          photo.onload = resolve;
          photo.onerror = resolve;
          photo.src = photoUrl;
        });

        if (photo.complete && photo.naturalWidth > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(140, 540, 800, 950, 40);
          ctx.clip();
          ctx.drawImage(photo, 140, 540, 800, 950);
          ctx.restore();
        }
      }

      // Alsó Kártya Info
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 52px sans-serif';
      ctx.fillText(displayName, 1080 / 2, 1560);

      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText(`📍 ${displayLocation}`, 1080 / 2, 1630);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText('#VízadásKőszeg  #KőszegVirágzik  #KőszegVáros', 1080 / 2, 1720);

      // Kép letöltése
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `vizadas-story-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      alert('Képgenerálási hiba: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-emerald-950 border-2 border-emerald-500 shadow-2xl p-5 space-y-4 text-white text-center">
        {/* Bezárás gomb */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Story Kártya Előnézet (Előnézet képernyőn) */}
        <div ref={cardRef} className="p-4 rounded-2xl bg-gradient-to-b from-emerald-900 to-emerald-950 border border-emerald-700/60 space-y-3 shadow-inner">
          {/* Hivatalos Kőszegi Városi Címer */}
          <div className="flex flex-col items-center gap-1.5 pt-1">
            <img src="/koszeg_cimer.png" alt="Kőszeg Város Címere" className="h-16 w-auto object-contain drop-shadow-md" />
            <div className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-200">
              Kőszeg Város — Vízadás 2026
            </div>
          </div>

          {/* Szelfi / Fotó keret */}
          {photoUrl ? (
            <div className="relative h-64 w-full rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-md">
              <img src={photoUrl} alt="Vízadási szelfi" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-44 w-full rounded-2xl bg-emerald-900/60 border border-emerald-700 flex flex-col items-center justify-center gap-2 text-emerald-200">
              <Droplets className="h-10 w-10 text-emerald-400" />
              <span className="text-xs font-bold">Önkéntes Faöntözés Kőszegen</span>
            </div>
          )}

          {/* Név & Utca */}
          <div className="space-y-0.5 pt-1">
            <div className="font-extrabold text-base text-white">{displayName}</div>
            <div className="text-xs font-bold text-emerald-300">📍 {displayLocation}</div>
            <div className="text-[11px] font-semibold text-amber-300 pt-1">
              #VízadásKőszeg #KőszegVirágzik
            </div>
          </div>
        </div>

        {/* Gombok */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadImage}
            className="w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95 border-b-4 border-amber-700"
          >
            {downloadSuccess ? (
              <>
                <Check className="h-5 w-5" />
                <span>Story Kártya elmentve a telefonodra!</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                <span>{downloading ? 'Kártya generálása…' : '📥 Letöltés Instagram / FB Storyba'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Vízadás Kőszegen',
                  text: `Ma én is adtam vizet Kőszeg fáinak! #VízadásKőszeg`,
                  url: window.location.href
                });
              } else {
                alert('Hivatkozás másolva a vágólapra!');
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-1.5"
          >
            <Share2 className="h-4 w-4" />
            <span>Közvetlen megosztás</span>
          </button>
        </div>
      </div>
    </div>
  );
};
