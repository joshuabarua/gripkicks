import { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { Text, Button, Card } from '@/components/ui';
import { useSession } from '@/lib/auth';
import { useQuery, useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useRouter } from 'expo-router';

const FOOT_SHAPES = ['egyptian', 'roman', 'greek', 'germanic', 'celtic'] as const;
const FOOT_VOLUMES = ['low', 'medium', 'high'] as const;

type FootShape = typeof FOOT_SHAPES[number];
type FootVolume = typeof FOOT_VOLUMES[number];

function OptionChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 999,
        backgroundColor: selected ? colors.accent : colors.muted,
        borderWidth: 1,
        borderColor: selected ? colors.accent : colors.border,
      }}
    >
      <Text
        variant="sm"
        weight="medium"
        color={selected ? 'inverse' : 'secondary'}
        style={{ textTransform: 'capitalize' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function FootLabScreen() {
  const session = useSession();
  const router = useRouter();
  const betterAuthId = session.data?.user?.id;

  const convexUser = useQuery(
    api.users.findByBetterAuthId,
    betterAuthId ? { betterAuthId } : 'skip',
  );

  const updateUser = useMutation(api.users.update);

  const [footShape, setFootShape] = useState<FootShape | undefined>(
    convexUser?.footShape as FootShape | undefined,
  );
  const [footVolume, setFootVolume] = useState<FootVolume | undefined>(
    convexUser?.footVolume as FootVolume | undefined,
  );
  const [saving, setSaving] = useState(false);

  if (!betterAuthId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.lg, alignItems: 'center' }}>
          <Text variant="xl" weight="semibold">
            Sign in to save your foot profile
          </Text>
          <Button onPress={() => router.push('/login')}>
            Sign In
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!convexUser?._id || !footShape || !footVolume) return;
    setSaving(true);
    try {
      await updateUser({
        id: convexUser._id,
        footShape: footShape as 'egyptian' | 'roman' | 'greek' | 'germanic' | 'celtic',
        footVolume,
      });
    } finally {
      setSaving(false);
    }
  };

  const canSave = footShape && footVolume && (footShape !== convexUser?.footShape || footVolume !== convexUser?.footVolume);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <Text variant="3xl" weight="bold" color="accent">
            Foot Lab
          </Text>
          <Text variant="lg" color="secondary">
            Set your foot profile for better recommendations
          </Text>
        </View>

        <Card style={{ padding: spacing.lg, gap: spacing.lg }}>
          <View style={{ gap: spacing.sm }}>
            <Text variant="lg" weight="semibold">
              Foot Shape
            </Text>
            <Text variant="sm" color="secondary">
              Which shape best matches your toes?
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {FOOT_SHAPES.map((shape) => (
              <OptionChip
                key={shape}
                label={shape}
                selected={footShape === shape}
                onPress={() => setFootShape(shape)}
              />
            ))}
          </View>
        </Card>

        <Card style={{ padding: spacing.lg, gap: spacing.lg }}>
          <View style={{ gap: spacing.sm }}>
            <Text variant="lg" weight="semibold">
              Foot Volume
            </Text>
            <Text variant="sm" color="secondary">
              How wide is your foot in climbing shoes?
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {FOOT_VOLUMES.map((vol) => (
              <OptionChip
                key={vol}
                label={vol}
                selected={footVolume === vol}
                onPress={() => setFootVolume(vol)}
              />
            ))}
          </View>
        </Card>

        {canSave && (
          <Button onPress={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        )}

        {convexUser?.footShape && convexUser?.footVolume && (
          <Card style={{ padding: spacing.lg, gap: spacing.md }}>
            <Text variant="sm" color="secondary">
              Saved profile
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text color="secondary">Shape</Text>
              <Text weight="semibold" style={{ textTransform: 'capitalize' }}>
                {convexUser.footShape}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text color="secondary">Volume</Text>
              <Text weight="semibold" style={{ textTransform: 'capitalize' }}>
                {convexUser.footVolume}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
