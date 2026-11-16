// Copied from packages/web/src/constants/shoe-sizes.ts (Metro does not bundle the web package).
export const SIZE_SYSTEMS = ["EU", "US", "UK"] as const;
export type SizeSystem = (typeof SIZE_SYSTEMS)[number];

const range = (from: number, to: number) =>
  Array.from({ length: Math.round((to - from) / 0.5) + 1 }, (_, i) => String(from + i * 0.5));

export const SIZES: Record<SizeSystem, string[]> = {
  EU: range(30, 50),
  US: range(3, 15),
  UK: range(2, 14.5),
};

export const SIZE_SYSTEM_STORAGE_KEY = "gripkicks.sizeSystem";

export interface ParsedSize {
  system: SizeSystem;
  size: string;
}

export function parseSize(value: string | null | undefined): ParsedSize | null {
  const text = value?.trim();
  if (!text) return null;
  const simple = text.match(/^(EU|US|UK)\s+(\d+(?:\.\d+)?)$/i);
  if (simple) return { system: simple[1]!.toUpperCase() as SizeSystem, size: simple[2]! };
  const legacyEu = text.match(/EU\s+(\d+(?:\.\d+)?)/i);
  if (legacyEu) return { system: "EU", size: legacyEu[1]! };
  return null;
}

export function sizeValue(system: SizeSystem, size: string) {
  return `${system} ${size}`;
}

export function formatSize(value: string | null | undefined) {
  const parsed = parseSize(value);
  return parsed ? sizeValue(parsed.system, parsed.size) : value?.trim() || "";
}
