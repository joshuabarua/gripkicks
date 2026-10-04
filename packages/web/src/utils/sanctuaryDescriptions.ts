import brandDescriptions from "@/components/stash/brand-descriptions.json";
import type { Shoe } from "@/types/api";

const profiles: Record<string, string> = { flat: "flat profile", moderate: "moderate profile", aggressive: "aggressive profile" };
const flex: Record<string, string> = { soft: "soft flex", medium: "balanced flex", stiff: "stiff support" };
const volumes: Record<string, string> = { low: "a low-volume fit", medium: "a medium-volume fit", high: "a high-volume fit" };
const disciplines: Record<string, string> = { sport: "sport climbing", bouldering: "bouldering", trad: "traditional climbing", gym: "gym climbing", competition: "competition climbing", approach: "approaches" };
const list = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

function lookup(values: Record<string, string>, key?: string): string | undefined {
  return key && Object.hasOwn(values, key) ? values[key] : undefined;
}

export function getBrandDescription(brand: string): string | null {
  return lookup(brandDescriptions, brand.trim().toLowerCase()) ?? null;
}

export function getShoeDescription(shoe?: Partial<Shoe>): string {
  if (shoe?.description?.trim() && (!shoe.enrichment || shoe.enrichment.reviewStatus === "approved")) {
    const first = shoe.description.trim().replace(/\s+/g, " ").split(/(?<=[.!?])\s+(?=[A-Z])/)[0]!;
    return first.length <= 180 ? first : `${first.slice(0, 177).replace(/\s+\S*$/, "")}…`;
  }
  const features = [lookup(profiles, shoe?.aggressiveness), lookup(flex, shoe?.stiffness), lookup(volumes, shoe?.volume)].filter((feature): feature is string => Boolean(feature));
  const discipline = lookup(disciplines, shoe?.climbingDiscipline);
  if (!features.length) return discipline ? `Climbing shoe for ${discipline}.` : "Product details are not available yet.";
  const summary = list.format(features);
  return `${summary[0]!.toUpperCase()}${summary.slice(1)}${discipline ? ` for ${discipline}` : ""}.`;
}
