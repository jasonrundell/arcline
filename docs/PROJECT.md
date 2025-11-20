# ARC Line - ARC Raiders Multi-Hotline Web App

**Project Type:** Web Application  
**Tech Stack:** Next.js 14+, Tailwind CSS, Supabase, Vercel, Twilio Programmable Voice & ConversationRelay, GitHub  
**Theme & Goal:** Submit to the [Twilio Web Dev Challenge](https://codetv.dev/blog/web-dev-challenge-hackathon-s2e11-code-powered-phone-hotline) with a slick, retro-styled, ARC Raiders universe hotline offering multiple fun, in-universe automated options.

---

## ✨ Features

- **Multi-Hotline System:**

  1. Extraction Request Hotline (automated in-universe “extraction” comm)
  2. Loot Locator Hotline (world item search bot)
  3. Scrappy’s Chicken Line (fun sound clip & randomizer)
  4. Faction Gossip Line (community rumor & news splash)
  5. Wake-Up Call/Raid Start Alarm (automated reminders)

- **Twilio/ConversationRelay Integration:**

  - All voice/sms hotlines use ConversationRelay between user and backend logic

- **Database:**

  - Supabase for user state, requests logging, loot data, alarms, and user/gossip submissions

- **Mobile-first Design:**

  - Fully mobile responsive—retro, polished, ARC RAIDERS-style UI
  - Use the ARC Raiders palette (no indigo or purple), e.g.:
    - **_Deep Space Black:_** #1a1a22
    - **_Burnt Orange:_** #ff6b32
    - **_Salvage Gray:_** #8f8f8f
    - **_Combat Sand:_** #ffe7a0
    - **_Accent Cyan:_** #00daff
    - **_Dark Olive:_** #273110

- **Slick Retro UI:**

  - Minimalist panels, large buttons, soft glow/neon, bold type, in-universe terminal/monitor cues
  - Use iconography and sound cues from ARC

- **Progressive Web App (PWA):**

  - Users can install as an app—full offline cache support
  - Expose a “Clear Cache/Check for Updates” button to manually clear outdated app data when new versions go live

- **Vercel Hosting:**

  - Build & deploy with Vercel; ensure repo is public on GitHub

- **Testing & Quality:**

  - 60%+ code coverage target
  - **Unit tests:** Core components, API logic, database functions (Jest + React Testing Library)
  - **End-to-End tests:** Voice/SMS flows, PWA installability, and manual cache clear (Cypress or Playwright)

- **Accessibility:**

  - WCAG 2.1 AA conformance, retro themes maintained with strong color contrast, focus state, keyboard navigation

- **Feature Flags & Monitoring:**
  - LaunchDarkly or similar (if available free tier) for toggling hotline scripts
  - Sentry for production monitoring/error capture

---

## 🚀 Getting Started

### 1. Clone and Bootstrap
