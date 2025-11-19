# ARCline Project Index

Comprehensive index of the ARC Raiders Multi-Hotline Voice System codebase.

## Project Overview

**Name:** ARCline  
**Version:** 2.0.0  
**Type:** Multi-Hotline Voice System for ARC Raiders  
**Tech Stack:** Node.js, TypeScript, Fastify, Next.js, Twilio ConversationRelay, Supabase  
**License:** MIT

---

## Directory Structure

```
arcline/
├── __tests__/              # Test files
├── api/                    # API routes (legacy/alternative)
├── app/                    # Next.js App Router
├── components/             # React components
├── docs/                   # Documentation
├── e2e/                    # End-to-end tests
├── lib/                    # Library/utility code
├── public/                 # Static assets
├── scripts/                # Utility scripts
├── types/                  # TypeScript type definitions
└── [config files]          # Configuration files
```

---

## Core Files

### Entry Points & Server

- **`server.ts`** (569 lines)
  - Main Fastify server with WebSocket support
  - Handles Twilio ConversationRelay WebSocket connections
  - Routes to hotline handlers based on user selection
  - Manages call sessions and state
  - Endpoints:
    - `GET /twiml` - Returns TwiML for ConversationRelay connection
    - `WS /ws` - WebSocket server for ConversationRelay
    - `POST /api/twilio/conversation/webhook` - Webhook endpoint (fallback)
    - `GET /health` - Health check endpoint

### Configuration Files

- **`package.json`**
  - Dependencies: Fastify, Twilio, Supabase, WebSocket
  - Scripts: dev, start, build, test, lint, seed:gossip
  - Keywords: arc-raiders, twilio, hotline, voice, conversationrelay

- **`tsconfig.json`**
  - TypeScript compiler configuration
  - Target: ES2020
  - Module: commonjs
  - Output: `dist/`
  - Excludes tests from build

- **`next.config.ts`**
  - Next.js configuration
  - React strict mode enabled
  - PWA-ready

- **`vercel.json`**
  - Vercel deployment configuration
  - Function timeouts and rewrites
  - Maps `/twiml` to `/api/twiml`

- **`tailwind.config.ts`**
  - Tailwind CSS configuration
  - ARC Raiders theme colors

- **`postcss.config.mjs`**
  - PostCSS configuration for Tailwind

- **`jest.config.js`**
  - Jest test configuration

- **`jest.setup.js`**
  - Jest test setup

- **`playwright.config.ts`**
  - Playwright E2E test configuration

- **`Procfile`**
  - Heroku deployment configuration

---

## Library Code (`lib/`)

### Supabase Client

- **`lib/supabase.ts`**
  - Supabase client singleton
  - Environment variable configuration
  - TypeScript interfaces:
    - `Intel`
    - `ScrappyMessage`

### Hotline Handlers (`lib/hotlines/`)

Each hotline handler implements the same interface:
- Accepts `ConversationRelayRequest` and memory object
- Returns `ConversationRelayResponse` with actions (say, listen, remember)
- Uses state machine pattern with `memory.step`

- **`lib/hotlines/menu.ts`**
  - Main menu handler
  - Presents 5 hotline options (1-5)
  - Routes to specific hotlines based on selection

