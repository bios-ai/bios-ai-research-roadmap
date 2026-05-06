# BIOS Life — AI Research Roadmap

Interactive AI research roadmap covering BIOS Life's three reusable models (digital twin, longitudinal risk scoring, transition / evolution), the data strategy that gates them, and the team / infrastructure / product alignment around them. 2026–2027.

Three tabs: **Roadmap** (visual timeline of streams + AI model evolution ribbons), **Strategy** (vision, populations, models, data strategy, 2026 priorities, 2027 horizon), **Model Evolution** (per-model v1 → vN trajectories).

Template adapted from Geoff's product roadmap project.

## Local Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Deploy to Vercel

### Option 1: Via GitHub (recommended)

1. Push this repo to a private GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Import Project" → select your repo
4. Framework preset will auto-detect as Vite
5. Click "Deploy"
6. Your site is live at `https://your-project.vercel.app`

### Option 2: Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

## Secure with Cloudflare Access (Google SSO)

### Prerequisites
- A Cloudflare account (free)
- A custom domain (or use the Vercel subdomain)
- Google Workspace admin access for IDP configuration

### Steps

1. **Add your domain to Cloudflare** (if using custom domain)
   - Go to Cloudflare dashboard → Add site
   - Update your domain's nameservers to Cloudflare

2. **Set up Google as Identity Provider**
   - In Cloudflare dashboard → Zero Trust → Settings → Authentication
   - Add Google as an identity provider
   - You'll need to create OAuth credentials in Google Cloud Console:
     - Go to console.cloud.google.com → APIs & Services → Credentials
     - Create OAuth 2.0 Client ID (Web application)
     - Add Cloudflare's callback URL as authorized redirect URI
     - Copy Client ID and Secret back to Cloudflare

3. **Create an Access Application**
   - Zero Trust → Access → Applications → Add an application
   - Type: Self-hosted
   - Application domain: your Vercel URL or custom domain
   - Create a policy:
     - Action: Allow
     - Include: Emails ending in `@yourdomain.com`
   - Save

4. **Point DNS (if custom domain)**
   - Add a CNAME record pointing to your Vercel deployment
   - Cloudflare will proxy traffic and enforce Access authentication

### Result
- Users hitting your URL get redirected to Google sign-in
- Only users with `@yourdomain.com` emails can access
- No code changes needed — auth happens at the network layer
- Free for up to 50 users

## Updating the Roadmap

Edit `src/App.jsx` — the data is defined at the top of the file:

- `MILESTONES` — block items per stream lane (`data`, `infra`, `team`, `product`)
- `AI_STREAMS` — continuous model-evolution ribbons with version waypoints
- `MODEL_EVOLUTION` — per-model v1 → vN tables for the *Model Evolution* tab

Push to GitHub and Vercel auto-deploys.

## Tech Stack
- React 18
- Vite 5
- No external CSS framework (inline styles)
