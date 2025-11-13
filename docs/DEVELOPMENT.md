# Development Guide

## Local Development Setup

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
NEXT_PUBLIC_TWILIO_EXTRACTION_NUMBER=+1234567890
NEXT_PUBLIC_TWILIO_LOOT_NUMBER=+1234567890
NEXT_PUBLIC_TWILIO_CHICKEN_NUMBER=+1234567890
NEXT_PUBLIC_TWILIO_GOSSIP_NUMBER=+1234567890
NEXT_PUBLIC_TWILIO_ALARM_NUMBER=+1234567890
```

### 2. Database Setup

1. Create a Supabase project
2. Run the SQL from `docs/DATABASE_SCHEMA.md`
3. Configure Row Level Security policies

### 3. Twilio Setup

1. Create a Twilio account
2. Purchase phone numbers (or use trial numbers)
3. Set up ConversationRelay webhooks pointing to your local dev server
4. Use ngrok or similar to expose localhost:3000 for webhook testing

### 4. Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Code Structure

### Hotline Handlers

Each hotline handler (`lib/hotlines/*.ts`) follows a state machine pattern:

1. **State Management**: Uses `memory.step` to track conversation flow
2. **Input Processing**: Processes user input based on current step
3. **Response Generation**: Returns ConversationRelay response with actions
4. **Memory Updates**: Updates conversation memory for next turn

### Adding a New Hotline

1. Create handler in `lib/hotlines/new-hotline.ts`
2. Add route in `app/api/twilio/conversation/webhook/route.ts`
3. Add hotline card in `components/HotlineGrid.tsx`
4. Create detail page in `app/hotline/[id]/page.tsx`
5. Add database schema if needed

### Component Guidelines

- Use TypeScript for all components
- Follow accessibility best practices (WCAG 2.1 AA)
- Use Tailwind classes with ARC Raiders color palette
- Ensure mobile responsiveness
- Add proper ARIA labels

### Testing Guidelines

- Write unit tests for hotline handlers
- Test component rendering and interactions
- Add E2E tests for critical user flows
- Maintain 60%+ code coverage

## Debugging

### Twilio Webhooks

Use ngrok to expose local server:
```bash
ngrok http 3000
```

Update Twilio webhook URL to ngrok URL.

### Database Queries

Use Supabase dashboard SQL editor for direct queries.

### Service Worker

Clear browser cache and unregister service worker:
- Chrome DevTools > Application > Service Workers > Unregister
- Or use the "Clear Cache" button in the app

## Code Style

- Use TypeScript strict mode
- Follow Next.js 14+ conventions
- Use functional components with hooks
- Prefer async/await over promises
- Use meaningful variable names
- Add comments for complex logic

## Git Workflow

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and commit: `git commit -m "feat: add new feature"`
3. Push and create PR: `git push origin feature/new-feature`
4. Use Conventional Commits format

## Common Issues

### Build Errors
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Type Errors
- Run `npm run build` to see TypeScript errors
- Check `tsconfig.json` configuration

### Webhook Not Working
- Verify webhook URL is accessible
- Check Twilio logs
- Verify environment variables are set

