import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConvexProviderWithAuth } from 'convex/react';
import { colors } from '@/theme/colors';
import { convex } from '@/lib/convex';
import { useBetterAuthForConvex } from '@/lib/auth';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ConvexProviderWithAuth client={convex} useAuth={useBetterAuthForConvex}>
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
      </ConvexProviderWithAuth>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
