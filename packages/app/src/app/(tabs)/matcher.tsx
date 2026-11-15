import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { Button, Card, Label, Segmented, Text, Title } from '@/components/ui';
import { Rise } from '@/components/lab/Rise';
import { ShoeThumb } from '@/components/lab/ShoeThumb';
import { FitChart } from '@/components/matcher/FitChart';
import { MatchBreakdownBar, MatchBreakdownList } from '@/components/matcher/MatchBreakdown';
import { EmptyStateCard, PromptScreen, TabScreen, useTabUser } from '@/components/TabScreenLayout';
import { useMatcherData, type DisplayShoe, type MatcherMode, type Metrics, type SoleMateClimber } from '@/hooks/useMatcherData';
import type { CommunitySignal } from '../../../../../types/shoe';

type Tab = 'seek' | 'mate';

export default function MatcherScreen() {
  const { betterAuthId, convexUser, router } = useTabUser();
  const data = useMatcherData(convexUser);
  const [tab, setTab] = useState<Tab>('seek');

  if (!betterAuthId) {
    return <PromptScreen title="Shoe matches" description="Sign in to see shoes that fit your feet." onAction={() => router.push('/login')} />;
  }

  return (
    <TabScreen title="Matcher" description="Shoes ranked for your foot profile and community ratings.">
      <Rise index={1}>
        <Segmented
          accessibilityLabel="Matcher views"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'seek', label: 'Shoe matches' },
            { value: 'mate', label: 'Sole Mate' },
          ]}
        />
      </Rise>
      {tab === 'seek' ? <ShoeMatches data={data} onOpen={(href) => router.push(href)} /> : <SoleMates data={data} onOpen={(href) => router.push(href)} />}
    </TabScreen>
  );
}

type Data = ReturnType<typeof useMatcherData>;
type Open = (href: '/foot-lab' | '/stash') => void;

function ShoeMatches({ data, onOpen }: { data: Data; onOpen: Open }) {
  const [mode, setMode] = useState<MatcherMode>('personal');
  const shoes = mode === 'personal' ? data.personal : data.community;
  const loading = mode === 'personal' ? data.personalLoading : data.communityLoading;
  const needsPreferences = mode === 'personal' && shoes.some((s) => s.signals && !s.signals.preferences);

  return (
    <>
      <Rise index={2}>
        <Card style={{ padding: spacing.lg, gap: spacing.md }}>
          <Title variant="base">{mode === 'personal' ? 'Your shoe matches' : 'Community ratings'}</Title>
          <Text variant="sm" color="secondary">
            {mode === 'personal' ? 'Fit estimates from catalog attributes and available ratings. Not a fit guarantee.' : 'Shoes ranked using ratings from all climbers.'}
          </Text>
          {needsPreferences ? <Text variant="xs" color="secondary">Preferences need 3 complete shoe ratings.</Text> : null}
          <Segmented
            accessibilityLabel="Choose recommendation source"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'personal', label: 'For you', count: data.personalLoading ? '…' : data.personal.length },
              { value: 'community', label: 'Community', count: data.communityLoading ? '…' : data.community.length },
            ]}
          />
        </Card>
      </Rise>

      {loading ? (
        <View style={{ gap: spacing.sm }}>
          {[0, 1].map((i) => (
            <Card key={i} style={{ height: 320, opacity: 0.5 }}><View /></Card>
          ))}
        </View>
      ) : shoes.length === 0 ? (
        <Rise index={3}>
          {mode === 'personal' && !data.hasProfile ? (
            <EmptyStateCard title="Set up your foot profile" description="Personal matches need your foot shape and volume." action={<Button onPress={() => onOpen('/foot-lab')}>Open Foot Lab</Button>} />
          ) : (
            <EmptyStateCard
              title="No shoe matches yet"
              description={mode === 'personal' ? 'Add shoes to your Sanctuary to record what fits.' : 'Not enough community ratings yet.'}
            />
          )}
        </Rise>
      ) : (
        <>
          <Rise index={3}>
            <Text weight="medium" variant="lg">
              {shoes.length} {mode === 'personal' ? 'shoe matches' : 'top-rated shoes'}
            </Text>
          </Rise>
          {shoes.map((shoe, index) => (
            <Rise key={`${mode}-${shoe.id}`} index={4 + Math.min(index, 6)}>
              <MatchTile shoe={shoe} rank={index + 1} mode={mode} hasProfile={data.hasProfile} fitProfile={mode === 'personal' ? data.fitProfile : undefined} />
            </Rise>
          ))}
          <Rise index={11}>
            <Leaderboard shoes={shoes} mode={mode} />
          </Rise>
          {mode === 'personal' && !data.hasProfile ? (
            <Card active style={{ padding: spacing.lg, gap: spacing.md }}>
              <Text variant="sm" color="secondary">Add your foot shape and volume to personalise these matches.</Text>
              <Button onPress={() => onOpen('/foot-lab')} style={{ alignSelf: 'flex-start' }}>Set up foot profile</Button>
            </Card>
          ) : null}
        </>
      )}
    </>
  );
}

