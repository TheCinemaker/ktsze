import React, { useState, useEffect } from 'react';
import { Droplets, Sparkles, Trophy, Search, MapPin, Calendar, Heart, ShieldCheck, Plus, Clock } from 'lucide-react';
import { listFlowerSpots, listFlowerLogs, getFlowerStats, createFlowerSpot } from '../lib/db';
import { supabase } from '../lib/supabaseClient';
import { useAsyncData } from '../lib/useAsyncData';
import { PageHeader, LoadingBlock, ErrorBlock, Modal } from '../components/ui';
import { SEO } from '../components/ui/SEO';
import { FlowerSpotCard } from '../components/public/FlowerSpotCard';
import { useAuth } from '../context/AuthContext';

export const FlowerMapPage = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.roles?.includes('admin');

  const { data: spots, loading: spotsLoading, error, reload } = useAsyncData(listFlowerSpots);
  const { data: stats, reload: reloadStats } = useAsyncData(getFlowerStats);
  const { data: logs, reload: reloadLogs } = useAsyncData(() => listFlowerLogs());

  // FULL REALTIME ELŐFIZETÉS: Ha bárki meglocsol egy virágot, az az összes látogató telefonján azonnal élőben frissül!
  useEffect(() => {
    const channel = supabase
      .channel('flower_realtime_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flower_spots' }, () => {
        reload();
        reloadStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flower_logs' }, () => {
        reloadLogs();
        reloadStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reload, reloadStats, reloadLogs]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSpotModal, setShowAddSpotModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newAdopter, setNewAdopter] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPhoto, setNewPhoto] = useState('');
  const [submittingSpot, setSubmittingSpot] = useState(false);

  const flowerSpots = spots || [];
  const flowerLogs = (logs || []).slice(0, 10); // 10 legfrissebb log

  const filteredSpots = flowerSpots.filter(
    (spot) =>
      spot.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.location_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.adopter_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefreshData = () => {
    reload();
    reloadStats();
    reloadLogs();
  };

  const handleCreateSpot = async (e) => {
    e.preventDefault();
    setSubmittingSpot(true);
    try {
      await createFlowerSpot({
        title: newTitle,
        location_name: newLocation,
        adopter_name: newAdopter,
        description: newDesc,
        photo_url: newPhoto
      });
      setShowAddSpotModal(false);
      setNewTitle('');
      setNewLocation('');
      setNewAdopter('');
      setNewDesc('');
      setNewPhoto('');
      handleRefreshData();
    } catch (err) {
      alert('Hiba történt a kaspó hozzáadásakor: ' + err.message);
    } finally {
      setSubmittingSpot(false);
    }
  };

  return (
    <div className="container-page py-12 sm:py-16 space-y-12">
      <SEO
        title="Kőszeg Virágzik — Okos Kaspó & Virágágyás Örökbefogadás"
        description="Tekintse meg Kőszeg örökbefogadott főtéri kaspóit, virágládáit és az öntözési naplót. Fogadj örökbe egy kaspót és tegyél Kőszeg szépségéért!"
      />

      <PageHeader
        eyebrow="Városszépítő & Közösségi Kezdeményezés"
        title="Kőszeg Virágzik"
        description="„Kőszeg virágzik - a város tisztul, szépül, él és újra vendéget vár.” Fogadj örökbe egy főtéri kaspót, vezesd az öntözési naplót és építsük együtt Kőszeg arculatát!"
      />

      {/* 0. Hivatalos VÍZADÁS Felhívás Banner */}
      <section className="rounded-3xl border border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-sand-100 p-6 sm:p-8 shadow-md overflow-hidden relative space-y-6">
        <div className="grid gap-6 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700 text-white font-extrabold text-xs shadow-xs">
              <Droplets className="h-4 w-4 text-emerald-200" />
              ÖNKÉNTES FAÖNTÖZÉS — „VÍZADÁS” KŐSZEGEN 🌳🚿
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-900 leading-tight">
              Segítsünk Kőszeg szomjazó fáinak a kánikulában!
            </h2>

            <div className="text-xs sm:text-sm text-ink-800 space-y-2 leading-relaxed bg-white/80 p-4 rounded-2xl border border-emerald-200 shadow-xs">
              <p>
                <strong>Pintér Gábor főkertész és Básthy Béla polgármester</strong> felhívása minden segítő szándékú kőszegihez: a házatok előtt, vagy közelében található fákat segítsétek öntözéssel a hőség idején!
              </p>
              <p>
                💡 <strong>Szakkifejezett jótanács:</strong> Leginkább a fiatal, 15 cm alatti törzsátmérőjű fák igénylik a locsolást. A törzs körül kialakított 1–1,5 méter átmérőjű tányér segít a vizet helyben tartani. Alkalmanként <strong>30–50 liter vizet</strong> érdemes a tányérba leszivárogtatni!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowAddSpotModal(true)}
                className="btn-primary text-xs font-extrabold rounded-xl py-3 px-5 flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-md"
              >
                <Plus className="h-4 w-4" />
                🌳 Új Fa Regisztrálása &amp; Öntözése (Utca &amp; Házszám)
              </button>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://ktsze.hu/viragos-koszeg')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs font-bold rounded-xl py-3 px-4 flex items-center gap-2 border-blue-300 text-blue-900 bg-blue-50 hover:bg-blue-100"
              >
                📢 Megosztom Facebookon (#VízadásKőszeg)
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center items-center">
            <img
              src="/vizadas_photo.jpg"
              alt="Önkéntes faöntözés Vízadás Kőszeg"
              className="rounded-2xl object-cover h-64 w-full shadow-lg border-2 border-white"
            />
          </div>
        </div>
      </section>

      {/* 1. Élő Öntözési Statisztikák & Ranglista */}
      <section className="grid gap-6 md:grid-cols-4">
        <div className="card p-6 border border-sand-300 bg-white space-y-2">
          <div className="flex items-center justify-between text-wine-700">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-500">Gondozott Fák &amp; Kaspók</span>
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="font-display text-3xl font-bold text-ink-900">{stats?.totalSpots || 0} db</div>
          <p className="text-xs text-ink-600">Nyilvántartott növény &amp; fafa</p>
        </div>

        <div className="card p-6 border border-sand-300 bg-white space-y-2">
          <div className="flex items-center justify-between text-positive-600">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-500">E Havi Vízadások</span>
            <Droplets className="h-5 w-5 text-blue-600" />
          </div>
          <div className="font-display text-3xl font-bold text-ink-900">{stats?.totalWateringsThisMonth || 0} alkalom</div>
          <p className="text-xs text-ink-600">Dokumentált vízadás a hónapban</p>
        </div>

        <div className="card p-6 border border-sand-300 bg-white space-y-2">
          <div className="flex items-center justify-between text-gold-600">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-500">Kijuttatott Öntözővíz</span>
            <Droplets className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="font-display text-3xl font-bold text-ink-900">{stats?.totalLiters || 0} Liter</div>
          <p className="text-xs text-ink-600">Kőszeg szomjazó fáinak megmentésére</p>
        </div>

        <div className="card p-6 border border-wine-200 bg-wine-50/50 space-y-2">
          <div className="flex items-center justify-between text-wine-800">
            <span className="text-xs font-bold uppercase tracking-wider text-wine-900">Legszorgalmasabb Vízadó</span>
            <Trophy className="h-5 w-5 text-gold-500" />
          </div>
          <div className="font-display text-lg font-bold text-wine-900 truncate">
            {stats?.leaderboard?.[0]?.name || 'Kőszegi Polgárok'}
          </div>
          <p className="text-xs text-wine-700 font-medium">
            {stats?.leaderboard?.[0]?.count ? `${stats.leaderboard[0].count} rögzített vízadás` : 'Példamutató városszépítés'}
          </p>
        </div>
      </section>

      {/* Keresés Utca & Házszám Alapján & Új Fa Rögzítése */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-sand-100 border border-sand-300">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Keresés Utca, Házszám vagy Öntöző neve alapján (pl. Jurisics tér 8.)…"
            className="input pl-9 text-xs"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAddSpotModal(true)}
          className="btn-primary btn-sm text-xs font-extrabold flex items-center gap-1.5 shadow-xs bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          <Plus className="h-4 w-4" />
          + Új Fa / Kaspó Regisztrálása
        </button>
      </div>

      {/* 2. Virágos Pontok Kártyái */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink-900">Örökbefogadott Virágos Pontjaink</h2>
          <span className="text-xs text-ink-500 font-semibold">{filteredSpots.length} kijelölt pont</span>
        </div>

        {spotsLoading && <LoadingBlock />}
        {error && <ErrorBlock message={error} onRetry={reload} />}

        {!spotsLoading && !error && filteredSpots.length === 0 && (
          <div className="rounded-2xl border border-dashed border-sand-400 p-8 text-center text-sm text-ink-600">
            Nem található a keresésnek megfelelő virágos pont.
          </div>
        )}

        {!spotsLoading && !error && filteredSpots.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSpots.map((spot) => (
              <FlowerSpotCard key={spot.id} spot={spot} onLogAdded={handleRefreshData} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Legfrissebb Öntözési Naplóbejegyzések (Idővonal) */}
      <section className="pt-8 border-t border-sand-300 space-y-6">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-wine-600" />
          <h2 className="font-display text-2xl text-ink-900">Legfrissebb Gondozási &amp; Öntözési Bejegyzések</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {flowerLogs.map((log) => (
            <div key={log.id} className="p-4 rounded-2xl bg-white border border-sand-300 flex gap-4 items-start shadow-xs">
              {log.photo_url ? (
                <img
                  src={log.photo_url}
                  alt={log.user_name}
                  className="h-16 w-16 rounded-xl object-cover border border-sand-200 shrink-0"
                />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-wine-100 flex items-center justify-center text-wine-700 shrink-0 font-bold">
                  <Droplets className="h-7 w-7" />
                </div>
              )}

              <div className="space-y-1 text-xs text-ink-800 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-ink-900 truncate">{log.user_name}</span>
                  <span className="text-[11px] text-ink-500 font-semibold">
                    {new Date(log.created_at).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="inline-block rounded-md bg-sand-100 text-wine-800 px-2 py-0.5 text-[11px] font-bold">
                  {log.action_type === 'locsolas'
                    ? `💧 Locsolás (${log.water_liters || 15}L vízzel)`
                    : log.action_type === 'gyomlalas'
                    ? '🌱 Gyomlálás'
                    : '🌸 Virággondozás'}
                </div>

                {log.notes && <p className="text-ink-600 italic leading-snug truncate">{log.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Új Fa vagy Kaspó felvételéhez Utca & Házszám alapján */}
      {showAddSpotModal && (
        <Modal
          open={showAddSpotModal}
          onClose={() => setShowAddSpotModal(false)}
          title="🌳 Új Fa / Kaspó Bejelentése (Utca & Házszám)"
          description="Azonosítsd be a fát vagy kaspót a pontos utca és házszám megadásával, hogy a szomszédok és a kőszegiek is megtalálják és öntözhessék!"
        >
          <form onSubmit={handleCreateSpot} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-ink-800">Utca &amp; Házszám / Pontos Helyszín *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Pl. Jurisics tér 8. (Városháza előtt) vagy Kecskeméti u. 14."
                className="input text-xs font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-ink-800">Városrész / Övezet *</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Pl. Belváros / Jurisics tér"
                  className="input text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-ink-800">Első Vízadó / Örökbefogadó Neve *</label>
                <input
                  type="text"
                  value={newAdopter}
                  onChange={(e) => setNewAdopter(e.target.value)}
                  placeholder="Pl. Marika néni vagy Kovács family"
                  className="input text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-ink-800">Leírás &amp; Növények Fajtája</label>
              <textarea
                rows="2"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Pl. Piros muskátli és fehér petúnia kompozíció"
                className="input text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-ink-800 flex items-center gap-1.5 text-xs">
                <Camera className="h-4 w-4 text-emerald-700" />
                <span>📸 Kép Készítése a Fáról / Képgaléria Válostó (Mobil kamera)</span>
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
                      setNewPhoto(reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="input text-xs p-3 w-full rounded-xl border border-sand-300 file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-emerald-100 file:text-emerald-900 hover:file:bg-emerald-200"
              />
              {newPhoto && (
                <div className="mt-2 relative h-36 w-full rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-md">
                  <img src={newPhoto} alt="Kiválasztott fa fotó" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-sand-200">
              <button
                type="button"
                onClick={() => setShowAddSpotModal(false)}
                className="btn-secondary text-xs font-bold py-2.5 px-4 rounded-xl"
              >
                Mégse
              </button>
              <button
                type="submit"
                disabled={submittingSpot}
                className="btn-primary text-xs font-extrabold py-3 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-md"
              >
                {submittingSpot ? 'Mentés…' : '🌳 Fa / Kaspó Rögzítése'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
