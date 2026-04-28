import type { Shoe, UserShoe } from "@/types/api";

const variantPatterns = [
  { pattern: /\blow\s*volume\b/gi, testPattern: /\blow\s*volume\b/i, label: "LV" },
  { pattern: /\blv\b/gi, testPattern: /\blv\b/i, label: "LV" },
  { pattern: /\bhigh\s*volume\b/gi, testPattern: /\bhigh\s*volume\b/i, label: "HV" },
  { pattern: /\bhv\b/gi, testPattern: /\bhv\b/i, label: "HV" },
  { pattern: /\bmid\s*volume\b/gi, testPattern: /\bmid\s*volume\b/i, label: "MV" },
  { pattern: /\bmv\b/gi, testPattern: /\bmv\b/i, label: "MV" },
  { pattern: /\bwomen'?s\b/gi, testPattern: /\bwomen'?s\b/i, label: "Women" },
  { pattern: /\bwomens\b/gi, testPattern: /\bwomens\b/i, label: "Women" },
  { pattern: /\bwomen\b/gi, testPattern: /\bwomen\b/i, label: "Women" },
  { pattern: /\bmen'?s\b/gi, testPattern: /\bmen'?s\b/i, label: "Men" },
  { pattern: /\bmens\b/gi, testPattern: /\bmens\b/i, label: "Men" },
  { pattern: /\bmen\b/gi, testPattern: /\bmen\b/i, label: "Men" },
  { pattern: /\bkids\b/gi, testPattern: /\bkids\b/i, label: "Kids" },
  { pattern: /\bkid\b/gi, testPattern: /\bkid\b/i, label: "Kids" },
  { pattern: /\byouth\b/gi, testPattern: /\byouth\b/i, label: "Kids" },
  { pattern: /\bjunior\b/gi, testPattern: /\bjunior\b/i, label: "Kids" },
  { pattern: /\bjr\b/gi, testPattern: /\bjr\b/i, label: "Kids" },
  { pattern: /\bunisex\b/gi, testPattern: /\bunisex\b/i, label: "Unisex" },
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
    const details = (item as any).shoe ?? (item as any).shoeDetails;
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

function sortGroupedVariants<T>(grouped: Map<string, ShoeVariantGroup<T>>) {
  return Array.from(grouped.values()).map((group) => ({
    ...group,
    variants: [...group.variants].sort((a, b) => {
      const left = a.variantLabel ?? "";
      const right = b.variantLabel ?? "";
      return left.localeCompare(right);
    }),
  }));
}
