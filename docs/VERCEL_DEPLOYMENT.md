# Vercel Deployment Guide (Webhook-Based)

This guide covers deploying ARC Line entirely on Vercel using ConversationRelay's webhook mode (no separate WebSocket server needed).

## Architecture Overview

This deployment uses ConversationRelay's **webhook mode** instead of WebSocket mode, which allows everything to run on Vercel serverless functions:

```
┌─────────────────┐
│  Twilio Phone   │
│     Number      │
└────────┬────────┘
         │
         │ HTTPS GET
         ▼
┌─────────────────┐
│  Vercel Function│
│    (/twiml)     │
└────────┬────────┘
         │
         │ Returns TwiML with Webhook URL
         ▼
┌─────────────────┐
│  Vercel Function│
│ (/api/twilio/   │
│ conversation/   │
│   webhook)      │
└─────────────────┘
```

## Prerequisites

- Vercel account (sign up at [vercel.com](https://vercel.com))
- Supabase project set up
- Twilio account with phone number

## Step 1: Deploy to Vercel

1. **Connect Repository to Vercel**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Project Settings**

   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: Leave empty (or `npm run build` if you want to build TypeScript)
   - Output Directory: Leave empty
   - Install Command: `npm install`

3. **Set Environment Variables**

   In Vercel project settings, add:

   ```env
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-key
   ```

   **Note**: Vercel automatically provides `VERCEL_URL` environment variable, which is used by the TwiML endpoint to construct the webhook URL.

4. **Deploy**

   - Click "Deploy"
   - Wait for deployment to complete
   - Note your Vercel domain (e.g., `your-app.vercel.app`)

## Step 2: Configure Twilio

1. **Get Your TwiML Endpoint URL**

   Your TwiML endpoint will be:

   ```
   https://your-app.vercel.app/twiml
   ```

   or

   ```
   https://your-app.vercel.app/api/twiml
   ```

   (Both work due to the rewrite rule)

2. **Configure Phone Number**

   - Go to [Twilio Console > Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/active)
   - Click on your phone number
   - Under **"A CALL COMES IN"**, set:
     - **Webhook URL**: `https://your-app.vercel.app/twiml`
     - **HTTP Method**: GET
   - Save configuration

## Step 3: Verify Deployment

1. **Test TwiML Endpoint**

   Visit `https://your-app.vercel.app/twiml` in your browser. You should see TwiML XML with a webhook URL pointing to your Vercel function.

2. **Test Webhook Endpoint**

   The webhook endpoint should be accessible at:

   ```
   https://your-app.vercel.app/api/twilio/conversation/webhook
   ```

3. **Test Full Flow**

   - Call your Twilio phone number
   - You should hear the menu
   - Press 1-5 to test each hotline
   - Verify responses work correctly

## Environment Variables Reference

### Required

| Variable            | Description            | Example                   |
| ------------------- | ---------------------- | ------------------------- |
| `SUPABASE_URL`      | Supabase project URL   | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...`                  |

### Automatic (Provided by Vercel)

| Variable     | Description                                    |
| ------------ | ---------------------------------------------- |
| `VERCEL_URL` | Current deployment URL (without protocol)      |
| `VERCEL_ENV` | Environment (production, preview, development) |

## How It Works

1. **Call Initiation**: When a user calls, Twilio requests `/twiml`
2. **TwiML Response**: Vercel function returns TwiML with ConversationRelay webhook configuration
3. **ConversationRelay**: Twilio's ConversationRelay service handles the call
4. **Webhook Calls**: For each user input, ConversationRelay calls `/api/twilio/conversation/webhook`
5. **Response**: Your function processes the input and returns a JSON response with actions
6. **Repeat**: ConversationRelay speaks the response and calls webhook again for next input

## Troubleshooting

### TwiML Endpoint Returns Wrong Webhook URL

- Verify `VERCEL_URL` is available (it's automatically set by Vercel)
- Check that the TwiML function is correctly constructing the webhook URL
- Ensure you're using the production deployment URL

### Webhook Not Receiving Requests

- Verify webhook URL is accessible (test with curl)
- Check Vercel function logs for errors
- Ensure Twilio webhook is configured correctly
- Check that ConversationRelay is enabled on your phone number

### Phone Calls Don't Work

- Verify Twilio webhook URL points to Vercel TwiML endpoint
- Check Vercel function logs for errors
- Verify ConversationRelay is properly configured
- Check Twilio logs in Console

### Function Timeout

- Default timeout is 10 seconds for Hobby plan, 60 seconds for Pro
- Increase timeout in `vercel.json` if needed (up to 60s on Pro plan)
- Optimize hotline handlers to respond quickly

## Cost Considerations

### Vercel

- **Free Tier**:
  - 100GB bandwidth
  - 100 serverless function invocations per day
  - 10 second function timeout
- **Pro Tier**: $20/month
  - Unlimited bandwidth
  - 1M function invocations
  - 60 second function timeout
  - Better performance

### Twilio

- Pay per minute for voice calls
- ConversationRelay has no additional cost beyond standard voice pricing

## Advantages of Webhook Mode

✅ **No separate server needed** - Everything runs on Vercel  
✅ **Automatic scaling** - Vercel handles traffic spikes  
✅ **Easy deployment** - Single platform to manage  
✅ **Cost effective** - Pay only for what you use  
✅ **Simple setup** - No WebSocket server configuration

## Limitations

⚠️ **Function timeout**: 10s (free) or 60s (pro) - ensure handlers respond quickly  
⚠️ **Cold starts**: First request after inactivity may be slower  
⚠️ **No persistent connections**: Each request is independent (memory stored in ConversationRelay)

## Continuous Deployment

- Automatically deploys on push to main branch
- Supports preview deployments for pull requests
- Environment variables are managed in Vercel dashboard

## Security Best Practices

1. **Environment Variables**: Never commit secrets to git
2. **HTTPS Only**: Vercel automatically uses HTTPS
3. **Webhook Validation**: Consider adding Twilio signature verification (future enhancement)
4. **Rate Limiting**: Vercel provides basic rate limiting
5. **Monitoring**: Set up error tracking (Sentry, etc.)

## Comparison: Webhook vs WebSocket Mode

| Feature          | Webhook Mode (This Guide)       | WebSocket Mode                |
| ---------------- | ------------------------------- | ----------------------------- |
| Platform         | Vercel only                     | Vercel + Separate server      |
| Setup Complexity | Simple                          | More complex                  |
| Cost             | Lower (pay per request)         | Higher (always-on server)     |
| Latency          | Slightly higher (HTTP overhead) | Lower (persistent connection) |
| Scalability      | Automatic                       | Manual scaling                |
| Best For         | Most use cases                  | Real-time streaming needs     |

## Support

For issues specific to:

- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **Twilio**: See [TWILIO_SETUP.md](TWILIO_SETUP.md)
- **ConversationRelay**: See [Twilio ConversationRelay Docs](https://www.twilio.com/docs/conversations/conversation-relay)
