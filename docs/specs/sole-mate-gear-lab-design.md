# Design Spec: Sole Mate Gear Lab

**Status:** Implemented
**Date:** 2026-03-24
**Shipped:** All tasks in sole-mate-gear-lab.md are complete. Schema, scoring algorithm, and all UI components are live.

## 1. Problem Statement
Current shoe recommendations rely on static brand data and general ratings. This doesn't account for:
1. **Subjectivity:** A shoe that is "stiff" for one climber might be "moderate" for another.
2. **Fit Variance:** Brand claims for comfort often fail specific foot shapes (e.g., Egyptian vs. Roman).
3. **Marketing vs. Reality:** Brand labels (e.g., "Ultra Aggressive") don't always align with community experience.

## 2. Proposed Solution: The Sole Mate Gear Lab
A refined shoe detail and recommendation system that prioritizes **personalized community data** and **reality-check comparisons**.

### Key Features
- **Match Score Breakdown (Tooltip/Hover):** Instead of a single number, show the weight of Foot Shape, Volume, and User Preferences.
- **Reality Check Metrics:** A visual 1-5 scale comparing the **Official Brand Claim** vs. the **Community Truth**.
- **Sole Mate Signals (Outliers):** Automated "High-Value" insights (e.g., "Heel Gap Risk," "Sizing Deviation") based on users with matching foot profiles.
- **Optional Deep Dive:** Expandable sections for technical details (rubber compound, closure systems) to keep the initial view clean but technically deep.

## 3. Architecture & Data Flow

### Database Schema Updates (Convex)
We need to track "reality" vs "brand" for key metrics:
- `shoes` table: Add `brandAggressiveness` (1-5), `brandStiffness` (1-5).
- `userShoes` table: Add specific rating fields for `perceivedAggressiveness`, `perceivedStiffness`, and `perceivedVolumeFit`.
- `outliers` table (New): To store identified signals like "Heel Gap" linked to specific `footShape` and `volume`.

### Scoring Algorithm Refinement
Update `useShoeScoring.ts` to:
1. Include a `SoleMateWeight` multiplier—reviews from users with identical `footShape` and `footVolume` carry 3x more weight.
2. Calculate the "Reality Delta": `OfficialMetric - AvgCommunityMetric`.

## 4. UI/UX Design
- **Theme:** Technical Elegance (technical data in a slick, modern wrapper).
- **Accents:** High-contrast orange (`hsl(17, 83%, 54%)`) for interactive states and cyan for Sole Mate signals.
- **Responsiveness:** Orientation-based fluid scaling using `var(--scale)`.

## 5. Success Criteria
- Users can clearly see *why* a shoe is a match for them.
- Increased trust in recommendations due to "Reality Check" transparency.
- Community reviews become actionable "Signals" rather than just text blobs.
