# Rama Dashboard — Full Setup & Deployment Guide

## 📁 Project Structure

```
rama-dashboard/
├── app/
│   ├── page.tsx                         ← Login / landing page
│   ├── layout.tsx                       ← Root layout
│   ├── globals.css                      ← Global styles + design system
│   ├── auth/
│   │   └── callback/route.ts            ← Discord OAuth callback
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts           ← Redirect to Discord OAuth
│   │   │   └── logout/route.ts          ← Clear session
│   │   ├── user/
│   │   │   └── guilds/route.ts          ← Fetch user's guilds filtered by bot
│   │   └── guilds/
│   │       ├── route.ts                 ← User global stats (XP, credits)
│   │       └── [guildId]/
│   │           ├── config/route.ts      ← GET/PATCH guild config
│   │           ├── moderation/route.ts  ← Warns, jailed members
│   │           ├── tickets/route.ts     ← Open tickets list
│   │           ├── economy/route.ts     ← Leaderboards, transactions
│   │           ├── xp/route.ts          ← XP leaderboards
│   │           ├── antiraid/route.ts    ← Anti-raid config
│   │           └── members/
│   │               ├── [userId]/route.ts ← Per-user stats
│   │               └── activity/route.ts ← Message counts
│   └── dashboard/
│       ├── page.tsx                     ← Server picker + global user stats
│       └── [guildId]/
│           ├── layout.tsx               ← Sidebar + responsive shell
│           ├── page.tsx                 ← Server overview
│           ├── moderation/page.tsx      ← Warns, ban, kick, mute, jail, purge...
│           ├── antiraid/page.tsx        ← Anti-raid settings
│           ├── tickets/page.tsx         ← Ticket system + active tickets
│           ├── giveaway/page.tsx        ← Giveaway configuration
│           ├── economy/page.tsx         ← Credits, shop, leaderboard
│           ├── xp/page.tsx             ← XP/levels + leaderboard
│           ├── games/page.tsx           ← Per-game toggles + cooldowns
│           ├── utility/page.tsx         ← AFK, polls, embeds, triggers, slowmode...
│           ├── ai/page.tsx             ← Gemini AI chat config
│           ├── invites/page.tsx         ← Invite tracking + rewards
│           ├── fun/page.tsx            ← Confessional, fakeban, LSD, advice...
│           ├── members/page.tsx         ← Member activity browser
│           └── setup/page.tsx          ← Core server setup (admin only)
├── components/
│   ├── Sidebar.tsx                      ← Responsive nav sidebar
│   ├── CommandSection.tsx               ← Toggle+config card for each feature
│   ├── SaveButton.tsx                   ← Loading/success/error save button
│   ├── StatCard.tsx                     ← Stat display card
│   └── ToggleSwitch.tsx                 ← Animated toggle switch
├── lib/
│   ├── db.ts                            ← Turso database helpers
│   ├── discord.ts                       ← Discord API + OAuth helpers
│   └── auth.ts                          ← JWT session management
├── middleware.ts                         ← Route protection
├── .env.example                         ← All required env vars
├── tailwind.config.ts                   ← Blue color theme
└── package.json
```

---

## ⚙️ Step 1 — Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

### Discord Application Setup

1. Go to https://discord.com/developers/applications
2. Select your bot application (Client ID: `1487025562705989692`)
3. Go to **OAuth2** → **General**
4. Add your redirect URI:
   - Local dev: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.vercel.app/auth/callback`
5. Copy your **Client Secret** into `.env.local`

```env
DISCORD_CLIENT_ID=1487025562705989692
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=https://your-domain.vercel.app/auth/callback
```

### Turso Database

Use the **same** Turso URL and token as your bot:

```env
TURSO_URL=libsql://your-database.turso.io
TURSO_TOKEN=your_turso_auth_token_here
```

### JWT Secret

Generate a strong secret:

```bash
openssl rand -base64 32
```

```env
JWT_SECRET=your_generated_secret_here
```

### Bot Token (Optional but Recommended)

Add your bot token so the dashboard can:
- Filter the server list to only show servers where the bot is present
- Fetch member info for richer displays

```env
DISCORD_BOT_TOKEN=your_bot_token_here
```

---

## 🚀 Step 2 — Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:3000

---

## 📦 Step 3 — GitHub

```bash
git init
git add .
git commit -m "feat: Rama Bot Dashboard"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/rama-dashboard.git
git push -u origin main
```

---

## 🌐 Step 4 — Vercel Deployment

### Option A — Vercel Dashboard (Recommended)

1. Go to https://vercel.com
2. Click **"New Project"**
3. Import your GitHub repo
4. Add all environment variables from `.env.example`
5. Set **Framework Preset** to `Next.js`
6. Click **Deploy**

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel

# Add env vars
vercel env add DISCORD_CLIENT_ID
vercel env add DISCORD_CLIENT_SECRET
vercel env add DISCORD_REDIRECT_URI
vercel env add TURSO_URL
vercel env add TURSO_TOKEN
vercel env add JWT_SECRET
vercel env add DISCORD_BOT_TOKEN
vercel env add NEXT_PUBLIC_APP_URL

# Deploy to production
vercel --prod
```

### After Deployment

