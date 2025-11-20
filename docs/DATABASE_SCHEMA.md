# Database Schema

This document describes the Supabase database schema for ARCline.

## Tables

### intel

Stores faction intel and rumors (formerly gossip).

| Column     | Type      | Description                  |
| ---------- | --------- | ---------------------------- |
| id         | uuid      | Primary key (auto-generated) |
| content    | text      | Intel content                |
| faction    | text      | Optional faction name        |
| verified   | boolean   | Whether intel is verified    |
| created_at | timestamp | Creation timestamp           |

### scrappy_messages

Stores messages left for Scrappy via the chicken hotline.

| Column     | Type      | Description                  |
| ---------- | --------- | ---------------------------- |
| id         | uuid      | Primary key (auto-generated) |
| content    | text      | Message content              |
| faction    | text      | Optional faction name        |
| verified   | boolean   | Whether message is verified  |
| created_at | timestamp | Creation timestamp           |

### logs

Stores debugging messages for each session (identified by callSid).

| Column     | Type      | Description                               |
| ---------- | --------- | ----------------------------------------- |
| id         | uuid      | Primary key (auto-generated)              |
| session_id | text      | Session identifier (callSid from Twilio)  |
| message    | text      | Log message content                       |
| level      | text      | Log level (log, error, warn, debug, info) |
| metadata   | jsonb     | Optional structured metadata              |
| created_at | timestamp | Creation timestamp                        |

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

-- Logs Table
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  message TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('log', 'error', 'warn', 'debug', 'info')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_intel_created_at ON intel(created_at);
CREATE INDEX idx_intel_verified ON intel(verified);
CREATE INDEX idx_scrappy_messages_created_at ON scrappy_messages(created_at);
CREATE INDEX idx_scrappy_messages_verified ON scrappy_messages(verified);
CREATE INDEX idx_logs_session_id ON logs(session_id);
CREATE INDEX idx_logs_created_at ON logs(created_at);
CREATE INDEX idx_logs_level ON logs(level);
CREATE INDEX idx_logs_session_created_at ON logs(session_id, created_at);
```

## Row Level Security (RLS)

Enable RLS policies as needed for your use case. For public read/write access (adjust based on your security requirements):

```sql
-- Enable RLS
ALTER TABLE intel ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrappy_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

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

-- Logs Policies
-- Allow anonymous users to read logs
CREATE POLICY "Allow anonymous reads" ON logs
  FOR SELECT TO anon
  USING (true);

-- Allow anonymous users to insert logs
CREATE POLICY "Allow anonymous inserts" ON logs
  FOR INSERT TO anon
  WITH CHECK (true);
```
