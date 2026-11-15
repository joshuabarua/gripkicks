import { useState, type ReactNode } from 'react';
import { View, type GestureResponderEvent } from 'react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/ui';

// 0–10 rating slider (web CloudShoe StatSlider). Tap or drag along the track;
// the value is saved once, when the finger lifts.
export function RatingSlider({ label, icon, value, onCommit }: { label: string; icon?: ReactNode; value: number | undefined; onCommit: (value: number) => void }) {
  const [width, setWidth] = useState(0);
  const [draft, setDraft] = useState<number | null>(null);
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(null);
  }
  const shown = draft ?? value;
  const pct = shown === undefined ? 0 : Math.min(10, Math.max(0, shown)) * 10;

  const valueAt = (e: GestureResponderEvent) => (width ? Math.round(Math.min(1, Math.max(0, e.nativeEvent.locationX / width)) * 10) : 0);
  const step = (delta: number) => {
    const next = Math.min(10, Math.max(0, (shown ?? 0) + delta));
    if (next !== value) onCommit(next);
  };

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {icon}
          <Text variant="xs" color="secondary">{label}</Text>
        </View>
        <Text variant="xs">{shown !== undefined ? `${shown}/10` : 'Not rated'}</Text>
      </View>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={`${label} rating`}
        accessibilityValue={shown !== undefined ? { min: 0, max: 10, now: shown, text: `${shown} out of 10` } : { text: 'Not rated' }}
        onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        // Keep the drag even if the finger wanders vertically (stops the ScrollView stealing it).
        onResponderTerminationRequest={() => false}
        onResponderGrant={(e) => setDraft(valueAt(e))}
        onResponderMove={(e) => setDraft(valueAt(e))}
        onResponderRelease={(e) => {
          const next = valueAt(e);
          setDraft(next);
          if (next !== value) onCommit(next);
        }}
        style={{ height: 28, justifyContent: 'center' }}
      >
        <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <View style={{ width: `${pct}%`, height: '100%', backgroundColor: 'rgba(244,91,91,0.7)' }} />
        </View>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: `${pct}%`,
            marginLeft: -9,
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: shown === undefined ? 'rgba(255,255,255,0.3)' : colors.brand.chalk,
            transform: [{ scale: draft !== null ? 1.2 : 1 }],
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="2xs" color="muted">0</Text>
        <Text variant="2xs" color="muted">10</Text>
      </View>
    </View>
  );
}
