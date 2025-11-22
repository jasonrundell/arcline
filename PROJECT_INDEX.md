# ARC Line Project Index

Comprehensive index of the ARC Raiders Multi-Hotline Voice System codebase.

## Project Overview

**Name:** ARC Line  
**Version:** 1.6.0  
**Type:** Multi-Hotline Voice System for ARC Raiders  
**Tech Stack:** Node.js, TypeScript, Fastify, Vite, React, Twilio ConversationRelay, Supabase  
**License:** MIT

---

## Directory Structure

```
arcline/
├── client/                  # Vite + React web application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── layout/      # Layout components (Header, Footer, Section)
│   │   │   ├── sections/    # Page sections (Hero, Bio, Features, Intel, Scrappy)
│   │   │   └── ui/          # UI components (Button, Card, ErrorButton)
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities (errors, sanitize, sentry, supabase, utils)
│   │   ├── types/           # TypeScript type definitions
│   │   ├── constants/       # Constants
│   │   └── assets/          # Static assets (images)
│   ├── public/              # Public static assets
│   ├── components.json      # shadcn/ui configuration
│   ├── tailwind.config.ts   # Tailwind CSS configuration
│   ├── vite.config.ts       # Vite configuration
│   ├── tsconfig.json        # TypeScript configuration
│   ├── tsconfig.app.json    # TypeScript app config
│   ├── tsconfig.node.json   # TypeScript node config
│   ├── vercel.json          # Vercel deployment configuration
│   └── package.json
├── server/                  # Fastify server application
│   ├── server.ts            # Main server file
│   ├── lib/
│   │   ├── ai/              # AI modules (lootlookup, shaniresponse)
│   │   ├── hotlines/        # Hotline handlers
│   │   ├── utils/           # Utility functions
│   │   └── supabase.ts      # Supabase client
│   ├── types/               # TypeScript type definitions
│   ├── constants/           # Constants
│   ├── scripts/             # Utility scripts
│   ├── sql/                 # Database schema
│   ├── Dockerfile           # Docker configuration
│   ├── Procfile             # Heroku deployment configuration
│   ├── template.yaml        # AWS SAM template
│   ├── samconfig.toml       # AWS SAM configuration
│   ├── tsconfig.json        # TypeScript configuration
│   └── package.json
├── docs/                    # Documentation
│   ├── personas/            # Character personas
│   └── lovable/             # Lovable-specific docs
├── LICENSE                  # MIT License
├── README.md                # Main project README
├── PROJECT_INDEX.md         # This file
└── .gitignore               # Git ignore rules
```

---

## Core Files

### Entry Points & Server

- **`server/server.ts`** (~807 lines)
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

### Server Configuration Files

- **`server/package.json`**

  - Dependencies: Fastify, Twilio, Supabase, WebSocket, Zod
  - Scripts: dev, start, build, lint
  - Keywords: arc-raiders, twilio, hotline, voice, conversationrelay
  - Version: 1.6.0

- **`server/tsconfig.json`**

  - TypeScript compiler configuration
  - Target: ES2020
  - Module: commonjs
  - Output: `dist/`
  - Excludes tests from build

- **`server/Procfile`**

  - Heroku deployment configuration

- **`server/Dockerfile`**

  - Docker configuration for containerized deployment

- **`server/template.yaml`**

  - AWS SAM template for serverless deployment

- **`server/samconfig.toml`**
  - AWS SAM configuration

### Client Configuration (`client/`)

- **`client/package.json`**

  - Vite + React application
  - Dependencies: React, React Router, TanStack Query, Supabase, Sentry, Lucide React
  - Scripts: dev, build, build:dev, lint, preview
  - Version: 1.6.0

- **`client/vite.config.ts`**

  - Vite configuration
  - React SWC plugin
  - Path aliases configured (`@/*` maps to `src/*`)
  - Environment variable validation

- **`client/tsconfig.json`**

  - TypeScript configuration for client
  - References: tsconfig.app.json, tsconfig.node.json
  - Path aliases: `@/*` maps to `src/*`

- **`client/tsconfig.app.json`**

  - TypeScript configuration for app code

- **`client/tsconfig.node.json`**

  - TypeScript configuration for Node.js tooling

- **`client/tailwind.config.ts`**

  - Tailwind CSS configuration
  - ARC Raiders theme integration

- **`client/components.json`**

  - shadcn/ui component configuration

- **`client/vercel.json`**
  - Vercel deployment configuration

---

## Server Library Code (`server/lib/`)

### Supabase Client

- **`server/lib/supabase.ts`**
  - Supabase client singleton
  - Environment variable configuration
  - TypeScript interfaces:
    - `Intel`
    - `ScrappyMessage`

### Constants

- **`server/constants/index.ts`**
  - Application constants
  - Timeouts: CALL_END_DELAY, LOOT_LOOKUP_DELAY, SESSION_TIMEOUT, SESSION_CLEANUP_INTERVAL
  - WebSocket: MAX_CONNECTIONS

### AI Modules (`server/lib/ai/`)

