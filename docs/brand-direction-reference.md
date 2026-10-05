# Brand Direction Guide

This doc turns the retro-futurist climbing concept into a practical visual system for GripKicks.

## Shared Direction

The brand should feel like:

- A premium climbing instrument
- Retro sci-fi without neon cliches
- Calm, precise, and inviting
- Technical but human

## 1. Concrete Style Tile

Use this as the visual source of truth for the product.

### Color Palette

| Role           | Color                       | Use                        |
| -------------- | --------------------------- | -------------------------- |
| Base dark      | `#0f1110`                   | Main backgrounds           |
| Surface        | `#171a18`                   | Cards and panels           |
| Soft surface   | `#222623`                   | Elevated sections          |
| Text primary   | `#f4f0e8`                   | Headings and key body text |
| Text secondary | `#b8b1a6`                   | Supporting copy            |
| Border         | `rgba(244, 240, 232, 0.08)` | Dividers and outlines      |
| Accent orange  | `#d97757`                   | Primary action and focus   |
| Accent blue    | `#6a9bcc`                   | Secondary data and info    |
| Accent green   | `#788c5d`                   | Success and fit confidence |

### Typography

| Role    | Recommendation               | Use                                   |
| ------- | ---------------------------- | ------------------------------------- |
| Display | Ball Pill or Tanker          | Homepage headings and hero statements |
| Body    | Sora                         | Reading copy, specs, controls         |
| Utility | Sora uppercase with tracking | Labels and captions                   |

Rules:

- Use display type sparingly.
- Keep body type calm and readable.
- Avoid mono unless showing raw technical values.

### Texture And Atmosphere

Use these sparingly:

- Fine topo-line patterns
- Soft grain overlays
- Thin orbit arcs or rings
- Subtle radial glows behind the hero shoe

Avoid:

- Heavy neon grids
- Glitch effects
- Busy starfields
- Purple gradients

### Sample UI Pieces

Define a small set of reusable primitives:

- Primary button: dark fill, orange accent, slightly rounded, confident
- Secondary button: transparent with light border
- Metric chip: small capsule with muted background and one accent value
- Card: surface background, thin border, generous padding

## 2. Homepage Art Direction

This is the homepage's visual and emotional blueprint.

### Goal

Make the user feel like they are entering a precision climbing lab built for discovery.

### Layout

Recommended structure:

1. Hero with 3D shoe spinner on the dominant side
2. Short brand statement on the opposite side
3. Small row of trust or data points under the hero
4. Preview modules for Foot Lab, Shoe Sanctuary, and recommendations below

### Composition

- Let the spinner own the page.
- Use asymmetry instead of centered symmetry.
- Keep large negative space around the hero.
- Use thin rules and subtle labels instead of heavy boxes.

### Mood

- Quiet confidence
- Slight mystery
- Precision and care
- Warm, not sterile

### Imagery And Motion

- The spinner should rotate slowly and feel tactile.
- Panels should reveal with restrained motion.
- Hover states should feel physical, like leaning into an instrument panel.
- Background motion should be ambient only.

### Hierarchy

- First: the shoe
- Second: the promise of better fit
- Third: supporting data and navigation
- Fourth: deeper product sections

### Homepage Copy Tone

- Short
- Calm
- Specific
- Slightly futuristic

Example tone:

- "Find the shoe that fits your foot, not the other way around."
- "A precise fit system for climbers who care about detail."

## 3. Full Component-Level Design System

This is the implementation layer for the whole app.

### Core Rules

- Use the same surface, border, and spacing logic everywhere.
- Keep radii consistent.
- Prefer clear hierarchy over decorative variety.
- Every component should feel like part of the same machine.

### Spacing

- Use a compact but breathable scale.
- Section spacing should feel generous.
- Internal card spacing should be tighter than page spacing.

Suggested rhythm:

- Page padding: 24 to 32px on mobile, 48 to 64px on desktop
- Card padding: 20 to 28px
- Gaps between card elements: 12 to 16px

### Surface System

| Type                | Style                                             |
| ------------------- | ------------------------------------------------- |
| Default card        | Dark surface, thin border, slight radius          |
| Hover card          | Border brightens, shadow or glow increases subtly |
| Active card         | Accent border and faint accent wash               |
| Informational panel | Slightly lighter surface, clear label hierarchy   |

### Buttons

Primary button:

- Solid accent or dark fill with accent outline
- Clear label
- Strong hover contrast

Secondary button:

- Transparent or surface fill
- Minimal emphasis
- Use for less important actions

### Forms And Inputs

- Inputs should be quiet and precise.
- Borders should appear on focus, not dominate by default.
- Labels should sit above fields, not inside them as placeholders.

### Data Display

- Use chips, bars, and compact stats for fit and shoe attributes.
- Keep metrics aligned and scannable.
- Highlight one primary number per module.

### Navigation

- Navigation should remain slim and confident.
- Active state should use orange, not a heavy fill.
- Avoid oversized pills or loud underline animations.

### 3D And Special Components

- The shoe viewer is the hero component.
- Surround it with minimal framing.
- Do not over-decorate the 3D area.
- Let the object feel premium and isolated.

### Component Do / Don't

Do:

- Keep labels human and direct
- Use consistent borders and radii
- Use a restrained accent palette
- Maintain strong spacing discipline

Don't:

- Mix decorative styles within a single screen
- Add random gradients
- Overuse glow or blur
- Build every card as if it needs to be special

## Implementation Order

1. Lock the style tile first.
2. Apply the homepage art direction to the landing page.
3. Build the design system from repeated UI patterns.

That sequence keeps the brand coherent before it spreads across the app.
