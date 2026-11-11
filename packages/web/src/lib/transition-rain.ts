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

const BASE_RAIN_PIECES = [
  { asset: "blue", x: 5, size: 70, delayMs: -220, durationMs: 1020, rotateFrom: -28, rotateTo: 55, drift: 3, mobile: true },
  { asset: "plastic", x: 19, size: 96, delayMs: -160, durationMs: 1040, rotateFrom: 18, rotateTo: -48, drift: -3, mobile: false },
  { asset: "yellow", x: 35, size: 60, delayMs: -100, durationMs: 990, rotateFrom: -32, rotateTo: 64, drift: 4, mobile: true },
  { asset: "rock", x: 48, size: 52, delayMs: -40, durationMs: 1000, rotateFrom: 20, rotateTo: -30, drift: -2, mobile: false },
  { asset: "green", x: 62, size: 74, delayMs: -180, durationMs: 1030, rotateFrom: -15, rotateTo: 40, drift: 3, mobile: true },
  { asset: "blue", x: 78, size: 88, delayMs: -20, durationMs: 1010, rotateFrom: 30, rotateTo: -45, drift: -4, mobile: false },
  { asset: "plastic", x: 90, size: 66, delayMs: -80, durationMs: 1020, rotateFrom: -20, rotateTo: 35, drift: -2, mobile: true },
  { asset: "yellow", x: 12, size: 60, delayMs: 900, durationMs: 880, rotateFrom: 35, rotateTo: -20, drift: 4, mobile: false },
  { asset: "rock", x: 29, size: 48, delayMs: 960, durationMs: 890, rotateFrom: -20, rotateTo: 45, drift: -3, mobile: true },
  { asset: "plastic", x: 45, size: 84, delayMs: 1020, durationMs: 920, rotateFrom: -30, rotateTo: 35, drift: 3, mobile: true },
  { asset: "blue", x: 66, size: 62, delayMs: 1080, durationMs: 880, rotateFrom: 24, rotateTo: -48, drift: -2, mobile: false },
  { asset: "green", x: 86, size: 72, delayMs: 1140, durationMs: 890, rotateFrom: -22, rotateTo: 60, drift: -4, mobile: true },
] as const satisfies readonly RainPiece[];

export const RAIN_PIECES = [0, 1, 2].flatMap((copy) =>
  BASE_RAIN_PIECES.map((base) => ({
    asset: base.asset,
    x: 3 + ((base.x - 3 + copy * 11) % 88),
    size: base.size,
    delayMs: base.delayMs + copy * 50,
    durationMs: base.durationMs + copy * 30,
    rotateFrom: base.rotateFrom + copy * 37,
    rotateTo: base.rotateTo + copy * 37,
    drift: copy % 2 === 1 ? -base.drift : base.drift,
    mobile: base.mobile,
  })),
) satisfies readonly RainPiece[];

export const PAGE_TRANSITION_TIMING = {
  coverDelayMs: 120,
  coverDurationMs: 600,
  revealDelayMs: 1220,
  revealDurationMs: 600,
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
