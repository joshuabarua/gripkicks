import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConvexProvider } from 'convex/react';
import { colors } from '@/theme/colors';
import { convex } from '@/lib/convex';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ConvexProvider client={convex}>
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
      </ConvexProvider>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
