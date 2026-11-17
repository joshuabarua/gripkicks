import { useEffect, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Line, Path } from 'react-native-svg';
import { useIsFocused } from 'expo-router';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/layout';
import { Label, Text } from '@/components/ui';
import { ShoeThumb } from '@/components/lab/ShoeThumb';
import { FOOT_SHAPES, FOOT_VOLUMES, type FootShape, type FootVolume } from '@/components/lab/FootGlyphs';

// Mobile port of packages/web/src/app/home-designs/ToolPreviews.tsx. Each
// preview loops between a few frames while its screen is focused; reduced
// motion or a pressed card holds the resolved frame.

const GLIDE = { stiffness: 260, damping: 30 } as const;
const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface PreviewShoe {
  brand: string;
  name: string;
  imageUrl?: string;
}

function usePreviewStep(length: number, hold: boolean, holdStep = 0, intervalMs = 2400) {
  const reduce = useReducedMotion();
  const focused = useIsFocused();
  const [step, setStep] = useState(holdStep);
  const running = !reduce && focused && !hold;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setStep((s) => (s + 1) % length), intervalMs);
    return () => clearInterval(id);
  }, [running, length, intervalMs]);
  return hold || reduce ? holdStep : step;
}

const TOE_HEIGHTS: Record<FootShape, number[]> = {
  egyptian: [12, 10, 8, 6, 4],
  roman: [10, 10, 9, 7, 5],
  greek: [10, 12, 9, 7, 5],
  germanic: [11, 8, 8, 8, 7],
  celtic: [10, 11, 11, 8, 6],
};

function Toe({ height, max, fill, outline }: { height: number; max: number; fill: string; outline?: boolean }) {
  const h = useSharedValue((height / 12) * max);
  useEffect(() => {
    h.value = withSpring((height / 12) * max, GLIDE);
  }, [height, max, h]);
  const style = useAnimatedStyle(() => ({ height: h.value }));
  return (
    <Animated.View
      style={[
        { flex: 1, borderRadius: 999 },
        outline ? { borderWidth: 1.5, borderColor: fill } : { backgroundColor: fill },
        style,
      ]}
    />
  );
}

// Toe bars as springy Views (heights glide between foot shapes).
function AnimatedToeBars({ shape, height = 56, fill = colors.brand.red, outline }: { shape: FootShape; height?: number; fill?: string; outline?: boolean }) {
  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: height * 0.09 }}>
      {TOE_HEIGHTS[shape].map((h, i) => (
        <Toe key={i} height={h} max={height} fill={fill} outline={outline} />
      ))}
    </View>
  );
}

// Control points of each volume arch (M 8,44 C x1,y x2,y 72,44), same as FootGlyphs.
const ARCH: Record<FootVolume, { x: number; y: number }> = { low: { x: 30, y: 37 }, medium: { x: 22, y: 18 }, high: { x: 15, y: 2 } };

function MorphArch({ volume }: { volume: FootVolume }) {
  const x = useSharedValue(ARCH[volume].x);
  const y = useSharedValue(ARCH[volume].y);
  useEffect(() => {
    const timing = { duration: 500, easing: Easing.bezier(0.22, 1, 0.36, 1) };
    x.value = withTiming(ARCH[volume].x, timing);
    y.value = withTiming(ARCH[volume].y, timing);
  }, [volume, x, y]);
  const props = useAnimatedProps(() => ({ d: `M 8,44 C ${x.value},${y.value} ${80 - x.value},${y.value} 72,44` }));
  return (
    <Svg viewBox="0 0 80 52" width="100%" height={56}>
      <Line x1={8} y1={46} x2={72} y2={46} strokeWidth={1} stroke="rgba(255,255,255,0.15)" />
      <AnimatedPath animatedProps={props} fill="none" strokeWidth={3} strokeLinecap="round" stroke={colors.brand.chalk} />
    </Svg>
  );
}

const frame = {
  borderRadius: radii.lg,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: 'rgba(0,0,0,0.4)',
  overflow: 'hidden' as const,
};

