# GripKicks Project Backlog

Last updated: 2026-05-06

## Legend
- `[P0]` Blocker / Critical
- `[P1]` High priority
- `[P2]` Medium priority
- `[P3]` Nice to have
- `✓` Completed
- `⏳` In progress
- `⬜` Pending

---

## Phase 1: Sanctuary Foundation (COMPLETE)

| Item | Status | Date Added | Date Completed | Notes |
|------|--------|------------|----------------|-------|
| Variant metadata backfill (dev) | ✓ | 2026-05-06 | 2026-05-06 | 97 shoes updated, 18 grouped families |
| Variant metadata backfill (prod) | ✓ | 2026-05-06 | 2026-05-06 | 137 shoes updated on decisive-ermine-92 |
| M/W suffix variant grouping | ✓ | 2026-05-06 | 2026-05-06 | Aragon M/W, Miura M/W now group correctly |
| fitLongevity + sizingDeviation schema | ✓ | 2026-05-06 | 2026-05-06 | Convex validators, types, forms, UI wired |
| SCARPA image assignment (10/11) | ✓ | 2026-05-06 | 2026-05-06 | All except Drago LV (no exact image file) |
| La Sportiva folder fix (lasportiva → la_sportiva) | ✓ | 2026-05-06 | 2026-05-06 | Catalog normalized to match DB |
| Catalog folder naming normalization | ✓ | 2026-05-06 | 2026-05-06 | 13 catalogs normalized to brandKey convention |
| Code push to origin/main | ✓ | 2026-05-06 | 2026-05-06 | Commit 98132b5 |

---

## Phase 1.5: Prod Verification (PENDING)

| Item | Status | Date Added | Owner | Notes |
|------|--------|------------|-------|-------|
| Smoke test grouped variants | ⬜ | 2026-05-06 | Josh | Aragon, Miura, Zone, Drago families |
| Smoke test single shoes | ⬜ | 2026-05-06 | Josh | Verify standalone cards render |
| Smoke test add shoe flow | ⬜ | 2026-05-06 | Josh | Add to Sanctuary, confirm grouping |
| Smoke test edit shoe flow | ⬜ | 2026-05-06 | Josh | Edit comfort/performance/durability |
| Smoke test enrichment save | ⬜ | 2026-05-06 | Josh | fitLongevity + sizingDeviation persistence |
| Verify Vercel deployment | ⬜ | 2026-05-06 | Josh | Confirm DataContributionNudge, new fields |

---

## Phase 2: Enrichment + Scoring (PENDING)

| Item | Status | Date Added | Owner | Notes |
|------|--------|------------|-------|-------|
| Use fitLongevity in recommendation scoring | ⬜ | 2026-05-06 | — | Weight in shoe matching algorithm |
| Use sizingDeviation in recommendation scoring | ⬜ | 2026-05-06 | — | Weight in shoe matching algorithm |
| Community aggregate signals | ⬜ | 2026-05-06 | — | Per-shoe community ratings aggregation |
| DataContributionNudge improvements | ⬜ | 2026-05-06 | — | CTAs, dismiss state, progress prompts |
| Shoe detail stats UI | ⬜ | 2026-05-06 | — | Show enrichment data in shoe cards |

---

## Technical Debt / Cleanup (PENDING)

| Item | Status | Date Added | Owner | Notes |
|------|--------|------------|-------|-------|
| Fix .env URL mismatch | ⬜ | 2026-05-06 | — | CONVEX_URL=prod, NEXT_PUBLIC_CONVEX_URL=dev |
| Remove stale lasportiva ImageKit folder | ⬜ | 2026-05-06 | — | If empty/unused, delete |
| Upload Drago LV image asset | ⬜ | 2026-05-06 | — | Exact filename match needed |
| WebGL vertex attrib 0 warning | ⬜ | 2026-05-06 | — | GLTF model export fix |

---

## Known Issues

| Issue | Severity | Date Added | Context |
|-------|----------|------------|---------|
| Drago LV has no image | P2 | 2026-05-06 | No exact file in ImageKit scarpa/ folder |
| .env has mixed prod/dev URLs | P2 | 2026-05-06 | Can cause confusing local behavior |
| WebGL warning on desktop OpenGL | P3 | 2026-05-06 | Vertex attrib 0 array emulation |

---

## Quick Reference

**Prod Convex:** `https://decisive-ermine-92.convex.cloud`  
**Dev Convex:** `https://peaceful-marten-189.convex.cloud`  
**ImageKit Base:** `https://ik.imagekit.io/ie871bk0r/`  
**Active La Sportiva Folder:** `gripkicks/imgs/shoes/la_sportiva/`  
**Stale La Sportiva Folder:** `gripkicks/imgs/shoes/lasportiva/` (needs cleanup)

---

## How to Update This File

1. Add new items with `Date Added: YYYY-MM-DD`
2. Mark complete with `✓` and `Date Completed`
3. Keep sections organized by phase/priority
4. Update `Last updated` header
