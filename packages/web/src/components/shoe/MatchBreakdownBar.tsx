import type { MatchSignals } from "@/types/shoe";
import { describeMatchSignal } from "@/utils/matchSignals";
import { riseDelay } from "@/lib/motion";

export interface MatchBreakdown {
  footTypeCompatibility: number;
  volumeCompatibility: number;
  userPreferenceMatch: number;
  communityApproval: number;
  overallRating: number;
  learnedPreferenceBonus: number;
}

const ESTIMATED_SHADE = "bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.35)_0_2px,transparent_2px_5px)]";

// Mirrors the weights in calculateShoeScore: each factor is out of 5, and the
// learned bonus adds up to 0.5 points. Values are points out of 100.
function toFactors(breakdown: MatchBreakdown, signals?: MatchSignals) {
  const factors = [
    { key: "footShape", label: "Foot shape", max: 30, value: breakdown.footTypeCompatibility, note: describeMatchSignal(signals, "footShape"), estimated: signals?.footShape === "unknown", shade: "bg-brand-red" },
    { key: "volume", label: "Volume", max: 20, value: breakdown.volumeCompatibility, note: describeMatchSignal(signals, "volume"), estimated: signals ? !signals.volume : false, shade: "bg-brand-red/75" },
    { key: "preferences", label: "Preferences", max: 25, value: breakdown.userPreferenceMatch, note: describeMatchSignal(signals, "preferences"), estimated: signals ? !signals.preferences : false, shade: "bg-brand-red/55" },
    { key: "community", label: "Community", max: 15, value: breakdown.communityApproval, shade: "bg-brand-red/35" },
    { key: "rating", label: "Overall rating", max: 10, value: breakdown.overallRating, shade: "bg-brand-red/20" },
  ].map((factor) => ({ ...factor, points: (factor.value / 5) * factor.max }));

  if (breakdown.learnedPreferenceBonus > 0) {
    factors.push({ key: "learned", label: "Learned bonus", max: 10, value: breakdown.learnedPreferenceBonus, shade: "bg-brand-chalk/60", points: breakdown.learnedPreferenceBonus * 20 });
  }
  return factors;
}

export function MatchBreakdownBar({ breakdown, signals, delayIndex = 0 }: { breakdown: MatchBreakdown; signals?: MatchSignals | undefined; delayIndex?: number }) {
  const factors = toFactors(breakdown, signals);
  const label = factors.map((factor) => `${factor.label} ${factor.estimated ? "estimated" : Math.round(factor.points)}`).join(", ");

  return (
    <div className="space-y-2">
      <p aria-hidden="true" className="lab-label">Match makeup</p>
      <div role="img" aria-label={`Match makeup: ${label}`} className="flex h-2 overflow-hidden rounded-full bg-white/10">
        <div className="lab-grow flex h-full w-full" style={riseDelay(delayIndex, 60)}>
          {factors.map((factor) => (
            <span key={factor.key} title={`${factor.label}: +${Math.round(factor.points)}`} className={`h-full border-r border-brand-charcoal last:border-r-0 ${factor.estimated ? ESTIMATED_SHADE : factor.shade}`} style={{ width: `${Math.min(100, factor.points)}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MatchBreakdownList({ breakdown, signals }: { breakdown: MatchBreakdown; signals?: MatchSignals | undefined }) {
  return (
    <dl className="space-y-3 pb-2 font-mono text-sm text-brand-putty">
      {toFactors(breakdown, signals).map((factor) => (
        <div key={factor.key} className="flex items-center justify-between gap-4">
          <dt className="flex items-center gap-2">
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-sm ${factor.estimated ? ESTIMATED_SHADE : factor.shade}`} />
            {factor.label}
          </dt>
          <dd className="tabular-nums text-brand-chalk">
            {factor.note ?? <>+{Math.round(factor.points)}<span className="text-brand-putty"> / {factor.max}</span></>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
