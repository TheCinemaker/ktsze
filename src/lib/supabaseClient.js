import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://kcuqebzmloattlgzuhpg.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdXFlYnptbG9hdHRsZ3p1aHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMjc4OTYsImV4cCI6MjEwMDcwMzg5Nn0.sDKfwgKHOb9peD8ZMNJN9S8lQTcU_KYeRR4_FDY277k';

// Az env változó lehet üres string vagy csak whitespace a Netlify UI-ból — ezt a `||` nem szűri ki.
const clean = (v) => (typeof v === 'string' ? v.trim() : '');

export const supabaseUrl = clean(import.meta.env.VITE_SUPABASE_URL) || FALLBACK_URL;
export const supabaseAnonKey = clean(import.meta.env.VITE_SUPABASE_ANON_KEY) || FALLBACK_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);

// Melyik projektbe írunk valójában? (kcuqebzmloattlgzuhpg = a beégetett fallback)
export const supabaseProjectRef = supabaseUrl.replace(/^https?:\/\//, '').split('.')[0];

if (typeof window !== 'undefined') {
  console.info(
    `[Supabase] projekt: ${supabaseProjectRef} | forrás: ${
      clean(import.meta.env.VITE_SUPABASE_URL) ? 'VITE_SUPABASE_URL env' : 'beégetett fallback'
    }`
  );
}

/**
 * Egységes hibaformázás. FONTOS: a supabase-js query builder (PostgrestBuilder)
 * NEM Promise — csak `then()` van rajta, `catch()` NINCS. Ezért mindig `await`-elni
 * kell és az `error` mezőt vizsgálni, soha nem `.catch()`-elni közvetlenül a builderen.
 */
export const describeError = (error) => {
  if (!error) return null;
  if (error.code === '42501') {
    return 'Nincs RLS jogosultság az írásra. Futtasd le a supabase/schema.sql szkriptet a Supabase Dashboard → SQL Editor felületén.';
  }
  if (error.code === 'PGRST204' || error.code === '42703') {
    return `Hiányzó oszlop az adatbázisban (${error.message}). Futtasd le a supabase/schema.sql szkriptet a Supabase Dashboard → SQL Editor felületén.`;
  }
  if (error.code === 'PGRST205') {
    return `Hiányzó tábla az adatbázisban (${error.message}). Futtasd le a supabase/schema.sql szkriptet a Supabase Dashboard → SQL Editor felületén.`;
  }
  if (error.code === '23502') {
    return `Kötelező mező hiányzik: ${error.message}`;
  }
  return `${error.code || 'hiba'}: ${error.message || String(error)}`;
};
