import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePaginatedQuery, useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { fonts } from '@/theme/typography';
import { Input, Label, Text } from '@/components/ui';
import { ShoeThumb } from '@/components/lab/ShoeThumb';

// Mobile port of packages/web/src/components/stash/AddShoeDialog.tsx: search
// the catalogue (filtered server-side), filter by brand and fit, tap to add.

type Gender = 'all' | 'men' | 'women' | 'kids' | 'unisex';
const GENDERS: Array<{ label: string; value: Gender }> = [
  { label: 'All', value: 'all' },
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Unisex', value: 'unisex' },
  { label: 'Kids', value: 'kids' },
];

type CatalogShoe = { _id: string; name: string; brand: string; imageUrl?: string; gender?: string };

function useDebounced<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        minHeight: 36,
        justifyContent: 'center',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: selected ? colors.active.border : 'rgba(255,255,255,0.12)',
        backgroundColor: selected ? colors.active.background : 'transparent',
        paddingHorizontal: 14,
      }}
    >
      <Text variant="xs" style={{ fontFamily: fonts.medium, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
    </Pressable>
  );
}

export function AddShoeSheet({
  visible,
  ownedShoeIds,
  onAdd,
  onClose,
}: {
  visible: boolean;
  ownedShoeIds: Set<string>;
  onAdd: (shoeId: string) => Promise<void>;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('all');
  const [gender, setGender] = useState<Gender>('all');
  const [adding, setAdding] = useState<string | null>(null);
  const term = useDebounced(search, 250);

  const brands = useQuery(api.shoes.listBrands, visible ? {} : 'skip');
  const { results, status, loadMore } = usePaginatedQuery(
    api.shoes.searchCatalog,
    visible
      ? {
          ...(term.trim() ? { searchTerm: term.trim() } : {}),
          ...(brand !== 'all' ? { brand } : {}),
          ...(gender !== 'all' ? { gender } : {}),
        }
      : 'skip',
    { initialNumItems: 40 },
  );
  const shoes = ((results ?? []) as CatalogShoe[]).filter((s) => !ownedShoeIds.has(s._id));

  const close = () => {
    setSearch('');
    setBrand('all');
    setGender('all');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
        <View style={{ padding: spacing.lg, paddingBottom: spacing.md, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Sanctuary dialogs use the So Cloudy title, as on the web. */}
            <Text accessibilityRole="header" color="white" style={{ fontFamily: fonts.display, fontSize: 30, lineHeight: 34, textTransform: 'uppercase' }}>
              Add new shoe
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={close} hitSlop={12} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={22} color={colors.brand.chalk} />
            </Pressable>
          </View>
          <Input value={search} onChangeText={setSearch} placeholder="Search shoes" autoCorrect={false} autoCapitalize="none" returnKeyType="search" clearButtonMode="while-editing" accessibilityLabel="Search shoes" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {GENDERS.map((g) => (
              <Chip key={g.value} label={g.label} selected={gender === g.value} onPress={() => setGender(g.value)} />
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            <Chip label="All brands" selected={brand === 'all'} onPress={() => setBrand('all')} />
            {(brands ?? []).map((b) => (
              <Chip key={b} label={b} selected={brand === b} onPress={() => setBrand(b)} />
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={shoes}
          keyExtractor={(s) => s._id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (status === 'CanLoadMore') loadMore(40);
          }}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Add ${item.brand} ${item.name}`}
              disabled={adding !== null}
              onPress={async () => {
                setAdding(item._id);
                try {
                  await onAdd(item._id);
                  close();
                } finally {
                  setAdding(null);
                }
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                padding: spacing.sm,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: pressed ? colors.active.border : 'rgba(255,255,255,0.08)',
                backgroundColor: pressed ? colors.active.background : colors.brand.surface,
              })}
            >
              <ShoeThumb imageUrl={item.imageUrl} width={72} height={56} />
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <Label numberOfLines={1}>{item.brand}</Label>
                <Text variant="sm" numberOfLines={2}>{item.name}</Text>
              </View>
              {adding === item._id ? <ActivityIndicator color={colors.brand.chalk} /> : <Ionicons name="add" size={22} color={colors.brand.putty} />}
            </Pressable>
          )}
          ListEmptyComponent={
            status === 'LoadingFirstPage' ? (
              <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.brand.chalk} />
            ) : (
              <Text variant="sm" color="secondary" style={{ textAlign: 'center', marginTop: spacing.xl }}>No shoes found</Text>
            )
          }
          ListFooterComponent={status === 'LoadingMore' ? <ActivityIndicator style={{ margin: spacing.md }} color={colors.brand.chalk} /> : undefined}
        />
      </SafeAreaView>
    </Modal>
  );
}
