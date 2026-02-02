'use client';

import { create } from 'zustand';

interface OrientationState {
  isPortrait: boolean;
  isLandscape: boolean;
  scale: number;
  scaleX: number;
  scaleY: number;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  initialized: boolean;
  initialize: () => void;
  cleanup: () => void;
}

const DESIGN_WIDTH_PORTRAIT = 430;
const DESIGN_HEIGHT_PORTRAIT = 932;
const DESIGN_WIDTH_LANDSCAPE = 1440;
const DESIGN_HEIGHT_LANDSCAPE = 900;

let resizeHandler: (() => void) | null = null;
let mediaQueryHandler: ((e: MediaQueryListEvent) => void) | null = null;
let mediaQuery: MediaQueryList | null = null;

const calculateOrientation = () => {
  if (typeof window === 'undefined') {
    return {
      isPortrait: true,
      isLandscape: false,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      screenWidth: 0,
      screenHeight: 0,
      orientation: 'portrait' as const,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isPortrait = height > width;
  const isLandscape = width >= height;

  let scaleX: number;
  let scaleY: number;
  let scale: number;

  if (isPortrait) {
    scaleX = width / DESIGN_WIDTH_PORTRAIT;
    scaleY = height / DESIGN_HEIGHT_PORTRAIT;
    scale = Math.min(scaleX, scaleY, 1.5);
  } else {
    scaleX = width / DESIGN_WIDTH_LANDSCAPE;
    scaleY = height / DESIGN_HEIGHT_LANDSCAPE;
    scale = Math.min(scaleX, scaleY, 1.5);
  }

  scale = Math.max(scale, 0.5);

  document.documentElement.style.setProperty('--scale', scale.toString());
  document.documentElement.style.setProperty('--scale-x', scaleX.toString());
  document.documentElement.style.setProperty('--scale-y', scaleY.toString());
  document.documentElement.style.setProperty('--is-portrait', isPortrait ? '1' : '0');
  document.documentElement.style.setProperty('--is-landscape', isLandscape ? '1' : '0');

  return {
    isPortrait,
    isLandscape,
    scale,
    scaleX,
    scaleY,
    screenWidth: width,
    screenHeight: height,
    orientation: isPortrait ? 'portrait' as const : 'landscape' as const,
  };
};

export const useOrientationStore = create<OrientationState>((set, get) => ({
  isPortrait: true,
  isLandscape: false,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  screenWidth: 0,
  screenHeight: 0,
  orientation: 'portrait',
  initialized: false,

  initialize: () => {
    if (get().initialized || typeof window === 'undefined') return;

    const updateOrientation = () => {
      set(calculateOrientation());
    };

    updateOrientation();

    resizeHandler = updateOrientation;
    window.addEventListener('resize', resizeHandler);

    mediaQuery = window.matchMedia('(orientation: portrait)');
    mediaQueryHandler = () => updateOrientation();
    mediaQuery.addEventListener('change', mediaQueryHandler);

    set({ initialized: true });
  },

  cleanup: () => {
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
    if (mediaQuery && mediaQueryHandler) {
      mediaQuery.removeEventListener('change', mediaQueryHandler);
      mediaQueryHandler = null;
      mediaQuery = null;
    }
    set({ initialized: false });
  },
}));
