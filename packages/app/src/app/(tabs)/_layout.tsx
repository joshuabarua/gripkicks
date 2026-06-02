import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

function icon(name: keyof typeof Ionicons.glyphMap, color: string) {
  return <Ionicons name={name} size={24} color={color} />;
}

const screenOptions = {
  tabBarStyle: {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  tabBarActiveTintColor: colors.accent,
  tabBarInactiveTintColor: colors['muted-foreground'],
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.foreground,
};

export default function TabLayout() {
  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }: { color: string }) => icon('home', color),
        }}
      />
      <Tabs.Screen
        name="stash"
        options={{
          title: 'Sanctuary',
          tabBarIcon: ({ color }: { color: string }) => icon('footsteps', color),
        }}
      />
      <Tabs.Screen
        name="foot-lab"
        options={{
          title: 'Foot Lab',
          tabBarIcon: ({ color }: { color: string }) => icon('scan', color),
        }}
      />
      <Tabs.Screen
        name="matcher"
        options={{
          title: 'Matcher',
          tabBarIcon: ({ color }: { color: string }) => icon('search', color),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }: { color: string }) => icon('person', color),
        }}
      />
    </Tabs>
  );
}
