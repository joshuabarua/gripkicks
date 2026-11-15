import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { colors } from '@/theme/colors';

// Custom tab bar glyphs drawn on a 24px grid with the same 1.75 stroke as the
// web icons. Focused tabs fill a key part in brand red (shape only, never text).

export type TabGlyph = 'home' | 'sanctuary' | 'footLab' | 'matcher' | 'profile';

const RED = colors.brand.red;
const TINT = 'rgba(244, 91, 91, 0.22)';

function Glyph({ name, color, focused }: { name: TabGlyph; color: string; focused: boolean }) {
  const stroke = { stroke: color, strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  switch (name) {
    case 'home':
      // Boulder peaks with a summit flag.
      return (
        <G>
          <Path d="M2.5 20 9 9l3.4 5.6L15 11l6.5 9z" {...stroke} fill={focused ? TINT : 'none'} />
          <Path d="M9 9V3.5l4 1.6-4 1.6" {...stroke} stroke={focused ? RED : color} fill={focused ? RED : 'none'} />
        </G>
      );
    case 'sanctuary':
      // Climbing shoe in profile (same drawing as the web Add shoe icon).
      return (
        <G transform="translate(-1.8 -1.3) scale(1.15)">
          <Path
            d="M5 17.5C3.6 16.6 3.4 12.8 5 10.6l2.4-1.4c1.4 1 3.2 1.2 4.6.6 3.5.6 7.2 2.8 9 6.4-1.2.7-2.8.6-4.6.2-2.9-.5-6.4.2-9.4 1.2-.7.2-1.4.2-2-.1z"
            {...stroke}
            fill={focused ? TINT : 'none'}
          />
          <Path d="M5.3 15.5c3.7-1 8.2-1.4 11.7-.9 1.4.2 2.7.7 3.6 1.3" {...stroke} stroke={focused ? RED : color} />
          <Path d="M11.6 10l.8 4.5M14.6 10.6l.7 3.8" {...stroke} />
          <Path d="M5 10.6l-.4-2.4c1.2 0 2 .3 2.8 1" {...stroke} />
        </G>
      );
    case 'footLab':
      // Footprint: sole plus five toes, big toe first.
      return (
        <G>
          <Path
            d="M9.2 10.2c0-1.4 1.4-2 3.2-1.8 2.6.3 4.8 1.4 4.4 3.6-.3 1.6-1.5 2.6-1.7 4.8-.2 1.8.4 2.6.2 3.7-.2 1.1-1.3 1.7-2.5 1.6-1.6-.1-2.4-1.1-2.4-2.6 0-1.9.6-3.1 0-5.1-.5-1.6-1.2-2.6-1.2-4.2z"
            {...stroke}
            fill={focused ? TINT : 'none'}
          />
          {[
            [10.2, 4.6, 1.6],
            [13.2, 3.6, 1.1],
            [15.5, 4.3, 0.95],
            [17.2, 5.7, 0.85],
            [18.2, 7.6, 0.75],
          ].map(([cx, cy, r], i) => (
            <Circle key={i} cx={cx} cy={cy} r={r} fill={focused ? RED : color} />
          ))}
        </G>
      );
    case 'matcher':
      // Two overlapping rings; the overlap is the match.
      return (
        <G>
          {focused ? <Path d="M12 7.1A5.5 5.5 0 0 1 12 16.9 5.5 5.5 0 0 1 12 7.1z" fill={RED} /> : null}
          <Circle cx={9.5} cy={12} r={5.5} {...stroke} />
          <Circle cx={14.5} cy={12} r={5.5} {...stroke} />
        </G>
      );
    case 'profile':
      return (
        <G>
          <Circle cx={12} cy={8} r={3.6} {...stroke} fill={focused ? RED : 'none'} stroke={focused ? RED : color} />
          <Path d="M4.8 20.2c.4-3.7 3.4-6.2 7.2-6.2s6.8 2.5 7.2 6.2" {...stroke} fill={focused ? TINT : 'none'} />
        </G>
      );
  }
}

export function TabIcon({ name, color, focused }: { name: TabGlyph; color: string; focused: boolean }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withSpring(1.18, { damping: 10, stiffness: 400, reduceMotion: ReduceMotion.System }),
        withSpring(1, { damping: 12, stiffness: 220, reduceMotion: ReduceMotion.System }),
      );
    }
  }, [focused, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={{ alignItems: 'center' }}>
      {/* Red monolith bar above the active tab, as on the web cards. */}
      <View style={{ position: 'absolute', top: -8, width: 18, height: 2, borderRadius: 1, backgroundColor: focused ? RED : 'transparent' }} />
      <Animated.View style={style}>
        <Svg width={26} height={26} viewBox="0 0 24 24">
          <Glyph name={name} color={color} focused={focused} />
        </Svg>
      </Animated.View>
    </View>
  );
}
