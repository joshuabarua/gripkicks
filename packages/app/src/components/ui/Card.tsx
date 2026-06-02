import React from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/layout';
import { shadows } from '@/theme/layout';

interface CardProps extends ViewProps {
  style?: ViewStyle;
}

export function Card({ style, children, ...props }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.sm,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardHeader({ style, children, ...props }: CardProps) {
  return (
    <View
      style={[{ padding: spacing.lg, gap: spacing.xs }, style]}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardTitle({ style, children, ...props }: CardProps) {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
}

export function CardDescription({ style, children, ...props }: CardProps) {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
}

export function CardContent({ style, children, ...props }: CardProps) {
  return (
    <View style={[{ padding: spacing.lg, paddingTop: 0 }, style]} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ style, children, ...props }: CardProps) {
  return (
    <View
      style={[
        { padding: spacing.lg, paddingTop: 0, flexDirection: 'row', alignItems: 'center' },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
