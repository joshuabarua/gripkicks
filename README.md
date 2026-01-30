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
- **State Management**: TanStack Query for server state
- **Authentication**: Better Auth React client

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
- **/footchecker** - Foot Lab - Analyze foot shape and get recommendations
- **/findmyshoe** - Sole Mate - Find your perfect shoe match
- **/profile** - User profile management
- **/auth/login** - Authentication page
- **/api/v1/** - REST API endpoints (via Hono)
- **/api/auth/** - Better Auth endpoints

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
   # Copy from .env.example
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

- **Frontend**: Deployed on Vercel
- **Backend**: Convex (serverless functions)
- **Database**: Convex (real-time database)

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
})

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
})

// User's shoe collection
userShoes: defineTable({
  userId: v.id("users"),
  shoeId: v.id("shoes"),
})
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

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details
