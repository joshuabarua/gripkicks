import React from 'react';
import {
  Pressable,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors } from '@/theme/colors';
import { fontSizes, fontWeights, fonts } from '@/theme/typography';
import { radii, spacing } from '@/theme/layout';
import { Text } from './Text';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export function Button({
  variant = 'default',
  size = 'default',
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    default: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, height: 44 },
    sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, height: 36 },
    lg: { paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, height: 48 },
    icon: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  };

  const getVariantStyle = (pressed: boolean): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: spacing.xs,
      opacity: disabled ? 0.5 : 1,
    };

    switch (variant) {
      case 'default':
        return {
          ...base,
          backgroundColor: pressed ? `${colors.primary}e6` : colors.primary,
        };
      case 'destructive':
        return {
          ...base,
          backgroundColor: pressed ? `${colors.destructive}e6` : colors.destructive,
        };
      case 'outline':
        return {
          ...base,
          backgroundColor: pressed ? colors.muted : 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'secondary':
        return {
          ...base,
          backgroundColor: pressed ? `${colors.secondary}b3` : colors.secondary,
        };
      case 'ghost':
        return {
          ...base,
          backgroundColor: pressed ? colors.muted : 'transparent',
        };
      case 'link':
        return { ...base, backgroundColor: 'transparent' };
      default:
        return base;
    }
  };

  const textColor: Record<ButtonVariant, string> = {
    default: colors['primary-foreground'],
    destructive: colors['destructive-foreground'],
    outline: colors.foreground,
    secondary: colors['secondary-foreground'],
    ghost: colors.foreground,
    link: colors.primary,
  };

  const textSize: Record<ButtonSize, number> = {
    default: fontSizes.sm,
    sm: fontSizes.xs,
    lg: fontSizes.base,
    icon: fontSizes.sm,
  };

  const labelStyle: TextStyle = {
    fontFamily: fonts.medium,
    fontSize: textSize[size],
    fontWeight: fontWeights.medium,
    color: textColor[variant],
  };

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [sizeStyles[size], getVariantStyle(pressed), style as ViewStyle]}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text style={labelStyle}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
