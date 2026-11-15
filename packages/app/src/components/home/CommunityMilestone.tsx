import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { Label, Text, Title } from '@/components/ui';
import { useInView } from '@/components/lab/InView';

// Port of packages/web/src/components/CommunityMilestone.tsx. On a phone the
// rail runs down the left side instead of across.

const MILESTONES = [
  { threshold: 50, label: 'Foot profiles', description: 'Better fit patterns' },
  { threshold: 100, label: 'Community ratings', description: 'More useful comparisons' },
  { threshold: 250, label: 'Shoe data', description: 'Deeper catalog signals' },
  { threshold: 500, label: 'Climbing community', description: 'Stronger recommendations' },
];

// Each milestone node sits at the middle of its quarter of the rail.
function railProgress(count: number) {
  const clamped = Math.min(500, Math.max(0, count));
  const stages = [
    { start: 0, end: 50, from: 0, to: 12.5 },
    { start: 50, end: 100, from: 12.5, to: 37.5 },
    { start: 100, end: 250, from: 37.5, to: 62.5 },
    { start: 250, end: 500, from: 62.5, to: 87.5 },
  ] as const;
  const stage = stages.find(({ end }) => clamped <= end) ?? stages[3];
  return stage.from + ((clamped - stage.start) / (stage.end - stage.start)) * (stage.to - stage.from);
}

// Counts up from 0 once `start` is true.
function useCountUp(target: number, start: boolean, reduce: boolean) {
  const [value, setValue] = useState(reduce ? target : 0);
  useEffect(() => {
    if (!start) return;
    if (reduce) return setValue(target);
    const began = Date.now();
    const duration = 1200;
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - began) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t === 1) clearInterval(id);
    }, 32);
    return () => clearInterval(id);
  }, [target, start, reduce]);
  return value;
}

const ROW = 88;

export function CommunityMilestone() {
  const data = useQuery(api.users.getCount);
  const reduce = useReducedMotion();
  const { ref, inView } = useInView(0.8);
  const count = data?.count ?? 0;
  const shown = useCountUp(count, inView && data !== undefined, reduce);
  const next = MILESTONES.find((m) => m.threshold > count) ?? null;

  const fill = useSharedValue(0);
  useEffect(() => {
    if (!inView || data === undefined) return;
    const target = railProgress(count) / 100;
    fill.value = reduce ? target : withTiming(target, { duration: 1500, easing: Easing.out(Easing.quad) });
  }, [inView, data, count, reduce, fill]);
  const railStyle = useAnimatedStyle(() => ({ height: fill.value * ROW * 4 }));

  return (
    <Animated.View ref={ref} style={{ gap: spacing.md, paddingVertical: spacing.md }}>
      {/* Soft red glow, the mobile stand-in for the web blur circle. */}
      <View pointerEvents="none" style={{ position: 'absolute', right: -90, top: 10, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(244,91,91,0.08)' }} />
      <Title variant="xl">Community built</Title>
      {data === undefined ? (
        <Text variant="sm" color="secondary" accessibilityRole="progressbar">Loading community count…</Text>
      ) : (
        <>
          <View accessible accessibilityLabel={`${count} ${count === 1 ? 'climber' : 'climbers'} building the database`}>
            <Text style={{ fontSize: 64, lineHeight: 68, fontVariant: ['tabular-nums'] }}>{shown}</Text>
            <Text variant="sm" color="secondary">{count === 1 ? 'climber' : 'climbers'} building the database</Text>
          </View>
          <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.active.border, backgroundColor: colors.active.background, paddingHorizontal: 14, paddingVertical: 8 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brand.red }} />
            <Text variant="xs">{next ? `${next.threshold - count} to unlock ${next.label.toLowerCase()}` : 'All milestones unlocked'}</Text>
          </View>

          <View style={{ marginTop: spacing.md }}>
            <View style={{ position: 'absolute', left: 19, top: 0, height: ROW * 3.5, width: 1, backgroundColor: '#262626' }} />
            <Animated.View style={[{ position: 'absolute', left: 19, top: 0, width: 1, backgroundColor: colors.brand.red }, railStyle]} />
            {MILESTONES.map((m) => {
              const reached = count >= m.threshold;
              return (
                <View key={m.threshold} style={{ height: ROW, flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
                  <View
                    accessible
                    accessibilityRole="image"
                    accessibilityLabel={`${m.label} ${reached ? 'unlocked' : 'locked'}`}
                    style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', borderColor: reached ? colors.brand.red : '#404040', backgroundColor: reached ? colors.brand.red : '#000' }}
                  >
                    <Ionicons name={reached ? 'lock-open-outline' : 'lock-closed-outline'} size={16} color={reached ? '#000' : '#525252'} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}>
                      <Text variant="lg">{m.threshold}</Text>
                      <Text variant="sm">{m.label}</Text>
                    </View>
                    <Text variant="xs" color="secondary">{m.description}</Text>
                    <Label>{reached ? 'Unlocked' : `${Math.min(count, m.threshold)} / ${m.threshold}`}</Label>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}
    </Animated.View>
  );
}
