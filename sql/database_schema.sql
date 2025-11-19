-- ============================================================================
-- ARCline Database Schema
-- ============================================================================
-- This SQL file recreates the complete database schema for ARCline.
-- Run this in your Supabase SQL Editor to set up the database from scratch.
--
-- Tables:
--   - intel: Stores faction intel and rumors (formerly gossip)
--   - scrappy_messages: Stores messages left for Scrappy via the chicken hotline
-- ============================================================================

-- ============================================================================
-- DROP EXISTING TABLES (if they exist)
-- ============================================================================
-- Uncomment the following lines if you need to drop existing tables:
-- DROP TABLE IF EXISTS scrappy_messages CASCADE;
-- DROP TABLE IF EXISTS intel CASCADE;

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

-- Intel Table (formerly gossip)
-- Stores faction intel and rumors
CREATE TABLE IF NOT EXISTS intel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  faction TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scrappy Messages Table
-- Stores messages left for Scrappy via the chicken hotline
CREATE TABLE IF NOT EXISTS scrappy_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  faction TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================
-- Indexes improve query performance for common access patterns

-- Intel Indexes
CREATE INDEX IF NOT EXISTS idx_intel_created_at ON intel(created_at);
CREATE INDEX IF NOT EXISTS idx_intel_verified ON intel(verified);

-- Scrappy Messages Indexes
CREATE INDEX IF NOT EXISTS idx_scrappy_messages_created_at ON scrappy_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_scrappy_messages_verified ON scrappy_messages(verified);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS on all tables as per project requirements

ALTER TABLE intel ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrappy_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
-- Create policies to allow anonymous access for the application to function

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Allow anonymous reads" ON intel;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON intel;
DROP POLICY IF EXISTS "Allow anonymous reads" ON scrappy_messages;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON scrappy_messages;

-- Intel Policies
-- Allow anonymous users to read intel
CREATE POLICY "Allow anonymous reads" ON intel
  FOR SELECT TO anon
  USING (true);

-- Allow anonymous users to insert intel
CREATE POLICY "Allow anonymous inserts" ON intel
  FOR INSERT TO anon
  WITH CHECK (true);

-- Scrappy Messages Policies
-- Allow anonymous users to read scrappy messages
CREATE POLICY "Allow anonymous reads" ON scrappy_messages
  FOR SELECT TO anon
  USING (true);

-- Allow anonymous users to insert scrappy messages
CREATE POLICY "Allow anonymous inserts" ON scrappy_messages
  FOR INSERT TO anon
  WITH CHECK (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Uncomment to verify tables were created successfully:
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
--   AND table_name IN ('intel', 'scrappy_messages')
-- ORDER BY table_name;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

