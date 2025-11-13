# ARCline - ARC Raiders Multi-Hotline Web App

A retro-styled, multi-hotline web application for the ARC Raiders universe, built for the [Twilio Web Dev Challenge](https://codetv.dev/blog/web-dev-challenge-hackathon-s2e11-code-powered-phone-hotline).

## ✨ Features

- **5 Automated Hotlines:**
  - 🚁 Extraction Request Hotline - Request extractions from your location
  - 📦 Loot Locator Hotline - Search for valuable items
  - 🐔 Scrappy's Chicken Line - Fun sound clips and randomizers
  - 📢 Faction Gossip Line - Community rumors and news
  - ⏰ Wake-Up Call / Raid Alarm - Automated reminders

- **Tech Stack:**
  - Next.js 14+ with App Router
  - TypeScript
  - Tailwind CSS with ARC Raiders color palette
  - Supabase for database
  - Twilio ConversationRelay for voice/SMS
  - PWA support with offline caching
  - Jest + React Testing Library for unit tests
  - Playwright for E2E tests

- **Design:**
  - Retro ARC Raiders-themed UI
  - Mobile-first responsive design
  - WCAG 2.1 AA accessibility compliance
  - Terminal/monitor aesthetic with neon glow effects

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Twilio account with phone numbers
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jasonrundell/arcline.git
   cd arcline
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   - Supabase URL and keys
   - Twilio Account SID and Auth Token
   - Twilio phone numbers for each hotline

4. **Set up database**
   - Go to your Supabase project
   - Run the SQL from `docs/DATABASE_SCHEMA.md` in the SQL Editor

5. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
arcline/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── twilio/       # Twilio webhook handlers
│   ├── hotline/          # Hotline detail pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Homepage
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── HotlineCard.tsx
│   ├── HotlineGrid.tsx
│   └── HotlineDetail.tsx
├── lib/                   # Utility libraries
│   ├── supabase.ts       # Supabase client
│   └── hotlines/         # Hotline handlers
├── types/                 # TypeScript types
├── __tests__/            # Unit tests
├── e2e/                  # E2E tests
├── docs/                 # Documentation
└── public/               # Static assets
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

### E2E Tests

```bash
npm run test:e2e
```

## 🏗️ Building for Production

```bash
npm run build
npm start
```

## 📱 PWA Features

- Installable as a mobile app
- Offline support with service worker
- Cache management via "Clear Cache" button
- Responsive design for all screen sizes

## 🎨 Color Palette

- **Deep Space Black:** `#1a1a22`
- **Burnt Orange:** `#ff6b32`
- **Salvage Gray:** `#8f8f8f`
- **Combat Sand:** `#ffe7a0`
- **Accent Cyan:** `#00daff`
- **Dark Olive:** `#273110`

## 📚 Documentation

- [API Documentation](docs/API.md) - API endpoints and webhook details
- [Database Schema](docs/DATABASE_SCHEMA.md) - Database structure and setup
- [Deployment Guide](docs/DEPLOYMENT.md) - Deploying to Vercel
- [Project Plan](docs/PROJECT.md) - Original project requirements

## 🚢 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

Quick steps:
1. Push to GitHub
2. Connect to Vercel
3. Configure environment variables
4. Deploy!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Twilio Web Dev Challenge
- Inspired by ARC Raiders universe
- Uses Twilio ConversationRelay for voice interactions
