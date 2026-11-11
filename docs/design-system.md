# GripKicks Design System

## Aesthetic Direction

**Technical/precise with fluidity/organic elements.** Dark canvas, warm chalk
type, bold red accent reserved for shapes and controls. Orientation-based fluid
scaling — layouts adapt smoothly, no breakpoint snapping.

Tailwind v4, CSS-first: all tokens live in `@theme` inside
`packages/web/src/app/globals.css`. No JS config file.

---

## Tokens

### Colors

| Token            | Value           | Use                                                         |
| ---------------- | --------------- | ----------------------------------------------------------- |
| `brand-base`     | `#0a0a0a`       | Page background                                             |
| `brand-surface`  | `#1a1a1a`       | Panels (footer)                                             |
| `brand-charcoal` | `#2d2d2d`       | `lab-card` surface                                          |
| `brand-red`      | `#f45b5b`       | CTAs, borders, active states — never text                   |
| `brand-chalk`    | `#f0ede5`       | Primary text, warm white                                    |
| `brand-putty`    | `#c8bfb3`       | Secondary text                                              |
| `brand-border`   | white @ 16%     | Card borders                                                |
| shadcn tokens    | `hsl(var(--*))` | `background`, `foreground`, `card`, `muted`, `accent`, etc. |

### Typography

| Role                                | Font      | Class                                                             |
| ----------------------------------- | --------- | ----------------------------------------------------------------- |
| Display / headings / buttons        | Amatic    | `font-amatic` (auto-uppercase)                                    |
| Body, labels, data, controls        | DM Mono   | `font-mono` — the default UI face                                 |
| Sanctuary page title + dialogs only | So Cloudy | `font-so-cloudy` — enforced by `src/__tests__/typography.test.ts` |

**Banned**: Sora, Basteleur, Tanker — removed; test fails if they appear.

### Fluid scale

All sizes derive from `--scale` (JS-set per orientation):

- Spacing: `fluid-xs` → `fluid-3xl` (`--space-*`)
- Text: `fluid-xs` → `fluid-9xl` (`--text-*`), titles `--title-sm` →
  `--title-4xl` via `text-title-*`
- Containers: `max-w-(--fluid-container-sm|md|lg|xl)`

---

## Lab Visual System

Home, Dashboard, Matcher, Foot Lab and Profile share the Foot Lab language —
black canvas, charcoal cards:

- `lab-card` — charcoal card, red monolith bar animates in on hover
- `lab-card-lift` — hover translate lift
- `lab-card-active` — red border + glow, for selected/primary panels
- `lab-button` — red pill (Amatic, uppercase), primary action
- `lab-button-ghost` — bordered ghost, secondary action
- `lab-label` — small uppercase mono label
- `lab-rise` / `lab-fade` — entrance motion (see Motion)
- `lab-container` — shared page container (max-w-6xl, fluid padding)
- `LabHeader` — page title block (`text-fluid-8xl` title,
  `text-fluid-lg text-brand-putty` description); `PageSurface` — page wrapper

### Page shell

```tsx
<PageSurface>
	<div className="lab-container">
		<LabHeader title="Profile" description="…" />…
	</div>
</PageSurface>
```

### Patterns

- **Next step panel** (Dashboard, Profile, Foot Lab onboarding):
  `lab-card lab-card-active` with a `lab-label`, Amatic `h2`, one line of putty
  text, `lab-button` on the right.
- **Summary card**: `lab-card p-6`, `lab-label` + Amatic value; missing data
  gets a `lab-button-ghost` action, never red text.
- **Selectable option** (Foot Lab): `motion.button` with `lab-card`,
  `lab-card-active hal-glow` when selected, `aria-pressed`, hover `y: -4`, tap
  `scale: 0.97`.
- **Accordion section** (Profile): `lab-card`; header is a real
  `<button aria-expanded aria-controls>`, body uses `expandMotion`. Destructive
  sections use a red border and icon, title stays chalk.
- **Body text**: `text-brand-putty` (with opacity modifiers if needed). Do not
  use `text-neutral-*`.
- **Text link**: chalk text, red underline decoration
  (`decoration-brand-red underline-offset-4`), hover underline to chalk.
