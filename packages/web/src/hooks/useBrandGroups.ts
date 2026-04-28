import { useMemo } from "react";
import type { UserShoe } from "@/types/api";
import { groupUserShoesByModel } from "@/utils/shoeVariants";

export function useBrandGroups(userShoes: UserShoe[]) {
  return useMemo(() => {
    const grouped = userShoes.reduce(
      (acc: Record<string, UserShoe[]>, shoe) => {
        const fallbackBrand = (shoe as Partial<UserShoe> & { brand?: string })
          .brand;
        const brand =
          shoe?.shoe?.brand ??
          shoe?.shoeDetails?.brand ??
          fallbackBrand ??
          "Unknown";
        if (!acc[brand]) acc[brand] = [];
        acc[brand].push(shoe);
        return acc;
      },
      {} as Record<string, UserShoe[]>,
    );

    return Object.entries(grouped)
      .map(([brand, shoes]) => ({
        brand,
        models: Array.from(groupUserShoesByModel(shoes).values()),
      }))
      .sort((a, b) => a.brand.localeCompare(b.brand));
  }, [userShoes]);
}
