import React, { useState } from 'react';
import { Droplets, Calendar, MapPin, User, CheckCircle2, AlertCircle, Camera, Plus } from 'lucide-react';
import { Modal } from '../ui';
import { addFlowerLog } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';

export const FlowerSpotCard = ({ spot, onLogAdded }) => {
  const { user, profile } = useAuth();
  const [showLogModal, setShowLogModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState('locsolas');
  const [waterLiters, setWaterLiters] = useState(15);
  const [userName, setUserName] = useState(''); // 8. Alapértelmezetten ÜRES!
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  // 13. Napi 2x öntözési státusz kiszámítása az időbélyegekből
  const getWateringBadge = () => {
    if (!spot.last_watered_at) {
      return {
        text: '🚨 Öntözni kellene! (Kétszer egy nap)',
        color: 'bg-rose-600 animate-pulse',
        detail: 'Sürgős vízadásra vár!'
      };
    }

    const date = new Date(spot.last_watered_at);
    const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    const timeStr = date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
    const isToday = new Date().toDateString() === date.toDateString();

    // Ha ma már volt locsolás
    if (isToday) {
      if (spot.water_count_today >= 2 || diffHours < 6) {
        return {
          text: `🟢 Ma már megöntözve (${timeStr})`,
          color: 'bg-emerald-600',
          detail: 'Üde & Friss növény'
        };
      } else {
        return {
          text: `🟡 Ma 1x megöntözve (még 1x kellene)`,
          color: 'bg-amber-600',
          detail: 'Este még egy vízadást igényel'
        };
      }
    } else if (diffHours < 36) {
      return {
        text: `🟡 Tegnap megöntözve (${timeStr})`,
        color: 'bg-amber-600',
        detail: 'Ma még nem kapott vizet'
      };
    } else {
      const days = Math.floor(diffHours / 24);
      return {
        text: `🚨 ${days} napja szomjas! Öntözni kellene!`,
        color: 'bg-rose-600 animate-pulse',
        detail: 'Sürgős vízadásra vár!'
      };
    }
  };

  const badge = getWateringBadge();

  const handleSubmitLog = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(true); // 7. AZONNAL TOAST!
    try {
      await addFlowerLog({
        spot_id: spot.id,
        user_name: userName.trim() || 'Kőszegi Önkéntes',
        action_type: actionType,
        water_liters: Number(waterLiters),
        notes: notes,
        photo_url: photoUrl || spot.photo_url,
        water_count_this_month: spot.water_count_this_month || 0
      });
      setTimeout(() => {
        setSuccessMsg(false);
        setShowLogModal(false);
        setNotes('');
        setPhotoUrl('');
        if (onLogAdded) onLogAdded();
      }, 1500);
    } catch (err) {
      alert('Hiba történt a mentés során: ' + err.message);
      setSuccessMsg(false);
    } finally {
      setLoading(false);
    }
  };

  // 7. AZONNALI INSTANT TOAST A MEGLOCSOLTAM GOMBRA! (0ms várakozás!)
  const handleQuickWater = async () => {
    if (loading || successMsg) return;
    setLoading(true);
    setSuccessMsg(true); // Instant visszajelzés azonnal!

    try {
      await addFlowerLog({
        spot_id: spot.id,
        user_name: userName.trim() || profile?.full_name || '',
        action_type: 'locsolas',
        water_liters: 30,
        notes: 'Gyors 1-kattintásos vízadás',
        photo_url: spot.photo_url,
        water_count_this_month: spot.water_count_this_month || 0
      });
      setTimeout(() => {
        setSuccessMsg(false);
        if (onLogAdded) onLogAdded();
      }, 3500); // 3.5 másodpercig látható marad, hogy Marika néni el tudja olvasni!
    } catch (err) {
      console.error('Locsolási hiba:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <article className="card overflow-hidden flex flex-col justify-between border border-sand-300 bg-white hover:shadow-xl transition-all duration-300 group">
        <div>
          {/* Növény/kaspó fotó */}
          <div className="relative h-52 w-full overflow-hidden bg-sand-100">
            <img
              src={spot.photo_url}
              alt={spot.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* 12. Nem összefolyó, egymás alatti BADGE-EK a képen */}
            <div className="absolute top-3 left-3 right-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pointer-events-none">
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-md bg-white/95 text-ink-900 backdrop-blur-xs">
                <MapPin className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <span className="truncate">{spot.location_name || spot.title}</span>
              </div>

              {/* 13. Öntözési állapot jelvény */}
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold shadow-lg text-white ${badge.color}`}
              >
                <Droplets className="h-4 w-4 shrink-0" />
                <span>{badge.text}</span>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <h3 className="font-display text-lg font-bold text-ink-900 leading-snug group-hover:text-wine-900 transition-colors">
              {spot.title}
            </h3>

            <p className="text-xs text-ink-600 leading-relaxed">{spot.description}</p>

            <div className="pt-2 border-t border-sand-200 space-y-1.5 text-xs text-ink-700">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-wine-600 shrink-0" />
                <span className="font-semibold text-ink-900">Gondozó / Örökbefogadó:</span>
                <span className="truncate font-bold text-ink-800">{spot.adopter_name}</span>
              </div>

              <div className="flex items-center gap-2">
                <Droplets className="h-3.5 w-3.5 text-wine-600 shrink-0" />
                <span className="font-semibold text-ink-900">E havi gondozások:</span>
                <span className="font-bold text-wine-800 bg-sand-100 px-2 py-0.5 rounded-full">{spot.water_count_this_month || 0} alkalom</span>
              </div>
            </div>
          </div>
        </div>

        {/* Akció gombok: Mobilra optimalizált óriási gombok (Marika néninek, regisztráció NÉLKÜL) */}
        <div className="p-4 sm:p-5 pt-0 space-y-2">
          {successMsg ? (
            <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-950 text-sm font-extrabold text-center flex items-center justify-center gap-2 animate-bounce shadow-md">
              <CheckCircle2 className="h-6 w-6 text-emerald-700 shrink-0" />
              <span>🌸 Köszönjük! Az öntözést elmentettük!</span>
            </div>
          ) : (
            <>
              {/* ÓRIÁSI MARIKA NÉNI 1-KATTINTÁSOS MOBIL GOMB */}
              <button
                type="button"
                disabled={loading}
                onClick={handleQuickWater}
                className="w-full text-base sm:text-sm font-extrabold rounded-2xl py-4 sm:py-3 px-4 flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all transform active:scale-95 border-b-4 border-emerald-800"
              >
                <Droplets className="h-6 w-6 text-emerald-200 shrink-0" />
                <span>🪣 Meglocsoltam! (1 kattintás)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLogModal(true)}
                className="btn-secondary w-full text-xs font-bold rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-ink-700 bg-sand-100 hover:bg-sand-200"
              >
                <Plus className="h-4 w-4 text-ink-500" />
                Részletek / Saját fotó csatolása
              </button>
            </>
          )}
        </div>
      </article>

      {/* Rögzítő Modal */}
      {showLogModal && (
        <Modal
          open={showLogModal}
          onClose={() => setShowLogModal(false)}
          title={`Öntözés rögzítése: ${spot.title}`}
          description="Jegyezd fel az elvégzett öntözést vagy ápolási munkát a közösségi naplóba!"
        >
          {successMsg ? (
            <div className="p-6 text-center space-y-2">
              <CheckCircle2 className="h-12 w-12 text-positive-600 mx-auto animate-bounce" />
              <h3 className="font-display text-lg font-bold text-ink-900">Öntözés sikeresen rögzítve!</h3>
              <p className="text-xs text-ink-600">Köszönjük, hogy gondoskodsz Kőszeg virágairól!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitLog} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-ink-800">Tevékenység Típusa</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="input text-xs"
                >
                  <option value="locsolas">💧 Locsolás &amp; Bőséges Öntözés</option>
                  <option value="gyomlalas">🌱 Gyomlálás &amp; Talajlazítás</option>
                  <option value="ultetes">🌸 Újraültetés / Növénypótlás</option>
                  <option value="tisztitas">🧹 Kaspó &amp; Környezet Takarítása</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink-800">Kihelyezett Vízmennyiség (Liter)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={waterLiters}
                    onChange={(e) => setWaterLiters(e.target.value)}
                    className="input text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-ink-800">Gondozó Neve *</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Pl. Marika néni"
                    className="input text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink-800">Megjegyzés / Tapasztalat (Opcionális)</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Pl. Bőséges öntözést kapott, a virágok gyönyörűen hajtanak..."
                  className="input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink-800 flex items-center gap-1 text-xs">
                  <Camera className="h-4 w-4 text-emerald-700" />
                  <span>📸 Készíts szelfit / fotót az öntözésről!</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPhotoUrl(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="input text-xs p-2.5 w-full rounded-xl border border-sand-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-extrabold file:bg-emerald-100 file:text-emerald-900"
                />
                {photoUrl && (
                  <div className="mt-2 relative h-28 w-full rounded-xl overflow-hidden border border-emerald-300 shadow-xs">
                    <img src={photoUrl} alt="Szelfi / öntözési fotó" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="btn-secondary text-xs font-bold"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary text-xs font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {loading ? 'Mentés…' : 'Rögzítés a Naplóba'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </>
  );
};
