import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { fonts, fontSizes, lineHeights, tracking } from '@/theme/typography';

type Size = keyof typeof fontSizes;

interface TextProps extends RNTextProps {
  variant?: Size;
  weight?: 'normal' | 'medium';
  // Accent red is for shapes only, never text, so it is not offered here.
  color?: 'primary' | 'secondary' | 'muted' | 'inverse' | 'white';
  align?: TextStyle['textAlign'];
}

const colorMap = {
  primary: colors.foreground,
  secondary: colors.brand.putty,
  muted: colors['muted-foreground'],
  inverse: colors.background,
  white: '#ffffff',
} as const;

export function Text({
  variant = 'base',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  style,
  ...props
}: TextProps) {
  const size = fontSizes[variant];
  return (
    <RNText
      style={[
        {
          fontFamily: weight === 'medium' ? fonts.medium : fonts.regular,
          fontSize: size,
          lineHeight: Math.round(size * lineHeights.relaxed),
          color: colorMap[color],
          textAlign: align,
        },
        style,
      ]}
      {...props}
    />
  );
}

// lab-title: uppercase DM Mono heading.
export function Title({ variant = 'xl', style, ...props }: Omit<TextProps, 'weight'>) {
  const size = fontSizes[variant];
  return (
    <Text
      accessibilityRole="header"
      variant={variant}
      color="white"
      style={[
        { textTransform: 'uppercase', letterSpacing: size * tracking.title, lineHeight: Math.round(size * lineHeights.tight) },
        style,
      ]}
      {...props}
    />
  );
}

// lab-label: small uppercase label in faded putty.
export function Label({ style, ...props }: Omit<TextProps, 'variant' | 'weight'>) {
  return (
    <Text
      variant="2xs"
      color="muted"
      style={[{ textTransform: 'uppercase', letterSpacing: fontSizes['2xs'] * tracking.label }, style]}
      {...props}
    />
  );
}
