"use client";

import Link from "@/components/ui/NavLink";
import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { api } from "convex/_generated/api";
import ShoeImage from "@/components/ShoeImage";
import { BrandLogo } from "@/components/stash/BrandLogo";
import { RatingIcons } from "@/components/RatingIcons";
import { useShoeScoring } from "@/hooks/useShoeScoring";
import { useFootProfile } from "@/hooks/useFootProfile";
import { MatchScoreTooltip } from "./MatchScoreTooltip";
import { DataContributionNudge } from "@/components/DataContributionNudge";
import { RadarGrid, type RadarShoe, type RadarUserPosition } from "./RadarGrid";
import type { CommunitySignal, MatchSignals } from "@/types/shoe";
import { toFivePointScale, toHundredPointScale } from "convex/utils/scoring";
import { MatcherGridSkeleton } from "@/components/ui/skeleton";
import { glideTransition, riseDelay } from "@/lib/motion";
import { MatchBreakdownBar, MatchBreakdownList } from "./MatchBreakdownBar";

type Mode = "personal" | "community";

export interface DisplayShoe {
  id: string;
  brand: string;
  name: string;
  imageUrl?: string;
  primaryScore: number;
  secondaryLabel: string;
  brandAggressiveness?: number;
  totalRatings?: number;
  communitySignals?: CommunitySignal[];
  signals?: MatchSignals;
  metrics: {
    comfort: number;
    performance: number;
    durability: number;
    aggressiveness: number;
    versatility: number;
  };
  breakdown?: {
    footTypeCompatibility: number;
    volumeCompatibility: number;
    userPreferenceMatch: number;
    communityApproval: number;
    overallRating: number;
    learnedPreferenceBonus: number;
    soleMateMatch: number;
  };
}

export function MatcherView() {
  const { profile: footProfile } = useFootProfile();
  const { scoredShoes, isLoading: personalLoading, stashCount, ratedCount, userPreferenceProfile } = useShoeScoring();
  const communityShoes = useQuery(api.recommendations.getCommunityTopShoes, { limit: 10 });

  const personalTop5: DisplayShoe[] = useMemo(() => {
    if (!scoredShoes) return [];
    return scoredShoes.slice(0, 5).map((s) => ({
      id: s.shoe._id,
      brand: s.shoe.brand,
      name: s.shoe.name,
      ...(s.shoe.imageUrl ? { imageUrl: s.shoe.imageUrl } : {}),
      primaryScore: toHundredPointScale(s.totalScore, 5),
      secondaryLabel: "match",
      ...(s.shoe.brandAggressiveness !== undefined ? { brandAggressiveness: toFivePointScale(s.shoe.brandAggressiveness) } : {}),
      metrics: {
        comfort: s.metrics.comfort,
        performance: s.metrics.performance,
        durability: s.metrics.durability,
        aggressiveness: s.metrics.aggressiveness,
        versatility: s.metrics.versatility,
      },
      breakdown: s.breakdown,
      signals: s.signals,
    }));
  }, [scoredShoes]);

  const communityTop10: DisplayShoe[] = useMemo(() => {
    if (!communityShoes) return [];
    return communityShoes.map((s) => ({
      id: s._id,
      brand: s.brand,
      name: s.name,
      ...(s.imageUrl ? { imageUrl: s.imageUrl } : {}),
      primaryScore: toHundredPointScale(s.compositeScore, 10),
      secondaryLabel: `${s.totalRatings} ratings`,
      ...(s.brandAggressiveness !== undefined ? { brandAggressiveness: toFivePointScale(s.brandAggressiveness) } : {}),
      totalRatings: s.totalRatings,
      communitySignals: s.communitySignals ?? [],
      metrics: {
        comfort: toFivePointScale(s.avgComfort),
        performance: toFivePointScale(s.avgPerformance),
        durability: toFivePointScale(s.avgDurability),
        aggressiveness: toFivePointScale(s.avgAggressiveness),
        versatility: Math.max(0, 5 - toFivePointScale(s.avgAggressiveness)),
      },
    }));
  }, [communityShoes]);

  const userPosition: RadarUserPosition | undefined = userPreferenceProfile ? {
    label: "YOU",
    metrics: {
      comfort: userPreferenceProfile.comfort,
      performance: userPreferenceProfile.performance,
      aggressiveness: userPreferenceProfile.aggressiveness,
      versatility: userPreferenceProfile.versatility,
    },
  } : undefined;

  return <MatcherResults personalShoes={personalTop5} communityShoes={communityTop10} personalLoading={personalLoading} communityLoading={communityShoes === undefined} footProfile={footProfile} userPosition={userPosition} contribution={<DataContributionNudge stashCount={stashCount} ratedCount={ratedCount} />} />;
}

