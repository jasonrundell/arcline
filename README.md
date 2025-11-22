# ARC Line - ARC Raiders Multi-Hotline Voice System

A voice-based multi-hotline system for the ARC Raiders universe, built with Twilio ConversationRelay. Users call a single phone number and select from 5 different hotlines by pressing 1-5.

1 XXX ARC-LINE (272-5463) (272-5463 not available)

+1 872 282 LINE (5463)

## ✨ Features

- **4 Automated Hotlines:**

  - 🚁 Extraction Request - Request extractions from your location
  - 📦 Loot Locator - Search for valuable items
  - 🐔 Scrappy's Chicken Line - Fun sound clips and randomizers
  - 📢 Faction Intel - Community rumors and news

- **Tech Stack:**

  - Node.js with TypeScript
  - Fastify web server
  - WebSocket support for Twilio ConversationRelay
  - Supabase for database

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Twilio account with a phone number
- ngrok (for local development)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/jasonrundell/arcline.git
   cd arcline
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies** (optional, for web app)

   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**

   Create a `.env` file in the `server/` directory:

   ```env
   PORT=8080
   DOMAIN=your-ngrok-domain.ngrok.io

   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key

   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   ```

5. **Set up database**

   - Go to your Supabase project
   - Run the SQL from `docs/DATABASE_SCHEMA.md` in the SQL Editor

6. **Start ngrok** (for local development)

   ```bash
   ngrok http 8080
   ```

   Copy the ngrok URL (e.g., `abc123.ngrok.io`) and update your `.env` file:

   ```env
   DOMAIN=abc123.ngrok.io
   ```

7. **Run development server**

   ```bash
   cd server
   npm run dev
   ```

   The server will start on `http://localhost:8080`

8. **Configure Twilio**

   - Go to your Twilio Console
   - Navigate to Phone Numbers > Manage > Active Numbers
   - Click on your phone number
   - Under "A CALL COMES IN", set the webhook URL to:
     ```
     https://your-ngrok-domain.ngrok.io/twiml
     ```
   - Set HTTP method to **GET**

9. **Test the system**

   Call your Twilio phone number and follow the voice prompts!

## 📁 Project Structure

```
arcline/
├── server/                # Server application
│   ├── server.ts         # Main server file with WebSocket support
│   ├── lib/              # Utility libraries
│   │   ├── supabase.ts  # Supabase client
│   │   ├── ai/          # AI handlers
│   │   │   ├── lootlookup.ts
│   │   │   └── shaniresponse.ts
│   │   ├── hotlines/    # Hotline handlers
│   │   │   ├── menu.ts  # Main menu handler
│   │   │   ├── extraction.ts
│   │   │   ├── loot.ts
│   │   │   ├── chicken.ts
│   │   │   ├── listen-intel.ts
│   │   │   └── submit-intel.ts
│   │   └── utils/       # Utility functions
│   │       ├── exit.ts
│   │       ├── hotline-detection.ts
│   │       ├── repeat.ts
│   │       ├── router.ts
│   │       ├── save-logs.ts
│   │       ├── session-logger.ts
│   │       └── sms.ts
│   ├── types/            # TypeScript types
│   │   └── twilio.ts    # Twilio ConversationRelay types
│   ├── constants/        # Constants
│   ├── scripts/          # Utility scripts
│   ├── sql/              # Database schema
│   │   └── database_schema.sql
│   ├── Dockerfile        # Docker configuration
│   ├── Procfile          # Process configuration
│   ├── template.yaml     # AWS SAM template
│   ├── tsconfig.json     # TypeScript configuration
│   └── package.json
├── client/                # Client web application
│   ├── src/              # React source code
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility libraries
│   │   ├── types/        # TypeScript types
│   │   ├── constants/    # Constants
│   │   └── assets/       # Static assets
│   ├── public/           # Public static assets
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
└── docs/                  # Documentation
    ├── personas/         # Character personas
    └── lovable/          # Lovable-specific docs
```

## 🏗️ Building for Production

### Server

```bash
cd server
npm run build
npm start
```

### Client

```bash
cd client
npm run build
```

## 🔧 How It Works

1. **Call Initiation**: When a user calls the Twilio phone number, Twilio requests the `/twiml` endpoint, which returns TwiML instructions to connect to the WebSocket server.

2. **WebSocket Connection**: Twilio connects to the `/ws` WebSocket endpoint, establishing a persistent connection for the call.

3. **Menu Selection**: The system presents a voice menu and routes based on voice input.

4. **Hotline Routing**: Based on the selection, the system routes to the appropriate hotline handler:

   - 1 → Extraction Request
   - 2 → Loot Locator
   - 3 → Scrappy's Chicken Line
   - 4 → Faction News
   - 5 → Event Alarm

5. **Conversation Flow**: Each hotline handler manages its own conversation flow using a state machine pattern with memory persistence.

## 📚 Documentation

- [API Documentation](docs/API.md) - API endpoints and webhook details
- [Database Schema](docs/DATABASE_SCHEMA.md) - Database structure and setup
- [Deployment Guide](docs/DEPLOYMENT.md) - Deployment instructions
- [AWS Deployment](docs/AWS_DEPLOYMENT.md) - AWS-specific deployment guide
- [Vercel Deployment](docs/VERCEL_DEPLOYMENT.md) - Vercel-specific deployment guide
- [Twilio Setup](docs/TWILIO_SETUP.md) - Twilio ConversationRelay configuration
- [Twilio ConversationRelay](https://www.twilio.com/docs/voice/conversationrelay) - Twilio ConversationRelay official documentation

## 🚢 Deployment

The application can be deployed to any Node.js hosting platform:

### Single Platform Deployment

- **Heroku**: Root `package.json` and `Procfile` automatically configure deployment from `server/` directory
- **Railway**: Configure build command `npm run build` and start command `npm start` in `server/` directory
- **Fly.io**: Use Dockerfile in `server/` directory
- **AWS**: See [AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md) for Elastic Beanstalk, EC2, or ECS deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

### Vercel Deployment (Recommended)

Deploy everything on Vercel using ConversationRelay's webhook mode:

- **TwiML Endpoint**: Vercel serverless function
- **Webhook Handler**: Vercel serverless function
- **No separate server needed** - Everything runs on Vercel!

See [VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) for Vercel-specific instructions.

### Deployment Checklist

1. Set all environment variables
2. Configure your Twilio phone number webhook to point to your deployed `/twiml` endpoint
3. Use HTTPS (required for production WebSocket connections)
4. Verify WebSocket server is accessible

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Twilio Web Dev Challenge
- Inspired by ARC Raiders universe
- Uses Twilio ConversationRelay for voice interactions
- Based on [Twilio ConversationRelay Tutorial](https://www.twilio.com/en-us/blog/developers/tutorials/product/integrate-openai-twilio-voice-using-conversationrelay)
