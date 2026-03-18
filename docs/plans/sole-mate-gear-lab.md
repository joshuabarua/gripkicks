# Sole Mate Gear Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a refined shoe detail and recommendation system that prioritizes personalized community data and "Reality Check" metrics.

**Architecture:** Update Convex schema to support official vs. perceived metrics, refine the scoring algorithm to weight Sole Mates more heavily, and build a new UI component for the "Gear Lab" view.

**Tech Stack:** Next.js 15, Convex, Tailwind CSS, Framer Motion.

---

### Task 1: Database Schema Updates

**Files:**
- Modify: `convex/schema.ts`

- [ ] **Step 1: Update `shoes` table definition**
Add `brandAggressiveness` and `brandStiffness` (1-5 range).
- [ ] **Step 2: Update `userShoes` table definition**
Add `perceivedAggressiveness`, `perceivedStiffness`, and `perceivedVolumeFit`.
- [ ] **Step 3: Define `outliers` table**
Add a table to store identified signals like "Heel Gap" linked to `footShape` and `volume`.

```typescript
// Add to defineSchema in convex/schema.ts

// ... inside shoes table
brandAggressiveness: v.optional(v.number()),
brandStiffness: v.optional(v.number()),

// ... inside userShoes table
perceivedAggressiveness: v.optional(v.number()),
perceivedStiffness: v.optional(v.number()),
perceivedVolumeFit: v.optional(v.string()), // e.g., "heel_gap", "tight_toe"

// ... new table
outliers: defineTable({
  shoeId: v.id("shoes"),
  footShape: footShapeValidator,
  footVolume: v.string(),
  signalType: v.string(), // e.g., "heel_gap"
  count: v.number(),
  description: v.string(),
}).index("by_shoe_profile", ["shoeId", "footShape", "footVolume"]),
```

- [ ] **Step 4: Commit**
```bash
git add convex/schema.ts
git commit -m "db: update schema for Sole Mate Gear Lab metrics"
```

---

### Task 2: Refine Scoring Algorithm

**Files:**
- Modify: `packages/web/src/hooks/useShoeScoring.ts`

- [ ] **Step 1: Update `calculateShoeScore` to include Sole Mate weighting**
Multiply community approval score by 3x for users with matching profiles.
- [ ] **Step 2: Add Reality Delta calculation**
Calculate difference between brand claims and community ratings.

```typescript
// In packages/web/src/hooks/useShoeScoring.ts

// Update calculateShoeScore to use new weights
// ... logic to fetch userShoes for matching profiles
// ... logic to calculate realityDelta
```

- [ ] **Step 3: Test with mock data**
- [ ] **Step 4: Commit**
```bash
git add packages/web/src/hooks/useShoeScoring.ts
git commit -m "feat: refine scoring algorithm with Sole Mate weighting"
```

---

### Task 3: Build "Reality Check" UI Component

**Files:**
- Create: `packages/web/src/components/shoe/RealityCheck.tsx`

- [ ] **Step 1: Implement the visual 1-5 scale**
Show Brand vs. Community bars.
- [ ] **Step 2: Add tooltips for data source explanation**

- [ ] **Step 3: Commit**
```bash
git add packages/web/src/components/shoe/RealityCheck.tsx
git commit -m "feat: add RealityCheck UI component"
```

---

### Task 4: Implement Match Score Breakdown

**Files:**
- Create: `packages/web/src/components/shoe/MatchScoreTooltip.tsx`
- Modify: `packages/web/src/components/shoe/ShoeRadarMatcher.tsx`

- [ ] **Step 1: Create the tooltip component**
Show percentages for Foot Shape, Volume, and Preferences.
- [ ] **Step 2: Integrate into ShoeRadarMatcher**

- [ ] **Step 3: Commit**
```bash
git add packages/web/src/components/shoe/MatchScoreTooltip.tsx packages/web/src/components/shoe/ShoeRadarMatcher.tsx
git commit -m "feat: add Match Score breakdown tooltip"
```

---

### Task 5: Sole Mate Signals (Outliers) Section

**Files:**
- Create: `packages/web/src/components/shoe/SoleMateSignals.tsx`

- [ ] **Step 1: Build the display for high-value insights**
Show "Heel Gap", "Sizing", etc., with profile-specific labels.

- [ ] **Step 2: Commit**
```bash
git add packages/web/src/components/shoe/SoleMateSignals.tsx
git commit -m "feat: add Sole Mate Signals section"
```