interface MatcherResultsProps {
  personalShoes: DisplayShoe[];
  communityShoes: DisplayShoe[];
  personalLoading?: boolean;
  communityLoading?: boolean;
  footProfile?: { shape: string; volume: string } | null;
  userPosition?: RadarUserPosition | undefined;
  contribution?: ReactNode;
}

export function MatcherResults({ personalShoes, communityShoes, personalLoading = false, communityLoading = false, footProfile, userPosition, contribution }: MatcherResultsProps) {
  const [mode, setMode] = useState<Mode>("personal");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeShoes = mode === "personal" ? personalShoes : communityShoes;
  const isLoading = mode === "personal" ? personalLoading : communityLoading;
  const hasProfile = !!(footProfile?.shape && footProfile.volume);

  return (
    <div className="space-y-fluid-xl">
      <section aria-label="Recommendation source" className="lab-card lab-rise flex flex-col justify-between gap-fluid-lg p-fluid-lg lg:flex-row lg:items-center" style={riseDelay(0)}>
        <div>
          <h2 className="lab-title text-fluid-lg">{mode === "personal" ? "Your shoe matches" : "Community ratings"}</h2>
          <p className="mt-2 font-mono text-base leading-relaxed text-brand-putty">{mode === "personal" ? "Fit estimates from catalog attributes and available ratings. Not a fit guarantee." : "Shoes ranked using ratings from all climbers."}</p>
          {mode === "personal" && activeShoes.some((shoe) => shoe.signals && !shoe.signals.preferences) && <p className="mt-3 font-mono text-sm text-brand-putty">Preferences need 3 complete shoe ratings. <Link href="/stash" className="underline underline-offset-4">Rate your shoes</Link></p>}
        </div>
        <div aria-label="Choose recommendation source" className="grid grid-cols-2 gap-2">
          {([["personal", "For you", personalShoes.length, personalLoading], ["community", "Community", communityShoes.length, communityLoading]] as const).map(([value, label, count, loading]) => (
            <button key={value} type="button" aria-pressed={mode === value} onClick={() => { setMode(value); setHoveredId(null); }} className={`relative flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-3 font-mono text-xs uppercase tracking-wider transition-colors duration-500 ${mode === value ? "text-white" : "text-brand-chalk hover:bg-white/5"}`}>
              {mode === value && <motion.span layoutId="matcher-mode" aria-hidden="true" transition={glideTransition} className="absolute inset-0 rounded-lg border border-brand-red/40 bg-brand-red/10" />}
              <span className="relative">{label}</span><span className="relative text-sm tabular-nums">{loading ? "…" : count}</span>
            </button>
          ))}
        </div>
      </section>

      {isLoading ? (
        <div style={riseDelay(1)}><MatcherGridSkeleton /></div>
      ) : !activeShoes.length ? (
        <EmptyState mode={mode} hasFootProfile={hasProfile} />
      ) : (
        <>
          <section aria-labelledby="matches-title" className="lab-rise space-y-fluid-lg" style={riseDelay(1)}>
            <h2 id="matches-title" className="font-mono text-xl font-semibold">{activeShoes.length} {mode === "personal" ? "shoe matches" : "top-rated shoes"}</h2>
            <TileGrid shoes={activeShoes} mode={mode} hasProfile={hasProfile} />
          </section>
          <section aria-labelledby="radar-title" className="lab-card lab-rise" style={riseDelay(10)}>
            <h2 id="radar-title" className="p-fluid-lg font-mono text-lg font-semibold">Radar map</h2>
            <div className="border-t border-white/8 p-fluid-md sm:p-fluid-lg">
              <RadarGrid shoes={toRadarShoes(activeShoes, mode)} hoveredId={hoveredId} onHoverChange={setHoveredId} confidenceLabel={mode === "personal" ? "Match strength" : "Sample size"} {...(mode === "personal" && userPosition ? { userPosition } : {})} />
            </div>
          </section>
          <details className="lab-card lab-rise" style={riseDelay(11)}>
            <summary className="cursor-pointer rounded-lg p-fluid-lg font-mono text-lg font-semibold hover:bg-white/3">Compare ratings</summary>
            <div className="border-t border-white/8">
              <Leaderboard shoes={activeShoes} mode={mode} hoveredId={hoveredId} onHoverChange={setHoveredId} />
            </div>
          </details>
        </>
      )}

      {!contribution && !hasProfile && !isLoading && activeShoes.length > 0 && mode === "personal" && (
        <section className="lab-card lab-rise flex flex-col justify-between gap-4 p-fluid-lg sm:flex-row sm:items-center" style={riseDelay(12)}>
          <p className="font-mono text-base text-brand-putty">Add your foot shape and volume to personalise these matches.</p>
          <Link href="/footlab" className="lab-button shrink-0">Set up foot profile</Link>
        </section>
      )}
      {contribution}
    </div>
  );
}

