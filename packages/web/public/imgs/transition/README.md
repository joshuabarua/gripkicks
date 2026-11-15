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

One wave of twelve hold/rock pieces falls during `page-nav`
view transitions (12 pieces desktop, 7 on portrait phones ≤767px), each
falling for ~0.7–0.9s. The seven leading pieces are already in flight when the
red curtain starts covering, and the five tail pieces land as the curtain
reveal finishes (~980ms). No bouncing; every piece
starts above and exits below the viewport. Reduced-motion users get no rain
and a transparent curtain. If a WebP fails to load its group simply paints
nothing; the wipe still works.
