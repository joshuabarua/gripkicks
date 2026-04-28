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
  soleMateUsers?: {
    _id: string;
    name?: string;
    image?: string;
  }[];
}
