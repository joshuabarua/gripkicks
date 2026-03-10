import { describe, it, expect, vi, beforeEach } from "vitest";
import { ok } from "neverthrow";

const mockFetchApi = vi.fn();

vi.mock("@/lib/api-client", () => ({
  fetchApi: mockFetchApi,
}));

const mockFetchSuccess = <T>(data: T): void => {
  mockFetchApi.mockReturnValue(ok(data));
};

describe("stash service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserStash", () => {
    it("fetches user stash successfully", async () => {
      const mockStash = [
        { _id: "us_1", shoeId: "shoe_1", comfortScore: 8 },
        { _id: "us_2", shoeId: "shoe_2", comfortScore: 7 },
      ];

      mockFetchSuccess(mockStash);

      const { getUserStash } = await import("@/services/stash");
      const result = await getUserStash();

      expect(result.isOk()).toBe(true);
      result.match(
        (data) => {
          expect(data).toHaveLength(2);
        },
        () => {
          expect.fail("Should not fail");
        },
      );
    });
  });

  describe("addShoeToStash", () => {
    it("adds a shoe to stash", async () => {
      const mockResponse = { userShoeId: "us_new" };

      mockFetchSuccess(mockResponse);

      const { addShoeToStash } = await import("@/services/stash");
      const result = await addShoeToStash("shoe_123");

      expect(result.isOk()).toBe(true);
      result.match(
        (data) => {
          expect(data.userShoeId).toBe("us_new");
        },
        () => {
          expect.fail("Should not fail");
        },
      );
    });
  });

  describe("removeShoeFromStash", () => {
    it("removes a shoe from stash", async () => {
      const mockResponse = null;

      mockFetchSuccess(mockResponse);

      const { removeShoeFromStash } = await import("@/services/stash");
      const result = await removeShoeFromStash("us_123");

      expect(result.isOk()).toBe(true);
    });
  });

  describe("toggleFavouriteInStash", () => {
    it("toggles favourite status", async () => {
      const mockResponse = {
        _id: "us_123",
        isFavourite: true,
      };

      mockFetchSuccess(mockResponse);

      const { toggleFavouriteInStash } = await import("@/services/stash");
      const result = await toggleFavouriteInStash("us_123");

      expect(result.isOk()).toBe(true);
      result.match(
        (data) => {
          expect(data.isFavourite).toBe(true);
        },
        () => {
          expect.fail("Should not fail");
        },
      );
    });
  });

  describe("updateShoeInStash", () => {
    it("updates shoe data in stash", async () => {
      const mockResponse = {
        _id: "us_123",
        comfortScore: 9,
        performanceRating: 8,
      };

      mockFetchSuccess(mockResponse);

      const { updateShoeInStash } = await import("@/services/stash");
      const result = await updateShoeInStash("us_123", {
        comfortScore: 9,
        performanceRating: 8,
      });

      expect(result.isOk()).toBe(true);
      result.match(
        (data) => {
          expect(data.comfortScore).toBe(9);
        },
        () => {
          expect.fail("Should not fail");
        },
      );
    });
  });
});