export function FootLabPreview({ active, profile }: { active: boolean; profile?: { shape: FootShape; volume: FootVolume } | null }) {
  const step = usePreviewStep(FOOT_SHAPES.length * FOOT_VOLUMES.length, active || !!profile);
  const shape = profile?.shape ?? FOOT_SHAPES[step % FOOT_SHAPES.length]!;
  const volume = profile?.volume ?? FOOT_VOLUMES[step % FOOT_VOLUMES.length]!;
  return (
    <View style={[frame, { height: 112, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md, paddingHorizontal: spacing.md, paddingBottom: 12 }]}>
      <View style={{ flex: 1, gap: 8 }}>
        <AnimatedToeBars shape={shape} height={56} />
        <Label>
          Shape <Text variant="xs" style={{ textTransform: 'uppercase' }}>{shape}</Text>
        </Label>
      </View>
      <View style={{ flex: 1, gap: 8 }}>
        <MorphArch volume={volume} />
        <Label>
          Volume <Text variant="xs" style={{ textTransform: 'uppercase' }}>{volume}</Text>
        </Label>
      </View>
    </View>
  );
}

const SANCTUARY_SHOES: PreviewShoe[] = [
  { brand: 'Scarpa', name: 'Drago LV', imageUrl: 'https://ik.imagekit.io/ie871bk0r/gripkicks/imgs/shoes/scarpa/drago_lv_side_profile.png' },
  { brand: 'Black Diamond', name: 'Focus', imageUrl: 'https://ik.imagekit.io/ie871bk0r/gripkicks/imgs/shoes/black_diamond/focus_side_profile.png' },
  { brand: 'Boreal', name: 'Dharma', imageUrl: 'https://ik.imagekit.io/ie871bk0r/gripkicks/imgs/shoes/boreal/dharma_side_profile.png' },
];

function FanCard({ shoe, offset, spread }: { shoe: PreviewShoe; offset: number; spread: boolean }) {
  const t = useSharedValue(spread ? 1 : 0);
  useEffect(() => {
    t.value = withSpring(spread ? 1 : 0, GLIDE);
  }, [spread, t]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset * (26 + t.value * 66) },
      { translateY: Math.abs(offset) * 6 * (1 - t.value) },
      { rotate: `${offset * (10 - t.value * 6)}deg` },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 104,
          height: 76,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: Math.abs(offset) < 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
          backgroundColor: colors.brand.charcoal,
          padding: 6,
          zIndex: Math.abs(offset) < 1 ? 1 : 0,
          shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        },
        style,
      ]}
    >
      <ShoeThumb imageUrl={shoe.imageUrl} width={90} height={62} framed={false} />
    </Animated.View>
  );
}

export function SanctuaryPreview({ active, shoes }: { active: boolean; shoes?: PreviewShoe[] }) {
  const spread = usePreviewStep(2, active, 1) === 1;
  const fan = shoes?.length ? shoes : SANCTUARY_SHOES;
  return (
    <View style={[frame, { height: 112, alignItems: 'center', justifyContent: 'center' }]}>
      {fan.map((shoe, index) => (
        <FanCard key={`${shoe.brand}-${shoe.name}-${index}`} shoe={shoe} offset={index - (fan.length - 1) / 2} spread={spread} />
      ))}
    </View>
  );
}

// Two arrangements the markers glide between, in a 200 x 170 plot.
const RADAR_LAYOUTS = [
  [[52, 42], [128, 36], [96, 76], [150, 110], [60, 124], [118, 136]],
  [[64, 56], [140, 48], [86, 88], [136, 124], [44, 110], [108, 144]],
] as const;
const YOU_POSITIONS = [[104, 64], [96, 70]] as const;
const MAKEUP = [
  [26, 17, 20, 11, 8],
  [28, 18, 22, 12, 9],
] as const;
const MAKEUP_SHADES = [colors.brand.red, 'rgba(244,91,91,0.75)', 'rgba(244,91,91,0.55)', 'rgba(244,91,91,0.35)', 'rgba(244,91,91,0.2)'];
const PLOT_H = 160;

function Marker({ x, y, scale, size, delay, style }: { x: number; y: number; scale: number; size: number; delay: number; style: object }) {
  const px = useSharedValue(x * scale);
  const py = useSharedValue(y * scale);
  useEffect(() => {
    px.value = withDelay(delay, withSpring(x * scale, GLIDE));
    py.value = withDelay(delay, withSpring(y * scale, GLIDE));
  }, [x, y, scale, delay, px, py]);
  const animated = useAnimatedStyle(() => ({ transform: [{ translateX: px.value - size / 2 }, { translateY: py.value - size / 2 }] }));
  return <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: size, height: size, borderRadius: size / 2 }, style, animated]} />;
}

