import React from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/layout';
import { fontSizes, fonts } from '@/theme/typography';
import { Text } from './Text';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface BadgeProps extends ViewProps {
  variant?: BadgeVariant;
  children: string;
}

export function Badge({ variant = 'default', children, style, ...props }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, ViewStyle> = {
    default: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.secondary,
    },
    destructive: {
      backgroundColor: colors.destructive,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
  };

  const textColors: Record<BadgeVariant, string> = {
    default: colors['primary-foreground'],
    secondary: colors['secondary-foreground'],
    destructive: colors['destructive-foreground'],
    outline: colors.foreground,
  };

  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: radii.full,
        },
        variantStyles[variant],
        style,
      ]}
      {...props}
    >
      <Text
        style={{
          fontSize: fontSizes.xs,
          fontFamily: fonts.medium,
          color: textColors[variant],
        }}
      >
        {children}
      </Text>
    </View>
  );
}
