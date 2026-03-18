import type { Shoe, UserShoe } from "@/types/api";

const variantPatterns = [
  { pattern: /\blow\s*volume\b/gi, label: "LV" },
  { pattern: /\blv\b/gi, label: "LV" },
  { pattern: /\bhigh\s*volume\b/gi, label: "HV" },
  { pattern: /\bhv\b/gi, label: "HV" },
  { pattern: /\bmid\s*volume\b/gi, label: "MV" },
  { pattern: /\bmv\b/gi, label: "MV" },
  { pattern: /\bwomen'?s\b/gi, label: "Women" },
  { pattern: /\bwomens\b/gi, label: "Women" },
  { pattern: /\bwomen\b/gi, label: "Women" },
  { pattern: /\bmen'?s\b/gi, label: "Men" },
  { pattern: /\bmens\b/gi, label: "Men" },
  { pattern: /\bmen\b/gi, label: "Men" },
  { pattern: /\bkids\b/gi, label: "Kids" },
  { pattern: /\bkid\b/gi, label: "Kids" },
  { pattern: /\byouth\b/gi, label: "Kids" },
  { pattern: /\bjunior\b/gi, label: "Kids" },
  { pattern: /\bjr\b/gi, label: "Kids" },
  { pattern: /\bunisex\b/gi, label: "Unisex" },
] as const;

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

export function getBaseShoeName(name: string) {
  let baseName = name;

  for (const { pattern } of variantPatterns) {
    baseName = baseName.replace(pattern, " ");
  }

  return cleanupBaseName(baseName) || cleanupBaseName(name);
}

export function getVariantLabels(name: string, gender?: string | null) {
  const labels: string[] = [];

  for (const { pattern, label } of variantPatterns) {
    if (pattern.test(name)) {
      labels.push(label);
    }
  }

  const normalizedGender = gender?.toLowerCase();
  if (normalizedGender === "women") labels.push("Women");
  if (normalizedGender === "men") labels.push("Men");
  if (normalizedGender === "kids") labels.push("Kids");
  if (normalizedGender === "unisex") labels.push("Unisex");

  return uniqueLabels(labels).filter((label) => label !== "Unisex");
}

export function getVariantLabel(name: string, gender?: string | null) {
  const labels = getVariantLabels(name, gender);
  return labels.length > 0 ? labels.join(" ") : null;
}

export function getShoeGroupKey(brand: string, name: string) {
  return `${brand.toLowerCase()}::${getBaseShoeName(name).toLowerCase()}`;
}

type UserShoeLike = Pick<UserShoe, "_id" | "shoe" | "shoeDetails">;
type ShoeLike = Pick<
  Shoe,
  "_id" | "name" | "brand" | "modelName" | "variantLabel" | "gender" | "imageUrl" | "slug"
>;

function getStoredModelName(details: { name: string; modelName?: string }) {
  return details.modelName?.trim() || getBaseShoeName(details.name);
}

function getStoredVariantLabel(details: {
  name: string;
  gender?: string | null;
  variantLabel?: string;
}) {
  return details.variantLabel?.trim() || getVariantLabel(details.name, details.gender);
}

export interface GroupedVariant<T> {
  item: T;
  variantLabel: string | null;
}

export interface ShoeVariantGroup<T> {
  brand: string;
  baseName: string;
  groupKey: string;
  variants: GroupedVariant<T>[];
}

export function groupUserShoesByModel<T extends UserShoeLike>(userShoes: T[]) {
  const grouped = new Map<string, ShoeVariantGroup<T>>();

  for (const item of userShoes) {
    const details = item.shoe ?? item.shoeDetails;
    if (!details) continue;

    const modelName = getStoredModelName(details);
    const brandName = details.brand || "Unknown";
    const groupKey = `${brandName.toLowerCase()}::${modelName.toLowerCase()}`;
    const existing = grouped.get(groupKey);
    const variant = {
      item,
      variantLabel: getStoredVariantLabel(details),
    };

    if (existing) {
      existing.variants.push(variant);
      continue;
    }

    grouped.set(groupKey, {
      brand: details.brand,
      baseName: modelName,
      groupKey,
      variants: [variant],
    });
  }

  return Array.from(grouped.values()).map((group) => ({
    ...group,
    variants: [...group.variants].sort((a, b) => {
      const left = a.variantLabel ?? "";
      const right = b.variantLabel ?? "";
      return left.localeCompare(right);
    }),
  }));
}

export function groupShoesByModel<T extends ShoeLike>(shoes: T[]) {
  const grouped = new Map<string, ShoeVariantGroup<T>>();

  for (const item of shoes) {
    const modelName = getStoredModelName(item);
    const brandName = item.brand || "Unknown";
    const groupKey = `${brandName.toLowerCase()}::${modelName.toLowerCase()}`;
    const existing = grouped.get(groupKey);
    const variant = {
      item,
      variantLabel: getStoredVariantLabel(item),
    };

    if (existing) {
      existing.variants.push(variant);
      continue;
    }

    grouped.set(groupKey, {
      brand: item.brand,
      baseName: modelName,
      groupKey,
      variants: [variant],
    });
  }

  return Array.from(grouped.values()).map((group) => ({
    ...group,
    variants: [...group.variants].sort((a, b) => {
      const left = a.variantLabel ?? "";
      const right = b.variantLabel ?? "";
      return left.localeCompare(right);
    }),
  }));
}
