import { useEffect, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/layout';
import { fonts } from '@/theme/typography';
import { Card, Label, Text, Title } from '@/components/ui';
import { ToeBars } from '@/components/lab/FootGlyphs';
import { useInView } from '@/components/lab/InView';
import { RATINGS_NEEDED, type ToolStatus } from './useToolStatus';

// Port of packages/web/src/app/home-designs/HowItWorks.tsx: three steps joined
// by connectors that fill red, one after another, as each step is done.

type Href = '/foot-lab' | '/stash' | '/matcher';

const IDLE = '#525252';

function ScoreTag({ lit }: { lit: boolean }) {
  return (
    <Svg viewBox="0 0 80 52" width="100%" height={28}>
      <Rect x={15} y={8} width={50} height={32} rx={9} fill="none" strokeWidth={3} stroke={lit ? colors.brand.red : IDLE} />
      <SvgText x={40} y={30} textAnchor="middle" fontSize={14} fontFamily={fonts.medium} fill={lit ? '#fff' : '#737373'}>
        10/10
      </SvgText>
      <Path d="M 32,47 H 48" strokeWidth={3} strokeLinecap="round" stroke={lit ? '#737373' : '#404040'} />
    </Svg>
  );
}

function CompareArrows({ lit }: { lit: boolean }) {
  return (
    <Svg viewBox="0 0 80 52" width="100%" height={28}>
      <Path d="M 8,14 H 56 M 48,6 L 62,14 L 48,22" fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" stroke={lit ? colors.brand.red : IDLE} />
      <Path d="M 72,38 H 24 M 32,30 L 18,38 L 32,46" fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" stroke={lit ? IDLE : '#404040'} />
    </Svg>
  );
}

interface Step {
  title: string;
  copy: string;
  href: Href;
  glyph: (lit: boolean) => ReactNode;
  done: boolean;
  label: string | null;
}

function buildSteps(status: ToolStatus | null): Step[] {
  const profile = status?.footProfile ?? null;
  const rated = status?.ratedCount ?? 0;
  return [
    {
      title: 'Map your foot',
      copy: 'Shape and volume decide which lasts fit you.',
      href: '/foot-lab',
      glyph: (lit) => <ToeBars shape={profile?.shape ?? 'egyptian'} active={lit} height={28} />,
      done: !!profile,
      label: status ? (profile ? `${profile.shape} · ${profile.volume}` : 'Not set') : null,
    },
    {
      title: 'Rate your shoes',
      copy: `${RATINGS_NEEDED} rated pairs are enough to learn what you like.`,
      href: '/stash',
      glyph: (lit) => <ScoreTag lit={lit} />,
      done: rated >= RATINGS_NEEDED,
      label: status ? (rated >= RATINGS_NEEDED ? `${rated} shoes rated` : `${rated}/${RATINGS_NEEDED} shoes rated`) : null,
    },
    {
      title: 'Compare fits',
      copy: 'See which shoes fit climbers with feet like yours.',
      href: '/matcher',
      glyph: (lit) => <CompareArrows lit={lit} />,
      done: false,
      label: status ? status.labels.soleMate : null,
    },
  ];
}

// Vertical rail between two step nodes; grows downward once in view.
function Connector({ filled, delay, start }: { filled: boolean; delay: number; start: boolean }) {
  const reduce = useReducedMotion();
  const fill = useSharedValue(reduce && filled ? 1 : 0);
  useEffect(() => {
    if (filled && start) fill.value = reduce ? 1 : withDelay(delay, withTiming(1, { duration: 600, easing: Easing.bezier(0.22, 1, 0.36, 1) }));
  }, [filled, start, delay, reduce, fill]);
  const style = useAnimatedStyle(() => ({ transform: [{ scaleY: fill.value }] }));
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 16 + 32 - 1, top: 16 + 64 + 4, bottom: -12, width: 2, borderRadius: 1, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.1)' }}>
      {/* transformOrigin keeps the fill growing from the top */}
      <Animated.View style={[{ flex: 1, backgroundColor: colors.brand.red, transformOrigin: 'top' }, style]} />
    </View>
  );
}

export function HowItWorks({ status, onOpen }: { status: ToolStatus | null; onOpen: (href: Href) => void }) {
  const steps = buildSteps(status);
  const nextIndex = steps.findIndex((s) => !s.done);
  const { ref, inView } = useInView(0.8);

  return (
    <Animated.View ref={ref}>
      <Card style={{ padding: 8 }}>
        {steps.map((step, index) => {
          const isNext = index === nextIndex;
          const lit = step.done || isNext;
          return (
            <View key={step.href} style={{ paddingBottom: index < steps.length - 1 ? 8 : 0 }}>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${step.title}${step.done ? ', done' : isNext ? ', next step' : ''}`}
                onPress={() => onOpen(step.href)}
                style={({ pressed }) => ({
                  zIndex: 1,
                  flexDirection: 'row',
                  gap: spacing.lg,
                  padding: 16,
                  borderRadius: radii.lg,
                  borderWidth: 1,
                  borderColor: isNext ? colors.active.border : 'transparent',
                  backgroundColor: isNext ? colors.active.background : pressed ? 'rgba(255,255,255,0.03)' : 'transparent',
                })}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    borderWidth: 1,
                    borderColor: step.done || isNext ? colors.brand.red : 'rgba(255,255,255,0.15)',
                    backgroundColor: step.done ? 'rgba(244,91,91,0.15)' : colors.brand.charcoal,
                    paddingHorizontal: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View style={{ width: '100%' }}>{step.glyph(lit)}</View>
                </View>
                <View style={{ flex: 1, minWidth: 0, alignSelf: 'center', gap: 6 }}>
                  <Title variant="base">{step.title}</Title>
                  <Text variant="sm" color="secondary">{step.copy}</Text>
                  {step.label ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, ...(step.done ? { backgroundColor: colors.brand.red } : { borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' }) }} />
                      <Label style={{ color: colors.brand.chalk }}>{step.label}</Label>
                    </View>
                  ) : null}
                </View>
              </Pressable>
              {index < steps.length - 1 ? <Connector filled={step.done} start={inView} delay={200 + index * 250} /> : null}
            </View>
          );
        })}
      </Card>
    </Animated.View>
  );
}
