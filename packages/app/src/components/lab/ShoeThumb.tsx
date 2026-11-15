import { useState } from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/layout';

// ImageKit resizes on the fly; ask for 2x the box so it stays sharp on retina screens.
function sized(url: string, width: number, height: number) {
  if (!url.includes('imagekit.io')) return url;
  const tr = `tr=w-${width * 2},h-${height * 2},c-at_max,f-png,q-80`;
  return url.includes('?') ? `${url}&${tr}` : `${url}?${tr}`;
}

export function ShoeThumb({
  imageUrl,
  width = 80,
  height = 64,
  framed = true,
  style,
}: {
  imageUrl?: string | null;
  width?: number;
  height?: number;
  framed?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = !!imageUrl && !failed;
  return (
    <View
      style={[
        { width, height, alignItems: 'center', justifyContent: 'center' },
        framed && { borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(0,0,0,0.4)', padding: 6 },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: sized(imageUrl, width, height) }}
          onError={() => setFailed(true)}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <Ionicons name="footsteps-outline" size={Math.min(width, height) * 0.4} color={colors['muted-foreground']} />
      )}
    </View>
  );
}