- **Form input**: `rounded-lg bg-black border-white/6 h-12`, red focus
  border/ring.

## Editorial Pages

About and Privacy keep an editorial look: `LiquidGlassBackdrop`,
`WordmarkWatermark`, `rounded-3xl` cards, alternating `bg-brand-surface`
sections. They still use fluid type (`text-fluid-9xl` titles, `text-fluid-5xl`
section heads), fluid padding (`px-fluid-lg md:px-fluid-xl`, `py-fluid-3xl`),
putty body text and `lab-rise` entrances. About keeps a short personal note
(constraint 3 exemption).

## Sanctuary

Sanctuary has its own theme: So Cloudy title, cloud backdrop + drifting clouds,
`CloudShoe` cards (`rounded-xl border-white/30 bg-brand-surface`). On load it
shows skeletons shaped like the final layout (`StatsStripSkeleton` in the header
slot, `SanctuaryGridSkeleton` for brand sections), then reveals in order: header
→ filters → nudge → badge key/toolbar → brand sections.

---

## Brand Marks

`BrandLogo` (`src/components/stash/BrandLogo.tsx`) renders approved brand
SVG/PNG logos:

- `size="sm"` h-5 w-20 — card rows, selects · `size="md"` — brand section
  headers · `size="lg"` h-10 w-40 — matcher tiles/leaderboard
- `tooltip` prop — Radix tooltip with company name (Sanctuary cards); otherwise
  `title` fallback
- Unmapped brands → uppercase mono text fallback

## Badges

Card badges (CloudShoe header) carry Radix tooltips:

- Star — favourite (manual toggle)
- Heart — highest comfort score · Crown — most worn · Clock — oldest Sanctuary
  shows the badge key above the brand grid.

---

## Media

- Shoe images via `ShoeImage` → ImageKit (`NEXT_PUBLIC_IMAGEKIT_*` envs)
- Video via plain `<video>` + `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` path join

---

## Motion

Hybrid: CSS for entrances, framer-motion for interactions. Shared helpers live
in `src/lib/motion.ts`.

- **Entrances**: `lab-rise` (fade + 20px rise, 0.5s, ease-out) or `lab-fade`
  (opacity, 0.9s). Stagger with `style={riseDelay(i)}` (50ms steps). Both are
  disabled under `prefers-reduced-motion`.
- **Interactions**: `expandMotion` (height `0 ↔ auto` + fade) inside
  `AnimatePresence`, `slideUpBarMotion` (spring bar from bottom), `stepMotion`
  (multi-step page transitions), hover/tap via `whileHover` / `whileTap`.
- `MotionConfig reducedMotion="user"` in `providers.tsx` makes framer respect OS
  reduce-motion.
