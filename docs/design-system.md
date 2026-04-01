# GripKicks Design System

## Aesthetic Direction

**Editorial × Precision Tool.** Like a climbing magazine designed by engineers who care about beauty. Approachable for everyday climbers, not just technical users. Dark, warm, focused.

---

## Tokens

### Colors
| Token | Value | Use |
|---|---|---|
| Background | `bg-black` / `bg-neutral-950` | Page backgrounds |
| Surface | `bg-neutral-900` | Cards, panels |
| Border | `border-neutral-800` | Card borders, dividers |
| Accent | `orange-500` | CTAs, highlights, active states |
| Accent hover | `orange-400` | Hover on orange elements |
| Text primary | `text-white` | Headlines |
| Text secondary | `text-neutral-400` / `text-neutral-500` | Body copy |
| Text muted | `text-white/30` | Labels, meta |

### Typography
| Role | Font | Class |
|---|---|---|
| Display / Headlines | Tanker | `font-tanker` |
| Body / UI | Sora | `font-sora` |
| Stash page only | So Cloudy | `font-so-cloudy` (intentional cloud theme) |

**Never use**: `font-mono` for visible UI labels. Reserve it only for actual code/technical values if ever needed.

---

## Section Labels

**Old (avoid):** `<p className="font-mono text-xs text-orange-500 tracking-[0.3em]">[DASHBOARD]</p>`

**New (use):** `<p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4">Your Dashboard</p>`

Rules:
- `font-sora` not `font-mono`
- `text-white/30` not `text-orange-500` — subtle, not technical
- No brackets `[ ]` — plain human-readable words
- Sentence case for multi-word labels ("Your Dashboard", not "YOUR_DASHBOARD")
- Trailing `mb-3` or `mb-4` before the heading

---

## Card Labels (inside bento cards)

**Old (avoid):** `<p className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[VOLUME]</p>`

**New (use):** `<p className="font-sora text-[10px] uppercase tracking-[0.15em] text-neutral-600 mb-1">Volume</p>`

---

## Page Structure Pattern

Every authenticated page follows:
```
<main className="min-h-screen bg-black text-white overflow-x-hidden">
  <section className="px-6 md:px-12 lg:px-16 py-12 max-w-[5xl|6xl|7xl] mx-auto">
    {/* Page label */}
    <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4">Label</p>
    {/* H1 */}
    <h1 className="font-tanker text-6xl md:text-8xl leading-none mb-4">TITLE</h1>
    {/* Subtitle */}
    <p className="font-sora text-neutral-400 text-lg max-w-lg">Description</p>
  </section>
</main>
```

---

## Cards / Bento

```
bg-neutral-900 border border-neutral-800 rounded-3xl p-6
```

Hover state: `hover:border-orange-500/30 transition-colors`
Active/selected: `border-orange-500 bg-orange-500/10`

---

## Navigation Structure

| Label | Route | Purpose |
|---|---|---|
| Dashboard | `/dashboard` | Home base — stats, foot profile, recent shoes |
| Foot Lab | `/footscan` | Set up / update foot profile |
| Sanctuary | `/stash` | Shoe collection |
| Matcher | `/matcher` | Visual shoe radar |
| Sole Mate | `/findmyshoe` | Personalised recommendations |

Note: `/foot-lab` redirects to `/dashboard`. Foot profile data lives in dashboard.

---

## Motion Principles

- **Page load**: `initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}` with `duration: 0.8`
- **Stagger children**: `delay: 0.1 * index`
- **Hover lift**: `whileHover={{ y: -4 }}` on cards
- **Tap feedback**: `whileTap={{ scale: 0.97 }}`
- **Spring modals/bars**: `type: 'spring', stiffness: 400, damping: 35`

---

## What to Avoid

- `[BRACKET_LABELS]` — feels like a dev console, not a product
- `font-mono` for UI labels — technical, cold
- `font-bold` headings — use `font-tanker` instead
- Purple gradients, white backgrounds, generic layouts
- `text-3xl font-bold` — use `font-tanker text-3xl` etc.
