export const shoeVariantPatterns = [
  { pattern: /\blow\s*volume\b/gi, testPattern: /\blow\s*volume\b/i, label: "LV" },
  { pattern: /\blv\b/gi, testPattern: /\blv\b/i, label: "LV" },
  { pattern: /\bhigh\s*volume\b/gi, testPattern: /\bhigh\s*volume\b/i, label: "HV" },
  { pattern: /\bhv\b/gi, testPattern: /\bhv\b/i, label: "HV" },
  { pattern: /\bmid\s*volume\b/gi, testPattern: /\bmid\s*volume\b/i, label: "MV" },
  { pattern: /\bmv\b/gi, testPattern: /\bmv\b/i, label: "MV" },
  { pattern: /\bwomen'?s\b/gi, testPattern: /\bwomen'?s\b/i, label: "Women" },
  { pattern: /\bwomens\b/gi, testPattern: /\bwomens\b/i, label: "Women" },
  { pattern: /\bwomen\b/gi, testPattern: /\bwomen\b/i, label: "Women" },
  { pattern: /\bw\b$/gi, testPattern: /\bw\b$/i, label: "Women" },
  { pattern: /\bmen'?s\b/gi, testPattern: /\bmen'?s\b/i, label: "Men" },
  { pattern: /\bmens\b/gi, testPattern: /\bmens\b/i, label: "Men" },
  { pattern: /\bmen\b/gi, testPattern: /\bmen\b/i, label: "Men" },
  { pattern: /\bm\b$/gi, testPattern: /\bm\b$/i, label: "Men" },
  { pattern: /\bkids\b/gi, testPattern: /\bkids\b/i, label: "Kids" },
  { pattern: /\bkid\b/gi, testPattern: /\bkid\b/i, label: "Kids" },
  { pattern: /\byouth\b/gi, testPattern: /\byouth\b/i, label: "Kids" },
  { pattern: /\bjunior\b/gi, testPattern: /\bjunior\b/i, label: "Kids" },
  { pattern: /\bjr\b/gi, testPattern: /\bjr\b/i, label: "Kids" },
] as const;

export const unisexVariantPattern = {
  pattern: /\bunisex\b/gi,
  testPattern: /\bunisex\b/i,
  label: "Unisex",
} as const;
