# ARC Line Dashboard

A simple dashboard application to view data from the ARC Line Supabase database tables: `logs`, `scrappy_messages`, and `intel`.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Database client

## Prerequisites

- Node.js 18+ and npm
- Supabase project with the following tables:
  - `logs`
  - `scrappy_messages`
  - `intel`

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `dashboard` directory:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these values in your Supabase project settings under "API" section.

### 3. Run Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Features

The dashboard provides three tabs to view data from different tables:

1. **Logs** - Displays session logs with filtering by log level
2. **Scrappy Messages** - Shows messages left for Scrappy via the chicken hotline
3. **Intel** - Displays intel reports submitted through the hotline system

Each table shows:
- Recent entries (up to 100 most recent)
- Sorting by creation date (newest first)
- Refresh button to reload data
- Error handling with retry functionality

## Project Structure

```
dashboard/
├── src/
│   ├── components/         # React components
│   │   ├── LogsTable.tsx
│   │   ├── ScrappyMessagesTable.tsx
│   │   └── IntelTable.tsx
│   ├── lib/               # Utilities
│   │   └── supabase.ts    # Supabase client configuration
│   ├── types/             # TypeScript types
│   │   └── database.ts
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

## Database Schema

The dashboard expects the following table structures:

### logs
- `id` (uuid)
- `session_id` (text)
- `message` (text)
- `level` (text: 'log', 'error', 'warn', 'debug', 'info')
- `metadata` (jsonb, nullable)
- `created_at` (timestamp)

### scrappy_messages
- `id` (uuid)
- `content` (text)
- `faction` (text, nullable)
- `verified` (boolean)
- `created_at` (timestamp)

### intel
- `id` (uuid)
- `content` (text)
- `faction` (text, nullable)
- `verified` (boolean)
- `created_at` (timestamp)

## Troubleshooting

### Environment Variables Not Found

Make sure your `.env` file is in the `dashboard` directory and contains both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Cannot Connect to Supabase

1. Verify your Supabase project URL and anon key are correct
2. Check that Row Level Security (RLS) policies allow SELECT operations on the tables
3. Check browser console for specific error messages

### No Data Showing

1. Verify that the tables exist in your Supabase project
2. Check that the table names match exactly: `logs`, `scrappy_messages`, `intel`
3. Ensure RLS policies allow reading from these tables

