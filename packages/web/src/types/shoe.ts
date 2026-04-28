import type { Doc } from "convex/_generated/dataModel";

export type { ShoeRecommendation } from "../../../../types/shoe";

export type Shoe = Doc<"shoes"> & {
  rubberTechnology?: {
    brand: string;
    compound: string;
    stickiness: string;
    durability: string;
  } | null;
};
