import Svg, { Line, Path, Rect } from 'react-native-svg';
import { colors } from '@/theme/colors';

// Same data as the web glyphs in packages/web/src/components/foot/FootGlyphs.tsx.
export const FOOT_SHAPES = ['egyptian', 'roman', 'greek', 'germanic', 'celtic'] as const;
export const FOOT_VOLUMES = ['low', 'medium', 'high'] as const;
export type FootShape = (typeof FOOT_SHAPES)[number];
export type FootVolume = (typeof FOOT_VOLUMES)[number];

const TOE_HEIGHTS: Record<FootShape, number[]> = {
  egyptian: [12, 10, 8, 6, 4],
  roman: [10, 10, 9, 7, 5],
  greek: [10, 12, 9, 7, 5],
  germanic: [11, 8, 8, 8, 7],
  celtic: [10, 11, 11, 8, 6],
};

const VOLUME_ARCH: Record<FootVolume, string> = {
  low: 'M 8,44 C 30,37 50,37 72,44',
  medium: 'M 8,44 C 22,18 58,18 72,44',
  high: 'M 8,44 C 15,2 65,2 72,44',
};

const IDLE = '#404040';

export function isFootShape(value: unknown): value is FootShape {
  return typeof value === 'string' && (FOOT_SHAPES as readonly string[]).includes(value.toLowerCase());
}
export function isFootVolume(value: unknown): value is FootVolume {
  return typeof value === 'string' && (FOOT_VOLUMES as readonly string[]).includes(value.toLowerCase());
}

export function ToeBars({ shape, active, height = 56 }: { shape: FootShape; active: boolean; height?: number }) {
  return (
    <Svg viewBox="0 0 100 66" width="100%" height={height}>
      {TOE_HEIGHTS[shape].map((h, i) => {
        const barH = (h / 12) * 58;
        return <Rect key={i} x={i * 19 + 4} y={62 - barH} width={14} height={barH} rx={7} fill={active ? colors.brand.red : IDLE} />;
      })}
    </Svg>
  );
}

export function VolumeArch({ volume, active, height = 44 }: { volume: FootVolume; active: boolean; height?: number }) {
  return (
    <Svg viewBox="0 0 80 52" width="100%" height={height}>
      <Line x1={8} y1={46} x2={72} y2={46} strokeWidth={1} stroke="rgba(255,255,255,0.15)" />
      <Path d={VOLUME_ARCH[volume]} fill="none" strokeWidth={3} strokeLinecap="round" stroke={active ? colors.brand.red : IDLE} />
    </Svg>
  );
}
