import { View, Pressable } from 'react-native';
import { spacing } from '@/theme/layout';
import { Text, Button, Card } from '@/components/ui';
import { TabScreen, useTabUser } from '@/components/TabScreenLayout';

export default function HomeScreen() {
  const { user, router } = useTabUser();

  return (
    <TabScreen title="GripKicks" subtitle="Find your perfect sole mate">
      <Card style={{ padding: spacing.lg, gap: spacing.md }}>
        <Text variant="xl" weight="semibold">
          {user ? 'Welcome back' : 'Get started'}
        </Text>
        {user ? (
          <Text color="secondary">
            Signed in as {user.name || user.email}
          </Text>
        ) : (
          <View style={{ gap: spacing.md }}>
            <Text color="secondary">
              Sign in to save your stash and get personalized recommendations
            </Text>
            <Button onPress={() => router.push('/login')}>
              Sign In
            </Button>
          </View>
        )}
      </Card>

      <View style={{ gap: spacing.md }}>
        <Text variant="xl" weight="semibold">
          Quick Actions
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Pressable style={{ flex: 1 }} onPress={() => router.push('/foot-lab')}>
            <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
              <Text variant="2xl" weight="bold" color="accent">
                Foot Lab
              </Text>
              <Text variant="sm" color="secondary">
                Scan your foot profile
              </Text>
            </Card>
          </Pressable>
          <Pressable style={{ flex: 1 }} onPress={() => router.push('/matcher')}>
            <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
              <Text variant="2xl" weight="bold" color="accent">
                Matcher
              </Text>
              <Text variant="sm" color="secondary">
                Find your match
              </Text>
            </Card>
          </Pressable>
        </View>
      </View>
    </TabScreen>
  );
}
