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
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const calculateHoursSinceWatered = () => {
    if (!spot.last_watered_at) return 999;
    const diffMs = Date.now() - new Date(spot.last_watered_at).getTime();
    return Math.floor(diffMs / (1000 * 60 * 60));
  };

  const hoursAgo = calculateHoursSinceWatered();
  const isFresh = hoursAgo < 24;

  const handleSubmitLog = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addFlowerLog({
        spot_id: spot.id,
        user_name: profile?.full_name || user?.email?.split('@')[0] || 'Kőszegi Önkéntes',
        action_type: actionType,
        water_liters: Number(waterLiters),
        notes: notes,
        photo_url: photoUrl || spot.photo_url,
        water_count_this_month: spot.water_count_this_month || 0
      });
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setShowLogModal(false);
        setNotes('');
        if (onLogAdded) onLogAdded();
      }, 1200);
    } catch (err) {
      alert('Hiba történt a mentés során: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickWater = async () => {
    setLoading(true);
    try {
      await addFlowerLog({
        spot_id: spot.id,
        user_name: profile?.full_name || user?.email?.split('@')[0] || 'Kőszegi Virágangyal',
        action_type: 'locsolas',
        water_liters: 10,
        notes: 'Gyors 1-kattintásos öntözés',
        photo_url: spot.photo_url,
        water_count_this_month: spot.water_count_this_month || 0
      });
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        if (onLogAdded) onLogAdded();
      }, 1800);
    } catch (err) {
      alert('Hiba történt az öntözés rögzítésekor: ' + err.message);
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
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-md bg-white/95 text-ink-900 backdrop-blur-xs">
              <MapPin className="h-3.5 w-3.5 text-wine-600" />
              {spot.location_name}
            </div>

            {/* Öntözési állapot jelvény */}
            <div
              className={`absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold shadow-lg text-white ${
                isFresh ? 'bg-emerald-600' : 'bg-amber-600 animate-pulse'
              }`}
            >
              <Droplets className="h-4 w-4" />
              {hoursAgo < 1
                ? '🟢 Épp most öntözve'
                : hoursAgo < 24
                ? `🟢 ${hoursAgo} órája öntözve`
                : `🚨 ${Math.floor(hoursAgo / 24)} napja szomjas!`}
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

        {/* Akció gombok: Marika néni 1-kattintásos gyors gomb + részletes gomb */}
        <div className="p-5 pt-0 space-y-2">
          {successMsg ? (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold text-center flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              🌸 Köszönjük! Az öntözést elmentettük!
            </div>
          ) : (
            <>
              {/* ÓRIÁSI MARIKA NÉNI 1-KATTINTÁSOS GOMB */}
              <button
                type="button"
                disabled={loading}
                onClick={handleQuickWater}
                className="w-full btn-primary text-sm font-extrabold rounded-xl py-3 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition-all transform active:scale-98"
              >
                <Droplets className="h-5 w-5 text-emerald-200" />
                🪣 Meglocsoltam! (1 kattintás)
              </button>

              <button
                type="button"
                onClick={() => setShowLogModal(true)}
                className="btn-secondary w-full text-xs font-bold rounded-xl py-1.5 flex items-center justify-center gap-1.5 text-ink-600"
              >
                <Plus className="h-3.5 w-3.5" />
                Részletek / Fotó feltöltése
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
                  <label className="font-bold text-ink-800">Gondozó Neve</label>
                  <input
                    type="text"
                    readOnly
                    value={profile?.full_name || user?.email?.split('@')[0] || 'Kőszegi Önkéntes'}
                    className="input text-xs bg-sand-100 font-semibold"
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
                <label className="font-bold text-ink-800 flex items-center gap-1">
                  <Camera className="h-3.5 w-3.5 text-wine-600" />
                  Fotó URL (Opcionális bizonyító fotó)
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="input text-xs"
                />
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
