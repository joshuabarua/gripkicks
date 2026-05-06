import { Check, Circle } from 'lucide-react';

interface DataContributionNudgeProps {
  hasFootShape: boolean;
  hasFootVolume: boolean;
  hasShoe: boolean;
  hasRatedShoe: boolean;
}

const items = [
  { key: 'hasFootShape', label: 'Foot shape set' },
  { key: 'hasFootVolume', label: 'Foot volume set' },
  { key: 'hasShoe', label: 'Shoe added' },
  { key: 'hasRatedShoe', label: 'Shoe rated' },
] as const;

export function DataContributionNudge({
  hasFootShape,
  hasFootVolume,
  hasShoe,
  hasRatedShoe,
}: DataContributionNudgeProps) {
  const status = {
    hasFootShape,
    hasFootVolume,
    hasShoe,
    hasRatedShoe,
  };
  const completedCount = items.filter((item) => status[item.key]).length;
  const progress = Math.round((completedCount / items.length) * 100);

  if (completedCount === items.length) {
    return null;
  }

  return (
    <div className="mt-fluid-md rounded-2xl border border-white/[0.06] bg-black/50 p-fluid-md">
      <div className="flex flex-col gap-fluid-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-sora text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">
            Community data
          </p>
          <h2 className="font-tanker text-fluid-2xl text-white leading-none">
            Make your signals sharper
          </h2>
        </div>
        <div className="font-ball-pill text-fluid-2xl text-brand-red">
          {progress}%
        </div>
      </div>

      <div className="mt-fluid-sm h-1.5 overflow-hidden rounded-full bg-neutral-900">
        <div
          className="h-full rounded-full bg-brand-red transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-fluid-sm grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const complete = status[item.key];
          const Icon = complete ? Check : Circle;

          return (
            <div
              key={item.key}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 font-sora text-xs ${complete
                ? 'border-brand-red/20 bg-brand-red/10 text-brand-red'
                : 'border-white/[0.06] bg-neutral-950 text-neutral-500'
                }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
