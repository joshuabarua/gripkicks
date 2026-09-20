import type { Shoe, UserShoe } from "@/types/api";
import { shoeVariantPatterns, unisexVariantPattern } from "convex/utils/shoeVariants";

const variantPatterns = [...shoeVariantPatterns, unisexVariantPattern];

function uniqueLabels(labels: string[]) {
  return Array.from(new Set(labels));
}

function cleanupBaseName(name: string) {
  return name
    .replace(/[()]/g, " ")
    .replace(/\s+-\s+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function getBaseShoeName(name: string) {
  let baseName = name;

  for (const { pattern } of variantPatterns) {
    baseName = baseName.replace(pattern, " ");
  }

  return cleanupBaseName(baseName) || cleanupBaseName(name);
}

function getVariantLabels(name: string, gender?: string | null) {
  const labels: string[] = [];

  for (const { testPattern, label } of variantPatterns) {
    if (testPattern.test(name)) {
      labels.push(label);
    }
  }

  const normalizedGender = gender?.toLowerCase();
  if (normalizedGender === "women") labels.push("Women");
  if (normalizedGender === "men") labels.push("Men");
  if (normalizedGender === "kids") labels.push("Kids");
  if (normalizedGender === "unisex") labels.push("Unisex");

  const unique = uniqueLabels(labels);
  // Only remove Unisex if there are other labels
  if (unique.length > 1 && unique.includes("Unisex")) {
    return unique.filter((label) => label !== "Unisex");
  }
  return unique;
}

function getVariantLabel(name: string, gender?: string | null) {
  const labels = getVariantLabels(name, gender);
  return labels.length > 0 ? labels.join(" ") : null;
}


type UserShoeLike = Pick<UserShoe, "_id" | "shoe" | "shoeDetails">;
type ShoeLike = Pick<
  Shoe,
  "_id" | "name" | "brand" | "modelName" | "variantLabel" | "gender" | "imageUrl" | "slug"
>;

type ShoeVariantSource = {
  name: string;
  brand: string;
  modelName?: string | undefined;
  gender?: string | null | undefined;
  variantLabel?: string | undefined;
};

function getStoredModelName(details: Pick<ShoeVariantSource, "name" | "modelName">) {
  return details.modelName?.trim() || getBaseShoeName(details.name);
}

function getStoredVariantLabel(details: Pick<ShoeVariantSource, "name" | "gender" | "variantLabel">) {
  return details.variantLabel?.trim() || getVariantLabel(details.name, details.gender);
}

interface GroupedVariant<T> {
  item: T;
  variantLabel: string | null;
}

export interface ShoeVariantGroup<T> {
  brand: string;
  baseName: string;
  groupKey: string;
  variants: GroupedVariant<T>[];
}

function groupShoesByModelHelper<T>(
  items: T[],
  getSource: (item: T) => ShoeVariantSource | null,
): Map<string, ShoeVariantGroup<T>> {
  const grouped = new Map<string, ShoeVariantGroup<T>>();

  for (const item of items) {
    const source = getSource(item);
    if (!source) continue;

    const brandName = source.brand || "Unknown";
    const modelName = getStoredModelName(source);
    const groupKey = `${brandName.toLowerCase()}::${modelName.toLowerCase()}`;
    const variant = {
      item,
      variantLabel: getStoredVariantLabel(source),
    };

    addVariantToGroup(grouped, groupKey, brandName, modelName, variant);
  }

  return grouped;
}

export function groupUserShoesByModel<T extends UserShoeLike>(userShoes: T[]) {
  return groupShoesByModelHelper(userShoes, (item) => {
    const details = item.shoe ?? item.shoeDetails;
    return details as ShoeVariantSource;
  });
}

export function groupShoesByModel<T extends ShoeLike>(shoes: T[]) {
  return groupShoesByModelHelper(shoes, (item) => item as ShoeVariantSource);
}

function addVariantToGroup<T>(
  grouped: Map<string, ShoeVariantGroup<T>>,
  groupKey: string,
  brandName: string,
  modelName: string,
  variant: GroupedVariant<T>
) {
  const existing = grouped.get(groupKey);

  if (existing) {
    existing.variants.push(variant);
    return;
  }

  grouped.set(groupKey, {
    brand: brandName,
    baseName: modelName,
    groupKey,
    variants: [variant],
  });
}

