import React from 'react';
import { Eye, Smartphone, Monitor, TrendingUp, Users, RefreshCw, BarChart2, CheckCircle2 } from 'lucide-react';
import { useAsyncData } from '../../lib/useAsyncData';
import { getAnalyticsStats } from '../../lib/analytics';
import { LoadingBlock, ErrorBlock } from '../ui';

export const SiteAnalyticsAdmin = () => {
  const { data: stats, loading, error, reload } = useAsyncData(getAnalyticsStats);

  if (loading) return <LoadingBlock label="Statisztikák és kattintások betöltése…" />;
  if (error) return <ErrorBlock message={error} onRetry={reload} />;

  const {
    totalEvents = 0,
    todayViews = 0,
    weekViews = 0,
    monthViews = 0,
    mobileCount = 0,
    desktopCount = 0,
    topPages = [],
    topUsers = [],
    recentEvents = []
  } = stats || {};

  const totalDevice = (mobileCount + desktopCount) || 1;
  const mobilePct = Math.round((mobileCount / totalDevice) * 100);
  const desktopPct = Math.round((desktopCount / totalDevice) * 100);

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'Főoldal';
      case '/belepes': return 'Tagi Belépés';
      case '/elnokseg': return 'Elnökségi Felület';
      case '/hirek': return 'Hírek & Beszámolók';
      case '/dokumentumok': return 'Hivatalos Dokumentumok';
      case '/egyesulet': return 'Egyesületünk';
      case '/munkacsoportok': return 'Munkacsoportok';
      case '/tagsag': return 'Tagság & Jelentkezés';
      default: return path;
    }
  };

  return (
    <div className="space-y-6">
      {/* Fejléc és frissítés gomb */}
      <div className="flex flex-wrap justify-between items-center gap-3 bg-sand-50 p-4 rounded-2xl border border-sand-300">
        <div>
          <h3 className="font-bold text-ink-900 text-lg flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-wine-700" />
            Weboldal Látogatottság &amp; Tagi Aktivitás Analitika
          </h3>
          <p className="text-xs text-ink-600">
            Valós idejű látogatottsági adatok, kattintások és tagi aktiváció nyomon követése.
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          className="btn-secondary btn-sm rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="h-4 w-4" />
          Adatok Frissítése
        </button>
      </div>

      {/* KPI Kártyák */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-sand-300 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-500 font-bold uppercase tracking-wider">
            <span>Mai Megtekintések</span>
            <Eye className="h-4 w-4 text-wine-600" />
          </div>
          <div className="text-2xl font-extrabold text-wine-800">{todayViews}</div>
          <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> Mai aktív munkaerő
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sand-300 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-500 font-bold uppercase tracking-wider">
            <span>Heti Megtekintések</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-ink-900">{weekViews}</div>
          <div className="text-xs text-ink-500 font-medium">Elmúlt 7 nap összesítése</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sand-300 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-500 font-bold uppercase tracking-wider">
            <span>Havi Összesítés</span>
            <Eye className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-ink-900">{monthViews}</div>
          <div className="text-xs text-ink-500 font-medium">Elmúlt 30 nap oldalletöltései</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sand-300 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-500 font-bold uppercase tracking-wider">
            <span>Készülékek Bontása</span>
            <Smartphone className="h-4 w-4 text-wine-700" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-xs font-bold text-ink-800">
              <Smartphone className="h-3.5 w-3.5 text-wine-600" /> Mobil: {mobilePct}%
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-ink-800">
              <Monitor className="h-3.5 w-3.5 text-ink-600" /> Asztali: {desktopPct}%
            </div>
          </div>
          <div className="w-full bg-sand-200 h-2 rounded-full overflow-hidden flex mt-2">
            <div style={{ width: `${mobilePct}%` }} className="bg-wine-700 h-full" />
            <div style={{ width: `${desktopPct}%` }} className="bg-ink-400 h-full" />
          </div>
        </div>
      </div>

      {/* Részletes bontások */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Legnépszerűbb Oldalak */}
        <div className="p-5 rounded-2xl bg-white border border-sand-300 shadow-xs space-y-4">
          <h4 className="font-bold text-ink-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <Eye className="h-4 w-4 text-wine-700" />
            Legnépszerűbb Menüpontok &amp; Oldalak
          </h4>

          {topPages.length === 0 ? (
            <p className="text-xs text-ink-500">Még nincs elegendő látogatottsági adat.</p>
          ) : (
            <div className="space-y-2">
              {topPages.map((item, idx) => {
                const maxCount = topPages[0].count || 1;
                const pct = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={idx} className="space-y-1 text-xs font-medium">
                    <div className="flex justify-between items-center text-ink-800">
                      <span className="font-bold">
                        {idx + 1}. {getPageTitle(item.path)} <code className="text-ink-400 font-normal ml-1">({item.path})</code>
                      </span>
                      <span className="font-bold text-wine-800 font-mono">{item.count} kattintás</span>
                    </div>
                    <div className="w-full bg-sand-100 h-2 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className="bg-wine-700 h-full rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legaktívabb Belépett Tagok */}
        <div className="p-5 rounded-2xl bg-white border border-sand-300 shadow-xs space-y-4">
          <h4 className="font-bold text-ink-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-700" />
            Legaktívabb Belépett Tagjaink
          </h4>

          {topUsers.length === 0 ? (
            <p className="text-xs text-ink-500">Még egyetlen bejelentkezett tag sem végzett aktivitást.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {topUsers.map((u, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-sand-200 bg-sand-50/50 flex justify-between items-center text-xs"
                >
                  <div className="font-bold text-ink-900 truncate max-w-[240px]">
                    {u.email}
                  </div>
                  <div className="text-emerald-800 font-bold font-mono bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 text-[11px]">
                    {u.count} művelet
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legutóbbi Események Naplója */}
      <div className="p-5 rounded-2xl bg-white border border-sand-300 shadow-xs space-y-3">
        <h4 className="font-bold text-ink-900 text-sm uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-wine-700" />
          Valós Idejű Eseménynapló (Utolsó 20 interakció)
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-sand-300 text-left text-ink-500 bg-sand-50">
                <th className="p-2">Időpont</th>
                <th className="p-2">Oldal</th>
                <th className="p-2">Felhasználó</th>
                <th className="p-2">Készülék</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((evt) => (
                <tr key={evt.id} className="border-b border-sand-200 hover:bg-sand-50">
                  <td className="p-2 text-ink-500">
                    {evt.created_at ? new Date(evt.created_at).toLocaleTimeString('hu-HU') : '—'}
                  </td>
                  <td className="p-2 font-bold text-wine-800">{evt.path}</td>
                  <td className="p-2 text-ink-800">{evt.user_email || '— Vendég / Anonim —'}</td>
                  <td className="p-2 uppercase text-[10px] font-bold text-ink-600">{evt.device_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
