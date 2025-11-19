/**
 * Test script to verify Supabase connection from server context
 * Run with: npx tsx scripts/test-supabase.ts
 */

// Load environment variables
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env") });
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Testing Supabase connection...");
  console.log("URL:", supabaseUrl);
  
  try {
    const { data, error } = await supabase
      .from("gossip")
      .select("*")
      .limit(1);
    
    if (error) {
      console.error("Error:", error);
      process.exit(1);
    }
    
    console.log("Success! Connected to Supabase.");
    console.log("Sample data:", data?.[0] || "No data found");
    process.exit(0);
  } catch (error) {
    console.error("Connection failed:", error);
    process.exit(1);
  }
}

testConnection();

