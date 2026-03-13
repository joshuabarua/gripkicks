import type { Doc } from "convex/_generated/dataModel";

type Shoe = Doc<"shoes">;

export interface RadarMetrics {
  comfort: number;
  performance: number;
  durability: number;
  aggressiveness: number;
  stability: number;
  versatility: number;
}

export type RadarQuadrantKey =
  | "daily-drivers"
  | "versatile-performers"
  | "aggressive-comfort"
  | "competition";

export interface RadarQuadrantInfo {
  name: string;
  description: string;
  borderColor: string;
  bgColor: string;
  accentClass: string;
}

export interface PublicRadarEntry {
  shoe: Shoe;
  score: number;
  scoreLabel: string;
  popularityCount: number;
  metrics: RadarMetrics;
  x: number;
  y: number;
  quadrantKey: RadarQuadrantKey;
  descriptors: {
    horizontalLabel: string;
    verticalLabel: string;
  };
  topTraits: Array<{
    key: string;
    label: string;
    value: number;
  }>;
}

export const radarQuadrants: Record<RadarQuadrantKey, RadarQuadrantInfo> = {
  "daily-drivers": {
    name: "Daily Drivers",
    description: "Comfortable & versatile all-rounders",
    borderColor: "border-green-500/40",
    bgColor: "bg-green-500/5",
    accentClass: "text-green-400/80",
  },
  "versatile-performers": {
    name: "Versatile Performers",
    description: "High performance with range",
    borderColor: "border-blue-500/40",
    bgColor: "bg-blue-500/5",
    accentClass: "text-blue-400/80",
  },
  "aggressive-comfort": {
    name: "Aggressive Comfort",
    description: "Downturned but padded",
    borderColor: "border-orange-500/40",
    bgColor: "bg-orange-500/5",
    accentClass: "text-orange-400/80",
  },
  competition: {
    name: "Competition",
    description: "Max performance, max aggression",
    borderColor: "border-red-500/40",
    bgColor: "bg-red-500/5",
    accentClass: "text-red-400/80",
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getAggressivenessValue(aggressiveness?: string | null) {
  if (aggressiveness === "very_high") return 5;
  if (aggressiveness === "high") return 4;
  if (aggressiveness === "moderate") return 3;
  if (aggressiveness === "low") return 1;
  return 2.5;
}

function getStiffnessValue(stiffness?: string | null) {
  if (stiffness === "very_stiff") return 5;
  if (stiffness === "stiff") return 4;
  if (stiffness === "medium") return 3;
  if (stiffness === "soft") return 2;
  if (stiffness === "very_soft") return 1;
  return 2.5;
}

function getVolumeSupportValue(volume?: string | null) {
  if (volume === "low_volume" || volume === "low") return 4;
  if (volume === "medium_volume" || volume === "medium") return 3;
  if (volume === "high_volume" || volume === "high") return 2;
  return 2.5;
}

function getVersatilityValue(discipline?: string | null) {
  if (discipline === "all_around") return 5;
  if (discipline === "trad") return 4;
  if (discipline === "sport" || discipline === "bouldering") return 3;
  if (discipline === "indoor") return 2;
  return 2.5;
}

export function calculateOverallRating(shoe: Shoe) {
  const comfort = shoe.avgComfortScore || 2.5;
  const performance = shoe.avgPerformanceRating || 2.5;
  const durability = shoe.avgDurabilityRating || 2.5;
  return (comfort + performance + durability) / 3;
}

export function calculateCommunityApproval(shoe: Shoe, popularityCount: number) {
  if (!popularityCount) {
    return 2.5;
  }

  const popularityBoost = Math.min(2, popularityCount / 10);
  return Math.min(5, calculateOverallRating(shoe) + popularityBoost);
}

export function calculatePublicRadarMetrics(shoe: Shoe): RadarMetrics {
  const comfort = Math.min(5, (shoe.avgComfortScore || 2.5) + 1);
  const performance = Math.min(5, (shoe.avgPerformanceRating || 2.5) + 0.7);
  const durability = shoe.avgDurabilityRating || 2.5;
  const aggressiveness = getAggressivenessValue(shoe.aggressiveness);
  const stiffness = getStiffnessValue(shoe.stiffness);
  const volumeSupport = getVolumeSupportValue(shoe.volume);
  const versatility = Math.min(5, getVersatilityValue(shoe.climbingDiscipline) + 0.5);
  const stability = Math.min(5, durability * 0.45 + stiffness * 0.35 + volumeSupport * 0.2);

  return {
    comfort,
    performance,
    durability,
    aggressiveness,
    stability,
    versatility,
  };
}

export function getQuadrantKeyFromPosition(x: number, y: number): RadarQuadrantKey {
  const isPerformanceLed = x >= 0.5;
  const isAggressiveLed = y >= 0.5;

  if (!isPerformanceLed && !isAggressiveLed) return "daily-drivers";
  if (isPerformanceLed && !isAggressiveLed) return "versatile-performers";
  if (!isPerformanceLed && isAggressiveLed) return "aggressive-comfort";
  return "competition";
}

export function getAxisDescriptor(metrics: RadarMetrics) {
  const horizontalDelta = metrics.performance - metrics.comfort;
  const verticalDelta = metrics.aggressiveness - metrics.versatility;

  return {
    horizontalLabel:
      horizontalDelta > 0.55
        ? "Performance-first"
        : horizontalDelta < -0.55
          ? "Comfort-first"
          : "Balanced feel",
    verticalLabel:
      verticalDelta > 0.55
        ? "Aggression-led"
        : verticalDelta < -0.55
          ? "Versatility-led"
          : "All-round profile",
  };
}

export function getTopTraits(metrics: RadarMetrics) {
  return [
    { key: "comfort", label: "Comfort", value: metrics.comfort },
    { key: "performance", label: "Performance", value: metrics.performance },
    { key: "versatility", label: "Versatility", value: metrics.versatility },
    { key: "aggressiveness", label: "Aggressive", value: metrics.aggressiveness },
  ]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
}

export function getRadarCoordinates(metrics: RadarMetrics) {
  const performanceWeight = metrics.performance + metrics.aggressiveness;
  const comfortWeight = metrics.comfort + metrics.versatility;
  const versatilityWeight = metrics.versatility + metrics.comfort;
  const aggressiveWeight = metrics.aggressiveness + metrics.performance;

  return {
    x: clamp(
      performanceWeight / Math.max(performanceWeight + comfortWeight, 0.001),
      0.08,
      0.92,
    ),
    y: clamp(
      1 - aggressiveWeight / Math.max(aggressiveWeight + versatilityWeight, 0.001),
      0.08,
      0.92,
    ),
  };
}

export function calculatePublicMatchScore(shoe: Shoe, popularityCount: number) {
  const overallRating = calculateOverallRating(shoe);
  const communityApproval = calculateCommunityApproval(shoe, popularityCount);
  const technicalScore = (getAggressivenessValue(shoe.aggressiveness) + getStiffnessValue(shoe.stiffness)) / 2;
  const totalScore = overallRating * 0.5 + communityApproval * 0.35 + technicalScore * 0.15;
  return Math.round((Math.min(5, totalScore) / 5) * 100);
}

export function buildPublicRadarEntry(shoe: Shoe, popularityCount: number, score: number, scoreLabel: string): PublicRadarEntry {
  const metrics = calculatePublicRadarMetrics(shoe);
  const { x, y } = getRadarCoordinates(metrics);
  const quadrantKey = getQuadrantKeyFromPosition(x, y);

  return {
    shoe,
    score,
    scoreLabel,
    popularityCount,
    metrics,
    x,
    y,
    quadrantKey,
    descriptors: getAxisDescriptor(metrics),
    topTraits: getTopTraits(metrics),
  };
}
