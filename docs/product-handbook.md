# GripKicks Product Handbook

A single reference for product context, brand voice, design system, and
technical architecture.

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Brand Voice & Design Context](#brand-voice--design-context)
3. [Visual Design System](#visual-design-system)
4. [Orientation-Based Responsive Design](#orientation-based-responsive-design)
5. [Architecture & Tech Stack](#architecture--tech-stack)
6. [Database Schema](#database-schema)
7. [Development & Deployment](#development--deployment)
8. [Roadmap](#roadmap)
9. [Contributing & License](#contributing--license)

---

## Product Overview

GripKicks is a web app that recommends climbing shoes based on foot shape,
volume, and comfort, built with **Next.js**, **Convex**, and **Better Auth**.

### Features

- **Shoe Sanctuary**

  - Browse and manage your personal climbing shoe collection
  - Search and filter 70+ climbing shoes from 10 major brands
  - Track shoes you own with visual collection management

- **Foot Lab**

  - Foot shape analysis (Egyptian/Roman/Greek/Germanic/Celtic)
  - Volume analysis (low, medium, high)
  - Personalized shoe recommendations based on foot profile

- **Smart Recommendations**

  - Comprehensive shoe database with detailed specifications
  - Matching algorithm for foot characteristics and comfort
  - Comfort rankings for specific foot shapes and volumes

- **User Profiles**

  - Save foot profiles and favorite shoes
  - Track climbing shoe collection
  - Email/password and Google OAuth authentication

- **3D Visualization**
  - Interactive 3D shoe model with WebGL
  - Context lost recovery for smooth rendering
  - Responsive design with modern UI

### Pages & Routes

| Route                         | Purpose                                               |
| ----------------------------- | ----------------------------------------------------- |
| `/`                           | Home page with 3D visualization                       |
| `/dashboard`                  | Home base — stats, foot profile, recent shoes         |
| `/stash`                      | Shoe Sanctuary — manage your shoe collection          |
| `/footlab`                    | Foot Lab — analyze foot shape and get recommendations |
| `/matcher`                    | Visual shoe radar matcher                             |
| `/profile`                    | User profile management                               |
| `/onboarding`                 | First-run onboarding flow                             |
| `/pricing`                    | Pricing page                                          |
| `/about`                      | About page                                            |
| `/privacy`                    | Privacy policy                                        |
| `/admin`                      | Admin dashboard (incl. canonical Backlog tab)         |
| `/test/*`                     | Editorial homepage design variants                    |
| `/auth/login`, `/auth/signup` | Authentication pages                                  |
| `/api/v1/*`                   | REST API endpoints (via Hono)                         |
| `/api/auth/*`                 | Better Auth endpoints                                 |

---

## Brand Voice & Design Context

### Users

Climbers of all levels looking to find the perfect climbing shoe based on their
foot shape, volume, and preferences. They use the app to browse shoes, analyze
their foot profile in the "Foot Lab", and manage their personal "Shoe Sanctuary"
collection. The interface should evoke excitement, joy, and curiosity as they
explore the 3D models and technical details.

### Brand Personality

Engaging, Slick, Modern. The tone is interactive and highly visual, blending the
technical aspects of climbing gear with a polished, consumer-facing digital
experience.

### Aesthetic Direction

Technical/precise with fluidity/organic elements. The UI leverages an
orientation-based fluid responsive design system, avoiding rigid breakpoints for
a seamless scaling experience. The visual language includes a bold orange accent
(`hsl(17, 83%, 54%)`), distinct custom typography (`dm-mono`,
`so-cloudy`), and engaging interactive states like 3D perspective hovers and
slow-spinning gradients. It balances high-precision data display with organic,
flowing interactions.

### Design Principles

1. **Fluidity Above All**: Utilize the custom orientation-based scaling system
   (`var(--scale)`) to ensure typography, spacing, and layouts smoothly adapt to
   any device without abrupt breakpoint snapping.
2. **Engaging & Interactive**: Capitalize on micro-interactions (e.g.,
   perspective text on hovers, gradients) and 3D visuals (React Three Fiber) to
   spark joy and curiosity during exploration.
3. **Technical Elegance**: Present complex, precise data (shoe aggressiveness,
   stiffness, volume) cleanly and clearly, maintaining a slick and modern
   aesthetic that feels like a premium tool rather than a basic spreadsheet.
4. **Bold Contrast**: Leverage the dark/light mode foundations, ensuring the
   primary orange accent pops and draws attention to key interactions, while
   letting the 3D models and shoe imagery take center stage.
5. **Distinctive Typography**: Thoughtfully apply the custom font stack
   (`dm-mono` for body and headings, `so-cloudy` in Sanctuary) to
   maintain the brand's unique personality.

### Constraints

1. **No Marketing Fluff**: No numbered feature lists (01/02/03), no "Precision
   fit system", no "Smart Match", no promotional copy. Use minimal placeholder
   text like "Layout test. No marketing copy."
2. **No Accent-Colored Text**: The orange/red accent (`brand-red`) is for
   shapes, borders, buttons only. Never use it on body text, headings, or
   marketing copy.
3. **Minimal Copy**: Strip all "weird ass fluff" — mission statements, value
   propositions, founder stories, FAQ sections. Keep only functional UI labels.
4. **Editorial Test Themes**: Homepage variations follow editorial hybrid
   aesthetic (japanese, retro, gorp) with grain overlays, halftone patterns,
   serif italic typography hierarchy.

---

## Visual Design System

### Aesthetic Direction

**Monolithic Minimalism × Retro Sci-Fi.** Inspired by 2001: A Space Odyssey —
HAL 9000's red eye, monolithic surfaces, restrained motion. Dark, warm, focused.
Approachable for everyday climbers, not just technical users.

### Tokens

#### Colors

| Token          | Value                                   | Use                             |
| -------------- | --------------------------------------- | ------------------------------- |
| Background     | `bg-black` / `bg-neutral-950`           | Page backgrounds                |
| Surface        | `bg-neutral-900`                        | Cards, panels                   |
| Border         | `border-neutral-800`                    | Card borders, dividers          |
| Accent         | `brand-red` (`#f45b5b`)                 | CTAs, highlights, active states |
| Accent hover   | `brand-red/80`                          | Hover on accent elements        |
| Chalk          | `brand-chalk` (`#f0ede5`)               | Light text accents, warm white  |
| Putty          | `brand-putty` (`#c8bfb3`)               | Secondary warm neutral          |
| Charcoal       | `brand-charcoal` (`#2d2d2d`)            | Elevated surface, subtle cards  |
| Text primary   | `text-white`                            | Headlines                       |
| Text secondary | `text-neutral-400` / `text-neutral-500` | Body copy                       |
| Text muted     | `text-white/30`                         | Labels, meta                    |

#### Typography

| Role                | Font      | Class                                      |
| ------------------- | --------- | ------------------------------------------ |
| Display / Headlines | Tanker    | `font-tanker`                              |
| Body / UI           | Sora      | `font-sora`                                |
| Stash page only     | So Cloudy | `font-so-cloudy` (intentional cloud theme) |

**Never use**: `font-mono` for visible UI labels. Reserve it only for actual
code/technical values if ever needed.

### Section Labels

**Old (avoid):**
`<p className="font-mono text-xs text-orange-500 tracking-[0.3em]">[DASHBOARD]</p>`
(orange-500 is fully retired)

**New (use):**
`<p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4">Your Dashboard</p>`

Rules:

- `font-sora` not `font-mono`
- `text-white/30` not `text-brand-red` — subtle, not technical
- No brackets `[ ]` — plain human-readable words
- Sentence case for multi-word labels ("Your Dashboard", not "YOUR_DASHBOARD")
- Trailing `mb-3` or `mb-4` before the heading

### Card Labels (inside bento cards)

**Old (avoid):**
`<p className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[VOLUME]</p>`

**New (use):**
`<p className="font-sora text-[10px] uppercase tracking-[0.15em] text-neutral-600 mb-1">Volume</p>`

### Page Structure Pattern

Every authenticated page follows:

```
<main className="min-h-screen bg-black text-white overflow-x-hidden">
  <section className="px-6 md:px-12 lg:px-16 py-12 max-w-[5xl|6xl|7xl] mx-auto">
    {/* Page label */}
    <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4">Label</p>
    {/* H1 */}
    <h1 className="font-tanker text-6xl md:text-8xl leading-none mb-4">TITLE</h1>
    {/* Subtitle */}
    <p className="font-sora text-neutral-400 text-lg max-w-lg">Description</p>
  </section>
</main>
```

### Cards / Bento

```
bg-neutral-900 border border-neutral-800 rounded-3xl p-6
```

Hover state: `hover:border-brand-red/30 transition-colors` Active/selected:
`border-brand-red bg-brand-red/10`

### Navigation Structure

| Label     | Route        | Purpose                                       |
| --------- | ------------ | --------------------------------------------- |
| Dashboard | `/dashboard` | Home base — stats, foot profile, recent shoes |
| Foot Lab  | `/footlab`   | Set up / update foot profile                  |
| Sanctuary | `/stash`     | Shoe collection                               |
| Matcher   | `/matcher`   | Visual shoe radar                             |

Secondary links: About (`/about`), Privacy (`/privacy`), Admin (`/admin`,
admin-only).

### Motion Principles

- **Page load**:
  `initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}` with
  `duration: 0.8`
- **Stagger children**: `delay: 0.1 * index`
- **Hover lift**: `whileHover={{ y: -4 }}` on cards
- **Tap feedback**: `whileTap={{ scale: 0.97 }}`
- **Spring modals/bars**: `type: 'spring', stiffness: 400, damping: 35`

### What to Avoid

- `[BRACKET_LABELS]` — feels like a dev console, not a product
- `font-mono` for UI labels — technical, cold
- `font-bold` headings — use `font-tanker` instead
- Purple gradients, white backgrounds, generic layouts
- `orange-500` anywhere — fully replaced by `brand-red`
- `text-3xl font-bold` — use `font-tanker text-3xl` etc.

---

## Orientation-Based Responsive Design

### Overview

GripKicks uses a custom orientation-based responsive design system that
dynamically scales UI elements based on screen orientation (portrait/landscape)
rather than fixed breakpoints. This eliminates the need for media queries and
provides a smooth, consistent experience across all devices.

### How It Works

#### 1. CSS Variables

The system sets dynamic CSS variables based on screen dimensions:

```css
:root {
	--scale: 1; /* Dynamic scale factor */
	--scale-x: 1; /* Horizontal scale */
	--scale-y: 1; /* Vertical scale */
	--is-portrait: 1; /* Boolean flag */
	--is-landscape: 0; /* Boolean flag */

	/* Fluid spacing */
	--space-xs: calc(8px * var(--scale));
	--space-sm: calc(12px * var(--scale));
	--space-md: calc(16px * var(--scale));
	/* ... */

	/* Fluid font sizes */
	--text-sm: calc(14px * var(--scale));
	--text-md: calc(16px * var(--scale));
	/* ... */

	/* Title sizes with tight line height */
	--title-sm: clamp(24px, calc(30px * var(--scale)), 48px);
	--title-md: clamp(36px, calc(48px * var(--scale)), 72px);
	/* ... */
}
```

#### 2. Zustand Store

A Zustand store manages orientation state and updates CSS variables:

```typescript
// src/stores/orientationStore.ts
export const useOrientationStore = create<OrientationState>((set) => ({
	isPortrait: true,
	scale: 1,
	initialize: () => {
		// Updates CSS variables on resize/orientation change
		const updateOrientation = () => {
			const scale = calculateScale();
			document.documentElement.style.setProperty("--scale", scale.toString());
			// ... update other variables
		};
		window.addEventListener("resize", updateOrientation);
	},
}));
```

#### 3. Tailwind Utilities

Custom Tailwind classes use the CSS variables:

```typescript
// tailwind.config.ts
theme: {
  extend: {
    fontSize: {
      'fluid-sm': 'var(--text-sm)',
      'fluid-md': 'var(--text-md)',
      'title-sm': ['var(--title-sm)', { lineHeight: '1.1' }],
      'title-xl': ['var(--title-xl)', { lineHeight: '1.1' }],
    },
    spacing: {
      'fluid-sm': 'var(--space-sm)',
      'fluid-md': 'var(--space-md)',
      'fluid-lg': 'var(--space-lg)',
    },
  },
}
```

### Usage Examples

```tsx
// Instead of media queries, use fluid classes:
<h1 className="text-title-xl">Big Title</h1>
<p className="text-fluid-lg">Responsive text</p>
<div className="p-fluid-md gap-fluid-sm">Responsive spacing</div>
<div className="max-w-fluid-lg">Responsive container</div>

// Access orientation state in components:
import { useOrientationStore } from '@/stores/orientationStore';

function MyComponent() {
  const { isPortrait, scale } = useOrientationStore();
  return <div>{isPortrait ? 'Portrait' : 'Landscape'}</div>;
}
```

### Benefits

- **No media queries** — Everything scales automatically
- **Smooth transitions** — Elements resize proportionally
- **Consistent experience** — Same relative sizing across devices
- **Performance** — CSS variables are faster than JavaScript calculations
- **Maintainable** — Single source of truth for responsive values

---

## Architecture & Tech Stack

### Frontend

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **3D Graphics**: React Three Fiber + Three.js
- **State Management**: TanStack Query for server state, Zustand for client
  state
- **Authentication**: Better Auth React client
- **Responsive Design**: Orientation-based fluid design system
- **Testing**: Vitest + Testing Library (unit), Playwright (e2e)

### Backend

- **API Framework**: Hono with TypeScript (`packages/backend-api`)
- **Database**: Convex (real-time, serverless)
- **Authentication**: Better Auth with email/password + Google OAuth
- **HTTP Router**: Convex Hono router modules in `convex/router/` mounted via
  `convex/http.ts`
- **Mobile**: Expo / React Native app in `packages/app` (Expo Router tabs:
  index, foot-lab, matcher, stash, profile)

### Data Flow

```
Frontend ↔ Convex Client ↔ Convex Functions (Queries/Mutations) ↔ Convex Database
          ↘ Better Auth Client ↗
```

### Infrastructure

- **Deployment**: Vercel (frontend) + Render (backend API) + Convex (database)
- **Monorepo**: Yarn workspaces
- **Package Management**: Yarn

---

## Database Schema

### Convex Schema

```typescript
// Shoes table (common fields via commonShoeFieldsValidator)
shoes: defineTable({
	...commonShoeFieldsValidator, // name, brand, modelName, variantLabel, parentModelId, gender, imageUrl, ...
	brandAggressiveness: v.optional(v.number()),
	stiffness: v.string(),
	brandStiffness: v.optional(v.number()),
	climbingDiscipline: v.string(),
	volume: v.string(),
	rubberTechnologyId: v.optional(v.id("rubberTechnologies")),
	avgComfortScore: v.optional(v.number()),
	// ... aggregate rating fields
});

// Users table (Better Auth)
users: defineTable({
	email: v.string(),
	name: v.optional(v.string()),
	emailVerified: v.boolean(),
	image: v.optional(v.string()),
	isAdmin: v.optional(v.boolean()),
	onboardingComplete: v.boolean(),
	betterAuthId: v.optional(v.string()),
	footShape: v.optional(footShapeValidator),
	footVolume: v.optional(v.string()),
	favoriteShoeId: v.optional(v.id("shoes")),
	...subscriptionFieldsValidator, // legacy Polar fields, unused since billing removal
});

// User's shoe collection (stash)
userShoes: defineTable({
	userId: v.id("users"),
	shoeId: v.id("shoes"),
	...userShoeFieldsValidator,
	perceivedAggressiveness: v.optional(v.number()),
	perceivedStiffness: v.optional(v.number()),
	perceivedVolumeFit: v.optional(v.string()),
	isFavourite: v.optional(v.boolean()),
	fitLongevity: v.optional(v.string()), // B2B signal enrichment
	sizingDeviation: v.optional(v.number()),
});
```

Other tables: `rubberTechnologies`, `comfortRankings`, `footShapeCompat`,
`accounts`, `sessions`, `verifications`, `jwks`, `backlogItems`,
`userScoreProfiles`, `outliers`, `popularity`. See `convex/schema.ts` for the
authoritative definition.

---

## Development & Deployment

### Prerequisites

- Node.js 18+
- Yarn (recommended)
- Convex account (for deployment)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/joshuabarua/gripkicks.git
   cd gripkicks
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Environment variables**

   ```bash
   # From .env
   cp .env.example .env.local

   # Required variables:
   NEXT_PUBLIC_CONVEX_URL=your-convex-url
   NEXT_PUBLIC_API_URL=http://localhost:3001
   BETTER_AUTH_SECRET=your-secret
   CONVEX_SERVICE_TOKEN=your-service-token
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Start development servers**

   ```bash
   # Terminal 1: Start Convex backend
   npx convex dev

   # Terminal 2: Start Hono API server
   yarn workspace backend-api dev

   # Terminal 3: Start Next.js frontend
   yarn workspace web dev
   ```

### Deployment

- **Frontend**: Vercel (`packages/web`)
- **Backend API**: Render (`packages/backend-api`)
- **Database**: Convex (real-time database)

#### Vercel (Web)

- **Root Directory**: `packages/web`
- **Node**: `20.x`
- **Install Command**:
  `corepack enable && corepack prepare yarn@4.6.0 --activate && YARN_ENABLE_SCRIPTS=false corepack yarn install --immutable`
- **Build Command**: `corepack yarn build`
- **Required env vars**:
  - `NEXT_PUBLIC_API_URL=https://api.grip-kicks.com`
  - `NEXT_PUBLIC_CONVEX_URL=<convex_prod_url>`
  - `NEXT_PUBLIC_POSTHOG_KEY=<posthog_key>`
  - `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com`

#### Render (Backend API)

- **Root Directory**: `packages/backend-api`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Runtime**: Node `20`
- **Port binding**: service listens on `PORT` (Render default) with fallback to
  `BACKEND_PORT`
- **Blueprint**: `render.yaml`
- **Required env vars**:
  - `PORT=10000` (or let Render inject)
  - `FRONTEND_URL=https://grip-kicks.com,https://www.grip-kicks.com`
  - `BETTER_AUTH_URL=https://api.grip-kicks.com`
  - `BETTER_AUTH_SECRET=<strong_secret>`
  - `CONVEX_URL=<convex_prod_url>`
  - `CONVEX_SERVICE_TOKEN=<shared_convex_service_token>`
- **Required Convex deployment env vars**:
  - `BETTER_AUTH_URL=https://api.grip-kicks.com`
  - `CONVEX_SERVICE_TOKEN=<same_shared_convex_service_token>`
- **Optional rate-limit env vars** (defaults shown):
  - `RATE_LIMIT_API_WINDOW_MS=60000`, `RATE_LIMIT_API_MAX=120`
  - `RATE_LIMIT_AUTH_WINDOW_MS=60000`, `RATE_LIMIT_AUTH_MAX=30`
  - `RATE_LIMIT_ACCOUNT_WINDOW_MS=60000`, `RATE_LIMIT_ACCOUNT_MAX=10`
  - `RATE_LIMIT_CHECKOUT_WINDOW_MS=60000`, `RATE_LIMIT_CHECKOUT_MAX=12`
  - `RATE_LIMIT_UPLOAD_WINDOW_MS=60000`, `RATE_LIMIT_UPLOAD_MAX=20`

#### Cloudflare Recommendations

- Keep Cloudflare edge rate limits as the first layer, and backend limits as the
  second layer.
- Suggested edge limits:
  - `/api/auth/*`: `10 requests / minute / IP`
  - `/api/v1/auth/*`: `20 requests / minute / IP`
  - `/api/upload` and `/api/imagekit`: `20 requests / minute / IP`
- Suggested cache rules:
  - Cache static paths (`/imgs/*`, `/fonts/*`, `/_next/static/*`) aggressively
  - Do not cache auth/session paths (`/api/auth/*`, user-specific API responses)

#### Common production checks

- `/health` returns `200` on the backend domain
- `https://api.grip-kicks.com/api/auth/get-session` responds with CORS headers
  for both `grip-kicks.com` and `www.grip-kicks.com`
- frontend and backend point to the same production Convex deployment

---

## Roadmap

The canonical roadmap and backlog are stored in Convex and managed from the
**Backlog** tab at `/admin`. Repository documentation describes the current
product and architecture but does not track task status.

---

## Contributing & License

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

MIT License — see LICENSE file for details.