1. Copy your Vercel production URL (e.g., `https://rama-dashboard.vercel.app`)
2. Go to Discord Developer Portal → your app → OAuth2
3. Add `https://rama-dashboard.vercel.app/auth/callback` to redirect URIs
4. Update `DISCORD_REDIRECT_URI` in Vercel environment variables
5. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
6. Redeploy

---

## 📋 All Supported Commands/Features

### 🛡️ Moderation
| Command | Description | Configurable |
|---------|-------------|--------------|
| `warn` | Warn a member | Max warns, auto-action, duration |
| `warnings` | View/delete warns | Full CRUD from dashboard |
| `ban` | Ban member | Default reason, message delete days |
| `kick` | Kick member | Default reason |
| `mute/unmute` | Timeout member | Role, default duration |
| `jail/unjail` | Jail member | Channel ID, role ID |
| `jailreason` | View jail reason | — |
| `purge` | Delete messages | Max count (1-200) |
| `lock/unlock` | Lock channels | Default reason |
| `hide/unhide` | Hide channels | Default reason |
| `hideall/unhideall` | Hide all channels | — |
| `hidecategory/unhidecategory` | Hide category | — |
| `role` | Toggle roles | — |
| Mod log | Log mod actions | Channel ID |

### ⚔️ Anti-Raid
| Setting | Description |
|---------|-------------|
| Join threshold | How many joins to trigger |
| Time window | Detection window in seconds |
| Action | kick / ban / timeout / softban |
| Auto-lockdown | Lock all channels on raid |

### 🎟️ Tickets
| Setting | Description |
|---------|-------------|
| Panel channel | Where the open-ticket button lives |
| Category | Where ticket channels are created |
| Support role | Who can see all tickets |
| Transcript channel | Where closed ticket transcripts go |
| Max per user | Max open tickets per member |
| Button label | Customizable button text |
| Welcome message | Auto-message when ticket opens |

### 💰 Economy
| Command | Description |
|---------|-------------|
| `daily/reward` | Claim daily credits |
| `credits/balance` | Check balance |
| `transfer/pay` | Send credits |
| `transactions` | View history |
| `shop` | Browse shop |
| `buy` | Purchase item |
| Local economy | Per-server balance system |
| Shop items | Custom items with role rewards |

### ⭐ XP & Levels
| Setting | Description |
|---------|-------------|
| XP per message | Min/max range |
| Cooldown | Seconds between XP gains |
| Level-up channel | Where to announce level-ups |
| Level-up message | Custom message template |
| Level roles | Auto-assign roles at levels |

### 🎮 Games (13 games)
coin flip, dice, rps, guess-the-number, blackjack, slots, mafia, hide & seek, LSD mode, wheel spin, poll battle, emoji steal, fake ban

Each game has its own enable/disable toggle and cooldown setting.

### 🔧 Utility
AFK system, polls, embed creator, announcements/DM blast, custom triggers, smart slowmode, amnesia channels, milestone announcements, regex reminders, rate limiter, embassy system

### 🤖 AI Chat
Gemini API integration, custom persona, configurable model (Flash/Pro/2.0), persistent user memory

### 😄 Fun
Confessional, fake ban, LSD visual, advice bot, jinx, joke command, poll battle

### 📨 Invites
Invite tracking, credit rewards per invite, XP rewards per invite, top inviter role

### ⚙️ Setup (Admin)
Prefix, language (English/Arabic/Both), admin roles, mod roles, mute/jail roles, welcome/leave messages, all logging channels

---

## 🔐 Permission System

| Role | Dashboard Access |
|------|-----------------|
| **Member** | Own stats: warns, XP, credits, mute status, ticket, local credits |
| **Moderator** | + Moderation panel, warns list, jailed members, tickets management |
| **Admin** | + Anti-raid, all settings, setup page, role configuration |
| **Owner** | Full access to everything |

The dashboard automatically detects permissions from Discord OAuth and shows/hides sections accordingly.

---

## 📱 Mobile Responsiveness

- Full responsive layout for all screen sizes
- Mobile drawer sidebar with hamburger menu
- Touch-friendly toggles and inputs
- No "Request Desktop Site" needed
- Tested down to 320px width

---

## 🎨 Design System

- **Colors**: Deep navy (#010810) → ocean blue (#0e2a52) → brand blue (#2563eb) → sky (#60a5fa)
- **Font**: Outfit (headings) + JetBrains Mono (code/IDs)
- **Components**: Glass cards, animated toggles, gradient accents
- **Animations**: Staggered fade-up on page load, smooth transitions

---

## 🛠️ Common Issues

### "No servers found"
- Make sure the bot is in your server
- Check that `DISCORD_BOT_TOKEN` is set correctly
- Verify bot has proper permissions

### "Forbidden" on config save
- You need Manage Guild or Administrator permission in that Discord server
- Re-login to refresh your permission token

### Database errors
- Verify `TURSO_URL` starts with `libsql://`
- Verify `TURSO_TOKEN` is the auth token (not the URL)
- Make sure the bot has run at least once to create the schema

### OAuth errors
- Redirect URI must exactly match (including https vs http)
- Check Discord app has the correct redirect URI added
- Make sure scopes include `identify` and `guilds`
