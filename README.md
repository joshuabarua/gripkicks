# Climbing Shoe Recommender

A web app that recommends climbing shoes based on foot shape, volume, and comfort, built with **Next.js**, **Sanity CMS**, and user authentication.

## Features

- **Foot Profile System**
  - Egyptian/Roman/Greek/Germanic/Celtic foot shape detection.
  - Volume analysis (low, medium, high).
- **Smart Recommendations**
  - CMS-powered shoe database.
  - Matching algorithm for foot characteristics and comfort.
- **Comfort Ranking**
  - Comfort scores (1-5) for specific foot shapes and volumes.
- **User Accounts**
  - Save multiple foot profiles.
  - Track recommendations.
  - Social login (Google/GitHub) + email/password.
- **Admin Dashboard**
  - Manage shoe database through Sanity CMS.
  - Add/update shoe specifications, images, and comfort rankings.

## Tech Stack

- **Frontend**: Next.js 13 (App Router), React, TypeScript.
- **CMS**: Sanity Studio (Content Modeling).
- **Authentication**: NextAuth.js.
- **Database**: MongoDB/PostgreSQL (via Prisma).
- **Styling**: Tailwind CSS.
- **Deployment**: Vercel + Sanity Cloud.

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