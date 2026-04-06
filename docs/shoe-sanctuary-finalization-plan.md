# Shoe Sanctuary Finalization Plan

## Recent commit review

Latest commit reviewed:

- `ff75383 chore: remove unused home design variants`

This commit only removes unused home design components and does not affect the shoe variant refactor.

## Current status

The Shoe Sanctuary refactor is **close to finalizing**.

The main variant model work is already in place:

- `modelName`, `variantLabel`, and `parentModelId` exist in the Convex schema
- create, update, seed, and backfill paths handle explicit variant metadata
- admin UI can create and edit the new fields
- Sanctuary grouping prefers stored metadata instead of name parsing
- the admin dashboard includes a backfill trigger

## Remaining finalization steps

1. **Verify generated types and compile-time consistency**
   - run the relevant codegen / typecheck pass for Convex and the web app
   - confirm the frontend types match the latest schema

2. **Backfill existing shoe rows**
   - run `api.shoes.backfillVariantMetadata` once in the admin workflow or via a safe operator path
   - confirm the expected parent/variant relationships are populated

3. **Smoke test the Sanctuary flow**
   - verify grouped shoes render correctly
   - verify single shoes still render as single entries
   - verify the add shoe dialog and admin edit flow still submit valid data

4. **Image cleanup follow-up**
   - determine which La Sportiva ImageKit folder is actually used
   - remove the unused duplicate folder in ImageKit once confirmed
   - assign the new SCARPA images to the correct shoe records

## Finalization assessment

**Verdict: mostly complete, pending verification and data cleanup.**

I would treat this as **functionally near done**, but not fully final until:

- the backfill is run and checked
- the app is typechecked / smoke tested
- the ImageKit folder cleanup and SCARPA image assignment are confirmed

## Recommended next action

Run the backfill, then do a quick validation pass on the Sanctuary UI and image references.
