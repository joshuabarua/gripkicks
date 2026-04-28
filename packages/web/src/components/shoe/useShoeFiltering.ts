import { useMemo } from "react";
import type { Doc } from "convex/_generated/dataModel";

type Shoe = Doc<"shoes">;

interface GridPosition {
  x: number;
  y: number;
}

interface ShoePosition {
  shoe: Shoe;
  position: GridPosition;
  quadrant: string;
}

export function useShoeFiltering({
  shoes,
  calculateShoePosition,
  getQuadrant,
  searchQuery,
  selectedQuadrantFilter,
}: {
  shoes: Shoe[] | null | undefined;
  calculateShoePosition: (shoe: Shoe) => GridPosition;
  getQuadrant: (position: GridPosition) => string;
  searchQuery: string;
  selectedQuadrantFilter: string;
}) {
  return useMemo(() => {
    if (!shoes) return [];

    let filteredShoes = shoes;

    if (searchQuery.trim()) {
      filteredShoes = filteredShoes.filter(
        (shoe) =>
          shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shoe.brand.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedQuadrantFilter !== "all") {
      filteredShoes = filteredShoes.filter((shoe) => {
        const position = calculateShoePosition(shoe);
        return getQuadrant(position) === selectedQuadrantFilter;
      });
    }

    return filteredShoes.map((shoe) => ({
      shoe,
      position: calculateShoePosition(shoe),
      quadrant: getQuadrant(calculateShoePosition(shoe)),
    }));
  }, [shoes, calculateShoePosition, getQuadrant, searchQuery, selectedQuadrantFilter]);
}

export function getShoesInQuadrant(shoePositions: ShoePosition[], quadrant: string) {
  return shoePositions.filter((item) => item.quadrant === quadrant);
}
