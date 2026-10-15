import type { ReactNode } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { api } from 'convex/_generated/api';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { useSession } from '@/lib/auth';
import { Text, Button, Card, Badge } from '@/components/ui';

export function useTabUser() {
  const session = useSession();
  const router = useRouter();
  const user = session.data?.user;
  const betterAuthId = user?.id;
  const convexUser = useQuery(
    api.users.findByBetterAuthId,
    betterAuthId ? { betterAuthId } : 'skip',
  );

  return { session, user, betterAuthId, convexUser, router };
}

export function TabScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <Text variant="3xl" weight="bold" color="accent">
            {title}
          </Text>
          {subtitle ? (
            <Text variant="lg" color="secondary">
              {subtitle}
            </Text>
          ) : null}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function PromptScreen({
  title,
  description,
  actionLabel = 'Sign In',
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction: () => void;
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          padding: spacing.lg,
          gap: spacing.lg,
          alignItems: 'center',
        }}
      >
        <Text variant="xl" weight="semibold" align="center">
          {title}
        </Text>
        {description ? (
          <Text variant="sm" color="secondary" align="center">
            {description}
          </Text>
        ) : null}
        <Button onPress={onAction}>{actionLabel}</Button>
      </View>
    </SafeAreaView>
  );
}

export function EmptyStateCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card style={{ padding: spacing.lg, gap: spacing.md, alignItems: 'center' }}>
      <Text variant="lg" weight="semibold">
        {title}
      </Text>
      <Text variant="sm" color="secondary" align="center">
        {description}
      </Text>
    </Card>
  );
}

export function ShoeListCard({
  name,
  brand,
  aggressiveness,
  volume,
  climbingDiscipline,
  weightedScore,
}: {
  name?: string;
  brand?: string;
  aggressiveness?: string;
  volume?: string;
  climbingDiscipline?: string;
  weightedScore?: number;
}) {
  return (
    <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text variant="lg" weight="semibold">
          {name ?? 'Unknown shoe'}
        </Text>
        {brand ? <Badge variant="secondary">{brand}</Badge> : null}
      </View>
      <Text variant="sm" color="secondary">
        {aggressiveness} · {volume} · {climbingDiscipline}
      </Text>
      {weightedScore ? (
        <Text variant="sm" color="accent" weight="semibold">
          Match score: {weightedScore.toFixed(1)}
        </Text>
      ) : null}
    </Card>
  );
}

export function FootProfileRows({
  footShape,
  footVolume,
}: {
  footShape: string;
  footVolume: string;
}) {
  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text color="secondary">Shape</Text>
        <Text weight="semibold" style={{ textTransform: 'capitalize' }}>
          {footShape}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text color="secondary">Volume</Text>
        <Text weight="semibold" style={{ textTransform: 'capitalize' }}>
          {footVolume}
        </Text>
      </View>
    </View>
  );
}
