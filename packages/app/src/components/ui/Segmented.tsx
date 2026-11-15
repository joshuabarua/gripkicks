import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/layout';
import { fonts, fontSizes, tracking } from '@/theme/typography';
import { Text } from './Text';

// Two-or-more option switch. The active option gets the lab-card-active panel,
// which glides between options (the mobile version of the web layoutId pill).
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: Array<{ value: T; label: string; count?: string | number }>;
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}) {
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const gap = 8;
  const itemWidth = width ? (width - gap * (options.length - 1)) / options.length : 0;
  const pill = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(index * (itemWidth + gap), { damping: 22, stiffness: 260 }) }],
  }));

  return (
    <View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', gap }}>
      {itemWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            { position: 'absolute', top: 0, bottom: 0, left: 0, width: itemWidth, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.active.border, backgroundColor: colors.active.background },
            pill,
          ]}
        />
      ) : null}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: 44,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: selected ? 'transparent' : colors.ghostBorder,
              backgroundColor: pressed && !selected ? 'rgba(255,255,255,0.05)' : 'transparent',
            })}
          >
            <Text
              color={selected ? 'white' : 'primary'}
              style={{ fontFamily: fonts.medium, fontSize: fontSizes.xs, textTransform: 'uppercase', letterSpacing: fontSizes.xs * tracking.button }}
            >
              {option.label}
            </Text>
            {option.count !== undefined ? <Text variant="sm" color={selected ? 'white' : 'secondary'}>{option.count}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
