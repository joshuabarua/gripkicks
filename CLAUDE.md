# CLAUDE.md - GripKicks Development Guide

This document provides AI assistants with essential information about the GripKicks codebase structure, development workflows, and key conventions.

## 🎯 Project Overview

**GripKicks** is a climbing shoe recommendation web application built with modern full-stack TypeScript. It helps climbers find their perfect shoe match based on foot shape, volume, and comfort preferences.

### Core Features
- **Shoe Sanctuary**: Browse and manage 70+ climbing shoes from 10 major brands
- **Foot Lab**: Foot shape analysis (Egyptian/Roman/Greek/Germanic/Celtic) and volume profiling
- **Smart Recommendations**: AI-powered matching algorithm
- **User Profiles**: Save profiles, favorite shoes, and track collections
- **3D Visualization**: Interactive WebGL shoe models with React Three Fiber

## 📁 Repository Structure

```
gripkicks/
├── packages/
│   ├── web/                    # Next.js 15 frontend application
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router pages
│   │   │   ├── components/    # React components
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── stores/        # Zustand state management
│   │   │   ├── services/      # API clients and utilities
│   │   │   ├── lib/           # Shared utilities
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   ├── schemas/       # Zod validation schemas
│   │   │   └── constants/     # Application constants
│   │   ├── public/            # Static assets
│   │   └── package.json
│   │
│   └── backend-api/           # Hono API server + Convex integration
│       ├── src/
│       │   ├── routes/        # HTTP route handlers
│       │   ├── services/      # Business logic
│       │   ├── lib/           # Utilities
│       │   └── main.ts        # Server entry point
│       └── package.json
│
├── convex/                    # Convex database schema and functions
├── docs/                      # Documentation
├── scripts/                   # Utility scripts
├── .yarnrc.yml               # Yarn configuration
├── package.json              # Root workspace configuration
├── README.md                 # User-facing documentation
└── CLAUDE.md                 # This file

```

## 🏗️ Architecture Overview

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js | 15 with App Router |
| **Language** | TypeScript | 5.7+ |
| **UI Framework** | React | 19 |
| **Styling** | Tailwind CSS | 3.4 |
| **Component Library** | shadcn/ui + Radix UI | Latest |
| **State Management** | Zustand (client), TanStack Query (server) | Latest |
| **3D Graphics** | React Three Fiber + Three.js | 9.0 / 0.173 |
| **Backend API** | Hono | 4.8+ |
| **Database** | Convex | 1.31+ |
| **Authentication** | Better Auth | 1.4+ |
| **Package Manager** | Yarn | 4.6.0 |
| **Deployment** | Vercel (frontend) + Convex (backend) | - |

### Data Flow

```
┌─────────────┐
│  Browser    │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌──────────────────────────────────────┐
│   Next.js Frontend (Port 3000)       │
│  - React Components                  │
│  - Zustand Store (client state)      │
│  - TanStack Query (server state)     │
└──────┬──────────────────────┬────────┘
       │ Convex Client API    │ API calls (Hono)
       │                      │
       ▼                      ▼
┌──────────────────┐  ┌──────────────────────┐
│  Convex Backend  │  │  Hono API Server     │
│  - Real-time DB  │  │  (Port 3001)         │
│  - Functions     │  │  - HTTP Routes       │
│  - Auth          │  │  - Business Logic    │
└──────────────────┘  └──────────────────────┘
       │                      │
       └──────────┬───────────┘
                  │
                  ▼
         ┌────────────────┐
         │  Convex Auth   │
         │  & Database    │
         └────────────────┘
```

### Monorepo Workspaces

