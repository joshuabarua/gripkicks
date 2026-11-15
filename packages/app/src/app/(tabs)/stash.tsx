import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useMutation, useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';
import Svg, { G, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/layout';
import { fonts } from '@/theme/typography';
import { Card, Text } from '@/components/ui';
import { Rise } from '@/components/lab/Rise';
import { EmptyStateCard, PromptScreen, TabScreen, useTabUser } from '@/components/TabScreenLayout';
import { CloudBackdrop } from '@/components/sanctuary/CloudBackdrop';
import { AddShoeSheet } from '@/components/sanctuary/AddShoeSheet';
import { SanctuaryCard, type RatingField, type SanctuaryEntry } from '@/components/sanctuary/SanctuaryCard';

// Climbing shoe in profile, same drawing as the web Add shoe button.
function ShoeIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <G transform="translate(0 -1)" fill="none" stroke={colors.background} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M5 17.5C3.6 16.6 3.4 12.8 5 10.6l2.4-1.4c1.4 1 3.2 1.2 4.6.6 3.5.6 7.2 2.8 9 6.4-1.2.7-2.8.6-4.6.2-2.9-.5-6.4.2-9.4 1.2-.7.2-1.4.2-2-.1z" />
        <Path d="M5.3 15.5c3.7-1 8.2-1.4 11.7-.9 1.4.2 2.7.7 3.6 1.3" />
        <Path d="M11.6 10l.8 4.5M14.6 10.6l.7 3.8" />
        <Path d="M5 10.6l-.4-2.4c1.2 0 2 .3 2.8 1" />
      </G>
    </Svg>
  );
}

function AddShoeButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add shoe"
      onPress={onPress}
      style={({ pressed }) => ({
        alignSelf: 'flex-start',
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: radii.lg,
        backgroundColor: pressed ? 'rgba(244,91,91,0.8)' : colors.brand.red,
        paddingVertical: 8,
        paddingLeft: 8,
        paddingRight: 20,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <View style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' }}>
        <ShoeIcon />
        <View style={{ position: 'absolute', right: -4, top: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="add" size={12} color={colors.brand.red} />
        </View>
      </View>
      <Text color="inverse" style={{ fontFamily: fonts.regular, fontSize: 16, textTransform: 'uppercase' }}>Add shoe</Text>
    </Pressable>
  );
}

export default function StashScreen() {
  const { betterAuthId, convexUser, router } = useTabUser();
  const stash = useQuery(api.stash.getUserStash, convexUser?._id ? { userId: convexUser._id } : 'skip') as SanctuaryEntry[] | undefined;
  const addToStash = useMutation(api.stash.addToStash);
  const deleteUserShoe = useMutation(api.stash.deleteUserShoe);
  const updateUserShoeStats = useMutation(api.stash.updateUserShoeStats);
  const toggleFavourite = useMutation(api.stash.toggleFavourite);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

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
  const userShoeId = (entry: SanctuaryEntry) => entry._id as Id<'userShoes'>;
  const fail = (message: string) => Alert.alert('Something went wrong', message);

  const add = async (shoeId: string) => {
    if (!convexUser?._id) return;
    try {
      const id = await addToStash({ userId: convexUser._id, shoeId: shoeId as Id<'shoes'> });
      setExpandedId(String(id));
    } catch {
      fail('Could not add the shoe to your sanctuary.');
    }
  };

  const rate = (entry: SanctuaryEntry, field: RatingField, value: number) => {
    updateUserShoeStats({ userShoeId: userShoeId(entry), [field]: value }).catch(() => fail('Could not save the rating.'));
  };

  const update = (entry: SanctuaryEntry, fields: { size?: string; condition?: string }) => {
    updateUserShoeStats({ userShoeId: userShoeId(entry), ...fields }).catch(() => fail('Could not save the shoe details.'));
  };

  const remove = (entry: SanctuaryEntry) => {
    const name = [entry.shoe?.brand, entry.shoe?.name].filter(Boolean).join(' ') || 'this shoe';
    Alert.alert('Remove shoe?', `Remove ${name} from your sanctuary? Its ratings will be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          if (expandedId === entry._id) setExpandedId(null);
          deleteUserShoe({ userShoeId: userShoeId(entry) }).catch(() => fail('Could not remove the shoe.'));
        },
      },
    ]);
  };

  return (
    <TabScreen title="Shoe Sanctuary" cloudy backdrop={<CloudBackdrop />}>
      <Rise index={1}>
        <AddShoeButton onPress={() => setAdding(true)} />
      </Rise>
      {stash === undefined ? (
        <View style={{ gap: spacing.sm }}>
          {[0, 1, 2].map((i) => (
            <Card key={i} style={{ height: 220, opacity: 0.5 }}><View /></Card>
          ))}
        </View>
      ) : shoes.length === 0 ? (
        <Rise index={2}>
          <EmptyStateCard title="No shoes yet" description="Add the shoes you own to record size, condition and how they fit." />
        </Rise>
      ) : (
        <>
          <Rise index={2} style={{ flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 8, backgroundColor: colors.brand.surface, overflow: 'hidden' }}>
            {stats.map((stat, i) => (
              <View key={stat.label} style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderLeftWidth: i ? 1 : 0, borderLeftColor: 'rgba(255,255,255,0.2)' }}>
                <Text variant="2xl">{stat.value}</Text>
                <Text variant="xs" color="secondary">{stat.label}</Text>
              </View>
            ))}
          </Rise>
          {shoes.map((entry, index) => (
            <Rise key={entry._id} index={3 + Math.min(index, 8)}>
              <SanctuaryCard
                entry={entry}
                expanded={expandedId === entry._id}
                onToggle={() => setExpandedId((id) => (id === entry._id ? null : entry._id))}
                onRate={(field, value) => rate(entry, field, value)}
                onUpdate={(fields) => update(entry, fields)}
                onToggleFavourite={() => toggleFavourite({ userShoeId: userShoeId(entry) }).catch(() => fail('Could not update the favourite.'))}
                onRemove={() => remove(entry)}
              />
            </Rise>
          ))}
        </>
      )}
      <AddShoeSheet visible={adding} ownedShoeIds={new Set(shoes.map((s) => s.shoeId))} onAdd={add} onClose={() => setAdding(false)} />
    </TabScreen>
  );
}