function topTrait(metrics: DisplayShoe["metrics"]) {
  const entries: Array<[string, number]> = [["Comfort", metrics.comfort], ["Performance", metrics.performance], ["Durability", metrics.durability], ["Aggressive", metrics.aggressiveness]];
  entries.sort((a, b) => b[1] - a[1]);
  const winner = entries[0]!;
  return { label: winner[0], value: winner[1] };
}

function confidenceFor(s: DisplayShoe, mode: Mode): number {
  if (mode === "personal") return Math.min(1, s.primaryScore / 100);
  const ratings = s.totalRatings ?? 0;
  return Math.min(1, Math.log10(ratings + 1) / Math.log10(50));
}

function toRadarShoes(shoes: DisplayShoe[], mode: Mode): RadarShoe[] {
  return shoes.map((s) => ({
    id: s.id,
    brand: s.brand,
    name: s.name,
    ...(s.imageUrl ? { imageUrl: s.imageUrl } : {}),
    primaryScore: s.primaryScore,
    primaryScoreLabel: mode === "personal" ? "Match" : "Score",
    subtitle: s.secondaryLabel,
    confidence: confidenceFor(s, mode),
    ...(s.brandAggressiveness !== undefined ? { brandAggressiveness: s.brandAggressiveness } : {}),
    topTrait: topTrait(s.metrics),
    metrics: { comfort: s.metrics.comfort, performance: s.metrics.performance, aggressiveness: s.metrics.aggressiveness, versatility: s.metrics.versatility },
  }));
}

function signalToneClass(tone: CommunitySignal["tone"]) {
  if (tone === "good") return "border-brand-red/60 bg-black/30 text-brand-chalk";
  if (tone === "warn") return "border-amber-400/60 bg-black/30 text-brand-chalk";
  return "border-white/12 bg-black/30 text-brand-chalk";
}

function TileGrid({ shoes, mode, hasProfile }: { shoes: DisplayShoe[]; mode: Mode; hasProfile: boolean }) {
  return (
    <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {shoes.map((shoe, idx) => (
        <article key={shoe.id} aria-label={`${shoe.brand} ${shoe.name}`} style={riseDelay(2 + Math.min(idx, 8))} className="lab-card lab-card-lift lab-rise min-w-0">
          <div className="flex items-center justify-between gap-3 border-b border-white/6 px-fluid-lg py-2.5">
            <h3 className="truncate lab-title text-base text-brand-chalk">{shoe.name}</h3>
            <div className="shrink-0 text-right font-mono">
              <p className={`tabular-nums ${mode === "personal" && !hasProfile ? "text-xs font-semibold" : "text-lg"}`}>{mode === "personal" && !hasProfile ? "Set profile" : `${shoe.primaryScore}${mode === "personal" ? "%" : "/100"}`}</p>
              <p className="lab-label mt-0.5">{mode === "personal" ? hasProfile ? "Match" : "Profile needed" : shoe.secondaryLabel}</p>
            </div>
          </div>
          <div className="relative h-48 border-b border-white/6 bg-black/40 p-fluid-lg sm:h-56">
            <ShoeImage brand={shoe.brand} shoeName={shoe.name} imageUrl={shoe.imageUrl} className="h-full w-full" transformation={[{ height: 280, width: 400, crop: "at_max", format: "png" }]} />
            <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 font-mono text-sm font-semibold text-brand-chalk">{idx + 1}</span>
            <div className="absolute bottom-3 left-3 flex h-7 w-24 items-center justify-start px-1">
              <BrandLogo brand={shoe.brand} size="sm" tooltip />
            </div>
          </div>
          <div className="space-y-4 p-fluid-lg">
            <RatingIcons comfort={shoe.metrics.comfort} performance={shoe.metrics.performance} durability={shoe.metrics.durability} max={5} />
            {shoe.breakdown && (
              <div className="space-y-2 border-t border-white/8 pt-4">
                <MatchBreakdownBar breakdown={shoe.breakdown} signals={shoe.signals} delayIndex={2 + Math.min(idx, 8)} />
                <details>
                  <summary className="min-h-11 cursor-pointer py-3 font-mono text-sm font-medium">Match details</summary>
                  <MatchBreakdownList breakdown={shoe.breakdown} signals={shoe.signals} />
                </details>
              </div>
            )}
            {mode === "community" && <SignalCell signals={shoe.communitySignals ?? []} />}
          </div>
        </article>
      ))}
    </div>
  );
}

