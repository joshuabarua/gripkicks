export type FootShape = 'egyptian' | 'roman' | 'greek' | 'germanic' | 'celtic';
export type FootVolume = 'low' | 'medium' | 'high';

export const TOE_HEIGHTS: Record<FootShape, number[]> = {
  egyptian: [12, 10, 8, 6, 4],
  roman: [10, 10, 9, 7, 5],
  greek: [10, 12, 9, 7, 5],
  germanic: [11, 8, 8, 8, 7],
  celtic: [10, 11, 11, 8, 6],
};

export const VOLUME_ARCH: Record<FootVolume, string> = {
  low: 'M 8,44 C 30,37 50,37 72,44',
  medium: 'M 8,44 C 22,18 58,18 72,44',
  high: 'M 8,44 C 15,2 65,2 72,44',
};

export function ToeProfile({ shape, active, height = 72 }: { shape: FootShape; active: boolean; height?: number }) {
  const heights = TOE_HEIGHTS[shape];
  return (
    <svg viewBox="0 0 100 66" className="w-full" style={{ height }} aria-hidden="true">
      {heights.map((h, i) => {
        const barH = (h / 12) * 58;
        return (
          <rect
            key={i}
            x={i * 19 + 4}
            y={62 - barH}
            width={14}
            height={barH}
            rx={7}
            className={`transition-colors duration-300 ${active ? 'fill-brand-red' : 'fill-neutral-700'}`}
          />
        );
      })}
    </svg>
  );
}

export function ScoreTag({ active, height = 56 }: { active: boolean; height?: number }) {
  return (
    <svg viewBox="0 0 80 52" className="w-full" style={{ height }} aria-hidden="true">
      <rect
        x="15" y="8" width="50" height="32" rx="9"
        fill="none"
        strokeWidth="3"
        className={`transition-colors duration-300 ${active ? 'stroke-brand-red' : 'stroke-neutral-600'}`}
      />
      <text
        x="40" y="30" textAnchor="middle"
        fontSize="14" fontWeight="700"
        className={`font-mono transition-colors duration-300 ${active ? 'fill-white' : 'fill-neutral-500'}`}
      >
        10/10
      </text>
      <path
        d="M 32,47 H 48"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className={`transition-colors duration-300 ${active ? 'stroke-neutral-500' : 'stroke-neutral-700'}`}
      />
    </svg>
  );
}

export function CompareArrows({ active, height = 56 }: { active: boolean; height?: number }) {
  return (
    <svg viewBox="0 0 80 52" className="w-full" style={{ height }} aria-hidden="true">
      <path
        d="M 8,14 H 56 M 48,6 L 62,14 L 48,22"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-colors duration-300 ${active ? 'stroke-brand-red' : 'stroke-neutral-600'}`}
      />
      <path
        d="M 72,38 H 24 M 32,30 L 18,38 L 32,46"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-colors duration-300 ${active ? 'stroke-neutral-600' : 'stroke-neutral-700'}`}
      />
    </svg>
  );
}

export function VolumeArch({ volume, active, height = 56 }: { volume: FootVolume; active: boolean; height?: number }) {
  return (
    <svg viewBox="0 0 80 52" className="w-full" style={{ height }} aria-hidden="true">
      <line
        x1="8" y1="46" x2="72" y2="46"
        strokeWidth="1"
        className={active ? 'stroke-brand-red/30' : 'stroke-neutral-800'}
      />
      <path
        d={VOLUME_ARCH[volume]}
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className={`transition-colors duration-300 ${active ? 'stroke-brand-red' : 'stroke-neutral-600'}`}
      />
    </svg>
  );
}
