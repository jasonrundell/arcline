import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// Create client with placeholder values if not configured (for build time)
// In runtime, these should be set via environment variables
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

