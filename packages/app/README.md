# GripKicks Mobile App

React Native iOS app built with Expo.

## Getting Started

```bash
cd packages/app
yarn install
yarn ios
```

## Project Structure

- `src/app/` — Expo Router file-based routes
- `src/components/ui/` — Core UI components (Button, Card, Input, Text, Badge)
- `src/theme/` — Colors, typography, spacing, shadows
- `src/lib/` — Auth client, utilities

## Environment Variables

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` to your backend.
