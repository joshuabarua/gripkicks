import { FlatList, Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { Label, Text, Title } from '@/components/ui';

export type Option = { value?: string; label: string; separator?: boolean };

// Native-feeling replacement for the web <select>: a sheet listing the options,
// with the current value ticked.
export function OptionSheet({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: readonly Option[];
  value: string | undefined;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const initialIndex = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.brand.surface }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Title variant="lg">{title}</Title>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={12} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={22} color={colors.brand.chalk} />
          </Pressable>
        </View>
        <FlatList
          data={options as Option[]}
          keyExtractor={(item, index) => item.value ?? `sep-${index}`}
          initialScrollIndex={initialIndex > 3 ? initialIndex - 3 : 0}
          getItemLayout={(_, index) => ({ length: 52, offset: 52 * index, index })}
          renderItem={({ item }) =>
            item.separator ? (
              <View style={{ height: 52, justifyContent: 'center', paddingHorizontal: spacing.lg }}>
                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: item.value === value }}
                onPress={() => {
                  onSelect(item.value!);
                  onClose();
                }}
                style={({ pressed }) => ({
                  height: 52,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: spacing.lg,
                  backgroundColor: item.value === value ? colors.active.background : pressed ? 'rgba(255,255,255,0.05)' : 'transparent',
                })}
              >
                <Text variant="sm" numberOfLines={1} style={{ flex: 1 }}>{item.label}</Text>
                {item.value === value ? <Ionicons name="checkmark" size={18} color={colors.brand.red} /> : null}
              </Pressable>
            )
          }
          ListEmptyComponent={<Label style={{ padding: spacing.lg }}>No options</Label>}
        />
      </SafeAreaView>
    </Modal>
  );
}
