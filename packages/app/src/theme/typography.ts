// DM Mono for everything; So Cloudy only for the Sanctuary title (matches web).
// Custom fonts carry their own weight, so pick a family instead of fontWeight.
export const fonts = {
  regular: 'DMMono-Regular',
  medium: 'DMMono-Medium',
  display: 'SoCloudy',
} as const;

export const fontSources = {
  [fonts.regular]: require('../../assets/fonts/DMMono-Regular.ttf'),
  [fonts.medium]: require('../../assets/fonts/DMMono-Medium.ttf'),
  [fonts.display]: require('../../assets/fonts/SoCloudy.otf'),
};

export const fontSizes = {
  '2xs': 11,
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const lineHeights = {
  none: 1,
  tight: 1.1,
  normal: 1.35,
  relaxed: 1.55,
} as const;

// lab-title: tracking 0.04em; lab-label: tracking 0.18em.
export const tracking = {
  title: 0.04,
  label: 0.18,
  button: 0.08,
} as const;
