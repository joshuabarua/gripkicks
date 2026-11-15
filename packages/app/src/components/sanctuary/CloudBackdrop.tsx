import { useEffect, useState } from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  ReduceMotion,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

// Port of the web Sanctuary background (StashPage + CloudBackground): a sky
// image that slowly drifts, single clouds floating across, and a dark gradient
// so the cards stay readable.

const CLOUDS = [
  require('../../../assets/clouds/cloud1.png'),
  require('../../../assets/clouds/cloud2.png'),
  require('../../../assets/clouds/cloud3.png'),
  require('../../../assets/clouds/cloud4.png'),
  require('../../../assets/clouds/cloud5.png'),
];

interface CloudSpec {
  id: number;
  source: number;
  top: number;
  width: number;
  duration: number;
  fromLeft: boolean;
  opacity: number;
  // Where the first pass starts (0–1), so the sky is not empty on open.
  start: number;
}

let nextId = 0;
function randomCloud(start: number): CloudSpec {
  return {
    id: nextId++,
    source: CLOUDS[Math.floor(Math.random() * CLOUDS.length)],
    top: 2 + Math.random() * 83,
    width: 200 + Math.random() * 180,
    duration: 24_000 + Math.random() * 26_000,
    fromLeft: Math.random() < 0.5,
    opacity: 0.35 + Math.random() * 0.3,
    start,
  };
}

function DriftingCloud({ cloud, onDone, screenWidth, screenHeight }: { cloud: CloudSpec; onDone: (id: number) => void; screenWidth: number; screenHeight: number }) {
  const t = useSharedValue(cloud.start);
  useEffect(() => {
    t.value = withTiming(1, { duration: cloud.duration * (1 - cloud.start), easing: Easing.linear }, (finished) => {
      if (finished) runOnJS(onDone)(cloud.id);
    });
    return () => cancelAnimation(t);
  }, [cloud, onDone, t]);
  const style = useAnimatedStyle(() => {
    const from = cloud.fromLeft ? -cloud.width : screenWidth;
    const to = cloud.fromLeft ? screenWidth : -cloud.width;
    return { transform: [{ translateX: interpolate(t.value, [0, 1], [from, to]) }] };
  });
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: (cloud.top / 100) * screenHeight, width: cloud.width, height: cloud.width * 0.6, opacity: cloud.opacity }, style]}>
      <Image source={cloud.source} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
    </Animated.View>
  );
}

export function CloudBackdrop() {
  const reduce = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const [clouds, setClouds] = useState(() => Array.from({ length: 5 }, () => randomCloud(Math.random())));
  const respawn = (id: number) => setClouds((list) => list.map((c) => (c.id === id ? randomCloud(0) : c)));

  // Sky image: slow 44s drift and zoom, back and forth.
  const sky = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    sky.value = withRepeat(withTiming(1, { duration: 44_000, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(sky);
  }, [reduce, sky]);
  const skyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(sky.value, [0, 1], [-0.015, 0.015]) * width },
      { translateY: interpolate(sky.value, [0, 1], [-0.01, 0.01]) * height },
      { scale: interpolate(sky.value, [0, 1], [1.06, 1.1]) },
    ],
  }));

  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <Animated.View entering={FadeIn.duration(900).reduceMotion(ReduceMotion.System)} style={[StyleSheet.absoluteFill, skyStyle]}>
        <Image source={require('../../../assets/clouds/backdrop.jpg')} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
      </Animated.View>
      {reduce
        ? clouds.slice(0, 3).map((c, i) => (
            <Image key={c.id} source={c.source} resizeMode="contain" style={{ position: 'absolute', left: ((5 + i * 29) / 100) * width, top: (c.top / 100) * height, width: c.width, height: c.width * 0.6, opacity: c.opacity }} />
          ))
        : clouds.map((c) => <DriftingCloud key={c.id} cloud={c} onDone={respawn} screenWidth={width} screenHeight={height} />)}
      {/* Same overlay as the web: black/50 → black/30 → black/65. */}
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000" stopOpacity={0.5} />
            <Stop offset="0.5" stopColor="#000" stopOpacity={0.3} />
            <Stop offset="1" stopColor="#000" stopOpacity={0.65} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#shade)" />
      </Svg>
    </View>
  );
}
