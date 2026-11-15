import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, ReduceMotion } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/layout';
import { Button, Label, Text, Title } from '@/components/ui';
import { ShoeThumb } from '@/components/lab/ShoeThumb';
import { conditions, shoeSizes } from '@/constants/shoe-data';
import { OptionSheet } from './OptionSheet';
import { RatingSlider } from './RatingSlider';

// Mobile port of packages/web/src/components/CloudShoe.tsx: tap a shoe to open
// it, then rate it, set size and condition, favourite or remove it.

export type RatingField = 'comfortScore' | 'performanceRating' | 'durabilityRating';

export interface SanctuaryEntry {
  _id: string;
  shoeId: string;
  size?: string;
  condition?: string;
  comfortScore?: number;
  performanceRating?: number;
  durabilityRating?: number;
  isFavourite?: boolean;
  shoe?: {
    name?: string;
    brand?: string;
    imageUrl?: string;
    aggressiveness?: string;
    climbingDiscipline?: string;
    stiffness?: string;
    volume?: string;
  } | null;
}

const layout = LinearTransition.springify().damping(22).stiffness(220).reduceMotion(ReduceMotion.System);

function Dots({ value }: { value?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: value !== undefined && value / 2 > i ? colors.brand.red : 'rgba(255,255,255,0.15)' }} />
      ))}
    </View>
  );
}

export function SanctuaryCard({
  entry,
  expanded,
  onToggle,
  onRate,
  onUpdate,
  onToggleFavourite,
  onRemove,
}: {
  entry: SanctuaryEntry;
  expanded: boolean;
  onToggle: () => void;
  onRate: (field: RatingField, value: number) => void;
  onUpdate: (fields: { size?: string; condition?: string }) => void;
  onToggleFavourite: () => void;
  onRemove: () => void;
}) {
  const [sheet, setSheet] = useState<'size' | 'condition' | null>(null);
  const name = entry.shoe?.name ?? 'Unknown shoe';
  const brand = entry.shoe?.brand ?? 'Unknown brand';
  const ratings: Array<{ label: string; field: RatingField; value?: number; icon: keyof typeof Ionicons.glyphMap }> = [
    { label: 'Comfort', field: 'comfortScore', value: entry.comfortScore, icon: 'cloud-outline' },
    { label: 'Performance', field: 'performanceRating', value: entry.performanceRating, icon: 'flash-outline' },
    { label: 'Durability', field: 'durabilityRating', value: entry.durabilityRating, icon: 'shield-outline' },
  ];
  const hasRatings = ratings.some((r) => r.value !== undefined);
  const specs = [
    entry.shoe?.aggressiveness,
    entry.shoe?.climbingDiscipline,
    entry.shoe?.stiffness ? `${entry.shoe.stiffness} stiffness` : undefined,
    entry.shoe?.volume ? `${entry.shoe.volume} volume` : undefined,
  ].filter((s): s is string => !!s?.trim());

  return (
    <Animated.View
      layout={layout}
      style={{ borderRadius: 12, borderWidth: 1, borderColor: expanded ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)', backgroundColor: colors.brand.surface, overflow: 'hidden' }}
    >
      <View style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' }}>
        <Title variant="base" numberOfLines={1} style={{ flex: 1 }}>{name}</Title>
        {entry.isFavourite ? (
          <View accessible accessibilityLabel="Favourite" style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: colors.brand.red, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="star" size={12} color="#000" />
          </View>
        ) : null}
        {expanded ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`Hide details for ${brand} ${name}`} onPress={onToggle} hitSlop={10} style={{ width: 28, height: 28, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={14} color={colors.brand.chalk} />
          </Pressable>
        ) : null}
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel={expanded ? undefined : `Show details for ${brand} ${name}`} onPress={expanded ? undefined : onToggle} disabled={expanded}>
        <View style={{ aspectRatio: 16 / 10, backgroundColor: colors.brand.charcoal, padding: expanded ? spacing.lg : spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' }}>
          <ShoeThumb imageUrl={entry.shoe?.imageUrl} width={320} height={200} framed={false} style={{ width: '100%', height: '100%' }} />
          <Label style={{ position: 'absolute', left: 12, bottom: 10 }}>{brand}</Label>
        </View>
        {!expanded ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md }}>
            {hasRatings ? (
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                {ratings.map((r) => (
                  <View key={r.field} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name={r.icon} size={12} color={colors.brand.putty} />
                    <Dots value={r.value} />
                  </View>
                ))}
              </View>
            ) : (
              <Label>Add ratings</Label>
            )}
            <Ionicons name="chevron-down" size={16} color={colors.brand.putty} />
          </View>
        ) : null}
      </Pressable>

      {expanded ? (
        <Animated.View entering={FadeIn.duration(250).delay(120).reduceMotion(ReduceMotion.System)} exiting={FadeOut.duration(150)} style={{ padding: spacing.md, gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Picker label="Size" value={entry.size} placeholder="Select" onPress={() => setSheet('size')} />
            <Picker label="Condition" value={entry.condition} placeholder="Select condition" onPress={() => setSheet('condition')} />
          </View>
          <View style={{ gap: spacing.md }}>
            {ratings.map((r) => (
              <RatingSlider key={r.field} label={r.label} value={r.value} icon={<Ionicons name={r.icon} size={14} color="rgba(244,91,91,0.8)" />} onCommit={(v) => onRate(r.field, v)} />
            ))}
          </View>
          {specs.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {specs.map((s) => (
                <View key={s} style={{ borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text variant="xs" color="secondary" style={{ textTransform: 'capitalize' }}>{s}</Text>
                </View>
              ))}
            </View>
          ) : null}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button
              variant="ghost"
              onPress={onToggleFavourite}
              icon={<Ionicons name={entry.isFavourite ? 'star' : 'star-outline'} size={16} color={entry.isFavourite ? colors.brand.red : colors.brand.chalk} />}
              style={{ flex: 1 }}
            >
              {entry.isFavourite ? 'Favourite' : 'Add favourite'}
            </Button>
            <Button variant="danger" onPress={onRemove} icon={<Ionicons name="trash-outline" size={16} color={colors.brand.red} />}>
              Remove
            </Button>
          </View>
        </Animated.View>
      ) : null}

      <OptionSheet visible={sheet === 'size'} title="Size" options={shoeSizes} value={entry.size} onSelect={(size) => onUpdate({ size })} onClose={() => setSheet(null)} />
      <OptionSheet visible={sheet === 'condition'} title="Condition" options={conditions} value={entry.condition} onSelect={(condition) => onUpdate({ condition })} onClose={() => setSheet(null)} />
    </Animated.View>
  );
}

function Picker({ label, value, placeholder, onPress }: { label: string; value?: string; placeholder: string; onPress: () => void }) {
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Label>{label}</Label>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || 'not set'}`}
        onPress={onPress}
        style={({ pressed }) => ({
          minHeight: 44,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)',
          backgroundColor: pressed ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
          paddingHorizontal: 12,
        })}
      >
        <Text variant="xs" numberOfLines={1} style={{ flex: 1 }} color={value ? 'primary' : 'secondary'}>{value || placeholder}</Text>
        <Ionicons name="chevron-down" size={14} color={colors.brand.putty} />
      </Pressable>
    </View>
  );
}
