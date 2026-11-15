import { Component, useContext, useEffect, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  ReduceMotion,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { ShoeThumb } from '@/components/lab/ShoeThumb';
import { ScrollOffsetContext } from '@/components/lab/InView';

// Port of packages/web/src/components/foot/FitShoeBackdrop.tsx: catalogue shoes
// drift behind the page. Fixed to the screen, it fades in once the hero has
// scrolled away (`revealAfter` px) so it sits "under" the hero like the web.

const SLOTS = [
  { x: 4, y: 14, size: 88, drift: 22, delay: 4, tilt: -14 },
  { x: 70, y: 9, size: 80, drift: 26, delay: 11, tilt: 12 },
  { x: 10, y: 46, size: 72, drift: 24, delay: 7, tilt: 8 },
  { x: 74, y: 38, size: 92, drift: 28, delay: 2, tilt: -10 },
  { x: 6, y: 78, size: 84, drift: 25, delay: 15, tilt: 16 },
  { x: 66, y: 70, size: 76, drift: 23, delay: 9, tilt: -6 },
  { x: 40, y: 4, size: 64, drift: 27, delay: 13, tilt: 10 },
  { x: 46, y: 88, size: 80, drift: 24, delay: 5, tilt: -16 },
] as const;

type Slot = (typeof SLOTS)[number];

function FloatingShoe({ imageUrl, slot, index, width, height }: { imageUrl: string; slot: Slot; index: number; width: number; height: number }) {
  const reduce = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    // Half a drift period each way, started at a different phase per slot.
    t.value = withDelay(slot.delay * 120, withRepeat(withTiming(1, { duration: (slot.drift * 1000) / 2, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => cancelAnimation(t);
  }, [reduce, slot, t]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(t.value, [0, 1], [-10, 14]) },
      { translateX: interpolate(t.value, [0, 1], [-6, 6]) },
      { rotate: `${slot.tilt + interpolate(t.value, [0, 1], [-6, 6])}deg` },
    ],
  }));
  return (
    <Animated.View
      entering={FadeIn.duration(600).delay((index % 5) * 50).reduceMotion(ReduceMotion.System)}
      exiting={FadeOut.duration(350)}
      style={{ position: 'absolute', left: (slot.x / 100) * width, top: (slot.y / 100) * height }}
    >
      {/* Opacity lives on the inner view so the entering fade does not overwrite it. */}
      <Animated.View style={[{ opacity: 0.14 }, style]}>
        <ShoeThumb imageUrl={imageUrl} width={slot.size} height={Math.round(slot.size * 0.7)} framed={false} />
      </Animated.View>
    </Animated.View>
  );
}

function Backdrop({ footShape, footVolume, revealAfter = 0 }: { footShape?: string; footVolume?: string; revealAfter?: number }) {
  const shoes = useQuery(api.shoes.fitShowcase, {
    ...(footShape ? { footShape: footShape.toLowerCase() as never } : {}),
    ...(footVolume ? { footVolume } : {}),
    limit: SLOTS.length,
  });
  const offset = useContext(ScrollOffsetContext);
  const { width, height } = useWindowDimensions();
  const layer = useAnimatedStyle(() => ({
    opacity: revealAfter ? interpolate(offset ? offset.value : 0, [revealAfter * 0.6, revealAfter], [0, 1], 'clamp') : 1,
  }));

  return (
    <Animated.View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, layer]}>
      {(shoes ?? []).map((shoe, index) =>
        shoe.imageUrl ? <FloatingShoe key={shoe._id} imageUrl={shoe.imageUrl} slot={SLOTS[index % SLOTS.length]!} index={index} width={width} height={height} /> : null,
      )}
    </Animated.View>
  );
}

// Decorative only: a failed query renders nothing.
class SilentBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function FitShoeBackdrop(props: { footShape?: string; footVolume?: string; revealAfter?: number }) {
  return (
    <SilentBoundary>
      <Backdrop {...props} />
    </SilentBoundary>
  );
}
