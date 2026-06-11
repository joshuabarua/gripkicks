"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import ShoeImage from "@/components/ShoeImage";
import { useShoeScoring } from "@/hooks/useShoeScoring";
import { useUserPreferenceLearning } from "@/hooks/useUserPreferenceLearning";
import { useFootProfileStore } from "@/stores/footProfileStore";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { MatchScoreTooltip } from "./MatchScoreTooltip";
import { DataContributionNudge } from "./DataContributionNudge";
import { RadarGrid, type RadarShoe, type RadarUserPosition } from "./RadarGrid";
import type { CommunitySignal } from "@/types/shoe";

type Mode = "personal" | "community";

interface DisplayShoe {
  id: string;
  brand: string;
  name: string;
  imageUrl?: string;
  primaryScore: number;
  secondaryLabel: string;
  brandAggressiveness?: number;
  totalRatings?: number;
  communitySignals?: CommunitySignal[];
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
  const [mode, setMode] = useState<Mode>("personal");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { profile: footProfile } = useFootProfileStore();
  const { scoredShoes, isLoading: personalLoading, stashCount, ratedCount } = useShoeScoring();
  const { userPreferenceProfile } = useUserPreferenceLearning();
  const communityShoes = useQuery(api.recommendations.getCommunityTopShoes, { limit: 10 });

  const personalTop5: DisplayShoe[] = useMemo(() => {
    if (!scoredShoes) return [];
    return scoredShoes.slice(0, 5).map((s) => ({
      id: s.shoe._id,
      brand: s.shoe.brand,
      name: s.shoe.name,
      ...(s.shoe.imageUrl ? { imageUrl: s.shoe.imageUrl } : {}),
      primaryScore: Math.round((s.totalScore / 5) * 100),
      secondaryLabel: "match",
      ...(s.shoe.brandAggressiveness !== undefined ? { brandAggressiveness: s.shoe.brandAggressiveness } : {}),
      metrics: {
        comfort: s.metrics.comfort,
        performance: s.metrics.performance,
        durability: s.metrics.durability,
        aggressiveness: s.metrics.aggressiveness,
        versatility: s.metrics.versatility,
      },
      breakdown: s.breakdown,
    }));
  }, [scoredShoes]);

  const communityTop10: DisplayShoe[] = useMemo(() => {
    if (!communityShoes) return [];
    return communityShoes.map((s) => ({
      id: s._id,
      brand: s.brand,
      name: s.name,
      ...(s.imageUrl ? { imageUrl: s.imageUrl } : {}),
      primaryScore: Math.round((s.compositeScore / 5) * 100),
      secondaryLabel: `${s.totalRatings} ratings`,
      ...(s.brandAggressiveness !== undefined ? { brandAggressiveness: s.brandAggressiveness } : {}),
      totalRatings: s.totalRatings,
      communitySignals: s.communitySignals ?? [],
      metrics: {
        comfort: s.avgComfort,
        performance: s.avgPerformance,
        durability: s.avgDurability,
        aggressiveness: s.avgAggressiveness,
        versatility: Math.max(0, 5 - s.avgAggressiveness),
      },
    }));
  }, [communityShoes]);

  const activeShoes = mode === "personal" ? personalTop5 : communityTop10;
  const isLoading = mode === "personal" ? personalLoading : communityShoes === undefined;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <ModeToggle mode={mode} onChange={setMode} personalCount={personalTop5.length} communityCount={communityTop10.length} />

      {isLoading ? (
        <LoadingState />
      ) : activeShoes.length === 0 ? (
        <EmptyState mode={mode} hasFootProfile={!!footProfile?.shape} />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <ModeHeader mode={mode} count={activeShoes.length} />
            <TileGrid shoes={activeShoes} mode={mode} footProfile={footProfile} />
            <RadarGrid
              shoes={toRadarShoes(activeShoes, mode)}
              hoveredId={hoveredId}
              onHoverChange={setHoveredId}
              confidenceLabel={mode === "personal" ? "Match strength" : "Sample size"}
              {...(mode === "personal" && userPreferenceProfile
                ? {
                    userPosition: {
                      label: "YOU",
                      metrics: {
                        comfort: userPreferenceProfile.comfort,
                        performance: userPreferenceProfile.performance,
                        aggressiveness: userPreferenceProfile.aggressiveness,
                        versatility: userPreferenceProfile.versatility,
                      },
                    } satisfies RadarUserPosition,
                  }
                : {})}
            />
            <Leaderboard shoes={activeShoes} mode={mode} hoveredId={hoveredId} onHoverChange={setHoveredId} />
          </motion.div>
        </AnimatePresence>
      )}

