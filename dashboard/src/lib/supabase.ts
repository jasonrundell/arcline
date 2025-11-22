import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Client Configuration
 *
 * Note: The Supabase anon key is safe to expose client-side. It's designed to be
 * public and is restricted by Row Level Security (RLS) policies in Supabase.
 * The anon key can only perform operations allowed by your RLS policies.
 *
 * @see https://supabase.com/docs/guides/api#api-security
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Runtime validation
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

