import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { fonts, fontSizes, fontWeights, lineHeights } from '@/theme/typography';

interface TextProps extends RNTextProps {
  variant?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'destructive' | 'inverse';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export function Text({
  variant = 'base',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  style,
  children,
  ...props
}: TextProps) {
  const colorMap: Record<string, string> = {
    primary: colors.foreground,
    secondary: colors['secondary-foreground'],
    muted: colors['muted-foreground'],
    accent: colors.accent,
    destructive: colors.destructive,
    inverse: colors['primary-foreground'],
  };

  const textStyle: TextStyle = {
    fontFamily: fonts.regular,
    fontSize: fontSizes[variant],
    fontWeight: fontWeights[weight],
    color: colorMap[color],
    textAlign: align,
    lineHeight: fontSizes[variant] * lineHeights.normal,
  };

  return (
    <RNText style={[textStyle, style]} {...props}>
      {children}
    </RNText>
  );
}
