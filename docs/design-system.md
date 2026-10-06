# GripKicks Design System

## Aesthetic Direction

**Technical/precise with fluidity/organic elements.** Dark canvas, warm chalk type, bold red accent reserved for shapes and controls. Orientation-based fluid scaling — layouts adapt smoothly, no breakpoint snapping.

Tailwind v4, CSS-first: all tokens live in `@theme` inside `packages/web/src/app/globals.css`. No JS config file.

---

## Tokens

### Colors
| Token | Value | Use |
|---|---|---|
| `brand-base` | `#0a0a0a` | Page background |
| `brand-surface` | `#1a1a1a` | Panels (footer) |
| `brand-charcoal` | `#2d2d2d` | `lab-card` surface |
| `brand-red` | `#f45b5b` | CTAs, borders, active states — never text |
| `brand-chalk` | `#f0ede5` | Primary text, warm white |
| `brand-putty` | `#c8bfb3` | Secondary text |
| `brand-border` | white @ 16% | Card borders |
| shadcn tokens | `hsl(var(--*))` | `background`, `foreground`, `card`, `muted`, `accent`, etc. |

### Typography
| Role | Font | Class |
|---|---|---|
| Display / headings / buttons | Ball Pill | `font-ball-pill` (auto-uppercase) |
| Body, labels, data, controls | DM Mono | `font-mono` — the default UI face |
| Sanctuary page title + dialogs only | So Cloudy | `font-so-cloudy` — enforced by `src/__tests__/typography.test.ts` |

**Banned**: Sora, Basteleur, Tanker — removed; test fails if they appear.

### Fluid scale
All sizes derive from `--scale` (JS-set per orientation):
- Spacing: `fluid-xs` → `fluid-3xl` (`--space-*`)
- Text: `fluid-xs` → `fluid-9xl` (`--text-*`), titles `--title-sm` → `--title-4xl` via `text-title-*`
- Containers: `max-w-(--fluid-container-sm|md|lg|xl)`

---

## Lab Visual System

Home, Dashboard, Matcher, Foot Lab share the Foot Lab language — black canvas, charcoal cards:

- `lab-card` — charcoal card, red monolith bar animates in on hover
- `lab-card-lift` — hover translate lift
- `lab-card-active` — red border + glow, for selected/primary panels
- `lab-button` — red pill (Ball Pill, uppercase), primary action
- `lab-button-ghost` — bordered ghost, secondary action
- `lab-label` — small uppercase mono label
- `lab-rise` — staggered entrance (set `--rise-delay`)
- `LabHeader` — page title block; `PageSurface` — page wrapper

---

## Brand Marks

`BrandLogo` (`src/components/stash/BrandLogo.tsx`) renders approved brand SVG/PNG logos:
- `size="sm"` h-5 w-20 — card rows, selects · `size="md"` — brand section headers · `size="lg"` h-10 w-40 — matcher tiles/leaderboard
- `tooltip` prop — Radix tooltip with company name (Sanctuary cards); otherwise `title` fallback
- Unmapped brands → uppercase mono text fallback

## Badges

Card badges (CloudShoe header) carry Radix tooltips:
- Star — favourite (manual toggle)
- Heart — highest comfort score · Crown — most worn · Clock — oldest
Sanctuary shows the badge key above the brand grid.

---

## Media

- Shoe images via `ShoeImage` → ImageKit (`NEXT_PUBLIC_IMAGEKIT_*` envs)
- Video via plain `<video>` + `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` path join

---

## Motion

- Page/section entrance: `lab-rise` or framer `initial={{opacity:0, y:30→40}}` staggered by index
- Expand/collapse: `AnimatePresence` + height `0 ↔ auto`, respects `useReducedMotion`
- Clouds: `cloud-drift-left/right`, `fill-mode: both`, clipped above footer via `clip-path`
- Modals: `DialogContent` rounded-3xl; hover `scale: 1.02`, tap `0.98`

---

## Rules

- **No accent-colored text** — `brand-red` is for shapes, borders, buttons only
- **No marketing fluff** — functional labels only
- **No comments in code**; Tailwind first; don't rewrite existing utilities
- Tools grid max 2 columns, no decorative icons; hero nav arrow-only