      {!footProfile?.shape && !isLoading && mode === "personal" && (
        <div className="mt-8 p-5 bg-neutral-900 border border-neutral-800 rounded-3xl flex items-center gap-4">
          <User className="w-6 h-6 text-neutral-600 flex-shrink-0" />
          <p className="font-sora text-neutral-400 text-sm flex-1">
            Complete your foot profile for stronger recommendation accuracy.
          </p>
          <Link href="/footlab" className="font-sora text-sm text-brand-red hover:text-brand-red transition-colors shrink-0">
            Set up →
          </Link>
        </div>
      )}

      <DataContributionNudge stashCount={stashCount} ratedCount={ratedCount} />
    </div>
  );
}

function topTrait(metrics: DisplayShoe["metrics"]) {
  const entries: Array<[string, number]> = [
    ["Comfort", metrics.comfort],
    ["Performance", metrics.performance],
    ["Durability", metrics.durability],
    ["Aggressive", metrics.aggressiveness],
  ];
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
    metrics: {
      comfort: s.metrics.comfort,
      performance: s.metrics.performance,
      aggressiveness: s.metrics.aggressiveness,
      versatility: s.metrics.versatility,
    },
  }));
}

function ModeToggle({
  mode,
  onChange,
  personalCount,
  communityCount,
}: {
  mode: Mode;
  onChange: (mode: Mode) => void;
  personalCount: number;
  communityCount: number;
}) {
  return (
    <div className="inline-flex items-center bg-neutral-950 border border-neutral-800 rounded-full p-1 mb-8">
      <ToggleButton
        active={mode === "personal"}
        onClick={() => onChange("personal")}
        label="For you"
        count={personalCount}
      />
      <ToggleButton
        active={mode === "community"}
        onClick={() => onChange("community")}
        label="Community"
        count={communityCount}
      />
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative font-sora text-sm px-5 py-2 rounded-full transition-colors ${
        active ? "bg-white text-black" : "text-neutral-400 hover:text-white"
      }`}
    >
      {label}
      <span className={`ml-2 text-[10px] tabular-nums ${active ? "text-black/50" : "text-neutral-600"}`}>
        {count}
      </span>
    </button>
  );
}

function ModeHeader({ mode, count }: { mode: Mode; count: number }) {
  const title = mode === "personal" ? "Your Top Matches" : "Community Top Rated";
  const subtitle =
    mode === "personal"
      ? `Top ${count} shoes scored against your profile`
      : `Top ${count} shoes ranked by all community ratings`;

  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-2">
          {mode === "personal" ? "Personal" : "Community"}
        </p>
        <h2 className="font-ball-pill text-4xl md:text-5xl text-white leading-none">{title}</h2>
      </div>
      <p className="font-sora text-xs text-neutral-500 max-w-xs text-right hidden sm:block">{subtitle}</p>
    </div>
  );
}

function signalToneClass(tone: CommunitySignal["tone"]) {
  if (tone === "good") return "border-brand-red/25 bg-brand-red/10 text-brand-red";
  if (tone === "warn") return "border-amber-400/25 bg-amber-400/10 text-amber-300";
  return "border-white/10 bg-white/[0.04] text-neutral-300";
}

function TileGrid({ shoes, mode, footProfile }: { shoes: DisplayShoe[]; mode: Mode; footProfile?: { shape: string; volume: string } | null }) {
  const hasProfile = !!footProfile?.shape;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
      {shoes.map((shoe, idx) => {
        const showTrait = !hasProfile && mode === "personal";
        return (
        <motion.div
          key={shoe.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
          className="group relative aspect-square bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden hover:border-brand-red/40 transition-colors"
        >
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <ShoeImage
              brand={shoe.brand}
              shoeName={shoe.name}
              className="w-full h-full"
              transformation={[{ height: 240, width: 240, crop: "at_max", format: "png" }]}
              {...(shoe.imageUrl ? { imageUrl: shoe.imageUrl } : {})}
            />
          </div>

          <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/80 backdrop-blur border border-white/10 flex items-center justify-center">
            <span className="font-ball-pill text-xs text-white">{idx + 1}</span>
          </div>

          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-black ${showTrait ? "bg-neutral-600" : "bg-brand-red"}`}>
            <span className="font-ball-pill text-xs tabular-nums">{showTrait ? "Need profile" : shoe.primaryScore}</span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-3 pb-4 bg-gradient-to-t from-black via-black/80 to-transparent">
            <p className="font-ball-pill text-sm text-white line-clamp-2 leading-snug">{shoe.name}</p>
            <p className="font-sora text-[10px] text-neutral-400 truncate uppercase tracking-wider">{shoe.brand}</p>
          </div>

          {shoe.breakdown && (
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <p className="font-sora text-[10px] text-neutral-400 mb-1">Why this match:</p>
              <div className="space-y-0.5">
                <p className="font-sora text-[9px] text-neutral-300">Foot type: {(shoe.breakdown.footTypeCompatibility * 20).toFixed(0)}%</p>
                <p className="font-sora text-[9px] text-neutral-300">Volume: {(shoe.breakdown.volumeCompatibility * 20).toFixed(0)}%</p>
                <p className="font-sora text-[9px] text-neutral-300">Preferences: {(shoe.breakdown.userPreferenceMatch * 20).toFixed(0)}%</p>
              </div>
            </div>
          )}

          {mode === "community" && shoe.communitySignals && shoe.communitySignals.length > 0 && (
            <div className="absolute inset-x-2 bottom-12 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {shoe.communitySignals.slice(0, 2).map((signal) => (
                <span
                  key={`${shoe.id}-${signal.label}`}
                  className={`rounded-full border px-2 py-1 font-sora text-[8px] uppercase tracking-[0.12em] backdrop-blur ${signalToneClass(signal.tone)}`}
                >
                  {signal.label}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )
    })}
    </div>
  );
}

