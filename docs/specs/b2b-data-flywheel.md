# Spec: B2B Data Flywheel

**Status:** Active
**Date:** 2026-03-24
**Topic:** Business model — free consumer app as the data engine for B2B brand insight sales.

---

## 1. The Shift

The original model charged consumers for better recommendations. The problem: the data needed to deliver great recommendations doesn't exist until a large enough user base contributes it. That's a chicken-and-egg problem.

The new model inverts this:

> **The climber's data IS the product. We sell it to brands, not to climbers.**

The whole consumer-facing app is free. Always. This removes friction, grows the user base faster, and builds the richest real-world climbing shoe fit dataset in the world.

---

## 2. The Flywheel

```
More free users → More stash data → Richer Reality Check metrics
      ↑                                          ↓
Better recommendations ← Brands pay for brand perception data
```

1. **Consumers** add shoes to their Sanctuary, rate them, and provide real-world fit feedback (perceived aggressiveness, stiffness, volume fit, sizing deviation).
2. **The Gear Lab** surfaces this as community-powered recommendations — building trust and engagement.
3. **Brands** pay for access to their product's "Reality Dashboard": how their claims compare to community truth, per foot profile, per region, per discipline.

---

## 3. What Brands Buy

- **Foot-profile-specific Reality Deltas** — "Your shoe is rated 1.2 points less aggressive than you claim, specifically by Egyptian-foot climbers."
- **Sizing Deviation Reports** — "On average, climbers downsize 0.5 sizes in your La Sportiva Katana vs. their Scarpa baseline."
- **Fit Longevity Signals** — "High-volume climbers report the shoe bagging out within 3 months."
- **Competitive Benchmarking** — How a brand stacks up against its category peers in community perception.

---

## 4. What Stays Free (Forever)

- All shoe recommendations and the full radar matcher
- Reality Check comparisons (Brand Claim vs. Community Truth)
- Sole Mate Signals for your foot profile
- The stash / Sanctuary
- Foot scan and profile tools

---

## 5. Data Ethics

- User data is **aggregated and anonymised** before being sold. No individual user profiles are sold.
- Users are informed at signup that their anonymous reviews contribute to the community dataset.
- Individual reviews are never attributable to a specific user in B2B reports.

---

## 6. Polar (Billing Infrastructure)

Polar.sh remains in the stack but is **de-scoped from B2C**. It will be re-used to power B2B brand subscriptions — giving brands a metered dashboard access tier (e.g., monthly or per-report pricing).

The `subscriptionStatus` / `subscriptionTier` fields on the `users` table and the `useSubscription` hook are left intact. They become the B2B account auth layer in the future.
