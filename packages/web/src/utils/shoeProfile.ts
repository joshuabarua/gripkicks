import type { UserShoe } from "@/types/api";

const profileFields = [
  ["Size", "size"],
  ["Condition", "condition"],
  ["Comfort", "comfortScore"],
  ["Performance", "performanceRating"],
  ["Durability", "durabilityRating"],
] as const;

export function getShoeProfileCompletion(shoe: UserShoe) {
  const missing = profileFields
    .filter(([, field]) => {
      const value = shoe[field];
      return value === undefined || value === "";
    })
    .map(([label]) => label);

  return {
    completed: profileFields.length - missing.length,
    total: profileFields.length,
    missing,
    isComplete: missing.length === 0,
  };
}
