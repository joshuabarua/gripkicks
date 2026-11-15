import { View } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { spacing } from '@/theme/layout';
import { Card, Label, Text } from '@/components/ui';
import { Rise } from '@/components/lab/Rise';
import { isFootShape } from '@/components/lab/FootGlyphs';
import { EmptyStateCard, PromptScreen, ShoeRow, TabScreen, useTabUser } from '@/components/TabScreenLayout';

type Recommendation = {
  _id: string;
  name?: string;
  brand?: string;
  imageUrl?: string;
  aggressiveness?: string;
  volume?: string;
  climbingDiscipline?: string;
  weightedScore?: number;
};

export default function MatcherScreen() {
  const { betterAuthId, convexUser, router } = useTabUser();
  const shape = convexUser?.footShape?.toLowerCase();
  const volume = convexUser?.footVolume;
  const hasProfile = isFootShape(shape) && !!volume;

  const recommendations = useQuery(
    api.recommendations.getTopShoesForFootShape,
    hasProfile ? { footShape: shape, footVolume: volume, limit: 20 } : 'skip',
  );

  if (!betterAuthId) {
    return <PromptScreen title="Shoe matches" description="Sign in to see shoes that fit your feet." onAction={() => router.push('/login')} />;
  }

  if (!hasProfile) {
    return (
      <PromptScreen
        label="Next step"
        title="Map your foot"
        description="Matches need your foot shape and volume."
        actionLabel="Open Foot Lab"
        onAction={() => router.push('/foot-lab')}
      />
    );
  }

  const items = (recommendations?.items ?? []) as Recommendation[];
  // Scores are averages out of 10 with up to a 1.2 volume bonus.
  const best = Math.max(...items.map((item) => item.weightedScore ?? 0), 1);

  return (
    <TabScreen title="Matcher" description={`${shape} · ${volume}`}>
      {recommendations === undefined ? (
        <View style={{ gap: spacing.sm }}>
          {[0, 1, 2].map((i) => (
            <Card key={i} style={{ height: 96, opacity: 0.5 }}><View /></Card>
          ))}
        </View>
      ) : items.length === 0 ? (
        <Rise index={1}>
          <EmptyStateCard title="No matches yet" description="Not enough ratings for this foot profile." />
        </Rise>
      ) : (
        <>
          <Rise index={1} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Label>Top picks</Label>
            <Label>{recommendations.totalCount} rated</Label>
          </Rise>
          {items.map((shoe, index) => (
            <Rise key={shoe._id} index={2 + Math.min(index, 8)}>
              <ShoeRow
                name={shoe.name}
                brand={shoe.brand}
                imageUrl={shoe.imageUrl}
                details={[shoe.aggressiveness, shoe.volume, shoe.climbingDiscipline]}
                score={(shoe.weightedScore ?? 0) / best}
                value={shoe.weightedScore ? shoe.weightedScore.toFixed(1) : undefined}
                valueLabel="Score"
              />
            </Rise>
          ))}
          <Text variant="xs" color="muted" style={{ marginTop: spacing.sm }}>Score averages comfort, performance and durability ratings.</Text>
        </>
      )}
    </TabScreen>
  );
}
