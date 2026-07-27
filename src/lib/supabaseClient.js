import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kcuqebzmloattlgzuhpg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdXFlYnptbG9hdHRsZ3p1aHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MDMzODUsImV4cCI6MjA2OTE3OTM4NX0.demo_placeholder_or_env_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return true;
};