function MatchTile({ shoe, rank, mode, hasProfile, fitProfile }: { shoe: DisplayShoe; rank: number; mode: MatcherMode; hasProfile: boolean; fitProfile?: Metrics }) {
  const [open, setOpen] = useState(false);
  const personalNoProfile = mode === 'personal' && !hasProfile;
  return (
    <Card style={{ overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Title variant="base" numberOfLines={1} style={{ flex: 1 }}>{shoe.name}</Title>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant={personalNoProfile ? 'xs' : 'lg'} weight={personalNoProfile ? 'medium' : 'normal'}>
            {personalNoProfile ? 'Set profile' : `${shoe.primaryScore}${mode === 'personal' ? '%' : '/100'}`}
          </Text>
          <Label>{mode === 'personal' ? (hasProfile ? 'Match' : 'Profile needed') : shoe.secondaryLabel}</Label>
        </View>
      </View>
      <View style={{ height: 180, padding: spacing.lg, backgroundColor: 'rgba(0,0,0,0.4)', borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <ShoeThumb imageUrl={shoe.imageUrl} width={300} height={140} framed={false} style={{ width: '100%', height: '100%' }} />
        <View style={{ position: 'absolute', left: 12, top: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="sm" weight="medium">{rank}</Text>
        </View>
        <Label style={{ position: 'absolute', left: 12, bottom: 10 }}>{shoe.brand}</Label>
      </View>
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        {fitProfile ? <FitChart shoe={shoe.metrics} you={fitProfile} /> : <RatingBars metrics={shoe.metrics} />}
        {shoe.breakdown ? (
          <View style={{ gap: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: spacing.md }}>
            <MatchBreakdownBar breakdown={shoe.breakdown} signals={shoe.signals} />
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              onPress={() => setOpen((v) => !v)}
              style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Text variant="sm" weight="medium">Match details</Text>
              <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.brand.putty} />
            </Pressable>
            {open ? <MatchBreakdownList breakdown={shoe.breakdown} signals={shoe.signals} /> : null}
          </View>
        ) : null}
        {mode === 'community' ? <Signals signals={shoe.communitySignals ?? []} /> : null}
      </View>
    </Card>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.max(0, (value / 5) * 100));
  return (
    <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
      <Text variant="xs" color="secondary" numberOfLines={1}>{label}</Text>
      <Text variant="sm">
        {value.toFixed(1)}
        <Text variant="xs" color="secondary">/5</Text>
      </Text>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: '100%', borderRadius: 3, backgroundColor: colors.brand.red }} />
      </View>
    </View>
  );
}

function RatingBars({ metrics }: { metrics: Metrics }) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.md }}>
      <MetricBar label="Comfort" value={metrics.comfort} />
      <MetricBar label="Performance" value={metrics.performance} />
      <MetricBar label="Durability" value={metrics.durability} />
    </View>
  );
}

