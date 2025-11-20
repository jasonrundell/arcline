# ARCline Webapp

A modern React frontend for the ARCline voice hotline system. This webapp displays real-time intel submissions and Scrappy messages from the ARC Raiders community.

## Overview

The ARCline webapp provides a web interface for viewing:

- **Scrappy Messages**: Community messages left for Scrappy via the hotline
- **Intel Submissions**: Anonymous intelligence reports submitted through the voice system
- **Service Information**: Details about available hotline services (Extraction, Loot Locator, etc.)

## Features

- 📱 **Responsive Design**: Mobile-first design that works on all devices
- 🔄 **Real-time Data**: Fetches live data from Supabase
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- ⚡ **Fast Performance**: Powered by Vite for lightning-fast development and builds
- 🔒 **Type Safe**: Full TypeScript support

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library (Radix UI primitives)
- **React Query** - Data fetching and caching
- **Supabase** - Backend database
- **React Router** - Client-side routing
- **date-fns** - Date formatting
- **Sentry** - Error monitoring and performance tracking

## Prerequisites

- Node.js 18+ and npm
- Supabase project with the following tables:
  - `scrappy_messages` - Stores messages for Scrappy
  - `intel` - Stores intelligence reports

## Installation

1. **Navigate to the webapp directory**:

   ```bash
   cd webapp
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the `webapp` directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SENTRY_DSN=your-sentry-dsn
```

**Important**: Vite requires the `VITE_` prefix for environment variables to be exposed to client-side code.

### Required Variables

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

You can get these values from your Supabase project settings:

1. Go to your Supabase project dashboard
2. Navigate to **Settings > API**
3. Copy the **Project URL** and **anon/public** key

### Optional Variables

- `VITE_SENTRY_DSN` - Your Sentry DSN for error monitoring (optional but recommended for production)
- `VITE_SENTRY_ENABLE_IN_DEV` - Set to `"true"` to enable Sentry in development mode (default: disabled)

#### Setting up Sentry

1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new project and select **React** as the platform
3. Copy your DSN from the project settings
4. Add `VITE_SENTRY_DSN=your-dsn-here` to your `.env` file

**Note**: Sentry is optional. If `VITE_SENTRY_DSN` is not set, the app will work normally without error monitoring.

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

The dev server includes:

- Hot Module Replacement (HMR) for instant updates
- TypeScript type checking
- ESLint for code quality

## Building for Production

Build the production bundle:

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

Preview the production build locally:

```bash
npm run preview
```

## Deployment

### Vercel (Recommended)

See the main [SETUP.md](../docs/SETUP.md) guide for detailed Vercel deployment instructions.

Quick steps:

1. Connect your repository to Vercel
2. Set Root Directory to `webapp`
3. Add environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
4. Deploy!

### Other Platforms

The webapp can be deployed to any static hosting service:

- **Netlify**: Connect repository, set build command to `npm run build`, output directory to `dist`
- **GitHub Pages**: Use GitHub Actions to build and deploy
- **AWS S3 + CloudFront**: Upload `dist` folder contents
- **Any static host**: Upload the `dist` folder after building

## Project Structure

```
webapp/
├── public/              # Static assets
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/         # Images and other assets
│   ├── components/     # React components
│   │   └── ui/         # shadcn/ui components
│   ├── hooks/          # Custom React hooks
│   │   ├── use-intel.ts
│   │   ├── use-messages.ts
│   │   └── use-mobile.tsx
│   ├── lib/            # Utility libraries
│   │   ├── supabase.ts # Supabase client
│   │   └── utils.ts    # Helper functions
│   ├── pages/          # Page components
│   │   ├── index.tsx   # Main landing page
│   │   └── NotFound.tsx
│   ├── App.tsx         # Root component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tailwind.config.ts  # Tailwind configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Database Schema Requirements

The webapp expects the following Supabase tables:

### `scrappy_messages` table

```sql
- id (uuid, primary key)
- message (text) - Message content
- created_at (timestamp)
- verified (boolean) - Only verified messages are displayed
```

### `intel` table

```sql
- id (uuid, primary key)
- faction (text) - Faction name (e.g., "Raider Report")
- content (text) - Intel content
- priority (text, optional) - Priority level
- created_at (timestamp)
- verified (boolean) - Only verified intel is displayed
```

See [DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md) for the complete schema.

## Troubleshooting

### Environment Variables Not Working

- Ensure variables are prefixed with `VITE_`
- Restart the dev server after adding/changing variables
- Check that `.env` file is in the `webapp` directory

### Supabase Connection Errors

- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Verify Row Level Security (RLS) policies allow public read access
- Check browser console for specific error messages

### Build Failures

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`
- Verify all dependencies are installed

### Data Not Loading

- Check browser console for errors
- Verify Supabase tables exist and have data
- Ensure RLS policies allow SELECT operations
- Check network tab for failed API requests

### Sentry Not Reporting Errors

- Verify `VITE_SENTRY_DSN` is set in your `.env` file
- Check browser console for Sentry initialization warnings
- In development, Sentry is disabled by default unless `VITE_SENTRY_ENABLE_IN_DEV=true`
- Verify your Sentry project is active and receiving data

## Contributing

When adding new features:

1. Follow the existing code structure
2. Use TypeScript for all new files
3. Follow the existing naming conventions
4. Add proper error handling
5. Test on mobile devices

## License

See the main repository [LICENSE](../LICENSE) file.

## Related Documentation

- [SETUP.md](../docs/SETUP.md) - Full setup guide including webapp deployment
- [DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md) - Database schema reference
- [API.md](../docs/API.md) - Backend API documentation
- [ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture overview
