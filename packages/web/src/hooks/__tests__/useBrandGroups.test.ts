import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBrandGroups } from "@/hooks/useBrandGroups";
import type { UserShoe } from "@/types/api";

const createMockUserShoe = (brand: string, id: string): UserShoe =>
  ({
    _id: id,
    shoeId: `shoe_${id}`,
    shoe: {
      _id: `shoe_${id}`,
      name: `Test Shoe ${id}`,
      brand,
    },
  }) as UserShoe;

describe("useBrandGroups", () => {
  it("returns empty array when no shoes", () => {
    const { result } = renderHook(() => useBrandGroups([]));

    expect(result.current).toEqual([]);
  });

  it("groups shoes by brand", () => {
    const userShoes: UserShoe[] = [
      createMockUserShoe("La Sportiva", "1"),
      createMockUserShoe("La Sportiva", "2"),
      createMockUserShoe("Scarpa", "3"),
      createMockUserShoe("Five Ten", "4"),
    ];

    const { result } = renderHook(() => useBrandGroups(userShoes));

    expect(result.current).toHaveLength(3);

    const laSportivaGroup = result.current.find(
      (g) => g.brand === "La Sportiva",
    );
    expect(laSportivaGroup?.models).toHaveLength(2);

    const scarpaGroup = result.current.find((g) => g.brand === "Scarpa");
    expect(scarpaGroup?.models).toHaveLength(1);

    const fiveTenGroup = result.current.find((g) => g.brand === "Five Ten");
    expect(fiveTenGroup?.models).toHaveLength(1);
  });

  it("handles shoes without brand gracefully", () => {
    const userShoes = [
      { _id: "1", shoeId: "shoe_1" },
      { _id: "2", shoeId: "shoe_2", shoe: { _id: "shoe_2", name: "No Brand" } },
    ] as UserShoe[];

    const { result } = renderHook(() => useBrandGroups(userShoes));

    const unknownGroup = result.current.find((g) => g.brand === "Unknown");
    expect(unknownGroup?.models).toHaveLength(1);
  });

  it("memoizes results", () => {
    const userShoes: UserShoe[] = [createMockUserShoe("La Sportiva", "1")];

    const { result, rerender } = renderHook(
      ({ shoes }) => useBrandGroups(shoes),
      {
        initialProps: { shoes: userShoes },
      },
    );

    const firstResult = result.current;

    rerender({ shoes: userShoes });

    expect(result.current).toBe(firstResult);
  });

  it("updates when shoes change", () => {
    const initialShoes: UserShoe[] = [createMockUserShoe("La Sportiva", "1")];

    const { result, rerender } = renderHook(
      ({ shoes }) => useBrandGroups(shoes),
      {
        initialProps: { shoes: initialShoes },
      },
    );

    expect(result.current).toHaveLength(1);

    const updatedShoes: UserShoe[] = [
      ...initialShoes,
      createMockUserShoe("Scarpa", "2"),
    ];

    rerender({ shoes: updatedShoes });

    expect(result.current).toHaveLength(2);
  });
});
