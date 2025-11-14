# Setup Guide

This guide covers setting up ARCline as a standalone voice system.

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Twilio account with a phone number
- ngrok (for local development)

## Step 1: Clone and Install

```bash
git clone https://github.com/jasonrundell/arcline.git
cd arcline
npm install
```

## Step 2: Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8080
DOMAIN=your-ngrok-domain.ngrok.io

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Twilio Configuration (optional - not required for basic setup)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
```

**Note**: The `DOMAIN` variable should be your ngrok domain (without `https://`) for local development, or your production domain for deployed environments.

## Step 3: Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL from `docs/DATABASE_SCHEMA.md`
4. Verify tables are created:
   - `extraction_requests`
   - `loot_items`
   - `gossip`
   - `alarms`

## Step 4: Local Development Setup

### Start ngrok

In a separate terminal:

```bash
ngrok http 8080
```

Copy the ngrok URL (e.g., `abc123.ngrok.io`) and update your `.env` file:

```env
DOMAIN=abc123.ngrok.io
```

### Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:8080` and watch for file changes.

## Step 5: Configure Twilio

1. **Get Your Webhook URL**

   Your TwiML endpoint will be:
   ```
   https://your-ngrok-domain.ngrok.io/twiml
   ```

2. **Configure Phone Number**

   - Go to [Twilio Console > Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/active)
   - Click on your phone number
   - Under **"A CALL COMES IN"**, set:
     - **Webhook URL**: `https://your-ngrok-domain.ngrok.io/twiml`
     - **HTTP Method**: GET
   - Save configuration

3. **Test the Connection**

   - Call your Twilio phone number
   - You should hear: "Welcome to ARCline, the ARC Raiders Multi-Hotline system..."
   - Press 1-5 to select a hotline

## Step 6: Verify Everything Works

1. **Health Check**

   Visit `http://localhost:8080/health` in your browser. You should see:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-..."
   }
   ```

2. **Test TwiML Endpoint**

   Visit `https://your-ngrok-domain.ngrok.io/twiml` in your browser. You should see TwiML XML.

3. **Make a Test Call**

   - Call your Twilio phone number
   - Listen to the menu
   - Press 1-5 to test each hotline

## Troubleshooting

### Server Won't Start

- Check that port 8080 is not in use
- Verify all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run build`

### WebSocket Connection Fails

- Ensure ngrok is running and the URL is correct
- Verify `DOMAIN` environment variable matches your ngrok domain
- Check that the TwiML endpoint returns correct XML
- Ensure you're using `wss://` (secure WebSocket) in production

### Phone Calls Don't Work

- Verify Twilio phone number webhook is configured correctly
- Check Twilio logs in the Console
- Ensure ngrok URL is accessible (test in browser)
- Verify server logs for errors

### Database Errors

- Check Supabase credentials in `.env`
- Verify database tables exist
- Check Supabase logs for errors
- Ensure Row Level Security (RLS) policies allow access if configured

## Next Steps

- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- See [TWILIO_SETUP.md](TWILIO_SETUP.md) for advanced Twilio configuration
- See [API.md](API.md) for API documentation

