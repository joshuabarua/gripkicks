# GripKicks — Platform Blueprint

**Status:** Active  
**Last Updated:** 2026-03-25  
**Purpose:** Single source of truth for platform architecture and business model.

---

## 1. The Vision

A community-first climbing shoe platform that matches climbers to their perfect shoes based on foot shape, volume, and climbing style — then leverages that data to create a sellable B2B insights product for shoe brands.

**The hook:** "What worked for people with feet like yours."

---

## 2. The Business Model — B2B Data Flywheel

### The Flywheel

```
More free users → More stash data → Richer Reality Check metrics
      ↑                                          ↓
Better recommendations ← Brands pay for brand perception data
```

### How It Works

1. **Free consumer app** — All features free to climbers to maximize adoption
2. **Community data collection** — Users add shoes to Sanctuary, rate them, provide real-world fit feedback
3. **Gear Lab surfacing** — Community-powered recommendations build trust and engagement
4. **B2B monetization** — Brands pay for "Reality Dashboard" access

### What Brands Buy

- **Foot-profile-specific Reality Deltas** — "Your shoe is rated 1.2 points less aggressive than you claim, specifically by Egyptian-foot climbers."
- **Sizing Deviation Reports** — "On average, climbers downsize 0.5 sizes in your La Sportiva Katana vs. their Scarpa baseline."
- **Fit Longevity Signals** — "High-volume climbers report the shoe bagging out within 3 months."
- **Competitive Benchmarking** — How a brand stacks up against its category peers

### What Stays Free (Forever)

- All shoe recommendations and full radar matcher
- Reality Check comparisons (Brand Claim vs. Community Truth)
- Sole Mate Signals for your foot profile
- The Sanctuary (shoe stash)
- Foot scan and profile tools

### Data Ethics

- User data is **aggregated and anonymised** before being sold
- Users informed at signup that anonymous reviews contribute to community dataset
- Individual reviews are never attributable to a specific user in B2B reports

### Billing Infrastructure

Polar.sh is reserved for B2B brand subscriptions (metered dashboard access, monthly/per-report pricing). The `subscriptionStatus` / `subscriptionTier` fields on users table become the B2B auth layer.

---

## 3. Product — Sole Mate Gear Lab

### Status: Implemented

All core features shipped. Schema, scoring algorithm, and all UI components are live.

### Key Features

- **Match Score Breakdown (Tooltip/Hover):** Show weight of Foot Shape, Volume, and User Preferences instead of a single number
- **Reality Check Metrics:** Visual 1-5 scale comparing **Official Brand Claim** vs. **Community Truth**
- **Sole Mate Signals (Outliers):** Automated "High-Value" insights (e.g., "Heel Gap Risk," "Sizing Deviation") based on users with matching foot profiles
- **Optional Deep Dive:** Expandable sections for technical details (rubber compound, closure systems) — clean initial view, technically deep on demand

### Database Schema (Convex)

**Shoes table:**

- `brandAggressiveness` (1-5)
- `brandStiffness` (1-5)

**UserShoes table:**

- `perceivedAggressiveness` (1-5)
- `perceivedStiffness` (1-5)
- `perceivedVolumeFit` (e.g., "heel_gap", "tight_toe")
- `fitLongevity` (e.g., "1-3 months", "3-6 months", "6+ months")
- `sizingDeviation` (number, e.g., +0.5, -1.0)

**Outliers table:**

- `shoeId`, `footShape`, `volume`, `signalType`, `count`, `description`

### Scoring Algorithm

- **Sole Mate Weight:** Reviews from users with identical `footShape` and `footVolume` carry 3x weight
- **Reality Delta:** `OfficialMetric - AvgCommunityMetric`

---

## 4. Implementation Roadmap

The canonical roadmap and backlog are stored in Convex and managed from the **Backlog** tab at `/admin`. This document records platform architecture only; task status belongs in the admin backlog.

---

## 5. Deployment

### Current Stack

| Component   | Platform                    |
| ----------- | --------------------------- |
| Frontend    | Vercel (Next.js 15)         |
| Backend API | Render (Hono)               |
| Data Layer  | Convex Cloud                |
| Database    | Convex (decisive-ermine-92) |

### Production Checklist

**Environment:**

- `NEXT_PUBLIC_CONVEX_URL` → `https://decisive-ermine-92.convex.cloud`
- `NEXT_PUBLIC_API_URL` → production backend URL
- `CONVEX_SERVICE_TOKEN` → the same high-entropy value in Render and Convex
- `BETTER_AUTH_URL` → production auth issuer in Convex
- Better Auth, Database, Polar, ImageKit variables set

**Deploy sequence:**

1. `npx convex deploy` — confirm schema changes and indexes
2. Deploy backend (Render)
3. Deploy frontend (Vercel)
4. Smoke test: Sanctuary, Profile, Add/remove shoes, Foot profile save
5. Verify health endpoint (`https://api.grip-kicks.com/health`)

**Monitoring:**

- Keep-alive ping every 5 minutes to prevent cold starts
- PostHog for analytics
- Cloudflare for web analytics

---

## 6. Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS, Framer Motion
- **3D:** Three.js, React Three Fiber, React Spring
- **State:** Zustand (client), TanStack React Query (server)
- **Auth:** Better Auth + @convex-dev/better-auth
- **Data:** Convex (realtime, auth, database)
- **API:** Hono + @hono/node-server
- **Validation:** Zod, neverthrow (Result-based error handling)
- **UI:** Radix UI primitives, Lucide icons, Lottie
- **Charts:** Chart.js + react-chartjs-2
- **Billing:** Polar.sh (B2B only)

---

## 7. Design System

- **Theme:** Editorial × Precision Tool — climbing magazine meets engineering
- **Colors:** Dark, warm, focused — black backgrounds, orange-500 accents
- **Typography:** Tanker (display), Sora (body), So Cloudy (Sanctuary only)
- **Cards:** `bg-neutral-900 border-neutral-800 rounded-3xl`
- **Motion:** Page load fade-up, stagger children, hover lift

---

## 8. Open Questions

- How do we get more climbers to try the app? Current traction channels?
- What's the right moment to start B2B conversations? 1K users? 10K?
- Should the map feature be global or focus on specific regions first?
- What additional metrics would make the B2B product more compelling?