function Leaderboard({
  shoes,
  mode,
  hoveredId,
  onHoverChange,
}: {
  shoes: DisplayShoe[];
  mode: Mode;
  hoveredId: string | null;
  onHoverChange: (id: string | null) => void;
}) {
  return (
    <div>
      <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4">Leaderboard</p>
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[60px_1fr_120px_120px_120px_minmax(160px,1fr)_100px] gap-4 px-5 py-3 border-b border-neutral-800 bg-neutral-900/50">
          <span className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-500">#</span>
          <span className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-500">Shoe</span>
          <span className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-500 text-right">Comfort</span>
          <span className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-500 text-right">Performance</span>
          <span className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-500 text-right">Durability</span>
          <span className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-500">Signals</span>
          <span className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-500 text-right">
            {mode === "personal" ? "Match" : "Score"}
          </span>
        </div>

        {shoes.map((shoe, idx) => (
          <LeaderboardRow
            key={shoe.id}
            shoe={shoe}
            rank={idx + 1}
            mode={mode}
            isHovered={hoveredId === shoe.id}
            isDimmed={hoveredId !== null && hoveredId !== shoe.id}
            onHoverChange={onHoverChange}
          />
        ))}
      </div>
    </div>
  );
}

function LeaderboardRow({
  shoe,
  rank,
  mode,
  isHovered,
  isDimmed,
  onHoverChange,
}: {
  shoe: DisplayShoe;
  rank: number;
  mode: Mode;
  isHovered: boolean;
  isDimmed: boolean;
  onHoverChange: (id: string | null) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: isDimmed ? 0.4 : 1, x: 0 }}
      transition={{ delay: rank * 0.04 }}
      onMouseEnter={() => onHoverChange(shoe.id)}
      onMouseLeave={() => onHoverChange(null)}
      className={`md:grid md:grid-cols-[60px_1fr_120px_120px_120px_minmax(160px,1fr)_100px] gap-4 px-5 py-4 border-b border-neutral-800 last:border-b-0 transition-colors flex flex-col ${
        isHovered ? "bg-neutral-900/80" : "hover:bg-neutral-900/40"
      }`}
    >
      <div className="flex items-center gap-3 md:contents">
        <span className="font-ball-pill text-2xl text-white/30 w-8 md:w-auto">{rank}</span>

        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 shrink-0">
            <ShoeImage
              brand={shoe.brand}
              shoeName={shoe.name}
              className="p-1"
              transformation={[{ height: 48, width: 48, crop: "at_max", format: "png" }]}
              {...(shoe.imageUrl ? { imageUrl: shoe.imageUrl } : {})}
            />
          </div>
          <div className="min-w-0 flex-1 overflow-visible">
            <p className="font-ball-pill text-base text-white leading-tight">{shoe.name}</p>
            <p className="font-sora text-xs text-neutral-500 truncate">
              {shoe.brand} <span className="text-neutral-700">·</span> {shoe.secondaryLabel}
            </p>
          </div>
        </div>
      </div>

      <MetricCell label="Comfort" value={shoe.metrics.comfort} />
      <MetricCell label="Performance" value={shoe.metrics.performance} />
      <MetricCell label="Durability" value={shoe.metrics.durability} />

      <SignalCell signals={shoe.communitySignals ?? []} />

      <div className="flex md:justify-end items-center mt-3 md:mt-0">
        {mode === "personal" && shoe.breakdown ? (
          <MatchScoreTooltip score={shoe.primaryScore / 20} breakdown={shoe.breakdown} />
        ) : (
          <Badge className="bg-brand-red text-black border-0 font-ball-pill text-base px-3 py-1">{shoe.primaryScore}</Badge>
        )}
      </div>
    </motion.div>
  );
}