function Leaderboard({ shoes, mode, hoveredId, onHoverChange }: { shoes: DisplayShoe[]; mode: Mode; hoveredId: string | null; onHoverChange: (id: string | null) => void }) {
  return (
    <div className="divide-y divide-white/6">
      {shoes.map((shoe, idx) => (
        <article key={shoe.id} tabIndex={0} aria-label={`Compare ${shoe.brand} ${shoe.name}`} onMouseEnter={() => onHoverChange(shoe.id)} onMouseLeave={() => onHoverChange(null)} onFocus={() => onHoverChange(shoe.id)} onBlur={() => onHoverChange(null)} className={`grid items-center gap-fluid-lg p-fluid-lg transition-colors xl:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)_auto] ${hoveredId === shoe.id ? "bg-white/4" : "hover:bg-white/4"}`}>
          <div className="flex min-w-0 items-center gap-4">
            <span className="font-mono text-base tabular-nums text-brand-putty">{idx + 1}</span>
            <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg border border-white/6 bg-black/40">
              <ShoeImage brand={shoe.brand} shoeName={shoe.name} imageUrl={shoe.imageUrl} className="p-2" transformation={[{ height: 56, width: 64, crop: "at_max", format: "png" }]} />
            </div>
            <div className="min-w-0">
              <h3 className="wrap-break-word font-mono text-base font-semibold">{shoe.name}</h3>
              <div className="mt-1 flex items-center gap-2">
                <BrandLogo brand={shoe.brand} size="sm" className="shrink-0" />
                <span className="font-mono text-xs text-brand-putty">{shoe.brand}</span>
              </div>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-4">
            <MetricCell label="Comfort" value={shoe.metrics.comfort} />
            <MetricCell label="Performance" value={shoe.metrics.performance} />
            <MetricCell label="Durability" value={shoe.metrics.durability} />
          </dl>
          <div className="font-mono">
            {mode === "personal" && shoe.breakdown ? <MatchScoreTooltip score={shoe.primaryScore / 20} breakdown={shoe.breakdown} {...(shoe.signals ? { signals: shoe.signals } : {})} /> : <p className="text-lg font-semibold tabular-nums">{shoe.primaryScore}/100</p>}
          </div>
          {shoe.communitySignals?.length ? <div className="xl:col-span-3"><SignalCell signals={shoe.communitySignals} /></div> : null}
        </article>
      ))}
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.max(0, (value / 5) * 100));
  return (
    <div className="min-w-0 space-y-2 font-mono text-sm">
      <dt className="wrap-break-word text-brand-putty">{label}</dt>
      <dd className="tabular-nums">{value.toFixed(1)}<span className="text-brand-putty">/5</span></dd>
      <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-white/20"><div className="lab-grow h-full rounded-full bg-brand-red" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function SignalCell({ signals }: { signals: CommunitySignal[] }) {
  if (!signals.length) return <p className="font-mono text-sm text-brand-putty">No community signals yet</p>;
  return <div className="flex flex-wrap gap-2">{signals.slice(0, 2).map((signal) => <span key={`${signal.label}-${signal.value}`} className={`rounded-lg border px-3 py-2 font-mono text-sm ${signalToneClass(signal.tone)}`} title={signal.detail}>{signal.label} <span className="font-semibold">{signal.value}</span></span>)}</div>;
}

function EmptyState({ mode, hasFootProfile }: { mode: Mode; hasFootProfile: boolean }) {
  const needsProfile = mode === "personal" && !hasFootProfile;
  return (
    <section className="lab-card lab-rise p-fluid-xl" style={riseDelay(1)}>
      <h3 className="lab-title text-base">{needsProfile ? "Set up your foot profile" : "No shoe matches yet"}</h3>
      <p className="mt-3 max-w-lg font-mono text-base leading-relaxed text-brand-putty">{needsProfile ? "Personal matches need your foot shape and volume." : mode === "personal" ? "Add shoes to your Sanctuary to record what fits." : "Not enough community ratings yet."}</p>
      {mode === "personal" && <Link href={needsProfile ? "/footlab" : "/stash"} className="lab-button mt-fluid-lg">{needsProfile ? "Set up foot profile" : "Open Sanctuary"}</Link>}
    </section>
  );
}
