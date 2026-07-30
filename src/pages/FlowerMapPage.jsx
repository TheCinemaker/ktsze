import React, { useState } from 'react';
import { Droplets, Sparkles, Trophy, Search, MapPin, Calendar, Heart, ShieldCheck, Plus, Clock } from 'lucide-react';
import { listFlowerSpots, listFlowerLogs, getFlowerStats, createFlowerSpot } from '../lib/db';
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

      {/* 1. Élő Öntözési Statisztikák & Ranglista */}
      <section className="grid gap-6 md:grid-cols-4">
        <div className="card p-6 border border-sand-300 bg-white space-y-2">
          <div className="flex items-center justify-between text-wine-700">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-500">Gondozott Pontok</span>
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="font-display text-3xl font-bold text-ink-900">{stats?.totalSpots || 0} db</div>
          <p className="text-xs text-ink-600">Örökbefogadott kaspó &amp; virágláda</p>
        </div>

        <div className="card p-6 border border-sand-300 bg-white space-y-2">
          <div className="flex items-center justify-between text-positive-600">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-500">E Havi Öntözések</span>
            <Droplets className="h-5 w-5" />
          </div>
          <div className="font-display text-3xl font-bold text-ink-900">{stats?.totalWateringsThisMonth || 0} alkalom</div>
          <p className="text-xs text-ink-600">Dokumentált gondozás a hónapban</p>
        </div>

        <div className="card p-6 border border-sand-300 bg-white space-y-2">
          <div className="flex items-center justify-between text-gold-600">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-500">Kihelyezett Víz</span>
            <Droplets className="h-5 w-5" />
          </div>
          <div className="font-display text-3xl font-bold text-ink-900">{stats?.totalLiters || 0} Liter</div>
          <p className="text-xs text-ink-600">Összesen kijuttatott öntözővíz</p>
        </div>

        <div className="card p-6 border border-wine-200 bg-wine-50/50 space-y-2">
          <div className="flex items-center justify-between text-wine-800">
            <span className="text-xs font-bold uppercase tracking-wider text-wine-900">Legszorgalmasabb Öntöző</span>
            <Trophy className="h-5 w-5 text-gold-500" />
          </div>
          <div className="font-display text-lg font-bold text-wine-900 truncate">
            {stats?.leaderboard?.[0]?.name || 'Kőszegi Vállalkozók'}
          </div>
          <p className="text-xs text-wine-700 font-medium">
            {stats?.leaderboard?.[0]?.count ? `${stats.leaderboard[0].count} rögzített öntözés` : 'Példamutató városszépítés'}
          </p>
        </div>
      </section>

      {/* Keresés & Admin Új Kaspó Hozzáadása */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-sand-100 border border-sand-300">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Keresés helyszín, kaspó neve vagy örökbefogadó alapján…"
            className="input pl-9 text-xs"
          />
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowAddSpotModal(true)}
            className="btn-primary btn-sm text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Új Kaspó / Virágágyás Rögzítése
          </button>
        )}
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

      {/* Admin modal új kaspó felvételéhez */}
      {showAddSpotModal && (
        <Modal
          open={showAddSpotModal}
          onClose={() => setShowAddSpotModal(false)}
          title="Új Virágos Pont / Kaspó Rögzítése"
          description="Adja meg a kaspó vagy virágláda helyét és örökbefogadóját!"
        >
          <form onSubmit={handleCreateSpot} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-ink-800">Kaspó / Virágláda Megnevezése</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Pl. Fő tér 4. sz. Virágláda — Cukrászda előtt"
                className="input text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-ink-800">Helyszín</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Pl. Fő tér déli oldal"
                  className="input text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-ink-800">Örökbefogadó Neve / Cége</label>
                <input
                  type="text"
                  value={newAdopter}
                  onChange={(e) => setNewAdopter(e.target.value)}
                  placeholder="Pl. Kőszegi Cukrászda Kft."
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
              <label className="font-bold text-ink-800">Fotó URL</label>
              <input
                type="url"
                value={newPhoto}
                onChange={(e) => setNewPhoto(e.target.value)}
                placeholder="https://..."
                className="input text-xs"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-sand-200">
              <button
                type="button"
                onClick={() => setShowAddSpotModal(false)}
                className="btn-secondary text-xs font-bold"
              >
                Mégse
              </button>
              <button
                type="submit"
                disabled={submittingSpot}
                className="btn-primary text-xs font-bold"
              >
                {submittingSpot ? 'Mentés…' : 'Kaspó Létrehozása'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
