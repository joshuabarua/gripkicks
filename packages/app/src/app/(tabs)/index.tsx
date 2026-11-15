import { View } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { spacing } from '@/theme/layout';
import { Button, Card, Label, Text, Title } from '@/components/ui';
import { Rise } from '@/components/lab/Rise';
import { SectionHeading } from '@/components/lab/LabHeader';
import { ToeBars, isFootShape } from '@/components/lab/FootGlyphs';
import { TabScreen, useTabUser } from '@/components/TabScreenLayout';

type Href = '/login' | '/foot-lab' | '/matcher' | '/stash' | '/profile';

const TOOLS: Array<{ title: string; copy: string; href: Href }> = [
  { title: 'Foot Lab', copy: 'Set your foot shape and volume.', href: '/foot-lab' },
  { title: 'Sanctuary', copy: 'Your shoes, sizes and fit ratings.', href: '/stash' },
  { title: 'Matcher', copy: 'Shoes that fit feet like yours.', href: '/matcher' },
  { title: 'Profile', copy: 'Account and foot profile.', href: '/profile' },
];

export default function HomeScreen() {
  const { user, convexUser, router } = useTabUser();
  const stash = useQuery(api.stash.getUserStash, convexUser?._id ? { userId: convexUser._id } : 'skip');

  const firstName = (user?.name || 'Climber').trim().split(/\s+/)[0];
  const hasProfile = !!(convexUser?.footShape && convexUser?.footVolume);
  const shoes = (stash ?? []) as Array<{ isFavourite?: boolean; comfortScore?: number }>;
  const rated = shoes.filter((s) => typeof s.comfortScore === 'number' && s.comfortScore > 0);
  const avgComfort = rated.length ? rated.reduce((sum, s) => sum + (s.comfortScore ?? 0), 0) / rated.length : null;

  const next: { label: string; title: string; copy: string; action: string; href: Href } = !user
    ? { label: 'Start', title: 'Sign in', copy: 'Save your foot profile and shoes.', action: 'Sign in', href: '/login' }
    : !hasProfile
      ? { label: 'Next step', title: 'Map your foot', copy: 'Shape and volume decide which lasts fit you.', action: 'Open Foot Lab', href: '/foot-lab' }
      : shoes.length === 0
        ? { label: 'Next step', title: 'Add your shoes', copy: 'Record sizes and comfort for the shoes you own.', action: 'Open Sanctuary', href: '/stash' }
        : { label: 'Next step', title: 'Find your next shoe', copy: 'Compare shoes using your foot profile and ratings.', action: 'Find shoes', href: '/matcher' };

  const metrics = [
    { label: 'Shoes', value: String(shoes.length) },
    { label: 'Favourites', value: String(shoes.filter((s) => s.isFavourite).length) },
    { label: 'Avg comfort', value: avgComfort === null ? '–' : avgComfort.toFixed(1), suffix: avgComfort === null ? undefined : '/10' },
  ];

  const shape = convexUser?.footShape?.toLowerCase();

  return (
    <TabScreen title={user ? 'Dashboard' : 'GripKicks'} description={user ? `Hey ${firstName}` : undefined}>
      <Rise index={1}>
        <Card active style={{ padding: spacing.lg, gap: spacing.md }}>
          <View style={{ gap: spacing.sm }}>
            <Label>{next.label}</Label>
            <Title variant="xl">{next.title}</Title>
            <Text variant="sm" color="secondary">{next.copy}</Text>
          </View>
          <Button onPress={() => router.push(next.href)} style={{ alignSelf: 'flex-start' }}>{next.action}</Button>
        </Card>
      </Rise>

      {user ? (
        <Rise index={2} style={{ flexDirection: 'row', gap: spacing.sm }}>
          {metrics.map((metric) => (
            <Card key={metric.label} style={{ flex: 1, padding: spacing.md, gap: spacing.sm }}>
              <Label numberOfLines={1}>{metric.label}</Label>
              <Text variant="2xl">
                {metric.value}
                {metric.suffix ? <Text variant="xs" color="secondary">{metric.suffix}</Text> : null}
              </Text>
            </Card>
          ))}
        </Rise>
      ) : null}

      <Rise index={3}>
        <SectionHeading title="Tools" />
      </Rise>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {TOOLS.map((tool, index) => (
          <Rise key={tool.href} index={4 + index} style={{ width: '48.5%' }}>
            <Card onPress={() => router.push(tool.href)} accessibilityLabel={tool.title} style={{ padding: spacing.md, gap: spacing.sm, minHeight: 132 }}>
              {tool.href === '/foot-lab' ? (
                <View style={{ height: 36, marginBottom: 4 }}>
                  <ToeBars shape={isFootShape(shape) ? shape : 'egyptian'} active={hasProfile} height={36} />
                </View>
              ) : null}
              <Title variant="base">{tool.title}</Title>
              <Text variant="xs" color="secondary">{tool.copy}</Text>
            </Card>
          </Rise>
        ))}
      </View>
    </TabScreen>
  );
}
