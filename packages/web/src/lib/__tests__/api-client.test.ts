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

  it("should unwrap success envelopes", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { userShoeId: "us_123" } }),
      headers: new Headers({ "content-type": "application/json" }),
    });

    const { fetchApi } = await import("@/lib/api-client");
    const result = await fetchApi<{ userShoeId: string }>("/api/test");

    expect(result.isOk()).toBe(true);
    result.match(
      (data) => expect(data).toEqual({ userShoeId: "us_123" }),
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

  it("should dedupe concurrent identical requests", async () => {
    let resolveFetch:
      | ((value: {
        ok: boolean;
        json: () => Promise<{ data: string }>;
        headers: Headers;
      }) => void)
      | undefined;

    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const { fetchApi } = await import("@/lib/api-client");

    const first = fetchApi<{ data: string }>("/api/test");
    const second = fetchApi<{ data: string }>("/api/test");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);

    resolveFetch?.({
      ok: true,
      json: () => Promise.resolve({ data: "deduped" }),
      headers: new Headers({ "content-type": "application/json" }),
    });

    const firstResult = await first;
    const secondResult = await second;

    expect(firstResult.isOk()).toBe(true);
    expect(secondResult.isOk()).toBe(true);
    firstResult.match(
      (data) => expect(data).toEqual({ data: "deduped" }),
      () => expect.fail("Should not fail"),
    );
  });
});
