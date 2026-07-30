import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Droplets, Search, MapPin, Plus, Clock, Camera, Map, List, Trash2, Film } from 'lucide-react';
import { listFlowerSpots, listFlowerLogs, createFlowerSpot, uploadFlowerPhoto, deleteFlowerLog } from '../lib/db';
import { supabase } from '../lib/supabaseClient';
import { useAsyncData } from '../lib/useAsyncData';
import { LoadingBlock, ErrorBlock, Modal } from '../components/ui';
import { SEO } from '../components/ui/SEO';
import { FlowerSpotCard } from '../components/public/FlowerSpotCard';
import { FlowerSpotMap } from '../components/public/FlowerSpotMap';
import { VizadasStoriesModal } from '../components/public/VizadasStoriesModal';
import { VizadasStoryCardModal } from '../components/public/VizadasStoryCardModal';
import { useAuth } from '../context/AuthContext';

export const FlowerMapPage = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.roles?.includes('admin');
  const {
    data: spots,
    loading: spotsLoading,
    refreshing: spotsRefreshing,
    error,
    reload
  } = useAsyncData(listFlowerSpots);
  const { data: logs, reload: reloadLogs } = useAsyncData(() => listFlowerLogs());

  const handleRefreshData = useCallback(() => {
    reload();
    reloadLogs();
  }, [reload, reloadLogs]);

  // Realtime: ha bárki meglocsol egy fát, az mindenki telefonján frissül.
  //
  // Az események sűrű sorozatban is jöhetnek (egy öntözés két táblát ír), ezért
  // nem indítunk minden eseményre külön kérést, hanem 400 ms-ra összevárjuk
  // őket — így nem lesz 4-5 párhuzamos lekérés egyetlen locsolásból.
  const refreshTimer = useRef(null);
  useEffect(() => {
    const scheduleRefresh = () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(handleRefreshData, 400);
    };

    const channel = supabase
      .channel('flower_realtime_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flower_spots' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flower_logs' }, scheduleRefresh)
      .subscribe((status) => {
        // Ha ez nem 'SUBSCRIBED', akkor a táblák nincsenek a supabase_realtime
        // publikációban (lásd supabase/18_flower_spots_full_schema.sql 7. pont).
        if (status !== 'SUBSCRIBED') console.warn('[vizadas] Realtime csatorna állapota:', status);
      });

    // Tartalék, ha a realtime nem él: amikor a látogató visszatér a laphoz,
    // egyszer frissítünk. Ez fedi le a "más telefonján történt" öntözéseket is.
    const onVisible = () => {
      if (document.visibilityState === 'visible') scheduleRefresh();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(channel);
    };
  }, [handleRefreshData]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, thirsty, street
  const [viewMode, setViewMode] = useState('list'); // list (alapértelmezett), map
  const [showAddSpotModal, setShowAddSpotModal] = useState(false);
  const [showStoriesModal, setShowStoriesModal] = useState(false);
  const [createdStoryData, setCreatedStoryData] = useState(null);
  const [selectedSpotForModal, setSelectedSpotForModal] = useState(null);
  const [bannerCollapsed, setBannerCollapsed] = useState(() => {
    try {
      return localStorage.getItem('ktsze_banner_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  const [newTitle, setNewTitle] = useState('');
  const [newAdopter, setNewAdopter] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPhoto, setNewPhoto] = useState('');
  const [newPhotoUploading, setNewPhotoUploading] = useState(false);
  const [newLat, setNewLat] = useState(null);
  const [newLng, setNewLng] = useState(null);
  const [newGpsLoading, setNewGpsLoading] = useState(false);
  const [spotError, setSpotError] = useState('');
  const [submittingSpot, setSubmittingSpot] = useState(false);

  /** Az űrlap fotója azonnal a tárolóba megy; a táblába csak az URL kerül. */
  const handleNewPhotoPick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSpotError('');
    setNewPhotoUploading(true);
    try {
      setNewPhoto(await uploadFlowerPhoto(file));
    } catch (err) {
      setNewPhoto('');
      setSpotError(err.message);
    } finally {
      setNewPhotoUploading(false);
    }
  };

  const toggleBanner = () => {
    const next = !bannerCollapsed;
    setBannerCollapsed(next);
    try {
      localStorage.setItem('ktsze_banner_collapsed', String(next));
    } catch {}
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('A böngésző nem támogatja a GPS helymeghatározást.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setGpsLoading(false);
        // Gördítés a fákhoz
        const el = document.getElementById('flower-spots-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      },
      (err) => {
        setGpsLoading(false);
        alert('Nem sikerült lekérni a GPS pozíciót: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const flowerSpots = spots || [];
  const flowerLogs = (logs || []).slice(0, 10);

  // Szűrt fák listája
  const query = searchQuery.trim().toLowerCase();
  const filteredSpots = flowerSpots.filter((spot) => {
    const queryMatch =
      !query ||
      spot.title?.toLowerCase().includes(query) ||
      spot.location_name?.toLowerCase().includes(query) ||
      spot.adopter_name?.toLowerCase().includes(query);

    if (!queryMatch) return false;

    if (activeFilter === 'thirsty') {
      if (!spot.last_watered_at) return true;
      const diffHours = (Date.now() - new Date(spot.last_watered_at).getTime()) / (1000 * 60 * 60);
      return diffHours >= 24; // 24 óránál régebben öntözött
    }
    return true;
  });

  // A "Közelemben" gomb után a rögzített GPS koordináták alapján a legközelebbi
  // fák jönnek előre. Koordináta nélküli fák a lista végére kerülnek.
  if (userCoords) {
    const distanceFrom = (spot) => {
      if (!Number.isFinite(spot.latitude) || !Number.isFinite(spot.longitude)) return Number.MAX_SAFE_INTEGER;
      const dLat = spot.latitude - userCoords.lat;
      const dLng = (spot.longitude - userCoords.lng) * Math.cos((userCoords.lat * Math.PI) / 180);
      return dLat * dLat + dLng * dLng; // négyzetes távolság: rendezéshez elég
    };
    filteredSpots.sort((a, b) => distanceFrom(a) - distanceFrom(b));
  }

  const handleCreateSpot = async (e) => {
    e.preventDefault();
    setSubmittingSpot(true);
    setSpotError('');
    try {
      await createFlowerSpot({
        title: newTitle,
        location_name: newTitle,
        adopter_name: newAdopter,
        description: newDesc,
        photo_url: newPhoto,
        latitude: newLat,
        longitude: newLng
      });
      setShowAddSpotModal(false);
      setNewTitle('');
      setNewAdopter('');
      setNewDesc('');
      setNewPhoto('');
      setNewLat(null);
      setNewLng(null);
      handleRefreshData();
    } catch (err) {
      setSpotError(err.message);
    } finally {
      setSubmittingSpot(false);
    }
  };

  return (
    <div className="container-page py-6 sm:py-12 space-y-8">
      <SEO
        title="Kőszeg Virágzik — Önkéntes Vízadás & Faöntözés"
        description="Segítsük Kőszeg szomjazó fáit a hőségben! Önkéntes faöntözési térkép és regisztráció utca & házszám alapján."
      />

      {/* MOBIL GYORS GOMB BAR (Viszi a usert egyenesen a fákhoz!) */}
      <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-emerald-900 text-white shadow-lg sm:hidden sticky top-[68px] z-30">
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('flower-spots-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex-1 font-extrabold text-xs py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Droplets className="h-4 w-4" />
          Ugrás a fákhoz (locsolás)
        </button>

        <button
          type="button"
          onClick={handleGetLocation}
          disabled={gpsLoading}
          className="font-bold text-xs py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-1.5 border border-white/20"
        >
          <MapPin className="h-4 w-4 text-emerald-300" />
          {gpsLoading ? 'GPS…' : 'Közelemben'}
        </button>
      </div>

      {/* TÁJÉKOZTATÓ BANNER (Összecsukható a visszatérő usereknek!) */}
      {bannerCollapsed ? (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-emerald-700 shrink-0" />
            <span>ÖNKÉNTES FAÖNTÖZÉS — „VÍZADÁS” KŐSZEGEN</span>
          </div>
          <button
            type="button"
            onClick={toggleBanner}
            className="text-xs text-emerald-800 hover:text-emerald-950 underline font-extrabold"
          >
            Tájékoztató megnyitása
          </button>
        </div>
      ) : (
        <section className="rounded-3xl border border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-sand-100 p-5 sm:p-8 shadow-md overflow-hidden relative space-y-4">
          <div className="flex justify-between items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800 text-white font-extrabold text-xs shadow-xs border border-emerald-600">
              <img src="/koszeg_cimer.png" alt="Kőszeg Város Címere" className="h-5 w-auto object-contain" />
              <span>ÖNKÉNTES FAÖNTÖZÉS — „VÍZADÁS” KŐSZEGEN</span>
            </div>

            <button
              type="button"
              onClick={toggleBanner}
              className="text-xs font-bold text-ink-500 hover:text-ink-900 bg-sand-200/80 px-2.5 py-1 rounded-lg"
            >
              Tájékoztató elrejtése
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-12 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h2 className="font-display text-xl sm:text-3xl font-extrabold text-ink-900 leading-tight">
                Segítsünk Kőszeg szomjazó fáinak a kánikulában!
              </h2>

              <div className="text-xs sm:text-sm text-ink-800 space-y-2 leading-relaxed bg-white/80 p-4 rounded-2xl border border-emerald-200 shadow-xs">
                <p>
                  <strong>Pintér Gábor főkertész és Básthy Béla polgármester</strong> felhívása minden segítő szándékú kőszegihez: a házatok előtt, vagy közelében található fákat segítsétek öntözéssel a hőség idején!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddSpotModal(true)}
                  className="btn-primary text-xs font-extrabold rounded-xl py-3 px-5 flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Új Fa Regisztrálása (Utca &amp; Házszám)
                </button>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://ktsze.hu/viragos-koszeg')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs font-bold rounded-xl py-3 px-4 flex items-center gap-2 border-blue-300 text-blue-900 bg-blue-50 hover:bg-blue-100"
                >
                  Megosztom Facebookon (#VízadásKőszeg)
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center items-center">
              <img
                src="/vizadas_photo.jpg"
                alt="Önkéntes faöntözés Vízadás Kőszeg"
                className="rounded-2xl object-cover h-48 sm:h-56 w-full shadow-lg border-2 border-white"
              />
            </div>
          </div>
        </section>
      )}

      {/* 0.5. Főkertészi Öntözési Kisokos — Mikor és hogyan öntözzünk? */}
      <section className="p-5 sm:p-6 rounded-2xl bg-amber-50/80 border border-amber-200 text-ink-900 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
          <Clock className="h-5 w-5 text-amber-700" />
          <h3>Főkertészi Öntözési Kisokos — mikor a legjobb öntözni?</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-white border border-amber-200 space-y-1 shadow-2xs">
            <div className="font-extrabold text-emerald-800 flex items-center gap-1.5">
              <span>Kora reggel (6:00 – 9:00)</span>
            </div>
            <p className="text-ink-700 text-xs leading-relaxed">
              A LEGJOBB időpont! A talaj még hűvös, a víz mélyre szivárog a gyökerekhez, és felkészíti a fát a napközbeni hőségre.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-amber-200 space-y-1 shadow-2xs">
            <div className="font-extrabold text-indigo-900 flex items-center gap-1.5">
              <span>Késő este (18:00 – 21:00)</span>
            </div>
            <p className="text-ink-700 text-xs leading-relaxed">
              Kiváló választás! Éjszaka nincs párolgás, így a növény bőségesen fel tudja venni az öntözővizet a földből.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1 shadow-2xs">
            <div className="font-extrabold text-rose-900 flex items-center gap-1.5">
              <span>Tűző napon (11:00 – 16:00) NE!</span>
            </div>
            <p className="text-rose-950 text-xs leading-relaxed">
              Déli tűző napon a víz 80%-a elpárolog, a vízcseppek pedig megégethetik a leveleket. Ilyenkor érdemes megvárni az estét!
            </p>
          </div>
        </div>
      </section>

      {/* PROMOTIONAL CARD: VÍZADÁS STORIES & REELS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-900 via-rose-950 to-emerald-950 text-white shadow-lg border border-rose-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shrink-0">
            <Film className="h-7 w-7 text-rose-300 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white">
              Vízadás Stories &amp; Szelfi Reels
            </h3>
            <p className="text-xs text-rose-200 leading-snug">
              Nézd meg Kőszeg polgárainak legújabb öntözési szelfijeit és élménybeszámolóit!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowStoriesModal(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md transition-transform active:scale-95 shrink-0 flex items-center justify-center gap-2"
        >
          <span>📸 Stories Megnyitása</span>
        </button>
      </div>

      {/* Keresés Utca & Házszám Alapján & Új Fa Rögzítése */}
      <div id="flower-spots-section" className="p-4 sm:p-5 rounded-2xl bg-sand-100 border border-sand-300 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Keresés Utca, Házszám vagy Öntöző neve alapján (pl. Jurisics tér 8.)…"
              className="input pl-9 text-xs font-bold"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Vízadás Stories / Reels Gomb */}
            <button
              type="button"
              onClick={() => setShowStoriesModal(true)}
              className="btn-secondary btn-sm text-xs font-extrabold flex items-center gap-1.5 border-rose-300 text-rose-950 bg-rose-50 hover:bg-rose-100 shadow-xs"
            >
              <Film className="h-4 w-4 text-rose-600" />
              Vízadás Stories
            </button>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gpsLoading}
              className="btn-secondary btn-sm text-xs font-bold flex items-center gap-1.5 border-emerald-300 text-emerald-900 bg-emerald-50 hover:bg-emerald-100"
            >
              <MapPin className="h-4 w-4 text-emerald-700" />
              {gpsLoading ? 'GPS Keresés…' : 'GPS Helyzetem'}
            </button>

            <button
              type="button"
              onClick={() => setShowAddSpotModal(true)}
              className="btn-primary btn-sm text-xs font-extrabold flex items-center gap-1.5 shadow-xs bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              <Plus className="h-4 w-4" />
              + Új Fa Regisztrálása
            </button>
          </div>
        </div>
      </div>

      {/* 2. Rögzített Növények (Térkép / Lista Nézetváltóval) */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-ink-900 font-extrabold">Rögzített növények</h2>
            <span className="text-xs text-ink-500 font-semibold">
              {filteredSpots.length} regisztrált növény
              {spotsRefreshing && <span className="ml-2 text-emerald-700">frissítés…</span>}
            </span>
          </div>

          {/* Nézetváltó Gombok: Térkép vs Lista */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-sand-200 border border-sand-300">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                viewMode === 'map'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-ink-700 hover:text-ink-900 hover:bg-sand-100'
              }`}
            >
              <Map className="h-4 w-4" />
              Térkép nézet
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                viewMode === 'list'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-ink-700 hover:text-ink-900 hover:bg-sand-100'
              }`}
            >
              <List className="h-4 w-4" />
              Lista nézet
            </button>
          </div>
        </div>

        {spotsLoading && <LoadingBlock />}
        {error && <ErrorBlock message={error} onRetry={reload} />}

        {!spotsLoading && !error && filteredSpots.length === 0 && (
          <div className="rounded-2xl border border-dashed border-sand-400 p-8 text-center text-sm text-ink-600">
            Nem található a keresésnek megfelelő rögzített növény.
          </div>
        )}

        {/* INTERAKTÍV LEAFLET TÉRKÉP NÉZET */}
        {!spotsLoading && viewMode === 'map' && (
          <FlowerSpotMap
            spots={filteredSpots}
            userCoords={userCoords}
            onLogAdded={handleRefreshData}
            onOpenLogModal={(spot) => setSelectedSpotForModal(spot)}
          />
        )}

        {/* LISTA / KÁRTYA NÉZET */}
        {!spotsLoading && (viewMode === 'list' || filteredSpots.length === 0) && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSpots.map((spot) => (
              <FlowerSpotCard
                key={spot.id}
                spot={spot}
                onLogAdded={handleRefreshData}
                onStoryCreated={(storyData) => setCreatedStoryData(storyData)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. Legfrissebb Gondozások */}
      <section className="pt-6 border-t border-sand-300 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-emerald-700" />
          <h3 className="font-display text-lg font-bold text-ink-900">Legfrissebb Gondozások</h3>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
          {flowerLogs.map((log) => (
            <div key={log.id} className="p-3 rounded-xl bg-white border border-sand-200 flex items-center gap-3 shadow-2xs">
              {log.photo_url ? (
                <img
                  src={log.photo_url}
                  alt={log.user_name}
                  className="h-10 w-10 rounded-lg object-cover border border-sand-200 shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 font-bold">
                  <Droplets className="h-5 w-5" />
                </div>
              )}

              <div className="min-w-0 flex-1 text-xs space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-ink-900 truncate text-[11px]">
                    {log.user_name && log.user_name !== 'Kőszegi Önkéntes' ? log.user_name : 'Önkéntes Vízadó'}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-ink-400 font-semibold">
                      {new Date(log.created_at).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm('Admin: Törlöd ezt a bejegyzést?')) {
                            try {
                              await deleteFlowerLog(log.id);
                              handleRefreshData();
                            } catch (err) {
                              alert('Törlési hiba: ' + err.message);
                            }
                          }
                        }}
                        className="text-rose-600 hover:text-rose-800 p-0.5"
                        title="Bejegyzés törlése (Admin)"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-emerald-800 truncate">
                  Locsolás
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Új Fa felvételéhez Utca & Házszám alapján */}
      {showAddSpotModal && (
        <Modal
          open={showAddSpotModal}
          onClose={() => setShowAddSpotModal(false)}
          title="Új Fa Regisztrálása (Utca & Házszám)"
          description="Rögzítsd a fát a pontos utca és házszám megadásával, vagy koppints a GPS gombra!"
        >
          <form onSubmit={handleCreateSpot} className="space-y-4 text-xs">
            {/* GPS koordináta (opcionális) — csak a számok mennek a táblába,
                városnevet nem fűzünk a cím elé. */}
            <div className="space-y-1">
              <label className="font-bold text-ink-800">GPS koordináta (Opcionális — térképhez)</label>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={newGpsLoading}
                  onClick={() => {
                    if (!navigator.geolocation) {
                      setSpotError('A böngésző nem támogatja a GPS helymeghatározást.');
                      return;
                    }
                    setNewGpsLoading(true);
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setNewLat(pos.coords.latitude);
                        setNewLng(pos.coords.longitude);
                        setNewGpsLoading(false);
                      },
                      (err) => {
                        setNewGpsLoading(false);
                        setSpotError('A GPS pozíció nem érhető el: ' + err.message);
                      },
                      { enableHighAccuracy: true, timeout: 10000 }
                    );
                  }}
                  className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {newGpsLoading ? 'GPS keresés…' : 'Helyzetem rögzítése GPS-szel'}
                </button>
                {newLat !== null && newLng !== null && (
                  <>
                    <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      {newLat.toFixed(5)}, {newLng.toFixed(5)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewLat(null);
                        setNewLng(null);
                      }}
                      className="text-[11px] font-bold text-ink-500 underline hover:text-ink-800"
                    >
                      Törlés
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Utca & Házszám (kötelező) */}
            <div className="space-y-1">
              <label className="font-bold text-ink-800">Utca &amp; Házszám / Pontos Cím *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Pl. Jurisics tér 8. (Városháza előtt) vagy Kecskeméti u. 14."
                className="input text-xs font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-ink-800">Öntöző / Gondozó Neve (Opcionális)</label>
              <input
                type="text"
                value={newAdopter}
                onChange={(e) => setNewAdopter(e.target.value)}
                placeholder="Hagyd üresen vagy beírhatod a neved..."
                className="input text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-ink-800">Leírás &amp; Fa Fajtája (Opcionális)</label>
              <textarea
                rows="2"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Pl. Fiatal gömbjuhar fa az úttest mellett"
                className="input text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-ink-800 flex items-center gap-1.5 text-xs">
                <Camera className="h-4 w-4 text-emerald-700" />
                <span>Készíts képet a fáról! (Mobil kamera)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleNewPhotoPick}
                className="input text-xs p-3 w-full rounded-xl border border-sand-300 file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-emerald-100 file:text-emerald-900"
              />
              {newPhotoUploading && <p className="text-[11px] font-bold text-emerald-800">Fotó feltöltése…</p>}
              {newPhoto && !newPhotoUploading && (
                <div className="mt-2 relative h-36 w-full rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-md">
                  <img src={newPhoto} alt="Kiválasztott fa fotó" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            {spotError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold whitespace-pre-line">
                {spotError}
              </div>
            )}

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
                disabled={submittingSpot || newPhotoUploading}
                className="btn-primary text-xs font-extrabold py-3 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-md"
              >
                {submittingSpot ? 'Mentés…' : 'Fa Rögzítése'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* FULLSCREEN INSTAGRAM / TIKTOK STÍLUSÚ VÍZADÁS STORIES MODAL */}
      <VizadasStoriesModal
        isOpen={showStoriesModal}
        onClose={() => setShowStoriesModal(false)}
        logs={logs || []}
        onShareStory={(storyData) => setCreatedStoryData(storyData)}
      />

      {/* INSTAGRAM / FB STORY KÁRTYA GENERÁLÓ (KŐSZEG CÍMERREL) */}
      {createdStoryData && (
        <VizadasStoryCardModal
          isOpen={Boolean(createdStoryData)}
          onClose={() => setCreatedStoryData(null)}
          photoUrl={createdStoryData.photoUrl}
          userName={createdStoryData.userName}
          locationName={createdStoryData.locationName}
        />
      )}

      {/* TÉRKÉPRŐL MEGNYITOTT RÉSZLETES ÖNTÖZÉS MODAL */}
      {selectedSpotForModal && (
        <FlowerSpotCard
          key={`map-modal-${selectedSpotForModal.id}`}
          spot={selectedSpotForModal}
          initialOpen={true}
          onLogAdded={handleRefreshData}
          onStoryCreated={(storyData) => {
            setSelectedSpotForModal(null);
            setCreatedStoryData(storyData);
          }}
        />
      )}
    </div>
  );
};
