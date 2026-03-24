# B2B Catalyst Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open the platform to all users (no paywalls), enrich the data collection layer, and lay the groundwork for the B2B Brand Dashboard.

**Architecture:** Remove B2C subscription gating from the frontend, add signal-enrichment fields to the schema, and build the scaffolding for the future Brand Perception API.

**Tech Stack:** Next.js 15, Convex, Tailwind CSS, Framer Motion.

---

### Task 1: Remove B2C Paywalls

**Files:**
- Modify: `packages/web/src/components/shoe/ShoeRadarMatcher.tsx`

- [x] **Step 1: Remove recommendation limit**
  Remove `useSubscription` import, `isPremium`, `isFounder`, `subscriptionLoading`, and the `recommendationLimit` variable. All signed-in users see the full ranked list.
- [x] **Step 2: Update loading guard**
  Remove `subscriptionLoading` from the `isLoading` check so the page doesn't wait for a subscription API call that no longer matters.

- [ ] **Step 3: Commit**
```bash
git add packages/web/src/components/shoe/ShoeRadarMatcher.tsx
git commit -m "feat: remove B2C recommendation limit — full matches open to all users"
```

---

### Task 2: Schema Signal Enrichment

**Files:**
- Modify: `convex/schema.ts`

- [ ] **Step 1: Add `fitLongevity` to `userShoes`**
  A string field to capture how long before the shoe degraded (e.g., `"1-3 months"`, `"3-6 months"`, `"6+ months"`).
- [ ] **Step 2: Add `sizingDeviation` to `userShoes`**
  A number field (e.g., `+0.5`, `-1.0`) representing how much the user had to deviate from their standard size for this shoe.

- [ ] **Step 3: Commit**
```bash
git add convex/schema.ts
git commit -m "db: add fitLongevity and sizingDeviation fields to userShoes"
```

---

### Task 3: Data Incentive — Match Accuracy Meter

**Files:**
- Create: `packages/web/src/components/shoe/DataContributionNudge.tsx`
- Modify: `packages/web/src/components/shoe/ShoeRadarMatcher.tsx`

- [ ] **Step 1: Build the nudge component**
  A subtle progress indicator that shows the user how complete their recommendation profile is. Based on: foot shape set, foot volume set, ≥1 shoe in stash, ≥1 shoe rated.
- [ ] **Step 2: Integrate into ShoeRadarMatcher**
  Render the nudge below the top match card when the profile is incomplete.

- [ ] **Step 3: Commit**
```bash
git add packages/web/src/components/shoe/DataContributionNudge.tsx packages/web/src/components/shoe/ShoeRadarMatcher.tsx
git commit -m "feat: add data contribution nudge to recommend profile completion"
```

---

### Task 4: Brand Dashboard Scaffolding (Future)

**Files:**
- Create: `convex/dataReports.ts`
- Create: `packages/web/src/app/brand/dashboard/page.tsx` (protected route)

- [ ] **Step 1: Add `getBrandPerceptionReport` Convex query**
  Aggregates `realityDelta` values by brand, grouped by shoe and foot profile. Returns avg community aggressiveness vs. `brandAggressiveness`, avg stiffness delta, and sizing deviation patterns.
- [ ] **Step 2: Build the protected Brand Dashboard page**
  Initially shows a single brand's data. Gated by a `role: "brand"` field (to be added to the `users` table).

- [ ] **Step 3: Commit**
```bash
git add convex/dataReports.ts packages/web/src/app/brand/dashboard/page.tsx
git commit -m "feat: scaffold brand perception dashboard (B2B)"
```
