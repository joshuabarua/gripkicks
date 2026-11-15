import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

type IconName = keyof typeof Ionicons.glyphMap;

// Active tab gets the red monolith bar above its icon; labels stay chalk, never red.
function tabIcon(name: IconName, activeName: IconName) {
  return function TabIcon({ color, focused }: { color: string; focused: boolean }) {
    return (
      <View style={{ alignItems: 'center' }}>
        <View style={{ position: 'absolute', top: -8, width: 18, height: 2, borderRadius: 1, backgroundColor: focused ? colors.brand.red : 'transparent' }} />
        <Ionicons name={focused ? activeName : name} size={22} color={color} />
      </View>
    );
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
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('grid-outline', 'grid') }} />
      <Tabs.Screen name="stash" options={{ title: 'Sanctuary', tabBarIcon: tabIcon('cloud-outline', 'cloud') }} />
      <Tabs.Screen name="foot-lab" options={{ title: 'Foot Lab', tabBarIcon: tabIcon('footsteps-outline', 'footsteps') }} />
      <Tabs.Screen name="matcher" options={{ title: 'Matcher', tabBarIcon: tabIcon('git-compare-outline', 'git-compare') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('person-outline', 'person') }} />
    </Tabs>
  );
}
