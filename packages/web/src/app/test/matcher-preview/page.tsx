import { MatcherWorkspace, SoleMateContent } from "@/components/shoe/MatcherWorkspace";
import { MatcherResults, type DisplayShoe } from "@/components/shoe/MatcherView";
import type { SoleMateClimberMatch } from "@/hooks/useFindMyShoe";
import images from "../../../../../../data/shoe-images.json";

export default async function Page({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state = "ready" } = await searchParams;
  const shoes: DisplayShoe[] = images.filter((image) => image.imageUrl && image.status !== "removed").slice(0, 10).map((image, index) => ({
    id: `preview-${index}`,
    brand: image.brand,
    name: image.name,
    ...(image.imageUrl ? { imageUrl: image.imageUrl } : {}),
    primaryScore: 86 - index * 3,
    secondaryLabel: `${12 + index} ratings`,
    totalRatings: 12 + index,
    brandAggressiveness: 2,
    signals: { footShape: index === 0 ? "unknown" : "listed", volume: true, preferences: false },
    metrics: { comfort: 4.1 - (index % 3) * 0.6, performance: 3 + (index % 4) * 0.4, durability: 4, aggressiveness: 1 + (index % 5) * 0.7, versatility: 4 - (index % 3) * 0.5 },
    breakdown: { footTypeCompatibility: 4.2, volumeCompatibility: 4, userPreferenceMatch: 3.8, communityApproval: 3.5, overallRating: 4, learnedPreferenceBonus: 0, soleMateMatch: 2 },
    communitySignals: [{ label: "Comfort", value: "+0.4", detail: "Preview signal", tone: "good" }],
  }));
  const matches: SoleMateClimberMatch[] = [{ user: { _id: "preview-climber", name: "Preview climber" }, shoes: shoes.slice(0, 3).map((shoe) => ({
    shoe: { _id: shoe.id, name: shoe.name, brand: shoe.brand, imageUrl: shoe.imageUrl, aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "bouldering", volume: "low" },
    avgComfortScore: 9, avgPerformanceRating: 9, avgDurabilityRating: 8, totalRatings: 12, matchScore: shoe.primaryScore, isSoleMateMatch: true, communitySignals: [], soleMateUsers: [],
  })) }];
  return state.startsWith("mate") ? (
    <MatcherWorkspace activeTab="mate"><SoleMateContent matches={state === "mate-empty" ? [] : matches} hasProfile={state !== "mate-profile"} isLoading={state === "mate-loading"} /></MatcherWorkspace>
  ) : (
    <MatcherWorkspace activeTab="seek"><MatcherResults personalShoes={state === "empty" ? [] : shoes.slice(0, 5)} communityShoes={state === "empty" ? [] : shoes} personalLoading={state === "loading"} communityLoading={state === "loading"} footProfile={state === "profile" ? null : { shape: "Egyptian", volume: "Low" }} userPosition={{ label: "YOU", metrics: { comfort: 4, performance: 4, aggressiveness: 2, versatility: 4 } }} /></MatcherWorkspace>
  );
}