function Signals({ signals }: { signals: CommunitySignal[] }) {
  if (!signals.length) return <Text variant="sm" color="secondary">No community signals yet</Text>;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {signals.slice(0, 2).map((signal) => (
        <View
          key={`${signal.label}-${signal.value}`}
          accessibilityHint={signal.detail}
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: signal.tone === 'good' ? 'rgba(244,91,91,0.6)' : signal.tone === 'warn' ? 'rgba(251,191,36,0.6)' : 'rgba(255,255,255,0.12)',
            backgroundColor: 'rgba(0,0,0,0.3)',
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Text variant="sm">
            {signal.label} <Text variant="sm" weight="medium">{signal.value}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

// "Compare ratings": collapsible table of every shoe in the current list.
function Leaderboard({ shoes, mode }: { shoes: DisplayShoe[]; mode: MatcherMode }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((v) => !v)}
        style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Text weight="medium" variant="lg">Compare ratings</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.brand.putty} />
      </Pressable>
      {open
        ? shoes.map((shoe, index) => (
            <View key={shoe.id} style={{ borderTopWidth: 1, borderTopColor: colors.border, padding: spacing.lg, gap: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Text color="secondary">{index + 1}</Text>
                <ShoeThumb imageUrl={shoe.imageUrl} width={64} height={52} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text weight="medium" numberOfLines={1}>{shoe.name}</Text>
                  <Text variant="xs" color="secondary">{shoe.brand}</Text>
                </View>
                <Text variant="lg">{mode === 'personal' ? `${shoe.primaryScore}%` : `${shoe.primaryScore}/100`}</Text>
              </View>
              <RatingBars metrics={shoe.metrics} />
            </View>
          ))
        : null}
    </Card>
  );
}

function SoleMates({ data, onOpen }: { data: Data; onOpen: Open }) {
  if (!data.hasProfile) {
    return (
      <Rise index={2}>
        <EmptyStateCard
          title="Set up your foot profile"
          description="Your foot shape and volume are needed to find climbers with the same fit."
          action={<Button onPress={() => onOpen('/foot-lab')}>Open Foot Lab</Button>}
        />
      </Rise>
    );
  }
  if (data.soleMatesLoading) {
    return (
      <Card style={{ padding: spacing.xl }}>
        <Text color="secondary">Finding sole mates…</Text>
      </Card>
    );
  }
  if (!data.soleMates.length) {
    return (
      <Rise index={2}>
        <EmptyStateCard title="No sole mates yet" description="No climbers with your exact foot profile have rated shoes above 8.5 yet." />
      </Rise>
    );
  }
  return (
    <>
      <Rise index={2}>
        <Card active style={{ padding: spacing.lg, gap: spacing.sm }}>
          <Title variant="base">Sole Mate</Title>
          <Text variant="sm">
            {data.soleMates.length} {data.soleMates.length === 1 ? 'climber' : 'climbers'} with your foot profile. Shoes they rate highly.
          </Text>
        </Card>
      </Rise>
      {data.soleMates.map((match, index) => (
        <Rise key={match.user._id} index={3 + Math.min(index, 8)}>
          <SoleMateCard match={match} />
        </Rise>
      ))}
    </>
  );
}

function SoleMateCard({ match }: { match: SoleMateClimber }) {
  return (
    <Card style={{ padding: spacing.lg, gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {match.user.image ? (
            <Image source={{ uri: match.user.image }} style={{ width: '100%', height: '100%' }} accessibilityIgnoresInvertColors />
          ) : (
            <Ionicons name="people-outline" size={20} color={colors.brand.chalk} />
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text weight="medium" variant="lg" numberOfLines={1}>{match.user.name || 'Climber'}</Text>
          <Text variant="sm" color="secondary">
            {match.shoes.length} top {match.shoes.length === 1 ? 'shoe' : 'shoes'}
          </Text>
        </View>
      </View>
      {match.shoes.map((rating) => (
        <Card key={rating.shoe._id} style={{ padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <ShoeThumb imageUrl={rating.shoe.imageUrl} width={72} height={56} />
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Label numberOfLines={1}>{rating.shoe.brand}</Label>
            <Text weight="medium" numberOfLines={1}>{rating.shoe.name}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="2xl">{rating.matchScore}%</Text>
            <Label>Match</Label>
          </View>
        </Card>
      ))}
    </Card>
  );
}
