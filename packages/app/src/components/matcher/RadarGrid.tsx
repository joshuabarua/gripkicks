import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, ZoomIn, ZoomOut, ReduceMotion } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { Label, Text } from '@/components/ui';
import { ShoeThumb } from '@/components/lab/ShoeThumb';
import type { Metrics } from '@/hooks/useMatcherData';

// Port of packages/web/src/components/shoe/RadarGrid.tsx. x runs comfort (left)
// to performance (right), y versatile (top) to aggressive (bottom). Tap a shoe
// for its details; the web hover tooltip becomes a card under the plot.

type RadarMetrics = Pick<Metrics, 'comfort' | 'performance' | 'aggressiveness' | 'versatility'>;

export interface RadarShoe {
  id: string;
  brand: string;
  name: string;
  imageUrl?: string;
  primaryScore: number;
  primaryScoreLabel: string;
  subtitle?: string;
  confidence: number;
  topTrait?: { label: string; value: number };
  metrics: RadarMetrics;
}

type QuadrantKey = 'comfort' | 'all-rounder' | 'aggressive' | 'competition';
const QUADRANTS: Array<{ key: QuadrantKey; name: string; description: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'comfort', name: 'Comfort', description: 'Low aggression and all day comfort.', icon: 'heart-outline' },
  { key: 'all-rounder', name: 'All rounder', description: 'Balanced comfort and performance.', icon: 'flash-outline' },
  { key: 'aggressive', name: 'Aggressive', description: 'Downturned with a forgiving fit.', icon: 'shield-outline' },
  { key: 'competition', name: 'Competition', description: 'Downturned and precise for hard climbing.', icon: 'locate-outline' },
];

const GLIDE = { stiffness: 260, damping: 30 } as const;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function computePosition(m: RadarMetrics) {
  return {
    x: clamp(m.performance / Math.max(m.performance + m.comfort, 0.001), 0.08, 0.92),
    y: clamp(m.aggressiveness / Math.max(m.aggressiveness + m.versatility, 0.001), 0.08, 0.92),
  };
}

function quadrantOf(x: number, y: number): QuadrantKey {
  if (x < 0.5) return y < 0.5 ? 'comfort' : 'aggressive';
  return y < 0.5 ? 'all-rounder' : 'competition';
}

// Same spreading as the web: nearby markers step outwards on a grid so they
// never overlap; dashed lines link them back to their true positions.
function buildPositions(shoes: RadarShoe[], reserved: { x: number; y: number } | null) {
  const gapX = 0.2;
  const gapY = 0.16;
  const placed: Array<{ x: number; y: number }> = reserved ? [reserved] : [];
  const isFree = (p: { x: number; y: number }) => placed.every((o) => Math.abs(p.x - o.x) >= gapX - 0.001 || Math.abs(p.y - o.y) >= gapY - 0.001);
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]] as const;
  return shoes.map((shoe) => {
    const base = computePosition(shoe.metrics);
    let pos = base;
    search: for (let ring = 0; ring <= 6; ring++) {
      for (const [dx, dy] of ring ? dirs : ([[0, 0]] as const)) {
        const c = { x: clamp(base.x + dx * gapX * ring, 0.08, 0.92), y: clamp(base.y + dy * gapY * ring, 0.08, 0.92) };
        if (isFree(c)) {
          pos = c;
          break search;
        }
      }
    }
    placed.push(pos);
    return { ...shoe, baseX: base.x, baseY: base.y, ...pos, quadrant: quadrantOf(base.x, base.y) };
  });
}

type Placed = ReturnType<typeof buildPositions>[number];

function Glide({ x, y, children, z }: { x: number; y: number; children: React.ReactNode; z: number }) {
  const px = useSharedValue(x);
  const py = useSharedValue(y);
  useEffect(() => {
    px.value = withSpring(x, GLIDE);
    py.value = withSpring(y, GLIDE);
  }, [x, y, px, py]);
  const style = useAnimatedStyle(() => ({ left: px.value, top: py.value }));
  return <Animated.View style={[{ position: 'absolute', zIndex: z }, style]}>{children}</Animated.View>;
}