function MakeupSegment({ value, color }: { value: number; color: string }) {
  const w = useSharedValue(value);
  useEffect(() => {
    w.value = withSpring(value, GLIDE);
  }, [value, w]);
  const style = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return <Animated.View style={[{ height: '100%', backgroundColor: color, borderRightWidth: 1, borderRightColor: colors.brand.charcoal }, style]} />;
}

export function MatcherPreview({ active }: { active: boolean }) {
  const step = usePreviewStep(RADAR_LAYOUTS.length, active, 1, 2800);
  const [width, setWidth] = useState(0);
  const makeup = MAKEUP[step]!;
  const total = makeup.reduce((sum, v) => sum + v, 0);
  // Fit the 200 x 170 plot inside the box, centred.
  const scale = width ? Math.min(width / 200, PLOT_H / 170) : 0;
  const plotW = 200 * scale;

  return (
    <View style={[frame, { padding: spacing.md, gap: spacing.md }]}>
      <View style={{ height: PLOT_H, alignItems: 'center' }} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        {scale ? (
          <View style={{ width: plotW, height: 170 * scale }}>
            <View style={{ position: 'absolute', left: plotW / 2, top: 0, width: plotW / 2, height: 85 * scale, backgroundColor: 'rgba(244,91,91,0.08)' }} />
            <View style={{ position: 'absolute', left: plotW / 2, top: 0, bottom: 0, width: 0.5, backgroundColor: 'rgba(255,255,255,0.25)' }} />
            <View style={{ position: 'absolute', top: 85 * scale, left: 0, right: 0, height: 0.5, backgroundColor: 'rgba(255,255,255,0.25)' }} />
            {RADAR_LAYOUTS[step]!.map(([x, y], index) => (
              <Marker
                key={index}
                x={x}
                y={y}
                scale={scale}
                size={index === 0 ? 14 : 10}
                delay={index * 50}
                style={{ backgroundColor: colors.brand.charcoal, borderWidth: 1.5, borderColor: index === 0 ? colors.brand.red : 'rgba(255,255,255,0.5)' }}
              />
            ))}
            <Marker x={YOU_POSITIONS[step]![0]} y={YOU_POSITIONS[step]![1]} scale={scale} size={8} delay={0} style={{ backgroundColor: '#22d3ee' }} />
          </View>
        ) : null}
      </View>
      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Label>Match makeup</Label>
          <Text variant="sm">{total}%</Text>
        </View>
        <View style={{ flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.1)' }}>
          {makeup.map((value, index) => (
            <MakeupSegment key={index} value={value} color={MAKEUP_SHADES[index]!} />
          ))}
        </View>
      </View>
    </View>
  );
}

function Slide({ to, children }: { to: number; children: React.ReactNode }) {
  const x = useSharedValue(to);
  useEffect(() => {
    x.value = withSpring(to, GLIDE);
  }, [to, x]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return <Animated.View style={[{ position: 'absolute', width: 88 }, style]}>{children}</Animated.View>;
}

export function SoleMatePreview({ active }: { active: boolean }) {
  const together = usePreviewStep(2, active, 1) === 1;
  const badge = useSharedValue(together ? 1 : 0);
  useEffect(() => {
    badge.value = withSpring(together ? 1 : 0, GLIDE);
  }, [together, badge]);
  const badgeStyle = useAnimatedStyle(() => ({ opacity: badge.value, transform: [{ translateY: (1 - badge.value) * 6 }] }));

  return (
    <View style={[frame, { height: 112, alignItems: 'center', justifyContent: 'center' }]}>
      <Slide to={together ? -6 : -56}>
        <AnimatedToeBars shape="egyptian" height={48} fill="rgba(244,91,91,0.8)" />
      </Slide>
      <Slide to={together ? 6 : 56}>
        <AnimatedToeBars shape="egyptian" height={48} fill={colors.brand.chalk} outline />
      </Slide>
      <Animated.View
        style={[
          { position: 'absolute', bottom: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: colors.brand.charcoal, paddingHorizontal: 10, paddingVertical: 2 },
          badgeStyle,
        ]}
      >
        <Text variant="xs">Same profile</Text>
      </Animated.View>
    </View>
  );
}
