# Climbing Shoe Recommender

A web app that recommends climbing shoes based on foot shape, volume, and
comfort, built with **Next.js** and user authentication.

## Features

- **Foot Profile System**
  - Egyptian/Roman/Greek/Germanic/Celtic foot shape detection.
  - Volume analysis (low, medium, high).
- **Smart Recommendations**
  - Shoe database (local or API-powered).
  - Matching algorithm for foot characteristics and comfort.
- **Comfort Ranking**
  - Comfort scores (1-5) for specific foot shapes and volumes.
- **User Accounts**
  - Save multiple foot profiles.
  - Track recommendations.
  - Social login (Google/GitHub) + email/password.
- **Admin Dashboard**
  - Manage shoe database.
  - Add/update shoe specifications, images, and comfort rankings.

## State Management

This project uses Zustand for client-side related fetching. Zustand is a
lightweight and flexible state management library that is particularly
well-suited for client-side state management in React applications.

### Usage

- **Client-Side Fetching**: Zustand is used to manage state related to
  client-side fetching and user interactions. It provides a simple and efficient
  way to handle state updates in response to user actions and API calls. Think
  filters, preference, pagination.

### Benefits

- **Lightweight**: Zustand is minimalistic and doesn't require boilerplate code,
  making it easy to integrate into existing projects.
- **Scalable**: It can handle complex state management needs without adding
  unnecessary complexity.

For more information on Zustand, visit the
[Zustand GitHub repository](https://github.com/pmndrs/zustand).

## Validation with Zod

This project uses Zod for schema validation and type inference. Zod provides a
simple and powerful way to define and validate data schemas, ensuring that your
application data adheres to expected formats and constraints.

### Usage

- **Schema Validation**: Zod is used to validate incoming data from forms, API
  requests, and other sources, ensuring that the data is correctly structured
  and meets all required criteria.
- **Type Inference**: Zod can infer TypeScript types from schemas, reducing
  redundancy and improving type safety throughout the application.

For more information on Zod, visit the
[Zod GitHub repository](https://github.com/colinhacks/zod).

## Authentication with NextAuth

NextAuth is used in this project to handle authentication. It provides a
flexible and secure way to manage user authentication, supporting various
providers and strategies.

### Usage

- **User Authentication**: NextAuth is configured to authenticate users using
  providers such as Google, GitHub, and others, allowing for easy integration
  with popular authentication services.
- **Session Management**: It manages user sessions, providing secure access to
  authenticated routes and resources.

For more information on NextAuth, visit the
[NextAuth.js documentation](https://next-auth.js.org/).

## Data Retrieval with TanStack

For data operations performed on the backend, such as calculating scatter
graphs, TanStack's `useQuery` can be used to efficiently retrieve this data in
the frontend.

- **Backend Calculations**: Complex data operations, like scatter graph
  calculations, are handled on the backend to leverage server resources and
  ensure efficient processing.
- **Data Fetching with useQuery**: The `useQuery` hook from TanStack is utilized
  to fetch the processed data from the backend, ensuring that the frontend
  receives the data efficiently and with minimal latency.

This approach allows for a clear separation of concerns, with heavy computations
offloaded to the server while the frontend focuses on rendering and user
interaction.

For more information on using `useQuery`, visit the
[TanStack Query documentation](https://tanstack.com/query/latest).

## TODOs (Project Roadmap)

1. **Secure Backend API Endpoints with Better Auth**
   - Ensure all sensitive routes are protected with Better Auth middleware.
   - Test token validation and error handling for unauthorized requests.

2. **Update Frontend Data Fetching**
   - Refactor all frontend queries and mutations (TanStack Query, fetch, etc.) to call the backend API only.
   - Always include the Better Auth token in the `Authorization` header for protected requests.

3. **Admin and User CRUD Features**
   - Build/admin endpoints for managing shoes (create, update, delete).
   - Add user profile management and ratings endpoints.

4. **Type Sharing and Documentation**
   - Move shared types/interfaces to a common package or folder for type safety across backend and frontend.
   - Update documentation to reflect new API/data flow and authentication patterns.

5. **Testing**
   - Add integration tests for backend API endpoints (including auth).
   - Add frontend tests for data fetching and UI flows.

---

## Tech Stack

- **Frontend**: Next.js 13 (App Router), React, TypeScript.
<!-- - **CMS**: Sanity Studio (Content Modeling). -->
- **Authentication**: NextAuth.js.
- **Database**: SupabaseDB/PostgreSQL (via Prisma ORM).
- **Styling**: Tailwind CSS.
- **Deployment**: Vercel, Supabase.

## Schema Design

The Sanity schema includes the following fields for each shoe:

- **Basic Information**: Name, brand, image.
- **Core Metrics**: Aggressiveness, stiffness, climbing discipline, volume.
- **Rubber Technology**: Brand, compound, stickiness, durability.
- **Comfort Ranking**: Comfort scores for specific foot shapes and volumes.
- **Foot Shape Compatibility**: Array of compatible foot shapes.

Example shoe document:

```json
{
	"_type": "shoe",
	"name": "La Sportiva Solution",
	"brand": "La Sportiva",
	"image": { "asset": { "_ref": "image-abc123", "_type": "reference" } },
	"aggressiveness": "aggressive",
	"stiffness": "stiff",
	"climbingDiscipline": "bouldering",
	"volume": "medium",
	"rubberTechnology": {
		"brand": "vibram",
		"compound": "xs-grip",
		"stickiness": "high",
		"durability": "medium"
	},
	"comfortRanking": [
		{ "footShape": "egyptian", "volume": "low", "comfortScore": 4 },
		{ "footShape": "roman", "volume": "medium", "comfortScore": 3 }
	],
	"footShapeCompatibility": ["egyptian", "roman"]
}
```
