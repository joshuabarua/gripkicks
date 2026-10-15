import { View } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { Text, Button, Card } from '@/components/ui';
import { signOut } from '@/lib/auth';
import {
  FootProfileRows,
  TabScreen,
  useTabUser,
} from '@/components/TabScreenLayout';

export default function ProfileScreen() {
  const { user, convexUser, router } = useTabUser();

  return (
    <TabScreen title="Profile">
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
            <FootProfileRows
              footShape={convexUser.footShape}
              footVolume={convexUser.footVolume}
            />
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
            <Button variant="destructive" onPress={() => signOut()}>
              Sign Out
            </Button>
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
    </TabScreen>
  );
}
