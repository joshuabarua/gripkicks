import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/layout';
import { fonts } from '@/theme/typography';
import { Label, Text } from '@/components/ui';
import { SIZE_SYSTEMS, SIZE_SYSTEM_STORAGE_KEY, SIZES, parseSize, sizeValue, type SizeSystem } from '@/constants/shoe-sizes';

// Pick a size system once (remembered on the device), then tap a size.
// Mirrors packages/web/src/components/SizePicker.tsx.

const CHIP = 48;
const GAP = 6;
// SecureStore keys may only contain letters, numbers, ".", "-" and "_"; this one does.
const STORE_KEY = SIZE_SYSTEM_STORAGE_KEY;

export function SizePicker({ value, onChange }: { value: string | undefined; onChange: (value: string) => void }) {
  const parsed = parseSize(value);
  const [stored, setStored] = useState<SizeSystem | null>(null);
  const [chosen, setChosen] = useState<SizeSystem | null>(null);
  const system = chosen ?? parsed?.system ?? stored ?? 'EU';
  const selected = parsed?.system === system ? parsed.size : null;
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [rowWidth, setRowWidth] = useState(0);

  useEffect(() => {
    SecureStore.getItemAsync(STORE_KEY)
      .then((v) => {
        if (SIZE_SYSTEMS.includes(v as SizeSystem)) setStored(v as SizeSystem);
      })
      .catch(() => undefined);
  }, []);

  // Centre the selected size, or a common size when none is set.
  useEffect(() => {
    if (!rowWidth) return;
    const sizes = SIZES[system];
    const target = selected ?? (system === 'EU' ? '40' : system === 'US' ? '8' : '7');
    const index = Math.max(0, sizes.indexOf(target));
    scrollRef.current?.scrollTo({ x: Math.max(0, index * (CHIP + GAP) - rowWidth / 2 + CHIP / 2), animated: false });
  }, [system, selected, rowWidth]);

  const pickSystem = (next: SizeSystem) => {
    setChosen(next);
    SecureStore.setItemAsync(STORE_KEY, next).catch(() => undefined);
  };

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Label>Size</Label>
        <View accessibilityRole="radiogroup" accessibilityLabel="Size system" style={{ flexDirection: 'row', borderRadius: radii.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', padding: 2 }}>
          {SIZE_SYSTEMS.map((option) => {
            const active = system === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                onPress={() => pickSystem(option)}
                hitSlop={{ top: 8, bottom: 8 }}
                style={{
                  minHeight: 28,
                  justifyContent: 'center',
                  paddingHorizontal: 10,
                  borderRadius: radii.sm,
                  borderWidth: 1,
                  borderColor: active ? colors.active.border : 'transparent',
                  backgroundColor: active ? 'rgba(244,91,91,0.15)' : 'transparent',
                }}
              >
                <Text variant="2xs" color={active ? 'primary' : 'secondary'} style={{ fontFamily: fonts.medium, letterSpacing: 1 }}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
        contentContainerStyle={{ gap: GAP }}
        accessibilityRole="radiogroup"
        accessibilityLabel={`${system} size`}
      >
        {SIZES[system].map((size) => {
          const active = selected === size;
          return (
            <Pressable
              key={size}
              accessibilityRole="radio"
              accessibilityLabel={`${system} ${size}`}
              accessibilityState={{ checked: active }}
              onPress={() => onChange(sizeValue(system, size))}
              style={({ pressed }) => ({
                width: CHIP,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: active ? colors.brand.red : pressed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                backgroundColor: active ? 'rgba(244,91,91,0.15)' : 'transparent',
              })}
            >
              <Text variant="sm" color={active ? 'primary' : 'secondary'} style={{ fontVariant: ['tabular-nums'] }}>{size}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {value && !parsed ? <Text variant="xs" color="secondary">Saved: {value}</Text> : null}
    </View>
  );
}
