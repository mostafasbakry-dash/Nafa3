import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  // Hardcoded for testing as requested
  const supabaseUrl = 'https://ncpqhkoljjikqrgtelbv.supabase.co';
  // If the environment variable is missing, use the placeholder for the user to fill or for testing
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

  if (!supabaseUrl) {
    console.warn('Supabase URL missing.');
    return null;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};
