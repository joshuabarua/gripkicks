import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { Text, Button, Card } from '@/components/ui';
import {
  FootProfileRows,
  PromptScreen,
  TabScreen,
  useTabUser,
} from '@/components/TabScreenLayout';

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

function OptionSelectionCard<T extends string>({
  title,
  description,
  options,
  selected,
  onSelect,
}: {
  title: string;
  description: string;
  options: readonly T[];
  selected: T | undefined;
  onSelect: (option: T) => void;
}) {
  return (
    <Card style={{ padding: spacing.lg, gap: spacing.lg }}>
      <View style={{ gap: spacing.sm }}>
        <Text variant="lg" weight="semibold">
          {title}
        </Text>
        <Text variant="sm" color="secondary">
          {description}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {options.map((option) => (
          <OptionChip
            key={option}
            label={option}
            selected={selected === option}
            onPress={() => onSelect(option)}
          />
        ))}
      </View>
    </Card>
  );
}

export default function FootLabScreen() {
  const { betterAuthId, convexUser, router } = useTabUser();
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
      <PromptScreen
        title="Sign in to save your foot profile"
        onAction={() => router.push('/login')}
      />
    );
  }

  const handleSave = async () => {
    if (!convexUser?._id || !footShape || !footVolume) return;
    setSaving(true);
    try {
      await updateUser({
        id: convexUser._id,
        footShape,
        footVolume,
      });
    } finally {
      setSaving(false);
    }
  };

  const canSave =
    footShape &&
    footVolume &&
    (footShape !== convexUser?.footShape || footVolume !== convexUser?.footVolume);

  return (
    <TabScreen
      title="Foot Lab"
      subtitle="Set your foot profile for better recommendations"
    >
      <OptionSelectionCard
        title="Foot Shape"
        description="Which shape best matches your toes?"
        options={FOOT_SHAPES}
        selected={footShape}
        onSelect={setFootShape}
      />

      <OptionSelectionCard
        title="Foot Volume"
        description="How wide is your foot in climbing shoes?"
        options={FOOT_VOLUMES}
        selected={footVolume}
        onSelect={setFootVolume}
      />

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
          <FootProfileRows
            footShape={convexUser.footShape}
            footVolume={convexUser.footVolume}
          />
        </Card>
      )}
    </TabScreen>
  );
}
