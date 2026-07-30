/**
 * KTSZE Saját Elnökségi Látogatottság & Kattintásszámláló Analitika
 */
import { supabase } from './supabaseClient';

const STORAGE_KEY = 'ktsze_site_analytics_v1';

const getDeviceType = () => {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/mobile|android|iphone|ipad|tablet/i.test(ua)) return 'mobile';
  return 'desktop';
};

const getLocalAnalytics = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalAnalytics = (events) => {
  try {
    // Legutóbbi 10,000 esemény megtartása
    const trimmed = events.slice(-10000);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('[Analytics] LocalStorage mentési hiba:', err);
  }
};

/** Oldalmegtekintés vagy kattintás rögzítése */
export const trackPageView = async (path, title = null, userEmail = null) => {
  const event = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    path: path || window.location.pathname,
    title: title || document.title || path,
    user_email: userEmail || null,
    device_type: getDeviceType(),
    created_at: new Date().toISOString()
  };

  // 1. Supabase mentési kísérlet
  try {
    const { error } = await supabase.from('site_analytics').insert(event);
    if (!error) return event;
  } catch (err) {
    // Csendes fallback
  }

  // 2. LocalStorage tartalék
  const localEvents = getLocalAnalytics();
  localEvents.push(event);
  saveLocalAnalytics(localEvents);
  return event;
};

/** Analitikai adatok és statisztikák lekérése az Elnökség részére */
export const getAnalyticsStats = async () => {
  let events = [];

  try {
    const { data, error } = await supabase
      .from('site_analytics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5000);
    if (!error && data && data.length > 0) {
      events = data;
    }
  } catch (err) {
    console.warn('[Analytics] Supabase adatok nem érhetők el:', err);
  }

  if (events.length === 0) {
    events = getLocalAnalytics();
  }

  const now = new Date();
  const todayStr = now.toISOString().substring(0, 10);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let todayViews = 0;
  let weekViews = 0;
  let monthViews = 0;
  let mobileCount = 0;
  let desktopCount = 0;

  const pageCounts = {};
  const userLoginMap = {};

  events.forEach((evt) => {
    const evtDate = new Date(evt.created_at);
    const dateStr = evt.created_at ? evt.created_at.substring(0, 10) : '';

    if (dateStr === todayStr) todayViews++;
    if (evtDate >= oneWeekAgo) weekViews++;
    if (evtDate >= thirtyDaysAgo) monthViews++;

    if (evt.device_type === 'mobile') mobileCount++;
    else desktopCount++;

    // Oldal számláló
    const pathKey = evt.path || '/';
    pageCounts[pathKey] = (pageCounts[pathKey] || 0) + 1;

    // Tagok belépési számlálója
    if (evt.user_email) {
      userLoginMap[evt.user_email] = (userLoginMap[evt.user_email] || 0) + 1;
    }
  });

  const topPages = Object.entries(pageCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const topUsers = Object.entries(userLoginMap)
    .map(([email, count]) => ({ email, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalEvents: events.length,
    todayViews,
    weekViews,
    monthViews,
    mobileCount,
    desktopCount,
    topPages,
    topUsers,
    recentEvents: events.slice(0, 20)
  };
};
