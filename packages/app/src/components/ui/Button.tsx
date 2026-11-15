import React, { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { fonts, fontSizes, tracking } from '@/theme/typography';
import { radii, spacing } from '@/theme/layout';
import { Text } from './Text';

// primary = lab-button (red, near-black label for 6:1 contrast), ghost = lab-button-ghost, danger = ghost with a red border.
type ButtonVariant = 'primary' | 'ghost' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export function Button({ variant = 'primary', loading, icon, disabled, style, children, ...props }: ButtonProps) {
  const isPrimary = variant === 'primary';
  const inactive = disabled || loading;
  const labelSize = isPrimary ? fontSizes.base : fontSizes.xs;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      style={({ pressed }) => [
        {
          minHeight: 44,
          borderRadius: radii.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          paddingHorizontal: isPrimary ? spacing.lg : 20,
          paddingVertical: 12,
          opacity: inactive ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        isPrimary
          ? { backgroundColor: pressed ? 'rgba(244, 91, 91, 0.8)' : colors.brand.red }
          : {
              borderWidth: 1,
              borderColor: variant === 'danger' ? colors.active.border : pressed ? 'rgba(255,255,255,0.2)' : colors.ghostBorder,
              backgroundColor: pressed ? 'rgba(255,255,255,0.05)' : 'transparent',
            },
        style,
      ]}
      {...props}
    >
      {loading ? <ActivityIndicator size="small" color={isPrimary ? colors.background : colors.foreground} /> : icon}
      {typeof children === 'string' ? (
        <Text
          color={isPrimary ? 'inverse' : 'primary'}
          style={{
            fontFamily: isPrimary ? fonts.regular : fonts.medium,
            fontSize: labelSize,
            lineHeight: Math.round(labelSize * 1.3),
            textTransform: 'uppercase',
            letterSpacing: isPrimary ? 0 : labelSize * tracking.button,
          }}
        >
          {children}
        </Text>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>{children}</View>
      )}
    </Pressable>
  );
}
