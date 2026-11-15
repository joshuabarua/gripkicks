import { View } from 'react-native';
import Svg, { G, Line, Path, Text as SvgText } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { spacing } from '@/theme/layout';
import { Label, Text } from '@/components/ui';
import type { Metrics } from '@/hooks/useMatcherData';

// Port of packages/web/src/components/shoe/FitChart.tsx: a five-axis chart of
// the shoe's ratings over the ratings the user tends to give (both 0–5).

const AXES: Array<{ key: keyof Metrics; label: string }> = [
  { key: 'comfort', label: 'Comfort' },
  { key: 'performance', label: 'Performance' },
  { key: 'aggressiveness', label: 'Aggressive' },
  { key: 'durability', label: 'Durability' },
  { key: 'versatility', label: 'Versatile' },
];

const SIZE = 120;
const CENTER = SIZE / 2;
const RADIUS = 42;
const MAX = 5;

function point(index: number, value: number) {
  const angle = (Math.PI * 2 * index) / AXES.length - Math.PI / 2;
  const r = (Math.min(MAX, Math.max(0, value)) / MAX) * RADIUS;
  return [CENTER + Math.cos(angle) * r, CENTER + Math.sin(angle) * r] as const;
}

function shapePath(metrics: Metrics) {
  return (
    AXES.map(({ key }, index) => {
      const [x, y] = point(index, metrics[key]);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ') + ' Z'
  );
}

const ring = (v: number): Metrics => ({ comfort: v, performance: v, durability: v, aggressiveness: v, versatility: v });

export function biggestGap(shoe: Metrics, you: Metrics) {
  return AXES.map(({ key, label }) => ({ label, delta: shoe[key] - you[key] })).reduce((widest, axis) =>
    Math.abs(axis.delta) > Math.abs(widest.delta) ? axis : widest,
  );
}

export function FitChart({ shoe, you }: { shoe: Metrics; you: Metrics }) {
  const gap = biggestGap(shoe, you);
  const label = AXES.map(({ key, label: axis }) => `${axis} ${shoe[key].toFixed(1)} vs your ${you[key].toFixed(1)}`).join(', ');

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <View accessible accessibilityRole="image" accessibilityLabel={`Fit against your ratings: ${label}`}>
        <Svg width={132} height={132} viewBox={`-6 -6 ${SIZE + 12} ${SIZE + 12}`}>
          {[1, 2, 3, 4, 5].map((r) => (
            <Path key={r} d={shapePath(ring(r))} fill="none" strokeWidth={0.5} stroke={r === MAX ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'} />
          ))}
          {AXES.map(({ key, label: axis }, index) => {
            const [x, y] = point(index, MAX);
            const [lx, ly] = point(index, MAX + 1.15);
            return (
              <G key={key}>
                <Line x1={CENTER} y1={CENTER} x2={x} y2={y} strokeWidth={0.5} stroke="rgba(255,255,255,0.1)" />
                <SvgText x={lx} y={ly + 3} textAnchor="middle" fontSize={8} fontFamily={fonts.regular} fill={colors.brand.putty}>
                  {axis.slice(0, 4).toUpperCase()}
                </SvgText>
              </G>
            );
          })}
          <Path d={shapePath(shoe)} fill="rgba(244, 91, 91, 0.3)" stroke={colors.brand.red} strokeWidth={1.5} strokeLinejoin="round" />
          <Path d={shapePath(you)} fill="none" stroke={colors.brand.chalk} strokeWidth={1.5} strokeDasharray="3 2" strokeLinejoin="round" />
        </Svg>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, borderWidth: 1, borderColor: colors.brand.red, backgroundColor: 'rgba(244,91,91,0.3)' }} />
          <Text variant="xs" color="secondary">This shoe</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={{ width: 10, borderTopWidth: 2, borderStyle: 'dashed', borderColor: colors.brand.chalk }} />
          <Text variant="xs" color="secondary">Your ratings</Text>
        </View>
        <View style={{ gap: 2 }}>
          <Label>Biggest gap</Label>
          <Text variant="sm">
            {gap.label} {gap.delta >= 0 ? '+' : ''}
            {gap.delta.toFixed(1)}
          </Text>
        </View>
      </View>
    </View>
  );
}
