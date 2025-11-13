# Deployment Guide

This guide covers deploying ARCline to Vercel.

## Prerequisites

- GitHub account with repository access
- Vercel account (free tier works)
- Supabase project set up
- Twilio account with phone numbers configured

## Step 1: Environment Variables

Before deploying, configure these environment variables in Vercel:

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Twilio

- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `NEXT_PUBLIC_TWILIO_PHONE_NUMBER` - Single phone number for all hotlines

**Note**: The system uses one phone number with an interactive voice menu. Users press 1-5 to select options.

### Optional

- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN for error tracking
- `NEXT_PUBLIC_FEATURE_FLAG_KEY` - Feature flag service key

## Step 2: Deploy to Vercel

1. **Connect Repository**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Project**

   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

3. **Add Environment Variables**

   - Add all environment variables from Step 1
   - Mark sensitive variables appropriately

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

## Step 3: Configure Twilio Webhooks

After deployment, configure Twilio webhooks:

1. **Get Your Webhook URL**

   - Your webhook URL will be: `https://your-domain.vercel.app/api/twilio/conversation/webhook`

2. **Configure Twilio ConversationRelay**

   - In Twilio Console, go to Conversations
   - Set up ConversationRelay with your webhook URL
   - Configure for each hotline phone number

3. **Test Webhooks**
   - Use Twilio's webhook testing tools
   - Make test calls to verify functionality

## Step 4: Set Up Database

1. **Run Database Schema**

   - Go to Supabase SQL Editor
   - Run the SQL from `docs/DATABASE_SCHEMA.md`
   - Configure Row Level Security policies

2. **Seed Initial Data** (Optional)
   - Add some initial loot items
   - Add sample gossip entries

## Step 5: Verify Deployment

1. **Check Build Logs**

   - Ensure build completed successfully
   - Check for any warnings

2. **Test Functionality**

   - Visit your deployed site
   - Test each hotline
   - Verify PWA installation works
   - Check mobile responsiveness

3. **Monitor**
   - Set up Sentry (if configured)
   - Monitor Vercel analytics
   - Check Twilio logs

## Troubleshooting

### Build Failures

- Check environment variables are set correctly
- Verify all dependencies are in package.json
- Check TypeScript errors

### Webhook Issues

- Verify webhook URL is correct
- Check Twilio logs for errors
- Ensure API route is accessible

### Database Issues

- Verify Supabase credentials
- Check RLS policies
- Ensure tables exist

## Continuous Deployment

Vercel automatically deploys on:

- Push to main branch
- Pull request creation
- Manual deployment trigger

Configure branch protection and preview deployments as needed.
