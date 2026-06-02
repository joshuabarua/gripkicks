import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { Text, Card, Badge, Button } from '@/components/ui';
import { useSession } from '@/lib/auth';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useRouter } from 'expo-router';

export default function MatcherScreen() {
  const session = useSession();
  const router = useRouter();
  const betterAuthId = session.data?.user?.id;

  const convexUser = useQuery(
    api.users.findByBetterAuthId,
    betterAuthId ? { betterAuthId } : 'skip',
  );

  const hasProfile = convexUser?.footShape && convexUser?.footVolume;

  const recommendations = useQuery(
    api.recommendations.getTopShoesForFootShape,
    hasProfile
      ? {
          footShape: convexUser.footShape as 'egyptian' | 'roman' | 'greek' | 'germanic' | 'celtic',
          footVolume: convexUser.footVolume as string,
          limit: 20,
        }
      : 'skip',
  );

  if (!betterAuthId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.lg, alignItems: 'center' }}>
          <Text variant="xl" weight="semibold">
            Sign in to see recommendations
          </Text>
          <Button onPress={() => router.push('/login')}>
            Sign In
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasProfile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.lg, alignItems: 'center' }}>
          <Text variant="xl" weight="semibold" align="center">
            Set up your foot profile first
          </Text>
          <Text variant="sm" color="secondary" align="center">
            We need to know your foot shape and volume to recommend the best climbing shoes
          </Text>
          <Button onPress={() => router.push('/foot-lab')}>
            Go to Foot Lab
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
            Matcher
          </Text>
          <Text variant="lg" color="secondary">
            Top picks for your {convexUser.footShape} · {convexUser.footVolume} foot
          </Text>
        </View>

        {!recommendations || recommendations.items.length === 0 ? (
          <Card style={{ padding: spacing.lg, gap: spacing.md, alignItems: 'center' }}>
            <Text variant="lg" weight="semibold">
              No recommendations yet
            </Text>
            <Text variant="sm" color="secondary" align="center">
              Community data is still building. Check back soon.
            </Text>
          </Card>
        ) : (
          <View style={{ gap: spacing.md }}>
            {recommendations.items.map((shoe: any) => (
              <Card key={shoe._id} style={{ padding: spacing.lg, gap: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text variant="lg" weight="semibold">
                    {shoe.name}
                  </Text>
                  <Badge variant="secondary">{shoe.brand}</Badge>
                </View>
                <Text variant="sm" color="secondary">
                  {shoe.aggressiveness} · {shoe.volume} · {shoe.climbingDiscipline}
                </Text>
                {shoe.weightedScore && (
                  <Text variant="sm" color="accent" weight="semibold">
                    Match score: {shoe.weightedScore.toFixed(1)}
                  </Text>
                )}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
