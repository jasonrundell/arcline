# Database Schema

This document describes the Supabase database schema for ARCline.

## Tables

### intel

Stores faction intel and rumors (formerly gossip).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (auto-generated) |
| content | text | Intel content |
| faction | text | Optional faction name |
| verified | boolean | Whether intel is verified |
| created_at | timestamp | Creation timestamp |

### scrappy_messages

Stores messages left for Scrappy via the chicken hotline.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (auto-generated) |
| content | text | Message content |
| faction | text | Optional faction name |
| verified | boolean | Whether message is verified |
| created_at | timestamp | Creation timestamp |

## SQL Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Intel Table (formerly gossip)
CREATE TABLE intel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  faction TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scrappy Messages Table
CREATE TABLE scrappy_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  faction TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_intel_created_at ON intel(created_at);
CREATE INDEX idx_intel_verified ON intel(verified);
CREATE INDEX idx_scrappy_messages_created_at ON scrappy_messages(created_at);
CREATE INDEX idx_scrappy_messages_verified ON scrappy_messages(verified);
```

## Row Level Security (RLS)

Enable RLS policies as needed for your use case. For public read/write access (adjust based on your security requirements):

```sql
-- Enable RLS
ALTER TABLE intel ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrappy_messages ENABLE ROW LEVEL SECURITY;

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
```

