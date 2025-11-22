# ARC Line Project Index

Comprehensive index of the ARC Raiders Multi-Hotline Voice System codebase.

## Project Overview

**Name:** ARC Line  
**Version:** 2.0.0  
**Type:** Multi-Hotline Voice System for ARC Raiders  
**Tech Stack:** Node.js, TypeScript, Fastify, Vite, React, Twilio ConversationRelay, Supabase  
**License:** MIT

---

## Directory Structure

```
arcline/
├── __tests__/              # Test files
├── api/                    # API routes (legacy/alternative)
├── app/                    # Next.js App Router (legacy)
├── components/             # React components (legacy)
├── docs/                   # Documentation
├── e2e/                    # End-to-end tests
├── lib/                    # Library/utility code
│   ├── ai/                 # AI modules
│   ├── hotlines/           # Hotline handlers
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── scripts/                # Utility scripts
├── sql/                    # Database schema
├── types/                  # TypeScript type definitions
├── webapp/                 # Vite + React web application
│   └── src/
│       ├── components/     # React components
│       ├── hooks/          # React hooks
│       ├── lib/            # Utilities
│       └── pages/          # Page components
└── [config files]          # Configuration files
```

---

## Core Files

### Entry Points & Server

- **`server.ts`** (541 lines)
  - Main Fastify server with WebSocket support
  - Handles Twilio ConversationRelay WebSocket connections
  - Routes to hotline handlers based on user selection
  - Manages call sessions and state
  - Session-aware logging with database persistence
  - Endpoints:
    - `GET /twiml` - Returns TwiML for ConversationRelay connection
    - `WS /ws` - WebSocket server for ConversationRelay
    - `POST /api/twilio/conversation/webhook` - Webhook endpoint (fallback)
    - `GET /health` - Health check endpoint

### Configuration Files

- **`package.json`**

  - Dependencies: Fastify, Twilio, Supabase, WebSocket
  - Scripts: dev, start, build, test, lint
  - Keywords: arc-raiders, twilio, hotline, voice, conversationrelay

- **`tsconfig.json`**

  - TypeScript compiler configuration
  - Target: ES2020
  - Module: commonjs
  - Output: `dist/`
  - Excludes tests from build

- **`next.config.ts`**

  - Next.js configuration (legacy)
  - React strict mode enabled
  - PWA-ready

- **`vercel.json`**

  - Vercel deployment configuration
  - Function timeouts and rewrites
  - Maps `/twiml` to `/api/twiml`

- **`jest.config.js`**

  - Jest test configuration

- **`jest.setup.js`**

  - Jest test setup

- **`playwright.config.ts`**

  - Playwright E2E test configuration

- **`Procfile`**
  - Heroku deployment configuration

### Webapp Configuration (`webapp/`)

- **`webapp/package.json`**

  - Vite + React application
  - Dependencies: React, React Router, TanStack Query, Supabase, shadcn/ui, Sonner
  - Scripts: dev, build, build:dev, lint, preview

- **`webapp/vite.config.ts`**

  - Vite configuration
  - React SWC plugin
  - Path aliases configured

- **`webapp/tsconfig.json`**

  - TypeScript configuration for webapp
  - React-specific settings
  - Path aliases: `@/*` maps to `src/*`

- **`webapp/tailwind.config.ts`**

  - Tailwind CSS configuration for webapp
  - ARC Raiders theme integration

- **`webapp/components.json`**
  - shadcn/ui component configuration

---

## Library Code (`lib/`)

### Supabase Client

- **`lib/supabase.ts`**
  - Supabase client singleton
  - Environment variable configuration
  - TypeScript interfaces:
    - `Intel`
    - `ScrappyMessage`

### AI Modules (`lib/ai/`)

- **`lib/ai/lootlookup.ts`**

  - AI-powered loot lookup functionality
  - Processes loot search queries

- **`lib/ai/shaniresponse.ts`**
  - AI response generation for Shani character
  - Voice response formatting

### Hotline Handlers (`lib/hotlines/`)

Each hotline handler implements the same interface:

- Accepts `ConversationRelayRequest` and memory object
- Returns `ConversationRelayResponse` with actions (say, listen, remember)
- Uses state machine pattern with `memory.step`

- **`lib/hotlines/menu.ts`**

  - Main menu handler
  - Presents 5 hotline options (1-5)
  - Routes to specific hotlines based on selection

