import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, FadeInDown, ReduceMotion } from 'react-native-reanimated';

const STEP_MS = 70;

// lab-rise: staggered fade-and-rise entrance. Skipped when the system asks for reduced motion.
export function Rise({ index = 0, style, children }: { index?: number; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return (
    <Animated.View
      style={style}
      entering={FadeInDown.duration(600)
        .delay(index * STEP_MS)
        .easing(Easing.bezierFn(0.22, 1, 0.36, 1))
        .reduceMotion(ReduceMotion.System)}
    >
      {children}
    </Animated.View>
  );
}
