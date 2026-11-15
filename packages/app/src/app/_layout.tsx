import { useEffect, useRef, type ReactNode } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConvexProviderWithAuth } from 'convex/react';
import {
  PostHogErrorBoundary,
  PostHogProvider,
  usePostHog,
} from 'posthog-react-native';
import { colors } from '@/theme/colors';
import { convex } from '@/lib/convex';
import { useBetterAuthForConvex, useSession } from '@/lib/auth';
import { posthog } from '@/lib/posthog';

function ErrorFallback() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ color: colors.foreground }}>Something went wrong.</Text>
    </View>
  );
}

function PostHogIdentity({ children }: { children: ReactNode }) {
  const posthogClient = usePostHog();
  const session = useSession();
  const user = session.data?.user;
  const identifiedUserId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!user?.id) {
      identifiedUserId.current = undefined;
      return;
    }

    if (identifiedUserId.current === user.id) {
      return;
    }

    // Account ID only: the Privacy page promises we never send name or email.
    posthogClient.identify(user.id);
    identifiedUserId.current = user.id;
  }, [posthogClient, user?.id]);

  return (
    <PostHogErrorBoundary fallback={ErrorFallback}>
      {children}
    </PostHogErrorBoundary>
  );
}

export default function RootLayout() {
  const navigator = (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="login"
        options={{ title: 'Sign In', presentation: 'modal' }}
      />
    </Stack>
  );

  return (
    <SafeAreaProvider>
      <ConvexProviderWithAuth client={convex} useAuth={useBetterAuthForConvex}>
        {posthog ? (
          <PostHogProvider client={posthog}>
            <PostHogIdentity>{navigator}</PostHogIdentity>
          </PostHogProvider>
        ) : (
          navigator
        )}
      </ConvexProviderWithAuth>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
