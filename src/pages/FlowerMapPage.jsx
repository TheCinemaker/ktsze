import React, { useState, useEffect } from 'react';
import { Droplets, Sparkles, Trophy, Search, MapPin, Calendar, Heart, ShieldCheck, Plus, Clock, Camera } from 'lucide-react';
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
  const [activeFilter, setActiveFilter] = useState('all'); // all, thirsty, street
  const [showAddSpotModal, setShowAddSpotModal] = useState(false);
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
  const [newLocation, setNewLocation] = useState('');
  const [newAdopter, setNewAdopter] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPhoto, setNewPhoto] = useState('');
  const [submittingSpot, setSubmittingSpot] = useState(false);

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
  let filteredSpots = flowerSpots.filter((spot) => {
    const queryMatch =
      spot.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.location_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.adopter_name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!queryMatch) return false;

    if (activeFilter === 'thirsty') {
      if (!spot.last_watered_at) return true;
      const diffHours = (Date.now() - new Date(spot.last_watered_at).getTime()) / (1000 * 60 * 60);
      return diffHours >= 24; // 24 óránál régebben öntözött
    }
    return true;
  });

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
      alert('Hiba történt a fa hozzáadásakor: ' + err.message);
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
      <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-emerald-900 text-white shadow-lg sm:hidden sticky top-3 z-30">
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('flower-spots-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex-1 font-extrabold text-xs py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Droplets className="h-4 w-4" />
          ⚡ Ugrás a Fákhoz (Locsolás)
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
            <span>🌳 ÖNKÉNTES FAÖNTÖZÉS — „VÍZADÁS” KŐSZEGEN</span>
          </div>
          <button
            type="button"
            onClick={toggleBanner}
            className="text-xs text-emerald-800 hover:text-emerald-950 underline font-extrabold"
          >
            ℹ️ Tájékoztató megnyitása
          </button>
        </div>
      ) : (
        <section className="rounded-3xl border border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-sand-100 p-5 sm:p-8 shadow-md overflow-hidden relative space-y-4">
          <div className="flex justify-between items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700 text-white font-extrabold text-xs shadow-xs">
              <Droplets className="h-4 w-4 text-emerald-200" />
              ÖNKÉNTES FAÖNTÖZÉS — „VÍZADÁS” KŐSZEGEN 🌳🚿
            </div>

            <button
              type="button"
              onClick={toggleBanner}
              className="text-xs font-bold text-ink-500 hover:text-ink-900 bg-sand-200/80 px-2.5 py-1 rounded-lg"
            >
              ▲ Tájékoztató elrejtése
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
                  🌳 Új Fa Regisztrálása (Utca &amp; Házszám)
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
                className="rounded-2xl object-cover h-48 sm:h-56 w-full shadow-lg border-2 border-white"
              />
            </div>
          </div>
        </section>
      )}

      {/* 0.5. Főkertészi Öntözési Kisokos — Mikor és hogyan öntözzünk? */}
      <section className="p-5 sm:p-6 rounded-2xl bg-amber-50/80 border border-amber-200 text-ink-900 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
          <span className="text-xl">☀️</span>
          <h3>Főkertészi Öntözési Kisokos — mikor a legjobb öntözni?</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-white border border-amber-200 space-y-1 shadow-2xs">
            <div className="font-extrabold text-emerald-800 flex items-center gap-1.5">
              <span>🌅 Kora reggel (6:00 – 9:00)</span>
            </div>
            <p className="text-ink-700 text-xs leading-relaxed">
              A LEGJOBB időpont! A talaj még hűvös, a víz mélyre szivárog a gyökerekhez, és felkészíti a fát a napközbeni hőségre.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-amber-200 space-y-1 shadow-2xs">
            <div className="font-extrabold text-indigo-900 flex items-center gap-1.5">
              <span>🌇 Késő este (18:00 – 21:00)</span>
            </div>
            <p className="text-ink-700 text-xs leading-relaxed">
              Kiváló választás! Éjszaka nincs párolgás, így a növény bőségesen fel tudja venni az öntözővizet a földből.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1 shadow-2xs">
            <div className="font-extrabold text-rose-900 flex items-center gap-1.5">
              <span>🚫 Tűző napon (11:00 – 16:00) NE!</span>
            </div>
            <p className="text-rose-950 text-xs leading-relaxed">
              Déli tűző napon a víz 80%-a elpárolog, a vízcseppek pedig megégethetik a leveleket. Ilyenkor érdemes megvárni az estét!
            </p>
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
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gpsLoading}
              className="btn-secondary btn-sm text-xs font-bold flex items-center gap-1.5 border-emerald-300 text-emerald-900 bg-emerald-50 hover:bg-emerald-100"
            >
              <MapPin className="h-4 w-4 text-emerald-700" />
              {gpsLoading ? 'GPS Keresés…' : '📍 GPS Helyzetem'}
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

        {/* Utca & Állapot Gyorsgombok (Quick Filter Pills) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] font-bold text-ink-500 mr-1">Gyorsszűrő:</span>
          <button
            type="button"
            onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              activeFilter === 'all' && !searchQuery ? 'bg-emerald-700 text-white' : 'bg-white border border-sand-300 text-ink-700 hover:bg-sand-200'
            }`}
          >
            🌐 Összes Fa ({flowerSpots.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('thirsty')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              activeFilter === 'thirsty' ? 'bg-rose-600 text-white animate-pulse' : 'bg-rose-50 border border-rose-200 text-rose-900 hover:bg-rose-100'
            }`}
          >
            🚨 Szomjas fák (Sürgős)
          </button>

          {['Jurisics tér', 'Fő tér', 'Kecskeméti u.', 'Rákóczi u.'].map((street) => (
            <button
              key={street}
              type="button"
              onClick={() => { setActiveFilter('all'); setSearchQuery(street); }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                searchQuery === street ? 'bg-ink-900 text-white' : 'bg-white border border-sand-300 text-ink-700 hover:bg-sand-200'
              }`}
            >
              📍 {street}
            </button>
          ))}
        </div>
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
                    ? '💧 Locsolás & Vízadás'
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
