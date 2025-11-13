# Database Schema

This document describes the Supabase database schema for ARCline.

## Tables

### extraction_requests

Stores extraction requests from users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (auto-generated) |
| phone_number | text | User's phone number |
| location | text | Location for extraction |
| status | text | Status: 'pending', 'confirmed', 'completed' |
| created_at | timestamp | Creation timestamp |

### loot_items

Stores information about loot items in the ARC universe.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (auto-generated) |
| name | text | Item name |
| location | text | Location where item can be found |
| rarity | text | Rarity: 'common', 'uncommon', 'rare', 'epic', 'legendary' |
| coordinates | text | Optional coordinates |
| created_at | timestamp | Creation timestamp |

### alarms

Stores wake-up call and raid alarm requests.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (auto-generated) |
| phone_number | text | User's phone number |
| alarm_time | timestamp | When to send the alarm |
| message | text | Message to send |
| status | text | Status: 'pending', 'sent', 'cancelled' |
| created_at | timestamp | Creation timestamp |

### gossip

Stores faction gossip and rumors.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (auto-generated) |
| content | text | Gossip content |
| faction | text | Optional faction name |
| verified | boolean | Whether gossip is verified |
| created_at | timestamp | Creation timestamp |

## SQL Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Extraction Requests Table
CREATE TABLE extraction_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loot Items Table
CREATE TABLE loot_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  coordinates TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alarms Table
CREATE TABLE alarms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  alarm_time TIMESTAMP WITH TIME ZONE NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gossip Table
CREATE TABLE gossip (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  faction TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_extraction_requests_status ON extraction_requests(status);
CREATE INDEX idx_extraction_requests_created_at ON extraction_requests(created_at);
CREATE INDEX idx_loot_items_name ON loot_items(name);
CREATE INDEX idx_loot_items_rarity ON loot_items(rarity);
CREATE INDEX idx_alarms_status ON alarms(status);
CREATE INDEX idx_alarms_alarm_time ON alarms(alarm_time);
CREATE INDEX idx_gossip_created_at ON gossip(created_at);
CREATE INDEX idx_gossip_verified ON gossip(verified);
```

## Row Level Security (RLS)

Enable RLS policies as needed for your use case. For public read/write access (adjust based on your security requirements):

```sql
-- Enable RLS
ALTER TABLE extraction_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE loot_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE gossip ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust based on your needs)
-- Allow anonymous inserts for extraction_requests
CREATE POLICY "Allow anonymous inserts" ON extraction_requests
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous reads for loot_items
CREATE POLICY "Allow anonymous reads" ON loot_items
  FOR SELECT TO anon
  USING (true);

-- Allow anonymous reads for gossip
CREATE POLICY "Allow anonymous reads" ON gossip
  FOR SELECT TO anon
  USING (true);

-- Allow anonymous inserts for gossip
CREATE POLICY "Allow anonymous inserts" ON gossip
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous inserts for alarms
CREATE POLICY "Allow anonymous inserts" ON alarms
  FOR INSERT TO anon
  WITH CHECK (true);
```

