import React from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { radii, shadows } from '@/theme/layout';

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
