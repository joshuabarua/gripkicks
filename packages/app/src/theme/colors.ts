export const colors = {
  background: '#0a0a0a',
  foreground: '#f0ede5',

  card: '#1a1a1a',
  'card-foreground': '#f0ede5',

  popover: '#1a1a1a',
  'popover-foreground': '#f0ede5',

  primary: '#f0ede5',
  'primary-foreground': '#0a0a0a',

  secondary: '#8f8a73',
  'secondary-foreground': '#f0ede5',

  muted: '#262626',
  'muted-foreground': '#8f8a73',

  accent: '#f45b5b',
  'accent-foreground': '#ffffff',

  destructive: '#f45b5b',
  'destructive-foreground': '#ffffff',

  border: 'rgba(255, 255, 255, 0.06)',
  input: 'rgba(255, 255, 255, 0.06)',
  ring: '#f45b5b',

  brand: {
    base: '#0a0a0a',
    surface: '#1a1a1a',
    charcoal: '#2d2d2d',
    chalk: '#f0ede5',
    putty: '#c8bfb3',
    red: '#f45b5b',
    blue: '#6a9bcc',
    green: '#788c5d',
    border: 'rgba(255, 255, 255, 0.06)',
  },

  chart: {
    '1': '#f45b5b',
    '2': '#6a9bcc',
    '3': '#c8bfb3',
    '4': '#b3b3b3',
    '5': '#8f8a73',
  },
} as const;

export type Colors = typeof colors;