function ShoeMarker({ pos, rank, selected, onPress, w, h }: { pos: Placed; rank: number; selected: boolean; onPress: () => void; w: number; h: number }) {
  const size = Math.round((52 + clamp(pos.confidence, 0, 1) * 32) * 0.7);
  return (
    <Glide x={pos.x * w - size / 2} y={pos.y * h - size / 2} z={selected ? 40 : 30}>
      <Animated.View entering={ZoomIn.springify().reduceMotion(ReduceMotion.System)} exiting={ZoomOut.duration(200)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${rank}. ${pos.brand} ${pos.name}. ${pos.primaryScoreLabel} ${pos.primaryScore}`}
          accessibilityState={{ selected }}
          onPress={onPress}
          hitSlop={6}
        >
          <View style={{ width: size, height: size, borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: rank === 1 || selected ? 2 : 1, borderColor: rank === 1 || selected ? colors.brand.red : 'rgba(255,255,255,0.4)' }}>
            <ShoeThumb imageUrl={pos.imageUrl} width={size - 4} height={size - 4} framed={false} />
          </View>
          <View style={{ position: 'absolute', left: -7, top: -7, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: rank === 1 ? colors.brand.red : colors.brand.charcoal }}>
            <Text variant="2xs" weight="medium" color={rank === 1 ? 'inverse' : 'primary'}>{rank}</Text>
          </View>
          <View style={{ position: 'absolute', right: -7, bottom: -7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', backgroundColor: colors.background, paddingHorizontal: 6, paddingVertical: 2 }}>
            <Text variant="2xs" weight="medium">{pos.primaryScore}</Text>
          </View>
        </Pressable>
      </Animated.View>
    </Glide>
  );
}

export function RadarGrid({ shoes, you, confidenceLabel }: { shoes: RadarShoe[]; you?: RadarMetrics; confidenceLabel: string }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const userPos = you ? computePosition(you) : null;
  const userQuadrant = userPos ? quadrantOf(userPos.x, userPos.y) : null;
  const positions = buildPositions(shoes, userPos);
  const counts = positions.reduce((c, p) => ({ ...c, [p.quadrant]: c[p.quadrant] + 1 }), { comfort: 0, 'all-rounder': 0, aggressive: 0, competition: 0 } as Record<QuadrantKey, number>);
  const selected = positions.find((p) => p.id === selectedId);
  const selectedRank = selected ? positions.indexOf(selected) + 1 : 0;
  const { w, h } = size;

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <Text variant="xs" color="secondary">Tap a shoe for details.</Text>
        <Text variant="xs" color="secondary">Marker size: {confidenceLabel}</Text>
      </View>

      <View
        onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        style={{ aspectRatio: 4 / 5, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', backgroundColor: colors.brand.surface, overflow: 'hidden' }}
      >
        {w ? (
          <>
            {/* Quadrant tint for the user's preferences. */}
            {QUADRANTS.map((q, i) => (
              <View
                key={q.key}
                pointerEvents="none"
                style={{ position: 'absolute', left: i % 2 ? w / 2 : 0, top: i < 2 ? 0 : h / 2, width: w / 2, height: h / 2, backgroundColor: userQuadrant === q.key ? 'rgba(244,91,91,0.08)' : 'transparent' }}
              />
            ))}
            {QUADRANTS.map((q, i) => (
              <Text
                key={q.key}
                variant="2xs"
                pointerEvents="none"
                style={{ position: 'absolute', ...(i % 2 ? { right: 16 } : { left: 16 }), ...(i < 2 ? { top: 28 } : { bottom: 28 }), color: 'rgba(200,191,179,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}
              >
                {q.name}
              </Text>
            ))}
            <View pointerEvents="none" style={{ position: 'absolute', left: w / 2, top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.4)' }} />
            <View pointerEvents="none" style={{ position: 'absolute', top: h / 2, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.4)' }} />
            <Text variant="2xs" color="secondary" pointerEvents="none" style={{ position: 'absolute', top: 6, alignSelf: 'center' }}>More versatile</Text>
            <Text variant="2xs" color="secondary" pointerEvents="none" style={{ position: 'absolute', bottom: 6, alignSelf: 'center' }}>More aggressive</Text>
            <Text variant="2xs" color="secondary" pointerEvents="none" style={{ position: 'absolute', left: -38, top: h / 2 - 8, transform: [{ rotate: '-90deg' }], width: 100, textAlign: 'center' }}>More comfort</Text>
            <Text variant="2xs" color="secondary" pointerEvents="none" style={{ position: 'absolute', right: -38, top: h / 2 - 8, transform: [{ rotate: '90deg' }], width: 100, textAlign: 'center' }}>More performance</Text>

            <Svg pointerEvents="none" width={w} height={h} style={{ position: 'absolute' }}>
              {positions.map((p) => (
                <Line key={p.id} x1={p.baseX * w} y1={p.baseY * h} x2={p.x * w} y2={p.y * h} stroke={colors.brand.putty} strokeWidth={1} strokeDasharray="3 3" />
              ))}
            </Svg>

            {userPos ? (
              <Glide x={userPos.x * w - 18} y={userPos.y * h - 18} z={20}>
                <View pointerEvents="none" style={{ alignItems: 'center' }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#22d3ee', backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#22d3ee' }} />
                  </View>
                  <View style={{ marginTop: 4, borderRadius: 999, backgroundColor: '#22d3ee', paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text variant="2xs" weight="medium" color="inverse">YOU</Text>
                  </View>
                </View>
              </Glide>
            ) : null}

            {positions.map((p, i) => (
              <ShoeMarker key={p.id} pos={p} rank={i + 1} selected={p.id === selectedId} onPress={() => setSelectedId((id) => (id === p.id ? null : p.id))} w={w} h={h} />
            ))}
          </>
        ) : null}
      </View>

      {selected ? (
        <Animated.View entering={ZoomIn.duration(200).reduceMotion(ReduceMotion.System)} style={{ borderRadius: 12, borderWidth: 1, borderColor: colors.active.border, backgroundColor: colors.active.background, padding: spacing.md, gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text weight="medium">{selectedRank}. {selected.name}</Text>
              <Text variant="xs" color="secondary">{selected.brand}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close details" onPress={() => setSelectedId(null)} hitSlop={10}>
              <Ionicons name="close" size={18} color={colors.brand.chalk} />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="sm" color="secondary">{selected.primaryScoreLabel}</Text>
            <Text variant="sm" weight="medium">{selected.primaryScore}</Text>
          </View>
          {selected.topTrait ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="sm" color="secondary">{selected.topTrait.label}</Text>
              <Text variant="sm">{selected.topTrait.value.toFixed(1)}/5</Text>
            </View>
          ) : null}
          {selected.subtitle ? <Text variant="xs" color="secondary">{selected.subtitle}</Text> : null}
        </Animated.View>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {QUADRANTS.map((q) => (
          <View
            key={q.key}
            style={{ width: '48.5%', borderRadius: 8, borderWidth: 1, padding: 12, gap: 4, borderColor: userQuadrant === q.key ? colors.active.border : 'rgba(255,255,255,0.1)', backgroundColor: userQuadrant === q.key ? colors.active.background : 'transparent' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name={q.icon} size={14} color={colors.brand.chalk} />
              <Text variant="sm" style={{ flex: 1 }}>{q.name}</Text>
              <Text variant="sm" color="secondary">{counts[q.key]}</Text>
            </View>
            {userQuadrant === q.key ? <Label>Your preferences</Label> : null}
          </View>
        ))}
      </View>
      <Text variant="xs" color="secondary">
        Nearby markers are separated; dashed lines show metric positions.{userPos ? ' Cyan marker: your preferences; your quadrant is tinted.' : ''}
      </Text>
    </View>
  );
}