- **Page transitions**: whole-page wipe on navigations typed `page-nav`.
  React only calls `startViewTransition` when some `<ViewTransition>` boundary
  resolves a non-`none` update class, and the boundary must actually render a
  change during the transition for the class to resolve — a static element
  never fires. So `WipeTrigger` (`src/components/ui/WipeTrigger.tsx`, mounted in
  `app/layout.tsx`) renders `usePathname()` inside a hidden `<span>` wrapped in
  `<ViewTransition update={{ "page-nav": "page-wipe", default: "none" }}>`; the
  pathname swap on each navigation activates the boundary and starts the typed
  transition. An inert `<ViewTransition default="none">` wraps `AppShell` so
  nothing in the subtree gets a separate named snapshot. React's view-transition
  cleanup sets the overlay to `0 × 0` and hides the root snapshot, so the
  `page-nav` rules explicitly restore the overlay's viewport size and the
  root group's opacity. Without those overrides the animations run but nothing
  red paints. The wipe animates in `globals.css`
  (`:root:active-view-transition-type(page-nav)`): the
  `::view-transition-group(vt-trigger)` group carries the brand-red curtain —
  viewport-sized, `transform: none`, `z-index: 0`, clipping out with
  `page-wipe-out` (500ms, 800ms delay) — while `::view-transition-old(root)`
  clips top→bottom off screen (500ms, 120ms delay) ahead of it and the root
  group keeps `opacity: 1` at `z-index: 1`. The `::view-transition` overlay
  itself stays viewport-sized and transparent with no animation so it can clip
  the whole stage without cutting off the rain. The gap between the old root
  finishing at 620ms and the curtain reveal starting at 800ms holds a 180ms
  full-red plateau; the curtain finishes at ~1300ms. All four timings come
  from `PAGE_TRANSITION_TIMING` in `src/lib/transition-rain.ts`, exported as
  scoped custom properties by the generated CSS — no duplicated literals.
  Painted above everything (`z-index: 2`) are thirty-six `page-rain-*` groups
  from `PageTransitionRain`
  (`src/components/ui/PageTransitionRain.tsx`, same hidden-pathname boundary
  pattern as `WipeTrigger`): three staggered copies of a twelve-piece
  climbing-hold and rock set (`public/imgs/transition/rain-*.webp`,
  descriptors and generated CSS in `src/lib/transition-rain.ts`) fall through
  the shared `page-rain-fall` keyframe with modest rotation and no bounce.
  Lead pieces are already falling during the first 120ms before the old root
  covers, the tail burst keeps raining ~0.7s after the curtain ends, and the
  last piece lands at ~1990ms. Twenty-one pieces show on portrait phones;
  reduced motion hides all rain and the curtain. The reveal runs on
  the curtain group rather than `::view-transition-new(root)` because
  React-started transitions never produce a `new(root)` pseudo. Internal links route through
  `NavLink`
  (`src/components/ui/NavLink.tsx`), which always returns `["page-nav"]`;
  programmatic navigations pass `transitionTypes` to `router.push`/`replace`.
  Untyped updates (Suspense reveals, data refreshes, browser back/forward) don't
  animate — the trigger boundary resolves `default: "none"`, so no view
  transition starts at all and no root crossfade needs suppressing.
  `lab-rise`/`lab-fade` entrances run normally beneath the curtain, so the new
  page is visible under the rain-only tail. Reduced motion disables the
  overlay and its animations. Unsupported browsers navigate without animation.
- Don't put `lab-rise` on an element that framer also transforms (the CSS fill
  overrides framer's transform). Put `lab-rise` on a wrapper.
- Don't nest fading elements (parent `lab-rise` + child `lab-rise`). Opacity
  multiplies and looks muddy. Animate siblings instead.
- Don't use framer for entrances: content renders hidden until JS loads.
- Clouds: `cloud-drift-left/right`, `fill-mode: both`, clipped above footer via
  `clip-path`
- Modals: `DialogContent` rounded-3xl; hover `scale: 1.02`, tap `0.98`

---

## Loading & Auth States

- **Skeletons match the final layout**: same container sizes and positions,
  `animate-pulse motion-reduce:animate-none`. Never swap a list skeleton for a
  grid.
- **Full-page loading**: `FullPageLoading` (`src/components/ui/loading.tsx`)
  while the session or page data resolves.
- **Protected pages** (Dashboard, Profile, Sanctuary, Matcher, Foot Lab)
  redirect to `/auth/login?callbackUrl=<path>`. Two layers: `src/proxy.ts` (no
  session cookie) and `useRequireAuth()` (cookie but dead session). Pages render
  their loading state until `session.user` exists. Never redirect on the 5s
  session timeout.
- **Login/signup** redirect signed-in users to the callback via
  `useRedirectIfAuthenticated()`. Always sanitize callbacks with
  `safeCallbackPath()`.
- **Nav**: hides Sign In / Menu until the session resolves, then fades the right
  control in.

---

## Rules

- **No accent-colored text** — `brand-red` is for shapes, borders, buttons only
- **Fluid type** — headings use a single `text-fluid-*` / `text-title-*` size,
  not breakpoint steps like `text-4xl md:text-6xl`
- **No numbered feature lists** in UI copy
- **No marketing fluff** — functional labels only
- **No comments in code**; Tailwind first; don't rewrite existing utilities
- Tools grid max 2 columns, no decorative icons; hero has no scroll navigation
  overlay
- The shared `NavLink` dispatches a pre-navigation event; the nav menu plays a
  .40s close animation and routing resumes once the panel has collapsed 75% of
  its width — the wipe then follows once the destination is ready, so it can
  overlap the final quarter of the shrink — open stays .75s, reduced motion
  skips the close animation, manual close remains animated
