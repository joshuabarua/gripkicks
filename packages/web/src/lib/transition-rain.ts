export type RainAsset = "blue" | "green" | "yellow" | "plastic" | "rock";

export interface RainPiece {
  asset: RainAsset;
  x: number;
  size: number;
  delayMs: number;
  durationMs: number;
  rotateFrom: number;
  rotateTo: number;
  drift: number;
  mobile: boolean;
}

export const RAIN_IMAGE_URLS = {
  blue: "/imgs/transition/rain-blue.webp",
  green: "/imgs/transition/rain-green.webp",
  yellow: "/imgs/transition/rain-yellow.webp",
  plastic: "/imgs/transition/rain-plastic.webp",
  rock: "/imgs/transition/rain-rock.webp",
} as const satisfies Record<RainAsset, string>;

// One wave of twelve pieces. Leads (0-6) are already falling when the wipe
// starts; tails (7-11) drop in behind them and land as the curtain lifts.
export const RAIN_PIECES = [
  { asset: "blue", x: 5, size: 91, delayMs: -220, durationMs: 900, rotateFrom: -28, rotateTo: 55, drift: 3, mobile: true },
  { asset: "plastic", x: 19, size: 125, delayMs: -160, durationMs: 920, rotateFrom: 18, rotateTo: -48, drift: -3, mobile: false },
  { asset: "yellow", x: 35, size: 78, delayMs: -100, durationMs: 880, rotateFrom: -32, rotateTo: 64, drift: 4, mobile: true },
  { asset: "rock", x: 48, size: 68, delayMs: -40, durationMs: 890, rotateFrom: 20, rotateTo: -30, drift: -2, mobile: false },
  { asset: "green", x: 62, size: 96, delayMs: -180, durationMs: 910, rotateFrom: -15, rotateTo: 40, drift: 3, mobile: true },
  { asset: "blue", x: 78, size: 114, delayMs: -20, durationMs: 900, rotateFrom: 30, rotateTo: -45, drift: -4, mobile: false },
  { asset: "plastic", x: 90, size: 86, delayMs: -80, durationMs: 900, rotateFrom: -20, rotateTo: 35, drift: -2, mobile: true },
  { asset: "yellow", x: 12, size: 78, delayMs: 120, durationMs: 820, rotateFrom: 35, rotateTo: -20, drift: 4, mobile: false },
  { asset: "rock", x: 29, size: 62, delayMs: 160, durationMs: 800, rotateFrom: -20, rotateTo: 45, drift: -3, mobile: true },
  { asset: "plastic", x: 45, size: 109, delayMs: 200, durationMs: 780, rotateFrom: -30, rotateTo: 35, drift: 3, mobile: true },
  { asset: "blue", x: 66, size: 81, delayMs: 240, durationMs: 740, rotateFrom: 24, rotateTo: -48, drift: -2, mobile: false },
  { asset: "green", x: 86, size: 94, delayMs: 280, durationMs: 700, rotateFrom: -22, rotateTo: 60, drift: -4, mobile: true },
] as const satisfies readonly RainPiece[];

// Wipe off immediately, hold red for 80ms, then lift: about 1s in total.
export const PAGE_TRANSITION_TIMING = {
  coverDelayMs: 0,
  coverDurationMs: 450,
  revealDelayMs: 530,
  revealDurationMs: 450,
} as const;

const SCOPE = ":root:active-view-transition-type(page-nav)";

const pieceRule = (piece: RainPiece, index: number) => {
  const group = `${SCOPE}::view-transition-group(page-rain-${index})`;
  const pair = `${SCOPE}::view-transition-image-pair(page-rain-${index})`;
  const mobileHide = piece.mobile
    ? ""
    : `@media (orientation: portrait) and (max-width: 767px){${group}{display:none!important;animation:none!important}}`;
  return `${group}{z-index:2;inset:0 auto auto 0;width:clamp(32px,calc(var(--rain-size)*.12vw),calc(var(--rain-size)*1px))!important;height:clamp(32px,calc(var(--rain-size)*.12vw),calc(var(--rain-size)*1px))!important;background-image:url("${RAIN_IMAGE_URLS[piece.asset]}");background-size:contain;background-repeat:no-repeat;background-position:center;overflow:hidden;animation:page-rain-fall ${piece.durationMs}ms cubic-bezier(.22,.08,.6,1) ${piece.delayMs}ms both;--rain-x:${piece.x}vw;--rain-to-x:${piece.x + piece.drift}vw;--rain-from:${piece.rotateFrom}deg;--rain-to:${piece.rotateTo}deg;--rain-size:${piece.size}}${pair}{display:none}@media (prefers-reduced-motion: reduce){${group}{display:none!important}}${mobileHide}`;
};

const TIMING_ROOT_CSS = `${SCOPE}{--cover-delay:${PAGE_TRANSITION_TIMING.coverDelayMs}ms;--cover-duration:${PAGE_TRANSITION_TIMING.coverDurationMs}ms;--reveal-delay:${PAGE_TRANSITION_TIMING.revealDelayMs}ms;--reveal-duration:${PAGE_TRANSITION_TIMING.revealDurationMs}ms}`;

export const RAIN_TRANSITION_CSS = TIMING_ROOT_CSS + RAIN_PIECES.map(pieceRule).join("");
