import { createClient } from "@supabase/supabase-js";
import { AppError, ERROR_CODES } from "./errors";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new AppError(
    "Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY",
    ERROR_CODES.VALIDATION_ERROR,
    500
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
