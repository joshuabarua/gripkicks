# AI Coding Conventions

These rules apply to all AI-assisted development on this project.
The source of truth for the AI tooling is `.windsurf/rules/` — this file is the human-readable mirror.

---

## Package manager

Use `yarn` and `npx`. Never use `npm`.

```bash
yarn add <package>
npx convex deploy
```

---

## Code comments

No inline comments. Good naming makes code self-explanatory.

```typescript
// ❌ avoid
const x = value * 0.8; // apply 20% discount

// ✓ prefer
const discountedPrice = applyDiscount(price, 0.20);
```

---

## Task continuity

If there are remaining tasks in the active todo list, continue working through them without waiting to be asked.

---

## Notes on tool-specific files

`.windsurf/rules/` contains the live rule files that the Windsurf AI reads. They must stay in that location to function. This doc mirrors their content for human reference.

`.claude/settings.local.json` holds Claude tool permissions. It's a machine config, not documentation — keep it in `.claude/`.
