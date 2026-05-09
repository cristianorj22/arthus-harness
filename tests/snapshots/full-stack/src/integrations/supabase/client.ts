// Supabase client — env-driven.
//
// Read keys from Vite env (must be prefixed VITE_ to be exposed to the browser).
// SUPABASE_SERVICE_ROLE_KEY MUST NEVER be imported here — it bypasses RLS and
// belongs only in edge functions / server-side code.
//
// Generated types live in ./types.ts — run `npm run supabase:gen-types` after
// every migration to keep them in sync.

import { createClient } from '@supabase/supabase-js';
// import type { Database } from './types';   // uncomment after first `supabase gen types` run

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env (see .env.example).'
  );
}

// Import like:
//   import { supabase } from '@/integrations/supabase/client';
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
