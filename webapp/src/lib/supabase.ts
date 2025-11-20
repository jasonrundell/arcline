import { createClient } from "@supabase/supabase-js";
import { AppError, ERROR_CODES } from "./errors";

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

// Runtime validation (fallback - build-time validation should catch this)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new AppError(
    "Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY",
    ERROR_CODES.VALIDATION_ERROR,
    500
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