- **`lib/hotlines/extraction.ts`** (68 lines)
  - Extraction Request hotline (#1)
  - Collects user location
  - Creates extraction requests in database
  - Provides confirmation

- **`lib/hotlines/loot.ts`**
  - Loot Locator hotline (#2)
  - Searches for items in database
  - Returns location and rarity information

- **`lib/hotlines/chicken.ts`** (81 lines)
  - Scrappy's Chicken Line (#3)
  - Fun sound clips and randomizers
  - Entertainment-focused interactions

- **`lib/hotlines/gossip.ts`** (188 lines)
  - Faction News hotline (#4)
  - Users can submit gossip or get latest rumors
  - Retrieves and creates gossip entries

- **`lib/hotlines/alarm.ts`** (120 lines)
  - Event Alarm hotline (#5)
  - Sets up automated reminders
  - Creates alarm records in database

---

## Next.js App (`app/`)

### Pages

- **`app/page.tsx`**
  - Homepage
  - Displays hotline information

- **`app/layout.tsx`**
  - Root layout component
  - PWA configuration
  - Global styles

- **`app/manifest.ts`**
  - PWA manifest generation

- **`app/not-found.tsx`**
  - 404 page

- **`app/hotline/[id]/page.tsx`**
  - Dynamic route for individual hotline pages
  - Shows hotline details

### API Routes

- **`app/api/twilio/conversation/webhook/route.ts`**
  - Next.js API route for Twilio webhook
  - Alternative to Fastify server endpoint
  - Handles ConversationRelay requests

- **`app/sw.js/route.ts`**
  - Service worker route
  - PWA offline support

### Styles

- **`app/globals.css`**
  - Global CSS styles
  - Tailwind imports

---

## Components (`components/`)

All React components for the web UI:

- **`components/Header.tsx`**
  - Site header component

- **`components/Footer.tsx`**
  - Site footer component

- **`components/HotlineCard.tsx`**
  - Card component for displaying hotline information
  - Used in hotline grid

- **`components/HotlineDetail.tsx`**
  - Detailed view of a single hotline
  - Shows hotline description and features

- **`components/HotlineGrid.tsx`**
  - Grid layout for displaying all hotlines
  - Main homepage component

---

## Type Definitions (`types/`)

- **`types/twilio.ts`**
  - `ConversationRelayRequest` interface
  - `ConversationRelayResponse` interface
  - `HotlineType` union type:
    - "extraction"
    - "loot"
    - "chicken"
    - "gossip"
    - "alarm"

---

## Alternative API Routes (`api/`)

Legacy or alternative API implementations:

- **`api/twiml.ts`**
  - Alternative TwiML endpoint (for Vercel deployment)

- **`api/twilio/conversation/webhook.ts`**
  - Alternative webhook endpoint (for Vercel deployment)

---

## Scripts (`scripts/`)

- **`scripts/seed-gossip.ts`** (229 lines)
  - Seeds gossip database with initial entries
  - Run with: `npm run seed:gossip`

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

### Character Documentation

ARC Raiders character documentation:

- **`docs/ARC_RADIERS_CHARACTER_SHANI-SECURITY.md`** - Shani character (security/tactical)
- **`docs/ARC_RAIDERS_CHARACTER_APOLLO-GRENADES-GADGETS.md`** - Apollo character
- **`docs/ARC_RAIDERS_CHARACTER_CELESTE.md`** - Celeste character
- **`docs/ARC_RAIDERS_CHARACTER_LANCE-CLINIC.md`** - Lance character (clinic/alarm)
- **`docs/ARC_RAIDERS_CHARACTER_SCRAPPY.md`** - Scrappy character (chicken line)
- **`docs/ARC_RAIDERS_CHARACTER_TIAN_WEN-GUN_SHOP.md`** - Tian Wen character
- **`docs/ARC_RAIDERS_DIALOG_AND_LORE.md`** - Dialog and lore reference

---

## Static Assets (`public/`)

- **`public/manifest.json`**
  - PWA manifest file

- **`public/sw.js`**
  - Service worker script for offline support

---

## Environment Variables

Required environment variables (`.env`):

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
2. **Loot Locator** - Search for valuable items
3. **Scrappy's Chicken Line** - Fun sound clips and randomizers
4. **Faction News** - Community rumors and news
5. **Event Alarm** - Automated reminders

### Voice Configuration

- **Provider:** ElevenLabs
- **Characters:**
  - Shani (Security/Tactical) - Voice ID: `1hlpeD1ydbI2ow0Tt3EW`
  - Lance (Clinic) - Voice ID: `5e3JKXK83vvgQqBcdUol`
- **Language:** en-GB

### Technologies

- **Backend:** Fastify server with WebSocket support
- **Frontend:** Next.js 14+ with App Router
- **Database:** Supabase (PostgreSQL)
- **Voice:** Twilio ConversationRelay
- **Styling:** Tailwind CSS with ARC Raiders theme
- **PWA:** Service worker for offline support

---

## Quick Reference

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run lint         # Lint code
npm run seed:gossip  # Seed gossip database
```

### Key Endpoints

- `GET /twiml` - TwiML endpoint for ConversationRelay
- `WS /ws` - WebSocket server
- `POST /api/twilio/conversation/webhook` - Webhook endpoint
- `GET /health` - Health check

### Database Tables

- `intel` - Faction intel and rumors (formerly gossip)
- `scrappy_messages` - Messages left for Scrappy via the chicken hotline

---

## Project Status

- ✅ Core server implementation
- ✅ All 5 hotlines implemented
- ✅ Web UI (Next.js)
- ✅ PWA support
- ✅ Database integration (Supabase)
- ✅ Testing setup (Jest + Playwright)
- 📚 Comprehensive documentation
- 🚀 Deployable to Vercel/Heroku/Railway

---

## Related Files

- **LICENSE** - MIT License
- **README.md** - Main project README
- **.gitignore** - Git ignore rules (if present)

---

*Last indexed: Generated automatically*  
*For questions or updates, see `docs/` directory or project README*

