# Architecture Overview

## System Architecture

ARC Line is built as a Next.js application with the following architecture:

```
┌─────────────────┐
│   User Device   │
│  (Browser/PWA)  │
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐
│   Vercel Edge   │
│   (Next.js)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│Supabase│ │ Twilio   │
│Database│ │Conversation│
└────────┘ └──────────┘
```

## Component Architecture

### Frontend (Next.js App Router)

- **Pages**: Server components for routing
- **Components**: Client components for interactivity
- **Layout**: Root layout with PWA configuration
- **Styling**: Tailwind CSS with custom ARC Raiders theme

### Backend (API Routes)

- **Webhook Handler**: `/api/twilio/conversation/webhook`
  - Receives Twilio ConversationRelay requests
  - Routes to appropriate hotline handler
  - Returns ConversationRelay response format

### Hotline Handlers

Each hotline handler (`lib/hotlines/*.ts`) implements:

- State machine pattern using `memory.step`
- Conversation flow logic
- Database interactions (via Supabase)
- Response generation

### Data Layer

- **Supabase Client**: Singleton client in `lib/supabase.ts`
- **Database Tables**: See `docs/DATABASE_SCHEMA.md`
- **Type Safety**: TypeScript types for all database entities

## Data Flow

### Hotline Call Flow

1. User calls Twilio phone number
2. Twilio routes to ConversationRelay
3. ConversationRelay sends webhook to `/api/twilio/conversation/webhook`
4. Webhook handler determines hotline type
5. Routes to appropriate hotline handler
6. Handler processes input, updates memory, queries database
7. Returns response with actions (say, listen, remember)
8. ConversationRelay speaks response to user
9. Process repeats until conversation ends

### Database Operations

- **Read Operations**: Loot searches, gossip retrieval
- **Write Operations**: Extraction requests, alarm creation, gossip submission
- **Updates**: Alarm status updates (via background job)

## State Management

### Conversation State

Stored in Twilio ConversationRelay memory:

- `hotlineType`: Which hotline is active
- `step`: Current step in conversation flow
- `phoneNumber`: User's phone number
- Hotline-specific state (location, search term, etc.)

### Application State

- Client-side: React hooks for UI state
- Server-side: Stateless API routes
- Database: Persistent state in Supabase

## Security

### API Security

- Webhook validation (Twilio signature verification - TODO)
- Environment variables for secrets
- Row Level Security in Supabase

### Data Security

- No sensitive data in client-side code
- Environment variables for API keys
- HTTPS only in production

## Performance

### Caching

- Service worker for offline support
- Static page generation where possible
- Database query optimization with indexes

### Optimization

- Code splitting via Next.js
- Image optimization (if images added)
- Lazy loading for components

## Scalability

### Horizontal Scaling

- Stateless API routes enable easy scaling
- Vercel handles auto-scaling
- Supabase handles database scaling

### Background Jobs

- Alarm processing (future: cron job or queue)
- Gossip verification (future: moderation queue)

## Monitoring

### Error Tracking

- Sentry integration (optional)
- Vercel error logs
- Twilio webhook logs

### Analytics

- Vercel Analytics (optional)
- Custom event tracking (future)

## Future Enhancements

- Webhook signature verification
- Rate limiting
- Caching layer (Redis)
- Background job processing
- Real-time updates (Supabase Realtime)
- Admin dashboard
- User authentication
