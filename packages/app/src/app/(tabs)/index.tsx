import type { ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { Button, Card, Label, Text, Title } from '@/components/ui';
import { Rise } from '@/components/lab/Rise';
import { Reveal } from '@/components/lab/InView';
import { SectionHeading } from '@/components/lab/LabHeader';
import { TabScreen, useTabUser } from '@/components/TabScreenLayout';
import { Hero } from '@/components/hero/Hero';
import { FootLabPreview, MatcherPreview, SanctuaryPreview, SoleMatePreview } from '@/components/home/ToolPreviews';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CommunityMilestone } from '@/components/home/CommunityMilestone';
import { FitShoeBackdrop } from '@/components/home/FitShoeBackdrop';
import { useToolStatus, type ToolKey } from '@/components/home/useToolStatus';

type Href = '/login' | '/foot-lab' | '/matcher' | '/stash' | '/profile';

export default function HomeScreen() {
  const { user, convexUser, router } = useTabUser();
  const status = useToolStatus(user ? convexUser : null);
  const { height: windowHeight } = useWindowDimensions();
  const heroHeight = Math.round(windowHeight * 0.58);

  const firstName = (user?.name || 'Climber').trim().split(/\s+/)[0];
  const open = (href: Href) => router.push(href);

  const tools: Array<{ key: ToolKey; title: string; copy: string; href: Href; preview: ReactNode }> = [
    { key: 'matcher', title: 'Matcher', copy: 'Compare shoe matches and community ratings.', href: '/matcher', preview: <MatcherPreview active={false} /> },
    { key: 'footLab', title: 'Foot Lab', copy: 'Set your foot shape and volume.', href: '/foot-lab', preview: <FootLabPreview active={false} profile={status?.footProfile ?? null} /> },
    {
      key: 'stash',
      title: 'Sanctuary',
      copy: 'Your shoes, sizes and fit ratings.',
      href: '/stash',
      preview: <SanctuaryPreview active={false} {...(status?.stashShoes.length ? { shoes: status.stashShoes } : {})} />,
    },
    { key: 'soleMate', title: 'Sole Mate', copy: 'Shoes rated by climbers with your foot profile.', href: '/matcher', preview: <SoleMatePreview active={false} /> },
  ];

  return (
    // The hero carries the GRIP KICKS wordmark, so signed-out visitors get no separate title.
    <TabScreen
      hero={<Hero height={heroHeight} />}
      backdrop={<FitShoeBackdrop footShape={convexUser?.footShape} footVolume={convexUser?.footVolume} revealAfter={heroHeight} />}
      title={user ? 'Dashboard' : undefined}
      description={user ? `Hey ${firstName}` : undefined}
    >
      {!user ? (
        <Rise index={1}>
          <Card active style={{ padding: spacing.lg, gap: spacing.md }}>
            <View style={{ gap: spacing.sm }}>
              <Label>Start</Label>
              <Title variant="xl">Sign in</Title>
              <Text variant="sm" color="secondary">Save your foot profile and shoes.</Text>
            </View>
            <Button onPress={() => open('/login')} style={{ alignSelf: 'flex-start' }}>Sign in</Button>
          </Card>
        </Rise>
      ) : null}

      <Reveal style={{ gap: spacing.md }}>
        <SectionHeading title="How it works" />
        <HowItWorks status={status} onOpen={open} />
      </Reveal>

      <Reveal>
        <SectionHeading title="Tools" />
      </Reveal>
      {tools.map((tool, index) => (
        <Reveal key={tool.key} delay={index * 60}>
          <Card onPress={() => open(tool.href)} accessibilityLabel={tool.title} style={{ padding: spacing.lg, gap: spacing.md }}>
            {tool.preview}
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}>
                <Title variant="lg">{tool.title}</Title>
                <Ionicons name="arrow-forward" size={18} color={colors.brand.chalk} style={{ transform: [{ rotate: '-45deg' }] }} />
              </View>
              <Text variant="sm" color="secondary">{tool.copy}</Text>
              {status ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brand.red }} />
                  <Label style={{ color: colors.brand.chalk }}>{status.labels[tool.key]}</Label>
                </View>
              ) : null}
            </View>
          </Card>
        </Reveal>
      ))}

      <Reveal>
        <CommunityMilestone />
      </Reveal>
    </TabScreen>
  );
}
