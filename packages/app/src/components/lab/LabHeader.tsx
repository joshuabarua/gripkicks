import { View } from 'react-native';
import { Text, Title } from '@/components/ui';
import { fonts } from '@/theme/typography';
import { spacing } from '@/theme/layout';
import { Rise } from './Rise';

// Page title block. "cloudy" is the Sanctuary-only So Cloudy title.
export function LabHeader({ title, description, cloudy }: { title: string; description?: string; cloudy?: boolean }) {
  return (
    <Rise style={{ gap: spacing.sm, marginBottom: spacing.sm }}>
      {cloudy ? (
        <Text accessibilityRole="header" color="white" style={{ fontFamily: fonts.display, fontSize: 44, lineHeight: 48, textTransform: 'uppercase' }}>
          {title}
        </Text>
      ) : (
        <Title variant="4xl">{title}</Title>
      )}
      {description ? (
        <Text variant="lg" color="secondary" style={{ textTransform: 'uppercase' }}>
          {description}
        </Text>
      ) : null}
    </Rise>
  );
}

// Section heading with the trailing hairline used across the web Lab pages.
export function SectionHeading({ title }: { title: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md }}>
      <Title variant="lg">{title}</Title>
      <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
    </View>
  );
}
