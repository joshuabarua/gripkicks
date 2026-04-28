# GripKicks - Climbing Shoe Recommender

A web app that recommends climbing shoes based on foot shape, volume, and
comfort, built with **Next.js**, **Convex**, and **Better Auth**.

## Features

- **Shoe Sanctuary** 🏔️

  - Browse and manage your personal climbing shoe collection
  - Search and filter 70+ climbing shoes from 10 major brands
  - Track shoes you own with visual collection management

- **Foot Lab** 👟

  - Foot shape analysis (Egyptian/Roman/Greek/Germanic/Celtic)
  - Volume analysis (low, medium, high)
  - Personalized shoe recommendations based on foot profile

- **Smart Recommendations**

  - Comprehensive shoe database with detailed specifications
  - Matching algorithm for foot characteristics and comfort
  - Comfort rankings for specific foot shapes and volumes

- **User Profiles** 👤

  - Save foot profiles and favorite shoes
  - Track climbing shoe collection
  - Email/password and Google OAuth authentication

- **3D Visualization** 🎨
  - Interactive 3D shoe model with WebGL
  - Context lost recovery for smooth rendering
  - Responsive design with modern UI

## Architecture

### Frontend (Next.js)

- **Framework**: Next.js 15 with App Router
- **UI**: Tailwind CSS with shadcn/ui components
- **3D Graphics**: React Three Fiber with WebGL
- **State Management**: TanStack Query for server state, Zustand for client
  state
- **Authentication**: Better Auth React client
- **Responsive Design**: Orientation-based fluid design system

### Backend (Hono + Convex)

- **API Framework**: Hono with TypeScript
- **Database**: Convex (real-time, serverless)
- **Authentication**: Better Auth with email/password + Google OAuth
- **HTTP Router**: Convex HttpRouterWithHono integration

### Data Flow

```
Frontend ↔ Convex Client ↔ Convex Functions (Queries/Mutations) ↔ Convex Database
          ↘ Better Auth Client ↗
```

## Pages & Routes

- **/** - Home page with 3D visualization
- **/stash** - Shoe Sanctuary - Manage your shoe collection
- **/footlab** - Foot Lab - Analyze foot shape and get recommendations
- **/findmyshoe** - Sole Mate - Find your perfect shoe match
- **/profile** - User profile management
- **/auth/login** - Authentication page
- **/api/v1/** - REST API endpoints (via Hono)
- **/api/auth/** - Better Auth endpoints

## Orientation-Based Responsive Design System

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

- **No media queries** - Everything scales automatically
- **Smooth transitions** - Elements resize proportionally
- **Consistent experience** - Same relative sizing across devices
- **Performance** - CSS variables are faster than JavaScript calculations
- **Maintainable** - Single source of truth for responsive values

## Development

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
  - `/api/v1/polar/checkout`: `12 requests / minute / IP`
  - `/api/upload` and `/api/imagekit`: `20 requests / minute / IP`
- Suggested cache rules:
  - Cache static paths (`/imgs/*`, `/fonts/*`, `/_next/static/*`) aggressively
  - Do not cache auth/session paths (`/api/auth/*`, user-specific API responses)

#### Common production checks

- `/health` returns `200` on the backend domain
- `https://api.grip-kicks.com/api/auth/get-session` responds with CORS headers
  for both `grip-kicks.com` and `www.grip-kicks.com`
- frontend and backend point to the same production Convex deployment

## Database Schema

### Convex Schema

```typescript
// Shoes table
shoes: defineTable({
	name: v.string(),
	brand: v.string(),
	imageUrl: v.optional(v.string()),
	aggressiveness: v.string(),
	stiffness: v.string(),
	climbingDiscipline: v.string(),
	volume: v.string(),
	rubberTechnologyId: v.optional(v.id("rubberTechnologies")),
});

// Users table (Better Auth)
users: defineTable({
	name: v.string(),
	email: v.string(),
	emailVerified: v.boolean(),
	image: v.optional(v.string()),
	isAdmin: v.optional(v.boolean()),
	onboardingComplete: v.boolean(),
	footShape: v.optional(footShapeValidator),
	favoriteShoeId: v.optional(v.id("shoes")),
});

// User's shoe collection
userShoes: defineTable({
	userId: v.id("users"),
	shoeId: v.id("shoes"),
});
```

## Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **3D**: React Three Fiber + Three.js
- **State**: TanStack Query
- **Auth**: Better Auth React client

### Backend

- **API**: Hono framework
- **Database**: Convex (real-time, serverless)
- **Auth**: Better Auth (email/password + Google OAuth)
- **Language**: TypeScript

### Infrastructure

- **Deployment**: Vercel (frontend) + Convex (backend/database)
- **Monorepo**: Yarn workspaces
- **Package Management**: Yarn

## Key Features Implemented

### ✅ Completed

- **Convex Migration**: Full migration from Supabase/Prisma to Convex
- **Shoe Sanctuary**: Shoe collection management with 70+ shoes
- **Foot Lab**: Foot shape analysis and recommendations
- **User Profiles**: Profile management with onboarding
- **3D Visualization**: WebGL shoe model with context recovery
- **Authentication**: Better Auth integration with Google OAuth

### 🔄 In Progress

- **Stash Persistence**: Connecting shoe collection to user accounts
- **Real-time Updates**: Leveraging Convex real-time capabilities

### 📋 TODO

- **Admin Panel**: Manage shoe database
- **Image Upload**: Add shoe images to database
- **Advanced Filters**: More granular shoe filtering
- **Community Features**: Share collections and reviews
- **Loading States**: Improve UX with loading indicators
- **Shoe Rankings**: Game-like stats display for shoes
- **Brand Filters**: Quick brand filtering in search

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details
