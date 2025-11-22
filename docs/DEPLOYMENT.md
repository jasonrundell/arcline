# Deployment Guide

This guide covers deploying ARC Line as a standalone Node.js voice system.

## Deployment Options

- **Single Platform**: Deploy everything (TwiML + WebSocket) on one platform (Railway, Fly.io, Heroku, etc.)
- **Hybrid (Vercel)**: Deploy TwiML endpoint on Vercel, WebSocket server elsewhere
  - See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for Vercel-specific instructions

## Prerequisites

- Node.js 18+ runtime
- Supabase project set up
- Twilio account with phone number configured
- Hosting platform account (Heroku, Railway, Fly.io, AWS, etc.)

## Step 1: Environment Variables

Before deploying, configure these environment variables in your hosting platform:

### Server Configuration

- `PORT` - Port number (usually set automatically by hosting platform)
- `DOMAIN` - Your production domain (e.g., `your-app.herokuapp.com` or `your-app.railway.app`)

### Supabase

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Optional (for future features)

- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token

## Step 2: Deploy to Your Platform

### Option A: Heroku

The repository is configured to deploy the `server/` folder as the root project. The root `package.json` and `Procfile` handle this automatically.

1. **Install Heroku CLI** and login:

   ```bash
   heroku login
   ```

2. **Create Heroku App**:

   ```bash
   heroku create your-app-name
   ```

3. **Set Environment Variables**:

   ```bash
   heroku config:set DOMAIN=your-app-name.herokuapp.com
   heroku config:set SUPABASE_URL=your-supabase-url
   heroku config:set SUPABASE_ANON_KEY=your-supabase-key
   ```

4. **Deploy**:

   ```bash
   git push heroku main
   ```

   **Note**: The root `package.json` automatically installs server dependencies and builds the project during deployment. The root `Procfile` runs the server from the `server/` directory.

### Option B: Railway

1. **Connect Repository**

   - Go to [Railway Dashboard](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Build Settings**

   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Root Directory: `./`

3. **Add Environment Variables**

   - Add all variables from Step 1
   - Set `DOMAIN` to your Railway domain (e.g., `your-app.railway.app`)

4. **Deploy**
   - Railway will automatically deploy on push to main branch

### Option C: Fly.io

1. **Install Fly CLI**:

   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**:

   ```bash
   fly auth login
   ```

3. **Create App**:

   ```bash
   fly launch
   ```

4. **Set Environment Variables**:

   ```bash
   fly secrets set DOMAIN=your-app.fly.dev
   fly secrets set SUPABASE_URL=your-supabase-url
   fly secrets set SUPABASE_ANON_KEY=your-supabase-key
   ```

5. **Deploy**:
   ```bash
   fly deploy
   ```

### Option D: AWS

Deploy to AWS using Elastic Beanstalk, EC2, or ECS. See [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md) for detailed AWS deployment instructions.

**Quick Start (Elastic Beanstalk)**:

1. Navigate to server directory:

   ```bash
   cd server
   ```

2. Initialize Elastic Beanstalk:

   ```bash
   eb init
   eb create arcline-production
   ```

3. Set environment variables:

   ```bash
   eb setenv DOMAIN=your-domain.com SUPABASE_URL=... SUPABASE_ANON_KEY=...
   ```

4. Deploy:
   ```bash
   eb deploy
   ```

For detailed instructions on EC2, ECS, and advanced AWS configurations, see [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md).

## Step 3: Configure Twilio Webhooks

After deployment, configure Twilio webhooks:

1. **Get Your Webhook URL**

   Your TwiML endpoint will be:

   ```
   https://your-domain.com/twiml
   ```

2. **Configure Phone Number**

   - Go to [Twilio Console > Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/active)
   - Click on your phone number
   - Under **"A CALL COMES IN"**, set:
     - **Webhook URL**: `https://your-domain.com/twiml`
     - **HTTP Method**: GET
   - Save configuration

3. **Test Webhooks**

   - Use Twilio's webhook testing tools
   - Make test calls to verify functionality
   - Check server logs for any errors

## Step 4: Set Up Database

1. **Run Database Schema**

   - Go to Supabase SQL Editor
   - Run the SQL from `docs/DATABASE_SCHEMA.md`
   - Configure Row Level Security policies if needed

2. **Seed Initial Data** (Optional)

   - Add some initial loot items
   - Add sample gossip entries

## Step 5: Verify Deployment

1. **Check Build Logs**

   - Ensure build completed successfully
   - Check for any warnings or errors

2. **Test Health Endpoint**

   Visit `https://your-domain.com/health` in your browser. You should see:

   ```json
   {
     "status": "ok",
     "timestamp": "2024-..."
   }
   ```

3. **Test TwiML Endpoint**

   Visit `https://your-domain.com/twiml` in your browser. You should see TwiML XML.

4. **Test Functionality**

   - Call your Twilio phone number
   - Listen to the menu
   - Speak what you want to do
   - Verify responses work correctly

5. **Monitor**

   - Check server logs for errors
   - Monitor Twilio logs
   - Set up error tracking (Sentry, etc.) if desired

## Troubleshooting

### Build Failures

- Check environment variables are set correctly
- Verify all dependencies are in package.json
- Check TypeScript errors: `npm run build`
- Ensure Node.js version is 18+

### WebSocket Issues

- Verify HTTPS is enabled (required for WebSocket in production)
- Check that `DOMAIN` environment variable is set correctly
- Ensure WebSocket endpoint is accessible
- Check server logs for WebSocket connection errors

### Phone Calls Not Working

- Verify webhook URL is correct and accessible
- Check Twilio logs for errors
- Ensure TwiML endpoint returns valid XML
- Verify phone number is active in Twilio

### Database Issues

- Verify Supabase credentials
- Check RLS policies
- Ensure tables exist
- Check Supabase logs for errors

## Continuous Deployment

Most platforms support automatic deployment:

- **Heroku**: Deploys on push to main branch
- **Railway**: Deploys on push to main branch
- **Fly.io**: Deploys on push to main branch (if configured)

Configure branch protection and preview deployments as needed.

## Production Checklist

- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] Twilio webhook configured
- [ ] Health endpoint responding
- [ ] TwiML endpoint returning valid XML
- [ ] Test calls working
- [ ] Error logging configured
- [ ] Monitoring set up
- [ ] HTTPS enabled
- [ ] Domain configured correctly

## Security Considerations

- Never commit `.env` files
- Use environment variables for all secrets
- Enable HTTPS (required for WebSocket)
- Configure Supabase RLS policies
- Regularly update dependencies
- Monitor for security vulnerabilities
