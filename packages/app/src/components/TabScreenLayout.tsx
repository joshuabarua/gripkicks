import type { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedRef, useScrollOffset } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { api } from 'convex/_generated/api';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { useSession } from '@/lib/auth';
import { Button, Card, Label, Text, Title } from '@/components/ui';
import { LabHeader } from '@/components/lab/LabHeader';
import { Rise } from '@/components/lab/Rise';
import { ShoeThumb } from '@/components/lab/ShoeThumb';
import { ToeBars, VolumeArch, isFootShape, isFootVolume } from '@/components/lab/FootGlyphs';
import { ScrollOffsetContext } from '@/components/lab/InView';

export function useTabUser() {
  const session = useSession();
  const router = useRouter();
  const user = session.data?.user;
  const betterAuthId = user?.id;
  const convexUser = useQuery(api.users.findByBetterAuthId, betterAuthId ? { betterAuthId } : 'skip');

  return { session, user, betterAuthId, convexUser, router };
}

// Page shell: black canvas, 16px gutters, LabHeader on top.
export function TabScreen({
  title,
  description,
  cloudy,
  hero,
  backdrop,
  children,
}: {
  title?: string;
  description?: string;
  cloudy?: boolean;
  // Full-bleed block above the page content (Home's 3D hero).
  hero?: ReactNode;
  // Decorative layer fixed behind the scrolling content.
  backdrop?: ReactNode;
  children: ReactNode;
}) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const offset = useScrollOffset(scrollRef);
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollOffsetContext.Provider value={offset}>
        {backdrop}
        <Animated.ScrollView
          ref={scrollRef}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingTop: hero ? 0 : spacing.lg, paddingBottom: spacing['2xl'], gap: spacing.md }}
        >
          {hero ? <View style={{ marginHorizontal: -spacing.md }}>{hero}</View> : null}
          {title ? <LabHeader title={title} description={description} cloudy={cloudy} /> : null}
          {children}
        </Animated.ScrollView>
      </ScrollOffsetContext.Provider>
    </SafeAreaView>
  );
}

// Signed-out or missing-prerequisite state: one active panel with a single action.
export function PromptScreen({
  title,
  label = 'Sign in',
  description,
  actionLabel = 'Sign in',
  onAction,
}: {
  title: string;
  label?: string;
  description?: string;
  actionLabel?: string;
  onAction: () => void;
}) {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: spacing.md }}>
      <Rise>
        <Card active style={{ padding: spacing.lg, gap: spacing.md }}>
          <Label>{label}</Label>
          <Title variant="xl">{title}</Title>
          {description ? <Text variant="sm" color="secondary">{description}</Text> : null}
          <Button onPress={onAction} style={{ alignSelf: 'flex-start' }}>{actionLabel}</Button>
        </Card>
      </Rise>
    </SafeAreaView>
  );
}

export function EmptyStateCard({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <Card style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, gap: spacing.sm }}>
      <Text weight="medium">{title}</Text>
      {description ? <Text variant="sm" color="secondary">{description}</Text> : null}
      {action ? <View style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}>{action}</View> : null}
    </Card>
  );
}

// One shoe: image, brand label, name, specs, and an optional right-hand value.
export function ShoeRow({
  name,
  brand,
  imageUrl,
  details,
  value,
  valueLabel,
  score,
  onPress,
}: {
  name?: string;
  brand?: string;
  imageUrl?: string | null;
  details?: Array<string | undefined>;
  value?: string;
  valueLabel?: string;
  // 0–1, drawn as a red bar (accent is never used for text).
  score?: number;
  onPress?: () => void;
}) {
  const specs = (details ?? []).filter(Boolean).join(' · ');
  return (
    <Card onPress={onPress} accessibilityLabel={onPress ? `${brand ?? ''} ${name ?? ''}`.trim() : undefined} style={{ padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <ShoeThumb imageUrl={imageUrl} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        {brand ? <Label numberOfLines={1}>{brand}</Label> : null}
        <Text weight="medium" numberOfLines={1}>{name ?? 'Unknown shoe'}</Text>
        {specs ? <Text variant="xs" color="secondary" numberOfLines={1} style={{ textTransform: 'capitalize' }}>{specs}</Text> : null}
        {score !== undefined ? (
          <View accessibilityLabel={`Match ${Math.round(score * 100)} percent`} style={{ marginTop: 6, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <View style={{ width: `${Math.max(4, Math.min(100, score * 100))}%`, height: '100%', backgroundColor: colors.brand.red }} />
          </View>
        ) : null}
      </View>
      {value ? (
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="sm">{value}</Text>
          {valueLabel ? <Text variant="xs" color="secondary">{valueLabel}</Text> : null}
        </View>
      ) : null}
    </Card>
  );
}

// Saved foot profile with the same toe and arch glyphs as the web.
export function FootProfileSummary({ footShape, footVolume }: { footShape: string; footVolume: string }) {
  const shape = footShape.toLowerCase();
  const volume = footVolume.toLowerCase();
  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>{isFootShape(shape) ? <ToeBars shape={shape} active height={48} /> : null}</View>
        <View style={{ flex: 1 }}>{isFootVolume(volume) ? <VolumeArch volume={volume} active height={40} /> : null}</View>
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Label>Shape</Label>
          <Text weight="medium" style={{ textTransform: 'uppercase' }}>{footShape}</Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Label>Volume</Label>
          <Text weight="medium" style={{ textTransform: 'uppercase' }}>{footVolume}</Text>
        </View>
      </View>
    </View>
  );
}
