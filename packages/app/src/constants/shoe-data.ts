// Condition options copied from packages/web/src/constants/shoe-data.ts (Metro does not bundle the web package).
// Sizes live in ./shoe-sizes.ts.
export const conditions = [
  { value: 'New', label: 'New: Never worn' },
  { value: 'Like New', label: 'Like New: Worn once or twice' },
  { value: 'Good', label: 'Good: Light wear, good condition' },
  { value: 'Fair', label: 'Fair: Moderate wear, still functional' },
  { value: 'Worn', label: 'Worn: Heavy wear but usable' },
  { value: 'Retired', label: 'Retired: No longer in use' },
] as const;
