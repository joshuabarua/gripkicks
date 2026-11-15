import React, { type ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/layout';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  // lab-card-active: red border and tint for the selected or primary panel.
  active?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityState?: { selected?: boolean; checked?: boolean };
  testID?: string;
}

const monolithEase = Easing.bezier(0.76, 0, 0.24, 1);

// lab-card: charcoal panel. Pressable cards grow the red monolith bar on touch,
// the mobile stand-in for the web hover.
export function Card({ children, style, active, onPress, accessibilityLabel, accessibilityState, testID }: CardProps) {
  const bar = useSharedValue(0);
  const press = useSharedValue(1);
  const barStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: bar.value }] }));
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));

  const surface: StyleProp<ViewStyle> = [
    {
      backgroundColor: active ? colors.active.background : colors.card,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: active ? colors.active.border : colors.border,
      overflow: 'hidden',
    },
    style,
  ];

  if (!onPress) {
    return <View style={surface} testID={testID}>{children}</View>;
  }

  return (
    <Animated.View style={pressStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={accessibilityState}
        testID={testID}
        onPress={onPress}
        onPressIn={() => {
          bar.value = withTiming(1, { duration: 400, easing: monolithEase });
          press.value = withTiming(0.98, { duration: 120 });
        }}
        onPressOut={() => {
          bar.value = withTiming(0, { duration: 400, easing: monolithEase });
          press.value = withTiming(1, { duration: 200 });
        }}
        style={surface}
      >
        {children}
        <Animated.View
          pointerEvents="none"
          style={[
            { position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, backgroundColor: colors.brand.red, transformOrigin: 'top' },
            barStyle,
          ]}
        />
      </Pressable>
    </Animated.View>
  );
}
