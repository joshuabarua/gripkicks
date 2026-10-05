export interface ShoeRecommendation {
  _id: string;
  name: string;
  brand: string;
  imageUrl?: string;
  slug?: string;
  gender?: string;
  aggressiveness: string;
  stiffness: string;
  climbingDiscipline: string;
  volume: string;
  avgComfortScore?: number;
  avgPerformanceRating?: number;
  avgDurabilityRating?: number;
  totalRatings: number;
  matchScore: number;
  isSoleMateMatch: boolean;
  communitySignals?: CommunitySignal[];
  soleMateUsers?: {
    _id: string;
    name?: string;
    image?: string;
  }[];
}

export interface MatchSignals {
  footShape: "listed" | "not-listed" | "unknown";
  volume: boolean;
  preferences: boolean;
}

export interface CommunitySignal {
  label: string;
  value: string;
  detail: string;
  tone: "good" | "warn" | "neutral";
}
