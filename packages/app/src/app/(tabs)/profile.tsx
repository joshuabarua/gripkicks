import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { Text, Button, Card } from '@/components/ui';
import { useSession, signOut } from '@/lib/auth';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const session = useSession();
  const router = useRouter();
  const user = session.data?.user;
  const betterAuthId = user?.id;

  const convexUser = useQuery(
    api.users.findByBetterAuthId,
    betterAuthId ? { betterAuthId } : 'skip',
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <Text variant="3xl" weight="bold" color="accent">
            Profile
          </Text>
        </View>

        <Card style={{ padding: spacing.lg, gap: spacing.md, alignItems: 'center' }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.muted,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text variant="2xl" weight="bold">
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text variant="xl" weight="semibold">
            {user?.name || 'Guest'}
          </Text>
          {user?.email && (
            <Text variant="sm" color="secondary">
              {user.email}
            </Text>
          )}
        </Card>

        <View style={{ gap: spacing.md }}>
          <Card style={{ padding: spacing.lg, gap: spacing.md }}>
            <Text variant="lg" weight="semibold">
              Foot Profile
            </Text>
            {convexUser?.footShape && convexUser?.footVolume ? (
              <View style={{ gap: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text color="secondary">Shape</Text>
                  <Text weight="semibold" style={{ textTransform: 'capitalize' }}>
                    {convexUser.footShape}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text color="secondary">Volume</Text>
                  <Text weight="semibold" style={{ textTransform: 'capitalize' }}>
                    {convexUser.footVolume}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={{ gap: spacing.sm }}>
                <Text variant="sm" color="secondary">
                  No foot profile set yet
                </Text>
                <Button size="sm" onPress={() => router.push('/foot-lab')}>
                  Set Foot Profile
                </Button>
              </View>
            )}
          </Card>

          <Card style={{ padding: spacing.lg, gap: spacing.md }}>
            <Text variant="lg" weight="semibold">
              Account
            </Text>
            {!user ? (
              <Button onPress={() => router.push('/login')}>
                Sign In
              </Button>
            ) : (
              <>
                <Button variant="destructive" onPress={() => signOut()}>
                  Sign Out
                </Button>
              </>
            )}
          </Card>

          <Card style={{ padding: spacing.lg, gap: spacing.md }}>
            <Text variant="lg" weight="semibold">
              App
            </Text>
            <Text variant="sm" color="secondary">
              Version 1.0.0
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