- **`server/lib/ai/lootlookup.ts`**

  - AI-powered loot lookup functionality
  - Processes loot search queries

- **`server/lib/ai/shaniresponse.ts`**
  - AI response generation for Shani character
  - Voice response formatting

### Hotline Handlers (`server/lib/hotlines/`)

Each hotline handler implements the same interface:

- Accepts `ConversationRelayRequest` and memory object
- Returns `ConversationRelayResponse` with actions (say, listen, remember)
- Uses state machine pattern with `memory.step`

- **`server/lib/hotlines/menu.ts`**

  - Main menu handler
  - Presents 5 hotline options (1-5)
  - Routes to specific hotlines based on selection

- **`server/lib/hotlines/extraction.ts`**

  - Extraction Request hotline (#1)
  - Collects user location
  - Creates extraction requests in database
  - Provides confirmation

- **`server/lib/hotlines/loot.ts`**

  - Loot Locator hotline (#2)
  - Searches for items in database
  - Returns location and rarity information
  - Uses AI for enhanced lookup

- **`server/lib/hotlines/chicken.ts`**

  - Scrappy's Chicken Line (#3)
  - Fun sound clips and randomizers
  - Entertainment-focused interactions
  - Manages scrappy_messages table

- **`server/lib/hotlines/listen-intel.ts`**

  - Listen to Intel hotline (Faction News)
  - Retrieves verified intel entries
  - Reads intel content to caller
  - Pagination support

- **`server/lib/hotlines/submit-intel.ts`**
  - Submit Intel hotline (Faction News)
  - Allows users to submit intel/rumors
  - Collects faction, content, and priority
  - Creates intel entries in database

### Utility Functions (`server/lib/utils/`)

- **`server/lib/utils/router.ts`**

  - Centralized routing logic
  - Routes requests to appropriate hotline handlers
  - Handles menu navigation

- **`server/lib/utils/hotline-detection.ts`**

  - Detects hotline type from user input
  - Number-based and voice-based detection

- **`server/lib/utils/exit.ts`**

  - End call detection
  - Exit response generation
  - Menu navigation helpers

- **`server/lib/utils/repeat.ts`**

  - Repeat request detection
  - Repeats last message functionality

- **`server/lib/utils/session-logger.ts`**

  - Session-aware logging system
  - Associates logs with call sessions (callSid)
  - In-memory log storage

- **`server/lib/utils/save-logs.ts`**

  - Saves session logs to database
  - Persists logs to `logs` table on session end

- **`server/lib/utils/sms.ts`**
  - SMS sending utilities
  - Twilio SMS integration

---

## Client Application (`client/`)

### Entry Point

- **`client/src/main.tsx`**

  - Vite entry point
  - React root rendering
  - Global styles import
  - Sentry initialization
  - Error handling for root element

- **`client/src/App.tsx`**
  - Main application component
  - React Router setup
  - TanStack Query provider
  - Error Boundary wrapper
  - Lazy loading with Suspense
  - Route definitions

### Pages (`client/src/pages/`)

- **`client/src/pages/index.tsx`**

  - Homepage/main page
  - Displays hotline information
  - Shows intel entries (Raider Report)
  - Shows Scrappy messages
  - Real-time data fetching with React Query

- **`client/src/pages/NotFound.tsx`**
  - 404 Not Found page
  - Error handling component

### Components (`client/src/components/`)

#### Layout Components (`client/src/components/layout/`)

- **`client/src/components/layout/Header.tsx`**

  - Site header component
  - Navigation elements

- **`client/src/components/layout/Footer.tsx`**

  - Site footer component

- **`client/src/components/layout/Section.tsx`**
  - Reusable section wrapper component
  - Consistent spacing and layout

#### Section Components (`client/src/components/sections/`)

- **`client/src/components/sections/HeroSection.tsx`**

  - Hero section with phone number and tagline
  - Animated phone icon

- **`client/src/components/sections/BioSection.tsx`**

  - Bio/about section

- **`client/src/components/sections/FeaturesSection.tsx`**

  - Features/hotlines section

- **`client/src/components/sections/IntelSection.tsx`**

  - Intel/Raider Report section

- **`client/src/components/sections/ScrappySection.tsx`**
  - Scrappy messages section

#### UI Components (`client/src/components/ui/`)

- **`client/src/components/ui/Button.tsx`**

  - Button component

- **`client/src/components/ui/card.tsx`**

  - shadcn/ui Card component
  - Reusable card UI component
  - Subcomponents: CardHeader, CardTitle, CardDescription, CardContent

- **`client/src/components/ui/error-button.jsx`**
  - Error button component

#### Other Components

- **`client/src/components/ErrorBoundary.tsx`**

  - React Error Boundary component
  - Catches and handles React errors

- **`client/src/components/NavLink.tsx`**
  - Navigation link component
  - React Router integration

### Hooks (`client/src/hooks/`)

- **`client/src/hooks/use-intel.ts`**

  - React Query hook for fetching intel
  - Fetches from `intel` table filtered by faction
  - Returns: data, isLoading, error

- **`client/src/hooks/use-messages.ts`**

  - React Query hook for fetching Scrappy messages
  - Fetches from `scrappy_messages` table
  - Returns: data, isLoading, error

- **`client/src/hooks/use-mobile.tsx`**
  - Mobile detection hook
  - Responsive UI utilities

### Library (`client/src/lib/`)

- **`client/src/lib/supabase.ts`**

  - Supabase client for client application
  - Browser-optimized configuration

- **`client/src/lib/utils.ts`**

  - Utility functions
  - `cn()` function for className merging (tailwind-merge + clsx)

- **`client/src/lib/errors.ts`**

  - Application error codes and error handling
  - Standardized error codes (DATABASE_ERROR, MISSING_DATA, UNKNOWN_ERROR, etc.)
  - AppError class for consistent error handling

- **`client/src/lib/sentry.ts`**

  - Sentry error monitoring configuration
  - Initializes Sentry for error tracking and performance monitoring
  - Environment-based configuration

- **`client/src/lib/sanitize.ts`**
  - Content sanitization utilities
  - HTML/content sanitization functions

### Types (`client/src/types/`)

- **`client/src/types/database.ts`**
  - Database type definitions
  - Supabase-generated types

### Constants (`client/src/constants/`)

- **`client/src/constants/index.ts`**
  - Application constants
  - App name, contact information, etc.

### Assets (`client/src/assets/`)

- **`client/src/assets/arcline-og-share.psd`**

  - Open Graph share image source

- **`client/src/assets/intel-bg.webp`**

  - Intel section background image

- **`client/src/assets/jason-rundell-avatar.webp`**

  - Avatar image

- **`client/src/assets/scrappy-messages-bg.webp`**

  - Scrappy messages section background image

- **`client/src/assets/scrappy.webp`**
  - Scrappy character image

### Public Assets (`client/public/`)

- **`client/public/arcline-og-share.webp`**

  - Open Graph share image

- **`client/public/favicon.ico`**

  - Site favicon

- **`client/public/robots.txt`**
  - Search engine robots configuration

---

## Server Type Definitions (`server/types/`)

- **`server/types/twilio.ts`**
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

## Scripts (`server/scripts/`)

- **`server/scripts/test-supabase.ts`**
  - Supabase connection testing script
  - Database connectivity verification

---

## SQL (`server/sql/`)

- **`server/sql/database_schema.sql`**
  - Complete database schema
  - Table definitions:
    - `intel` - Faction intel and rumors
    - `scrappy_messages` - Messages left for Scrappy
    - `logs` - Session debugging logs
  - Indexes for performance
  - Row Level Security (RLS) policies
  - Anonymous access policies

---

## Documentation (`docs/`)

Comprehensive documentation files:

- **`docs/ACCESSIBILITY.md`** - Accessibility guidelines
- **`docs/API.md`** - API endpoints and webhook details
- **`docs/ARCHITECTURE.md`** - System architecture overview
- **`docs/AWS_DEPLOYMENT.md`** - AWS-specific deployment guide
- **`docs/CHANGELOG.md`** - Version history
- **`docs/CODE_REVIEW_REPORT.md`** - Code review report
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
- **`docs/AI_CODE_REVIEW_PROMPT.md`** - AI code review prompt
- **`docs/AI_HYBRID_APPROACH.md`** - AI hybrid approach documentation

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

### Lovable Documentation

- **`docs/lovable/LOVABLE_PROMPT.md`** - Lovable-specific documentation

---

## Environment Variables

### Server Environment Variables

Required environment variables for `server/` (`.env` or `.env.local`):

```
PORT=8080
DOMAIN=your-domain.com

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
```

### Client Environment Variables

Required environment variables for `client/` (`.env` or `.env.local`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SENTRY_DSN=your-sentry-dsn (optional)
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
- **Frontend:** Vite + React (in `client/`)
- **Database:** Supabase (PostgreSQL)
- **Voice:** Twilio ConversationRelay
- **Styling:** Tailwind CSS with ARC Raiders theme
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router
- **UI Components:** shadcn/ui
- **Error Monitoring:** Sentry
- **Icons:** Lucide React

---

## Quick Reference

### Development Commands

#### Server

```bash
cd server
npm run dev          # Start development server (tsx watch)
npm run build        # Build for production (TypeScript compile)
npm start            # Start production server
npm run lint         # Lint code
```

#### Client

```bash
cd client
npm run dev          # Start Vite dev server (port 3000)
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
- ✅ Web UI (Vite + React in `client/`)
- ✅ Database integration (Supabase)
- ✅ Session logging system
- ✅ Error monitoring (Sentry)
- ✅ Comprehensive error handling
- 📚 Comprehensive documentation
- 🚀 Deployable to Vercel/Heroku/Railway/AWS

---

## Related Files

- **LICENSE** - MIT License
- **README.md** - Main project README
- **.gitignore** - Git ignore rules

---

_Last indexed: 2024-12-19_  
_For questions or updates, see `docs/` directory or project README_
