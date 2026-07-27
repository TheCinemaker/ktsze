import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kcuqebzmloattlgzuhpg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdXFlYnptbG9hdHRsZ3p1aHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMjc4OTYsImV4cCI6MjEwMDcwMzg5Nn0.sDKfwgKHOb9peD8ZMNJN9S8lQTcU_KYeRR4_FDY277k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return true;
};
