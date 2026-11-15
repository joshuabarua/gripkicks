import { View } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { Card, Text } from '@/components/ui';
import { Rise } from '@/components/lab/Rise';
import { EmptyStateCard, PromptScreen, ShoeRow, TabScreen, useTabUser } from '@/components/TabScreenLayout';

type StashEntry = {
  _id: string;
  size?: string;
  comfortScore?: number;
  isFavourite?: boolean;
  shoe?: { name?: string; brand?: string; imageUrl?: string; aggressiveness?: string; volume?: string; climbingDiscipline?: string } | null;
};

export default function StashScreen() {
  const { betterAuthId, convexUser, router } = useTabUser();
  const stash = useQuery(api.stash.getUserStash, convexUser?._id ? { userId: convexUser._id } : 'skip') as StashEntry[] | undefined;

  if (!betterAuthId) {
    return <PromptScreen title="Your shoe collection" description="Sign in to see your shoes." onAction={() => router.push('/login')} />;
  }

  const shoes = stash ?? [];
  const brands = new Set(shoes.map((entry) => entry.shoe?.brand).filter(Boolean));
  const stats = [
    { label: 'shoes', value: shoes.length },
    { label: 'favorites', value: shoes.filter((entry) => entry.isFavourite).length },
    { label: 'brands', value: brands.size },
  ];

  return (
    <TabScreen title="Shoe Sanctuary" cloudy>
      {stash === undefined ? (
        <View style={{ gap: spacing.sm }}>
          {[0, 1, 2].map((i) => (
            <Card key={i} style={{ height: 96, opacity: 0.5 }}><View /></Card>
          ))}
        </View>
      ) : shoes.length === 0 ? (
        <Rise index={1}>
          <EmptyStateCard title="No shoes yet" description="Shoes you add on grip-kicks.com show up here." />
        </Rise>
      ) : (
        <>
          <Rise index={1} style={{ flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 8, backgroundColor: colors.brand.surface, overflow: 'hidden' }}>
            {stats.map((stat, i) => (
              <View key={stat.label} style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderLeftWidth: i ? 1 : 0, borderLeftColor: 'rgba(255,255,255,0.2)' }}>
                <Text variant="2xl">{stat.value}</Text>
                <Text variant="xs" color="secondary">{stat.label}</Text>
              </View>
            ))}
          </Rise>
          {shoes.map((entry, index) => (
            <Rise key={entry._id} index={2 + Math.min(index, 8)}>
              <ShoeRow
                name={entry.shoe?.name}
                brand={entry.shoe?.brand}
                imageUrl={entry.shoe?.imageUrl}
                details={[entry.size ? `Size ${entry.size}` : undefined, entry.shoe?.aggressiveness, entry.shoe?.volume]}
                value={typeof entry.comfortScore === 'number' && entry.comfortScore > 0 ? `${entry.comfortScore}/10` : 'Not rated'}
                valueLabel="Comfort"
              />
            </Rise>
          ))}
        </>
      )}
    </TabScreen>
  );
}
