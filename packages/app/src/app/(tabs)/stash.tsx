import { View } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { spacing } from '@/theme/layout';
import {
  EmptyStateCard,
  PromptScreen,
  ShoeListCard,
  TabScreen,
  useTabUser,
} from '@/components/TabScreenLayout';

export default function StashScreen() {
  const { betterAuthId, convexUser, router } = useTabUser();

  const stash = useQuery(
    api.stash.getUserStash,
    convexUser?._id ? { userId: convexUser._id } : 'skip',
  );

  if (!betterAuthId) {
    return (
      <PromptScreen
        title="Sign in to see your stash"
        onAction={() => router.push('/login')}
      />
    );
  }

  return (
    <TabScreen title="Shoe Sanctuary" subtitle="Your saved collection">
      {!stash || stash.length === 0 ? (
        <EmptyStateCard
          title="No shoes yet"
          description="Add shoes to your collection from the Matcher tab"
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          {stash.map((entry: any) => (
            <ShoeListCard
              key={entry._id}
              name={entry.shoe?.name}
              brand={entry.shoe?.brand}
              aggressiveness={entry.shoe?.aggressiveness}
              volume={entry.shoe?.volume}
              climbingDiscipline={entry.shoe?.climbingDiscipline}
            />
          ))}
        </View>
      )}
    </TabScreen>
  );
}
