import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { Text, Card, Badge, Button } from '@/components/ui';
import { useSession } from '@/lib/auth';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useRouter } from 'expo-router';

export default function StashScreen() {
  const session = useSession();
  const router = useRouter();
  const betterAuthId = session.data?.user?.id;

  const convexUser = useQuery(
    api.users.findByBetterAuthId,
    betterAuthId ? { betterAuthId } : 'skip',
  );

  const stash = useQuery(
    api.stash.getUserStash,
    convexUser?._id ? { userId: convexUser._id } : 'skip',
  );

  if (!betterAuthId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.lg, alignItems: 'center' }}>
          <Text variant="xl" weight="semibold">
            Sign in to see your stash
          </Text>
          <Button onPress={() => router.push('/login')}>
            Sign In
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <Text variant="3xl" weight="bold" color="accent">
            Shoe Sanctuary
          </Text>
          <Text variant="lg" color="secondary">
            Your saved collection
          </Text>
        </View>

        {!stash || stash.length === 0 ? (
          <Card style={{ padding: spacing.lg, gap: spacing.md, alignItems: 'center' }}>
            <Text variant="lg" weight="semibold">
              No shoes yet
            </Text>
            <Text variant="sm" color="secondary" align="center">
              Add shoes to your collection from the Matcher tab
            </Text>
          </Card>
        ) : (
          <View style={{ gap: spacing.md }}>
            {stash.map((entry: any) => (
              <Card key={entry._id} style={{ padding: spacing.lg, gap: spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text variant="lg" weight="semibold">
                    {entry.shoe?.name ?? 'Unknown shoe'}
                  </Text>
                  <Badge variant="secondary">{entry.shoe?.brand}</Badge>
                </View>
                <Text variant="sm" color="secondary">
                  {entry.shoe?.aggressiveness} · {entry.shoe?.volume} · {entry.shoe?.climbingDiscipline}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
