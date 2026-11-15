import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  measure,
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

// Scroll offset of the surrounding TabScreen, so children can tell when they
// scroll into view (the mobile version of framer-motion's whileInView).
export const ScrollOffsetContext = createContext<SharedValue<number> | null>(null);

// Returns a ref to put on an Animated.View and whether it has entered the
// bottom 85% of the screen. Fires once, like `viewport={{ once: true }}`.
export function useInView(threshold = 0.85) {
  const ref = useAnimatedRef<Animated.View>();
  const offset = useContext(ScrollOffsetContext);
  const { height } = useWindowDimensions();
  const [inView, setInView] = useState(false);
  const done = useSharedValue(false);
  // Bumped once after mount so content already on screen triggers without a scroll.
  const tick = useSharedValue(0);

  useEffect(() => {
    // Twice, in case layout lands after the first check.
    const ids = [setTimeout(() => (tick.value = 1), 50), setTimeout(() => (tick.value = 2), 400)];
    return () => ids.forEach(clearTimeout);
  }, [tick]);

  useAnimatedReaction(
    () => (offset ? offset.value : 0) + tick.value,
    () => {
      if (done.value) return;
      const m = measure(ref);
      if (m && m.pageY < height * threshold) {
        done.value = true;
        runOnJS(setInView)(true);
      }
    },
  );

  return { ref, inView };
}

const EASE = Easing.bezier(0.22, 1, 0.36, 1);

// Fades and rises its children when they scroll into view (web home sections).
export function Reveal({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const { ref, inView } = useInView();
  const reduce = useReducedMotion();
  const progress = useSharedValue(reduce ? 1 : 0);

  useEffect(() => {
    if (inView && !reduce) progress.value = withDelay(delay, withTiming(1, { duration: 700, easing: EASE }));
  }, [inView, reduce, delay, progress]);

  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 32 }],
  }));

  return (
    <Animated.View ref={ref} style={[style, animated]}>
      {children}
    </Animated.View>
  );
}
