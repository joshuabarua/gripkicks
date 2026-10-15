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

export default function MatcherScreen() {
  const { betterAuthId, convexUser, router } = useTabUser();
  const hasProfile = convexUser?.footShape && convexUser?.footVolume;

  const recommendations = useQuery(
    api.recommendations.getTopShoesForFootShape,
    hasProfile
      ? {
          footShape: convexUser.footShape as 'egyptian' | 'roman' | 'greek' | 'germanic' | 'celtic',
          footVolume: convexUser.footVolume as string,
          limit: 20,
        }
      : 'skip',
  );

  if (!betterAuthId) {
    return (
      <PromptScreen
        title="Sign in to see recommendations"
        onAction={() => router.push('/login')}
      />
    );
  }

  if (!hasProfile) {
    return (
      <PromptScreen
        title="Set up your foot profile first"
        description="We need to know your foot shape and volume to recommend the best climbing shoes"
        actionLabel="Go to Foot Lab"
        onAction={() => router.push('/foot-lab')}
      />
    );
  }

  return (
    <TabScreen
      title="Matcher"
      subtitle={`Top picks for your ${convexUser.footShape} · ${convexUser.footVolume} foot`}
    >
      {!recommendations || recommendations.items.length === 0 ? (
        <EmptyStateCard
          title="No recommendations yet"
          description="Community data is still building. Check back soon."
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          {recommendations.items.map((shoe: any) => (
            <ShoeListCard
              key={shoe._id}
              name={shoe.name}
              brand={shoe.brand}
              aggressiveness={shoe.aggressiveness}
              volume={shoe.volume}
              climbingDiscipline={shoe.climbingDiscipline}
              weightedScore={shoe.weightedScore}
            />
          ))}
        </View>
      )}
    </TabScreen>
  );
}