- **Root** (`package.json`): Shared dependencies, linting, formatting, dev scripts
- **packages/web**: Next.js frontend application
- **packages/backend-api**: Hono API server
- Both share TypeScript, ESLint, Prettier configurations

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- Yarn 4.6.0 or later
- Convex account (for backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/joshuabarua/gripkicks.git
cd gripkicks

# Install dependencies
yarn install

# Setup environment variables
cp .env.example .env.local
```

### Required Environment Variables

**Frontend (.env.local or .env):**
```
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Backend:**
```
BETTER_AUTH_SECRET=<your-secret>
GOOGLE_CLIENT_ID=<your-google-oauth-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-secret>
```

### Development Commands

```bash
# Start all development servers (web + backend-api in parallel)
yarn dev

# Start with Convex backend in same terminal
yarn dev:convex

# Start backend API only
yarn workspace backend-api dev

# Start frontend only
yarn workspace web dev

# Start Convex functions dev server
npx convex dev

# Linting
yarn lint

# Format code
yarn format
```

### Alternative Terminal Setup (Windows)

```bash
# Terminal 1: Start Convex dev server
npx convex dev

# Terminal 2: Start backend API
yarn workspace backend-api dev

# Terminal 3: Start Next.js frontend
yarn workspace web dev
```

## 📦 Key Packages & Dependencies

### Frontend (web/package.json)

**UI & Components:**
- `next` - React framework
- `react`, `react-dom` - React library
- `tailwindcss` - Utility CSS framework
- `@radix-ui/*` - Accessible UI primitives
- `shadcn/ui` - Pre-built Radix components
- `lucide-react` - Icon library

**3D Graphics:**
- `react-three/fiber` - React renderer for Three.js
- `react-three/drei` - Useful Three.js helpers
- `three` - 3D graphics library

**State & Data:**
- `zustand` - Client state management
- `@tanstack/react-query` - Server state management
- `zod` - TypeScript-first schema validation

**Authentication:**
- `better-auth` - Auth client
- `@convex-dev/better-auth` - Better Auth Convex integration

**Other:**
- `framer-motion` - Animation library
- `lottie-react` - Lottie animation support
- `imagekitio-react` - Image optimization

### Backend (backend-api/package.json)

**Server:**
- `hono` - Lightweight web framework
- `@hono/node-server` - Node.js adapter for Hono

**Database & Auth:**
- `better-auth` - Authentication framework
- `@convex-dev/better-auth` - Convex integration

**Utilities:**
- `jsonwebtoken` - JWT handling
- `dotenv` - Environment variable management
- `neverthrow` - Error handling

**Development:**
- `ts-node-dev` - TypeScript development runner
- `typescript` - TypeScript compiler
- `cross-env` - Cross-platform env variables

## 🎨 Design System & Conventions

### Responsive Design System

GripKicks uses a **custom orientation-based responsive design** system instead of traditional media queries:

#### CSS Variables (Global)
```css
/* Main scale variables */
--scale: 1;           /* Dynamic scale factor */
--scale-x: 1;         /* Horizontal scale */
--scale-y: 1;         /* Vertical scale */
--is-portrait: 1;     /* Boolean flag */
--is-landscape: 0;    /* Boolean flag */

/* Fluid spacing */
--space-xs: calc(8px * var(--scale));
--space-sm: calc(12px * var(--scale));
--space-md: calc(16px * var(--scale));
--space-lg: calc(24px * var(--scale));

/* Fluid font sizes */
--text-sm: calc(14px * var(--scale));
--text-md: calc(16px * var(--scale));
--text-lg: calc(18px * var(--scale));

/* Title sizes (with clamp) */
--title-sm: clamp(24px, calc(30px * var(--scale)), 48px);
--title-md: clamp(36px, calc(48px * var(--scale)), 72px);
--title-xl: clamp(48px, calc(60px * var(--scale)), 96px);
```

#### Zustand Store
Located in `src/stores/orientationStore.ts`:
- Manages orientation state
- Updates CSS variables on resize
- Provides `isPortrait`, `scale` hooks

#### Tailwind Utilities
Extend Tailwind config with fluid classes:
- `text-fluid-sm`, `text-fluid-md`, `text-fluid-lg` - Responsive text
- `p-fluid-sm`, `gap-fluid-md` - Responsive spacing
- `max-w-fluid-lg` - Responsive widths
- `title-sm`, `title-md`, `title-xl` - Responsive titles

#### Usage Pattern
```tsx
// ✅ Preferred: Use fluid classes
<h1 className="text-title-xl">Big Title</h1>
<p className="text-fluid-lg">Description</p>
<div className="p-fluid-md gap-fluid-sm">Content</div>

// ❌ Avoid: Media queries
<div className="md:text-2xl lg:text-4xl">...</div>
```

### Tailwind CSS Configuration

**Key extensions in `tailwind.config.ts`:**
- Fluid typography (text-fluid-*, title-*)
- Fluid spacing (p-fluid-*, gap-fluid-*, etc.)
- Custom color palette (climbing theme)
- Animation utilities
- Responsive image sizes

### Component Organization

**UI Components** (`src/components/ui/`):
- Built from Radix UI primitives + Tailwind
- Base components: `button.tsx`, `input.tsx`, `dialog.tsx`, `card.tsx`, etc.
- Feature components with `LoadingButton`, `Toast`, `Skeleton`, etc.

**Feature Components** (`src/components/`):
- Domain-specific: `ShoeSearch.tsx`, `ProfileForm.tsx`, etc.
- Organized by feature: `stash/`, `shoe/`, `ShoeStatsModal/`, `3d/`
- Mix of presentational and container components

**3D Components** (`src/components/3d/`):
- `Scene.tsx` - Main Three.js canvas setup
- `ShoeModel.tsx` - Individual shoe model
- `CarouselModel.tsx` - Carousel of models
- `CharacterSelector.tsx` - Interactive character

### Code Style & Naming

**File Naming:**
- Components: `PascalCase.tsx` (e.g., `ShoeSearch.tsx`)
- Utils/Services: `camelCase.ts` (e.g., `shoeService.ts`)
- Pages: `camelCase` or kebab-case (Next.js routing)
- Types: `PascalCase.ts` or inline

**Component Patterns:**
- Prefer functional components with hooks
- Use TypeScript for all components
- Extract complex logic to custom hooks
- Use Zustand for shared client state
- Use TanStack Query for server state

**CSS Approach:**
- Tailwind utilities (no inline CSS)
- Use CSS variables for theming
- Avoid CSS-in-JS except for dynamic styles
- Component-scoped styles with className

### Color Palette & Theme

**Primary Colors:**
- Brand primary: Used for CTAs and accents
- Climbing theme: Rock/mountain inspired colors
- Accessible contrast ratios maintained

**Semantic Colors:**
- Success: Green tones
- Error: Red/danger tones
- Warning: Amber/orange tones
- Info: Blue tones

**Dark Mode Considerations:**
- Currently light-mode focused
- Future dark mode support planned
- Use semantic colors for easy theme switching

## 📄 Key Files & Their Purpose

### Frontend

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout, providers setup |
| `src/app/page.tsx` | Home page with 3D visualization |
| `src/app/stash/page.tsx` | Shoe Sanctuary - Collection management |
| `src/app/footchecker/page.tsx` | Foot Lab - Foot analysis |
| `src/app/findmyshoe/page.tsx` | Sole Mate - Shoe matching |
| `src/app/profile/page.tsx` | User profile & settings |
| `src/app/auth/login/page.tsx` | Login page |
| `src/stores/orientationStore.ts` | Responsive design system |
| `src/components/providers.tsx` | React context providers |
| `src/services/` | API clients & utilities |
| `src/schemas/` | Zod validation schemas |
| `tailwind.config.ts` | Tailwind design system |

### Backend

| File | Purpose |
|------|---------|
| `src/main.ts` | Server entry point |
| `src/routes/` | Hono route handlers |
| `src/services/` | Business logic & integrations |
| `src/lib/` | Utilities & helpers |

### Database (Convex)

| File | Purpose |
|------|---------|
| `convex/schema.ts` | Database schema definition |
| `convex/functions/` | Convex queries & mutations |
| `convex/http.ts` | Hono HTTP router setup |

## 🔐 Authentication Flow

**Authentication Method:** Better Auth with email/password + Google OAuth

**Flow:**
1. User signs up/logs in via Better Auth client
2. Better Auth validates credentials
3. Convex stores user data (via Better Auth integration)
4. Session token stored in browser
5. Subsequent requests include session token
6. API endpoints verify session before responding

**Key Integration Points:**
- `packages/web/src/components/auth-button.tsx` - Sign in/out buttons
- `packages/web/src/components/login-form.tsx` - Login form
- `packages/web/src/components/signup-form.tsx` - Signup form
- Better Auth middleware handles automatic session management

## 🗄️ Database Schema (Convex)

**Key Tables:**

```typescript
// Shoes database
shoes: defineTable({
  name: v.string(),
  brand: v.string(),
  imageUrl: v.optional(v.string()),
  aggressiveness: v.string(),    // Downturn level
  stiffness: v.string(),         // Soft/Medium/Stiff
  climbingDiscipline: v.string(), // Bouldering/Sport/Trad
  volume: v.string(),            // Low/Medium/High
  rubberTechnologyId: v.optional(v.id("rubberTechnologies")),
})

// Users (managed by Better Auth)
users: defineTable({
  name: v.string(),
  email: v.string(),
  emailVerified: v.boolean(),
  image: v.optional(v.string()),
  isAdmin: v.optional(v.boolean()),
  onboardingComplete: v.boolean(),
  footShape: v.optional(footShapeValidator),
  favoriteShoeId: v.optional(v.id("shoes")),
})

// User's shoe collection
userShoes: defineTable({
  userId: v.id("users"),
  shoeId: v.id("shoes"),
})

// Foot shapes: Egyptian, Roman, Greek, Germanic, Celtic
```

## 🚀 Development Workflows

### Adding a New Page

1. Create file in `packages/web/src/app/[route]/page.tsx`
2. Use Next.js App Router patterns
3. Import layout from parent or use default
4. Use responsive classes for styling
5. Test on mobile and desktop orientations

### Adding a New Component

1. Create in appropriate directory:
   - `src/components/ui/` for reusable UI
   - `src/components/` for feature components
2. Use TypeScript interfaces for props
3. Extract styles to Tailwind classes
4. Add Zod schemas for validation if handling form data
5. Use Zustand if component state is shared

### Adding Backend Endpoints

1. Create handler in `packages/backend-api/src/routes/`
2. Use Hono router for type safety
3. Integrate with Convex functions as needed
4. Add request validation (Zod schemas)
5. Return typed responses
6. Update frontend service to consume endpoint

### Managing State

**Client State (Zustand):**
- UI state (modals, dropdowns, filters)
- User preferences
- Local form state

**Server State (TanStack Query):**
- Shoes data
- User profiles
- Collections

**Convex State:**
- Database records
- Real-time subscriptions
- Authentication sessions

## 🐛 Common Issues & Solutions

### Issue: TypeScript errors in build

**Solution:** Run `yarn lint` and fix errors. Clear cache: `rm -rf .next && yarn build`

### Issue: Responsive styling not working

**Solution:** Ensure `OrientationInitializer` component is rendered in `src/app/layout.tsx`. Check CSS variables are set correctly.

### Issue: 3D model rendering black/broken

**Solution:** Check browser WebGL support. Verify model file exists in `public/`. Check Three.js canvas is initialized correctly.

### Issue: Authentication not persisting

**Solution:** Verify `BETTER_AUTH_SECRET` is set. Check Better Auth session middleware is in providers.

### Issue: Convex queries returning undefined

**Solution:** Verify database schema is deployed. Check Convex functions are properly exported. Ensure `NEXT_PUBLIC_CONVEX_URL` is set correctly.

## 📝 Commit & Push Guidelines

### When Developing

1. Work on feature branch: `git checkout -b claude/feature-name`
2. Make focused commits with clear messages
3. Test locally before committing
4. Follow commit message format:
   ```
   [Type] Brief description

   Optional detailed explanation of changes.

   - Bullet point for specific changes
   - Another detail
   ```

### Commit Types

- `[feat]` - New feature
- `[fix]` - Bug fix
- `[refactor]` - Code refactoring without behavior change
- `[style]` - Formatting, no logic change
- `[docs]` - Documentation updates
- `[test]` - Adding/updating tests
- `[perf]` - Performance improvements
- `[chore]` - Build system, dependency updates

### Push to Remote

After committing locally:
```bash
# For the designated development branch
git push -u origin claude/claude-md-mlpqrxcb58hldy7t-Hc3IB

# Ensure branch name starts with 'claude/' and ends with session ID
```

### Before Creating PR

1. Pull latest changes: `git pull origin main`
2. Resolve any conflicts
3. Run `yarn lint` and `yarn format`
4. Test all affected pages/components
5. Create clear, descriptive commit messages

## 🔍 Testing & Validation

### Frontend Testing

```bash
# Run linter
yarn lint

# Format code
yarn format

# Manual testing
yarn workspace web dev
# Test responsive design at different orientations
# Test 3D model rendering
# Test authentication flows
```

### Backend Testing

```bash
# Test API endpoints
yarn workspace backend-api dev
# Use API client (curl, Postman, etc.)
# Verify Convex queries/mutations work
```

### Common Test Cases

- [ ] Authentication (signup, login, logout)
- [ ] Shoe search and filtering
- [ ] Adding shoes to collection
- [ ] 3D model rendering on mobile/desktop
- [ ] Responsive layout in portrait/landscape
- [ ] Convex real-time updates
- [ ] Image loading and optimization

## 🆘 Getting Help

### Useful Commands

```bash
# Check git status
git status

# View recent commits
git log --oneline -10

# Diff changes
git diff

# Stash uncommitted changes
git stash

# Check TypeScript errors
yarn lint

# Clear cache and rebuild
rm -rf .next dist node_modules && yarn install && yarn build
```

### Documentation

- **README.md** - User guide and feature overview
- **Convex Docs** - https://docs.convex.dev/
- **Next.js Docs** - https://nextjs.org/docs
- **Tailwind Docs** - https://tailwindcss.com/docs
- **Better Auth Docs** - https://www.better-auth.com/docs
- **Three.js Docs** - https://threejs.org/docs

## 🎯 Key Principles for AI Assistants

### When Making Changes

1. **Preserve Existing Patterns** - Follow established conventions in similar files
2. **Responsive First** - Always consider mobile and landscape orientations
3. **Type Safety** - Use TypeScript strictly; avoid `any`
4. **Component Reusability** - Extract common patterns to reusable components
5. **Performance** - Avoid unnecessary re-renders; use React.memo when appropriate
6. **Accessibility** - Maintain Radix UI accessibility features
7. **Error Handling** - Use neverthrow for Result types or try/catch appropriately
8. **Validation** - Use Zod schemas for input validation

### When Reviewing Code

- ✅ Does it follow project conventions?
- ✅ Is TypeScript strictly typed?
- ✅ Does it work on mobile and desktop?
- ✅ Are there accessibility concerns?
- ✅ Could it be simplified?
- ✅ Does it reuse existing components?
- ✅ Is error handling appropriate?

### Code Quality Standards

- No `any` types unless absolutely necessary
- All components accept TypeScript props
- Consistent file naming conventions
- Tailwind-only for styling
- Meaningful variable and function names
- Comments for non-obvious logic
- No console.log in production code
- Handle loading and error states

---

**Last Updated:** February 2026
**Version:** 1.0
**Maintained By:** Development Team
