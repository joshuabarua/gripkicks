import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { posthog } from '@/lib/posthog';
import { posthogLogger } from '@/lib/posthog-logger';
import { spacing } from '@/theme/layout';
import { Button, Card, Label, Text } from '@/components/ui';
import { Rise } from '@/components/lab/Rise';
import { SectionHeading } from '@/components/lab/LabHeader';
import {
  FOOT_SHAPES,
  FOOT_VOLUMES,
  ToeBars,
  VolumeArch,
  isFootShape,
  isFootVolume,
  type FootShape,
  type FootVolume,
} from '@/components/lab/FootGlyphs';
import { PromptScreen, TabScreen, useTabUser } from '@/components/TabScreenLayout';

export default function FootLabScreen() {
  const { betterAuthId, convexUser, router } = useTabUser();
  const updateUser = useMutation(api.users.update);

  const savedShape = convexUser?.footShape?.toLowerCase();
  const savedVolume = convexUser?.footVolume?.toLowerCase();
  const [footShape, setFootShape] = useState<FootShape | undefined>();
  const [footVolume, setFootVolume] = useState<FootVolume | undefined>();
  const [saving, setSaving] = useState(false);

  // Start from the saved profile once it loads.
  useEffect(() => {
    if (isFootShape(savedShape)) setFootShape((current) => current ?? savedShape);
    if (isFootVolume(savedVolume)) setFootVolume((current) => current ?? savedVolume);
  }, [savedShape, savedVolume]);

  if (!betterAuthId) {
    return <PromptScreen title="Foot Lab" description="Sign in to save your foot shape and volume." onAction={() => router.push('/login')} />;
  }

  const handleSave = async () => {
    if (!convexUser?._id || !footShape || !footVolume) return;
    setSaving(true);
    try {
      await updateUser({ id: convexUser._id, footShape, footVolume });
      posthog?.capture('foot_profile_saved', { foot_shape: footShape, foot_volume: footVolume });
      posthogLogger.footProfileSaved();
    } finally {
      setSaving(false);
    }
  };

  const changed = !!footShape && !!footVolume && (footShape !== savedShape || footVolume !== savedVolume);
  const saved = !!footShape && footShape === savedShape && footVolume === savedVolume;

  return (
    <TabScreen title="Foot Lab" description="Set your foot shape and volume.">
      <Rise index={1}>
        <SectionHeading title="Shape" />
      </Rise>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {FOOT_SHAPES.map((shape, index) => {
          const selected = footShape === shape;
          return (
            <Rise key={shape} index={2 + index} style={{ width: '48.5%' }}>
              <Card
                active={selected}
                onPress={() => setFootShape(shape)}
                accessibilityLabel={`${shape} foot shape`}
                accessibilityState={{ selected }}
                style={{ padding: spacing.md, gap: spacing.sm }}
              >
                <ToeBars shape={shape} active={selected} height={52} />
                <Text weight="medium" variant="sm" style={{ textTransform: 'uppercase' }}>{shape}</Text>
              </Card>
            </Rise>
          );
        })}
      </View>

      <Rise index={7}>
        <SectionHeading title="Volume" />
      </Rise>
      <Rise index={8} style={{ flexDirection: 'row', gap: spacing.sm }}>
        {FOOT_VOLUMES.map((volume) => {
          const selected = footVolume === volume;
          return (
            <View key={volume} style={{ flex: 1 }}>
              <Card
                active={selected}
                onPress={() => setFootVolume(volume)}
                accessibilityLabel={`${volume} volume`}
                accessibilityState={{ selected }}
                style={{ padding: spacing.md, gap: spacing.sm }}
              >
                <VolumeArch volume={volume} active={selected} height={36} />
                <Text weight="medium" variant="sm" style={{ textTransform: 'uppercase' }}>{volume}</Text>
              </Card>
            </View>
          );
        })}
      </Rise>

      <Rise index={9} style={{ marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}>
        <Label>{saved ? 'Saved' : changed ? 'Unsaved changes' : 'Pick a shape and volume'}</Label>
        <Button onPress={handleSave} disabled={!changed} loading={saving}>
          {saving ? 'Saving' : 'Save'}
        </Button>
      </Rise>
    </TabScreen>
  );
}
