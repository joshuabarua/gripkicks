import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { TabIcon, type TabGlyph } from '@/components/TabIcons';

// Active tab gets the red monolith bar and a red-filled glyph; labels stay chalk, never red.
function tabIcon(name: TabGlyph) {
  return function Icon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <TabIcon name={name} color={color as string} focused={focused} />;
  };
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1 },
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: 'rgba(200, 191, 179, 0.5)',
        tabBarLabelStyle: { fontFamily: fonts.regular, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="stash" options={{ title: 'Sanctuary', tabBarIcon: tabIcon('sanctuary') }} />
      <Tabs.Screen name="foot-lab" options={{ title: 'Foot Lab', tabBarIcon: tabIcon('footLab') }} />
      <Tabs.Screen name="matcher" options={{ title: 'Matcher', tabBarIcon: tabIcon('matcher') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('profile') }} />
    </Tabs>
  );
}
