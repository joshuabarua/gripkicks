import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("fetchApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("should return data on successful response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: "test" }),
      headers: new Headers({ "content-type": "application/json" }),
    });

    const { fetchApi } = await import("@/lib/api-client");
    const result = await fetchApi<{ data: string }>("/api/test");

    expect(result.isOk()).toBe(true);
    result.match(
      (data) => expect(data).toEqual({ data: "test" }),
      () => expect.fail("Should not fail"),
    );
  });

  it("should throw AppError on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: "Not found" }),
      headers: new Headers({ "content-type": "application/json" }),
    });

    const { fetchApi } = await import("@/lib/api-client");
    const result = await fetchApi("/api/test");

    expect(result.isErr()).toBe(true);
    result.match(
      () => expect.fail("Should not succeed"),
      (error) => {
        expect(error.code).toBe("NOT_FOUND_ERROR");
        expect(error.category).toBe("not_found");
      },
    );
  });

  it("should handle network errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { fetchApi } = await import("@/lib/api-client");
    const result = await fetchApi("/api/test");

    expect(result.isErr()).toBe(true);
    result.match(
      () => expect.fail("Should not succeed"),
      (error) => {
        expect(error.category).toBe("network");
      },
    );
  });

  it("should map status codes to error types correctly", async () => {
    const statusCodes = [
      { status: 400, expectedCategory: "validation" },
      { status: 401, expectedCategory: "authentication" },
      { status: 403, expectedCategory: "authorization" },
      { status: 404, expectedCategory: "not_found" },
      { status: 500, expectedCategory: "server" },
    ];

    for (const { status, expectedCategory } of statusCodes) {
      vi.resetModules();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status,
        json: () => Promise.resolve({ message: "Error" }),
        headers: new Headers({ "content-type": "application/json" }),
      });

      const { fetchApi } = await import("@/lib/api-client");
      const result = await fetchApi("/api/test");

      result.match(
        () => expect.fail("Should not succeed"),
        (error) => {
          expect(error.category).toBe(expectedCategory);
        },
      );
    }
  });
});
