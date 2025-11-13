# Setup Checklist

Use this checklist to ensure your ARCline project is fully configured.

## Pre-Development Setup

- [ ] Node.js 18+ installed
- [ ] Git repository cloned
- [ ] Dependencies installed (`npm install`)

## Environment Configuration

- [ ] `.env.local` file created from `.env.example`
- [ ] Supabase URL configured (`NEXT_PUBLIC_SUPABASE_URL`)
- [ ] Supabase anonymous key configured (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] Twilio Account SID configured (`TWILIO_ACCOUNT_SID`)
- [ ] Twilio Auth Token configured (`TWILIO_AUTH_TOKEN`)
- [ ] All Twilio phone numbers configured (5 hotlines)

## Database Setup

- [ ] Supabase project created
- [ ] Database schema executed (from `docs/DATABASE_SCHEMA.md`)
- [ ] Row Level Security policies configured
- [ ] Test data inserted (optional)

## Twilio Setup

- [ ] Twilio account created
- [ ] Phone numbers purchased/configured
- [ ] ConversationRelay configured
- [ ] Webhook URL set in Twilio
- [ ] Test calls made to verify functionality

## PWA Assets

- [ ] Icon files created:
  - [ ] `/public/icon-192.png` (192x192)
  - [ ] `/public/icon-512.png` (512x512)
- [ ] Manifest file verified (`/public/manifest.json`)
- [ ] Service worker tested

## Testing

- [ ] Unit tests pass (`npm test`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Code coverage meets 60% threshold
- [ ] Manual testing completed:
  - [ ] Homepage loads correctly
  - [ ] All hotline cards display
  - [ ] Navigation works
  - [ ] Mobile responsive
  - [ ] PWA installable

## Deployment

- [ ] Repository pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set in Vercel
- [ ] Build successful
- [ ] Webhook URL updated in Twilio
- [ ] Production testing completed

## Documentation

- [ ] README.md reviewed
- [ ] API documentation reviewed
- [ ] Database schema documented
- [ ] Deployment guide followed

## Optional Enhancements

- [ ] Sentry configured for error tracking
- [ ] Feature flags configured (LaunchDarkly)
- [ ] Analytics configured (Vercel Analytics)
- [ ] Custom icons designed
- [ ] Additional tests written

## Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

If something doesn't work:

1. Check environment variables are set correctly
2. Verify database schema is executed
3. Check Twilio webhook configuration
4. Review build logs in Vercel
5. Check browser console for errors
6. Review Twilio logs for webhook issues

## Getting Help

- Review documentation in `/docs` directory
- Check Twilio documentation
- Review Supabase documentation
- Check Next.js documentation

