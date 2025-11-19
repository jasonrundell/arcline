import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy-load Supabase client to ensure environment variables are loaded first
// This prevents the client from being created with placeholder values before dotenv loads
let _supabaseClient: SupabaseClient | null = null;

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
  
  return { supabaseUrl, supabaseAnonKey };
}

function getSupabaseClient(): SupabaseClient {
  if (!_supabaseClient) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    
    // Log configuration for debugging (without exposing keys)
    if (supabaseUrl && supabaseUrl !== "https://placeholder.supabase.co") {
      console.log("Supabase client initialized:", {
        url: supabaseUrl,
        hasKey: !!supabaseAnonKey && supabaseAnonKey !== "placeholder-key",
      });
    } else {
      console.warn("Supabase client initialized with placeholder values. Check environment variables.");
    }
    
    // Create client with same simple configuration as seed script for consistency
    _supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return _supabaseClient;
}

// Export a Proxy that lazily creates the client on first property access
// This ensures environment variables are loaded before the client is created
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    // Bind functions to maintain 'this' context
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

// Database types
export interface ExtractionRequest {
  id: string;
  phone_number: string;
  location: string;
  status: "pending" | "confirmed" | "completed";
  created_at: string;
}

export interface LootItem {
  id: string;
  name: string;
  location: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  coordinates?: string;
  created_at: string;
}

export interface Alarm {
  id: string;
  phone_number: string;
  alarm_time: string;
  message: string;
  status: "pending" | "sent" | "cancelled";
  created_at: string;
}

export interface Gossip {
  id: string;
  content: string;
  faction?: string;
  verified: boolean;
  created_at: string;
}

