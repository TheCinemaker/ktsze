import { createClient } from '@supabase/supabase-js';

// A Supabase URL és az "anon" kulcs szándékosan publikus adat — a böngészőbe
// mindenképp kikerül. A védelmet nem a kulcs titkossága adja, hanem a
// Row Level Security (lásd supabase/01_schema.sql). Titkot (service_role kulcs,
// jelszó) EBBE A FÁJLBA SOHA nem írunk.

const FALLBACK_URL = 'https://kcuqebzmloattlgzuhpg.supabase.co';
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdXFlYnptbG9hdHRsZ3p1aHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMjc4OTYsImV4cCI6MjEwMDcwMzg5Nn0.sDKfwgKHOb9peD8ZMNJN9S8lQTcU_KYeRR4_FDY277k';

// A Netlify UI-ból üres vagy csak whitespace értéket is kaphatunk, amit a `||`
// önmagában nem szűr ki.
const clean = (v) => (typeof v === 'string' ? v.trim() : '');

export const supabaseUrl = clean(import.meta.env.VITE_SUPABASE_URL) || FALLBACK_URL;
export const supabaseAnonKey = clean(import.meta.env.VITE_SUPABASE_ANON_KEY) || FALLBACK_ANON_KEY;

export const supabaseProjectRef = supabaseUrl.replace(/^https?:\/\//, '').split('.')[0];

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'ktsze-auth'
  }
});

// Belépéskor elég a "admin" szót beírni, nem kell a teljes e-mail cím.
// A Supabase Auth e-mail alapú, ezért a rövid nevet feloldjuk.
const LOGIN_ALIASES = {
  admin: clean(import.meta.env.VITE_ADMIN_EMAIL) || 'admin@visitkoszeg.hu'
};

export const resolveLoginIdentifier = (input) => {
  const value = clean(input).toLowerCase();
  if (!value) return '';
  if (value.includes('@')) return value;
  return LOGIN_ALIASES[value] || value;
};

/**
 * Supabase hibák emberi nyelvre fordítása.
 *
 * FONTOS: a supabase-js query builder (PostgrestBuilder) NEM Promise — csak
 * `then()` van rajta, `catch()` nincs. Ezért minden hívást `await`-elni kell és
 * az `error` mezőt megvizsgálni. Soha ne `.catch()`-elj közvetlenül a builderen,
 * mert a hiba némán elnyelődik.
 */
export const describeError = (error) => {
  if (!error) return null;

  const code = error.code || '';
  const message = error.message || String(error);

  const RUN_SCHEMA =
    'Futtasd le a supabase/01_schema.sql szkriptet a Supabase Dashboard → SQL Editor felületén.';

  // FONTOS: az eredeti szöveget MEG KELL TARTANI. A Postgres a 42501-es
  // hibában megnevezi a táblát és a műveletet ("new row violates row-level
  // security policy for table ..."), ami nélkül a hibakeresés vaktában megy.
  if (code === '42501') {
    return `Az adatbázis elutasította a műveletet (jogosultság).\n${message}\n\nHa a szerepköröd rendben van, futtasd le a supabase/07_fix_grants.sql szkriptet.`;
  }
  if (code === '42P01') {
    return `Nincs ilyen tábla az adatbázisban.\n${message}\n\n${RUN_SCHEMA}`;
  }
  if (code === 'PGRST204' || code === '42703') {
    return `Hiányzó oszlop az adatbázisban (${message}). ${RUN_SCHEMA}`;
  }
  if (code === 'PGRST205') {
    return `Hiányzó tábla az adatbázisban (${message}). ${RUN_SCHEMA}`;
  }
  if (code === '23502') {
    return `Egy kötelező mező üresen maradt: ${message}`;
  }
  if (code === '23505' || code === '23514') {
    return `Érvénytelen vagy már létező adat: ${message}`;
  }

  // Auth hibák
  if (message.includes('Invalid login credentials')) {
    return 'Hibás e-mail cím vagy jelszó.';
  }
  if (message.includes('Email not confirmed')) {
    return 'A fiók e-mail címe még nincs megerősítve. Nézd meg a postafiókodat, vagy kérd az elnökséget a megerősítésre.';
  }
  if (message.includes('User already registered') || message.includes('already been registered')) {
    return 'Ezzel az e-mail címmel már van regisztrált fiók. Próbálj belépni helyette.';
  }
  if (message.includes('Password should be at least')) {
    return 'A jelszó túl rövid — legalább 8 karakter kell.';
  }
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return 'Nem sikerült elérni az adatbázist. Ellenőrizd az internetkapcsolatot.';
  }

  return code ? `${code}: ${message}` : message;
};

/** Egységes hívás: hiba esetén beszédes Error-t dob, egyébként az adatot adja. */
export const unwrap = ({ data, error }) => {
  if (error) throw new Error(describeError(error));
  return data;
};
