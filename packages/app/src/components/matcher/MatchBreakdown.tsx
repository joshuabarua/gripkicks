import { View } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { Label, Text } from '@/components/ui';
import type { Breakdown } from '@/hooks/useMatcherData';
import type { MatchSignals } from '../../../../../types/shoe';

// Port of packages/web/src/components/shoe/MatchBreakdownBar.tsx. Weights mirror
// calculateShoeScore (convex/utils/matchScore.ts); values are points out of 100.

const ESTIMATED = 'rgba(255,255,255,0.3)';

function describe(signals: MatchSignals | undefined, field: keyof MatchSignals): string | undefined {
  if (!signals) return undefined;
  if (field === 'footShape') return signals.footShape === 'listed' ? 'Listed' : signals.footShape === 'not-listed' ? 'Not listed' : 'Not recorded';
  if (field === 'volume' && !signals.volume) return 'Not recorded';
  if (field === 'preferences' && !signals.preferences) return 'Not learned';
  return undefined;
}

function toFactors(breakdown: Breakdown, signals?: MatchSignals) {
  const factors = [
    { key: 'footShape', label: 'Foot shape', max: 30, value: breakdown.footTypeCompatibility, note: describe(signals, 'footShape'), estimated: signals?.footShape === 'unknown', color: colors.brand.red },
    { key: 'volume', label: 'Volume', max: 20, value: breakdown.volumeCompatibility, note: describe(signals, 'volume'), estimated: signals ? !signals.volume : false, color: 'rgba(244,91,91,0.75)' },
    { key: 'preferences', label: 'Preferences', max: 25, value: breakdown.userPreferenceMatch, note: describe(signals, 'preferences'), estimated: signals ? !signals.preferences : false, color: 'rgba(244,91,91,0.55)' },
    { key: 'community', label: 'Community', max: 15, value: breakdown.communityApproval, note: undefined, estimated: false, color: 'rgba(244,91,91,0.35)' },
    { key: 'rating', label: 'Overall rating', max: 10, value: breakdown.overallRating, note: undefined, estimated: false, color: 'rgba(244,91,91,0.2)' },
  ].map((f) => ({ ...f, points: (f.value / 5) * f.max }));
  if (breakdown.learnedPreferenceBonus > 0) {
    factors.push({ key: 'learned', label: 'Learned bonus', max: 10, value: breakdown.learnedPreferenceBonus, note: undefined, estimated: false, color: 'rgba(240,237,229,0.6)', points: breakdown.learnedPreferenceBonus * 20 });
  }
  return factors;
}

export function MatchBreakdownBar({ breakdown, signals }: { breakdown: Breakdown; signals?: MatchSignals }) {
  const factors = toFactors(breakdown, signals);
  const label = factors.map((f) => `${f.label} ${f.estimated ? 'estimated' : Math.round(f.points)}`).join(', ');
  return (
    <View style={{ gap: spacing.sm }}>
      <Label>Match makeup</Label>
      <View accessible accessibilityRole="image" accessibilityLabel={`Match makeup: ${label}`} style={{ flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.1)' }}>
        {factors.map((f) => (
          <View key={f.key} style={{ width: `${Math.min(100, f.points)}%`, backgroundColor: f.estimated ? ESTIMATED : f.color, borderRightWidth: 1, borderRightColor: colors.card }} />
        ))}
      </View>
    </View>
  );
}

export function MatchBreakdownList({ breakdown, signals }: { breakdown: Breakdown; signals?: MatchSignals }) {
  return (
    <View style={{ gap: spacing.sm }}>
      {toFactors(breakdown, signals).map((f) => (
        <View key={f.key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: f.estimated ? ESTIMATED : f.color }} />
            <Text variant="sm" color="secondary">{f.label}</Text>
          </View>
          <Text variant="sm">
            {f.note ?? (
              <>
                +{Math.round(f.points)}
                <Text variant="sm" color="secondary"> / {f.max}</Text>
              </>
            )}
          </Text>
        </View>
      ))}
    </View>
  );
}
