'use client';

import { useState, useEffect } from 'react';

interface OrientationScale {
  isPortrait: boolean;
  isLandscape: boolean;
  scale: number;
  orientation: 'portrait' | 'landscape';
  screenWidth: number;
  screenHeight: number;
}

export function useOrientationScale(): OrientationScale {
  const [orientation, setOrientation] = useState<OrientationScale>({
    isPortrait: true,
    isLandscape: false,
    scale: 1,
    orientation: 'portrait',
    screenWidth: 0,
    screenHeight: 0,
  });

  useEffect(() => {
    const updateOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;
      const isLandscape = width > height;
      
      // Calculate scale based on the smaller dimension
      // This ensures everything fits nicely on both orientations
      const baseDimension = 1080; // Base design dimension (e.g., iPhone 12 height)
      const currentDimension = Math.min(width, height);
      const scale = Math.min(currentDimension / baseDimension, 2); // Cap at 2x scale
      
      setOrientation({
        isPortrait,
        isLandscape,
        scale,
        orientation: isPortrait ? 'portrait' : 'landscape',
        screenWidth: width,
        screenHeight: height,
      });
    };

    // Initial check
    updateOrientation();

    // Listen for orientation changes and resize
    const mediaQuery = window.matchMedia('(orientation: portrait)');
    mediaQuery.addEventListener('change', updateOrientation);
    window.addEventListener('resize', updateOrientation);

    return () => {
      mediaQuery.removeEventListener('change', updateOrientation);
      window.removeEventListener('resize', updateOrientation);
    };
  }, []);

  return orientation;
}

// Helper function to generate responsive values based on orientation
export function getOrientationValue<T>(
  orientation: 'portrait' | 'landscape',
  portraitValue: T,
  landscapeValue: T
): T {
  return orientation === 'portrait' ? portraitValue : landscapeValue;
}

// Helper for scaling values
export function scaleValue(value: number, scale: number): number {
  return value * scale;
}
