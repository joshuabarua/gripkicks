import { View } from 'react-native';
import Constants from 'expo-constants';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { Button, Card, Label, Text, Title } from '@/components/ui';
import { Rise } from '@/components/lab/Rise';
import { signOut } from '@/lib/auth';
import { posthog } from '@/lib/posthog';
import { posthogLogger } from '@/lib/posthog-logger';
import { FootProfileSummary, TabScreen, useTabUser } from '@/components/TabScreenLayout';

export default function ProfileScreen() {
  const { user, convexUser, router } = useTabUser();

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.error) {
      posthog?.capture('user_signed_out');
      posthogLogger.authenticationCompleted('sign_out');
      posthog?.reset();
    }
  };

  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <TabScreen title="Profile">
      <Rise index={1}>
        <Card style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: user ? colors.brand.red : colors.ghostBorder, alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="xl">{initial}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Title variant="lg" numberOfLines={1}>{user?.name || 'Guest'}</Title>
            {user?.email ? <Text variant="sm" color="secondary" numberOfLines={1}>{user.email}</Text> : null}
          </View>
        </Card>
      </Rise>

      <Rise index={2}>
        <Card style={{ padding: spacing.lg, gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Title variant="base">Foot profile</Title>
            {convexUser?.footShape && convexUser?.footVolume ? (
              <Button variant="ghost" onPress={() => router.push('/foot-lab')}>Edit</Button>
            ) : null}
          </View>
          {convexUser?.footShape && convexUser?.footVolume ? (
            <FootProfileSummary footShape={convexUser.footShape} footVolume={convexUser.footVolume} />
          ) : (
            <View style={{ gap: spacing.md }}>
              <Text variant="sm" color="secondary">Not set</Text>
              <Button variant="ghost" onPress={() => router.push('/foot-lab')} style={{ alignSelf: 'flex-start' }}>Open Foot Lab</Button>
            </View>
          )}
        </Card>
      </Rise>

      <Rise index={3}>
        <Card style={{ padding: spacing.lg, gap: spacing.md }}>
          <Title variant="base">Account</Title>
          {user ? (
            <Button variant="danger" onPress={handleSignOut} style={{ alignSelf: 'flex-start' }}>Sign out</Button>
          ) : (
            <Button onPress={() => router.push('/login')} style={{ alignSelf: 'flex-start' }}>Sign in</Button>
          )}
        </Card>
      </Rise>

      <Rise index={4}>
        <Label style={{ textAlign: 'center', marginTop: spacing.sm }}>Version {Constants.expoConfig?.version ?? '1.0.0'}</Label>
      </Rise>
    </TabScreen>
  );
}