function MetricCell({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.max(0, (value / 5) * 100));
  return (
    <div className="flex items-center gap-2 md:justify-end mt-2 md:mt-0">
      <span className="md:hidden font-sora text-[10px] uppercase tracking-wider text-neutral-500 w-20">{label}</span>
      <div className="flex-1 md:flex-none md:w-20 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div className="h-full bg-brand-red rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-sora text-xs text-white tabular-nums w-8 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

function SignalCell({ signals }: { signals: CommunitySignal[] }) {
  if (signals.length === 0) {
    return <span className="hidden md:block font-sora text-xs text-neutral-700">No signals yet</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-2 md:mt-0">
      {signals.slice(0, 2).map((signal) => (
        <div
          key={`${signal.label}-${signal.value}`}
          className={`rounded-full border px-2.5 py-1 ${signalToneClass(signal.tone)}`}
          title={signal.detail}
        >
          <span className="font-sora text-[9px] uppercase tracking-[0.14em]">{signal.label}</span>
          <span className="ml-1.5 font-ball-pill text-xs">{signal.value}</span>
        </div>
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red mx-auto mb-4" />
        <p className="font-sora text-neutral-500 text-sm">Loading matcher...</p>
      </div>
    </div>
  );
}

function EmptyState({ mode, hasFootProfile }: { mode: Mode; hasFootProfile: boolean }) {
  if (mode === "personal" && !hasFootProfile) {
    return (
      <div className="p-8 bg-neutral-950 border border-neutral-800 rounded-3xl text-center">
        <h3 className="font-ball-pill text-2xl text-white mb-2">SET UP YOUR FOOT PROFILE</h3>
        <p className="font-sora text-neutral-500 text-sm mb-6 max-w-sm mx-auto">
          Personal matches need your foot shape and volume.
        </p>
        <Link
          href="/footlab"
          className="inline-flex items-center bg-brand-red hover:bg-brand-red/80 text-black font-ball-pill px-6 py-3 rounded-xl transition-colors"
        >
          FOOT LAB
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 bg-neutral-950 border border-neutral-800 rounded-3xl text-center">
      <p className="font-sora text-neutral-400 text-sm">
        {mode === "personal"
          ? "No personal matches yet — add shoes to your stash to get started."
          : "Not enough community ratings yet. Check back as the community grows."}
      </p>
    </div>
  );
}
