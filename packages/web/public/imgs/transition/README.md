# Page Transition Images

Sources and optimized assets for the page-wipe rain effect.

## Originals (do not edit)

- `blue_hold.png`, `green_hold.png`, `yellow_hold.png`, `plastic_hold1.png` —
  climbing holds with alpha.
- `rock1.png` — rock source (cyan background removed via local u2net model at
  asset-prep time).

## Optimized assets used at runtime

`rain-{blue,green,yellow,plastic,rock}.webp` — alpha-trimmed, ≤256px longest
side, WebP q80. The rain effect loads only these, preloaded with
`media="(prefers-reduced-motion: no-preference)"`.

## Behavior

Three staggered copies of a twelve-piece hold/rock set fall during `page-nav`
view transitions (36 pieces desktop, 21 on portrait phones ≤767px), each
falling for ~0.9–1.1s. The leading pieces are already in flight before the red
curtain covers (~120ms), and the tail keeps falling ~0.4s after the curtain
reveal finishes (~1620ms; last piece lands ~1990ms). No bouncing; every piece
starts above and exits below the viewport. Reduced-motion users get no rain
and a transparent curtain. If a WebP fails to load its group simply paints
nothing; the wipe still works.