- **`lib/hotlines/extraction.ts`**

  - Extraction Request hotline (#1)
  - Collects user location
  - Creates extraction requests in database
  - Provides confirmation

- **`lib/hotlines/loot.ts`**

  - Loot Locator hotline (#2)
  - Searches for items in database
  - Returns location and rarity information
  - Uses AI for enhanced lookup

- **`lib/hotlines/chicken.ts`**

  - Scrappy's Chicken Line (#3)
  - Fun sound clips and randomizers
  - Entertainment-focused interactions
  - Manages scrappy_messages table

- **`lib/hotlines/listen-intel.ts`**

  - Listen to Intel hotline (Faction News)
  - Retrieves verified intel entries
  - Reads intel content to caller
  - Pagination support

- **`lib/hotlines/submit-intel.ts`**
  - Submit Intel hotline (Faction News)
  - Allows users to submit intel/rumors
  - Collects faction, content, and priority
  - Creates intel entries in database

### Utility Functions (`lib/utils/`)

- **`lib/utils/router.ts`**

  - Centralized routing logic
  - Routes requests to appropriate hotline handlers
  - Handles menu navigation

- **`lib/utils/hotline-detection.ts`**

  - Detects hotline type from user input
  - Number-based and voice-based detection

- **`lib/utils/exit.ts`**

  - End call detection
  - Exit response generation
  - Menu navigation helpers

- **`lib/utils/repeat.ts`**

  - Repeat request detection
  - Repeats last message functionality

- **`lib/utils/session-logger.ts`**

  - Session-aware logging system
  - Associates logs with call sessions (callSid)
  - In-memory log storage

- **`lib/utils/save-logs.ts`**

  - Saves session logs to database
  - Persists logs to `logs` table on session end

- **`lib/utils/sms.ts`**
  - SMS sending utilities
  - Twilio SMS integration

---

## Webapp Application (`webapp/`)

### Entry Point

- **`webapp/src/main.tsx`**

  - Vite entry point
  - React root rendering
  - Global styles import

- **`webapp/src/App.tsx`**
  - Main application component
  - React Router setup
  - TanStack Query provider
  - Route definitions

### Pages (`webapp/src/pages/`)

- **`webapp/src/pages/index.tsx`**

  - Homepage/main page
  - Displays hotline information
  - Shows intel entries (Raider Report)
  - Shows Scrappy messages
  - Real-time data fetching with React Query

- **`webapp/src/pages/NotFound.tsx`**
  - 404 Not Found page
  - Error handling component

### Components (`webapp/src/components/`)

- **`webapp/src/components/NavLink.tsx`**

  - Navigation link component
  - React Router integration

- **`webapp/src/components/ui/card.tsx`**
  - shadcn/ui Card component
  - Reusable card UI component
  - Subcomponents: CardHeader, CardTitle, CardDescription, CardContent

### Hooks (`webapp/src/hooks/`)

- **`webapp/src/hooks/use-intel.ts`**

  - React Query hook for fetching intel
  - Fetches from `intel` table filtered by faction
  - Returns: data, isLoading, error

- **`webapp/src/hooks/use-messages.ts`**

  - React Query hook for fetching Scrappy messages
  - Fetches from `scrappy_messages` table
  - Returns: data, isLoading, error

- **`webapp/src/hooks/use-mobile.tsx`**
  - Mobile detection hook
  - Responsive UI utilities

### Library (`webapp/src/lib/`)

- **`webapp/src/lib/supabase.ts`**

  - Supabase client for webapp
  - Browser-optimized configuration

- **`webapp/src/lib/utils.ts`**
  - Utility functions
  - `cn()` function for className merging (tailwind-merge + clsx)

### Assets (`webapp/src/assets/`)

- **`webapp/src/assets/scrappy-messages-bg.png`**

  - Background image for Scrappy messages section

- **`webapp/src/assets/scrappy-messages-bg.webp`**
  - WebP version of Scrappy background image

---

## Type Definitions (`types/`)

- **`types/twilio.ts`**
  - `ConversationRelayRequest` interface
  - `ConversationRelayResponse` interface
  - `HotlineType` union type:
    - "extraction"
    - "loot"
    - "chicken"
    - "listen-intel"
    - "submit-intel"
    - "menu"

---

## Alternative API Routes (`api/`)

Legacy or alternative API implementations:

- **`api/twiml.ts`**

  - Alternative TwiML endpoint (for Vercel deployment)

- **`api/twilio/conversation/webhook.ts`**
  - Alternative webhook endpoint (for Vercel deployment)

---

## Scripts (`scripts/`)

- **`scripts/test-supabase.ts`**
  - Supabase connection testing script
  - Database connectivity verification

---

## SQL (`sql/`)

- **`sql/database_schema.sql`**
  - Complete database schema
  - Table definitions:
    - `intel` - Faction intel and rumors
    - `scrappy_messages` - Messages left for Scrappy
    - `logs` - Session debugging logs
  - Indexes for performance
  - Row Level Security (RLS) policies
  - Anonymous access policies

---

## Tests

### Unit Tests (`__tests__/`)

- **`__tests__/components/HotlineCard.test.tsx`**

  - Tests for HotlineCard component

- **`__tests__/lib/hotlines/chicken.test.ts`**
  - Tests for chicken hotline handler

### E2E Tests (`e2e/`)

- **`e2e/homepage.spec.ts`**
  - Playwright E2E tests for homepage

---

## Documentation (`docs/`)

Comprehensive documentation files:

- **`docs/ACCESSIBILITY.md`** - Accessibility guidelines
- **`docs/API.md`** - API endpoints and webhook details
- **`docs/ARCHITECTURE.md`** - System architecture overview
- **`docs/CHANGELOG.md`** - Version history
- **`docs/DATABASE_SCHEMA.md`** - Database structure and setup
- **`docs/DEPLOYMENT.md`** - Deployment instructions
- **`docs/DEVELOPMENT.md`** - Development setup guide
- **`docs/IMPLEMENTATION_SUMMARY.md`** - Implementation summary
- **`docs/PROJECT.md`** - Project overview and features
- **`docs/SETUP.md`** - Setup instructions
- **`docs/SETUP_CHECKLIST.md`** - Setup checklist
- **`docs/TWILIO_SETUP.md`** - Twilio ConversationRelay configuration
- **`docs/VERCEL_DEPLOYMENT.md`** - Vercel-specific deployment guide
- **`docs/VOICE_SWITCHING_LIMITATION.md`** - Voice switching limitations

### Character Documentation

ARC Raiders character documentation:

- **`docs/personas/APOLLO.md`** - Apollo character
- **`docs/personas/CELESTE.md`** - Celeste character
- **`docs/personas/LANCE.md`** - Lance character (clinic/alarm)
- **`docs/personas/SCRAPPY.md`** - Scrappy character (chicken line)
- **`docs/personas/SHANI.md`** - Shani character (security/tactical)
- **`docs/personas/TIAN_WEN.md`** - Tian Wen character

### Lore & Dialog

- **`docs/ARC_RAIDERS_DIALOG_AND_LORE.md`** - Dialog and lore reference

---

## Static Assets (`public/`)

- **`public/manifest.json`**

### Webapp Static Assets (`webapp/public/`)

- **`webapp/public/robots.txt`**
  - Search engine robots configuration

---

## Environment Variables

Required environment variables (`.env` or `.env.local`):

```
PORT=8080
DOMAIN=your-domain.com

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
```

---

## Key Features

### Hotlines (1-5)

1. **Extraction Request** - Request extractions from location
2. **Loot Locator** - Search for valuable items with AI enhancement
3. **Scrappy's Chicken Line** - Fun sound clips and randomizers
4. **Faction News** - Listen to intel or submit new intel/rumors
5. **Event Alarm** - Automated reminders (may be implemented)

### Voice Configuration

- **Provider:** ElevenLabs
- **Characters:**
  - Shani (Security/Tactical) - Voice ID: `1hlpeD1ydbI2ow0Tt3EW`
  - Lance (Clinic) - Voice ID: `5e3JKXK83vvgQqBcdUol`
- **Language:** en-GB

### Technologies

- **Backend:** Fastify server with WebSocket support
- **Frontend:**
  - Primary: Vite + React (in `webapp/`)
  - Legacy: Next.js 14+ with App Router (in `app/`)
- **Database:** Supabase (PostgreSQL)
- **Voice:** Twilio ConversationRelay
- **Styling:** Tailwind CSS with ARC Raiders theme
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router (webapp)
- **UI Components:** shadcn/ui
- **Notifications:** Sonner (toast notifications)

---

## Quick Reference

### Development Commands

#### Main Server

```bash
npm run dev          # Start development server (tsx watch)
npm run build        # Build for production (TypeScript compile)
npm start            # Start production server
npm test             # Run tests
npm run lint         # Lint code
```

#### Webapp

```bash
cd webapp
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build
npm run lint         # Lint code
```

### Key Endpoints

- `GET /twiml` - TwiML endpoint for ConversationRelay
- `WS /ws` - WebSocket server
- `POST /api/twilio/conversation/webhook` - Webhook endpoint
- `GET /health` - Health check

### Database Tables

- `intel` - Faction intel and rumors
  - Fields: id, faction, content, priority, created_at, verified
  - Indexed on: created_at, verified
- `scrappy_messages` - Messages left for Scrappy via the chicken hotline
  - Fields: id, message, created_at, verified
  - Indexed on: created_at, verified
- `logs` - Session debugging logs
  - Fields: id, session_id, message, level, metadata, created_at
  - Indexed on: session_id, created_at, level

### Row Level Security (RLS)

All tables have RLS enabled with anonymous read/write policies for application functionality.

---

## Project Status

- ✅ Core server implementation (Fastify + WebSocket)
- ✅ All 5+ hotlines implemented
- ✅ Web UI (Vite + React in webapp/)
- ✅ Database integration (Supabase)
- ✅ Session logging system
- ✅ Testing setup (Jest + Playwright)
- ✅ PWA support (legacy)
- 📚 Comprehensive documentation
- 🚀 Deployable to Vercel/Heroku/Railway

---

## Related Files

- **LICENSE** - MIT License
- **README.md** - Main project README
- **.gitignore** - Git ignore rules (if present)

---

_Last indexed: 2024-12-19_  
_For questions or updates, see `docs/` directory or project README_
