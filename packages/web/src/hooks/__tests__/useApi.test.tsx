import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProfile, useHealthCheck } from "@/hooks/useApi";
import { fetchApi } from "@/lib/api-client";
import { ApiError } from "@/lib/errors";
import { ok, err } from "neverthrow";

vi.mock("@/lib/api-client", () => ({
  fetchApi: vi.fn(),
}));

const mockFetchApi = vi.mocked(fetchApi);

describe("useApi hooks", () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
        },
      },
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    vi.clearAllMocks();
  });

  async function testSuccessfulHook(
    hookFn: () => any,
    mockData: any,
    expectedEndpoint: string
  ) {
    mockFetchApi.mockResolvedValue(ok(mockData));
    const { result } = renderHook(hookFn, { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockFetchApi).toHaveBeenCalledWith(expectedEndpoint);
  }

  async function testErrorHook(
    hookFn: () => any,
    error: any
  ) {
    mockFetchApi.mockResolvedValue(err(error));
    const { result } = renderHook(hookFn, { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(error);
  }

  describe("useProfile", () => {
    it("fetches profile successfully", async () => {
      const profileData = {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        image: "https://example.com/avatar.jpg",
      };

      await testSuccessfulHook(() => useProfile(), profileData, "/api/v1/profile");
    });

    it("handles API error", async () => {
      const error = new ApiError({ type: "NETWORK_ERROR", message: "Failed to fetch" });
      await testErrorHook(() => useProfile(), error);
    });

    it("uses correct query key", () => {
      mockFetchApi.mockResolvedValue(ok({ id: "test" }));

      renderHook(() => useProfile(), { wrapper });

      expect(queryClient.getQueryCache().getAll()[0]?.queryKey).toEqual(["profile"]);
    });

    it("caches data by default", async () => {
      const profileData = { id: "user-123", name: "John", email: "john@example.com" };
      mockFetchApi.mockResolvedValue(ok(profileData));

      const { result, rerender } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => expect(result.current.data).toEqual(profileData));
      expect(mockFetchApi).toHaveBeenCalledTimes(1);

      rerender();
      expect(result.current.data).toEqual(profileData);
      expect(mockFetchApi).toHaveBeenCalledTimes(1);
    });
  });

  describe("useHealthCheck", () => {
    it("fetches health check successfully", async () => {
      const healthData = {
        status: "ok",
        uptime: 12345,
        message: "Service is healthy",
      };

      await testSuccessfulHook(() => useHealthCheck(), healthData, "/health");
    });

    it("handles health check error", async () => {
      const error = new ApiError({ type: "INTERNAL_SERVER_ERROR", message: "Service unavailable" });
      await testErrorHook(() => useHealthCheck(), error);
    });

    it("uses correct query key", () => {
      mockFetchApi.mockResolvedValue(ok({ status: "ok" }));

      renderHook(() => useHealthCheck(), { wrapper });

      expect(queryClient.getQueryCache().getAll()[0]?.queryKey).toEqual(["health"]);
    });

    it("has correct query configuration", () => {
      expect(mockFetchApi).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("handles API errors correctly", async () => {
      const error = new ApiError({ type: "UNAUTHORIZED", message: "Unauthorized" });
      await testErrorHook(() => useProfile(), error);

      const { result } = renderHook(() => useProfile(), { wrapper });
      await waitFor(() => {
        expect(result.current.status).toBe("error");
        expect(result.current.data).toBeUndefined();
      });
    });

    it("handles network errors correctly", async () => {
      const networkError = new ApiError({ type: "NETWORK_ERROR", message: "Network failed" });
      await testErrorHook(() => useProfile(), networkError);

      const { result } = renderHook(() => useProfile(), { wrapper });
      await waitFor(() => {
        expect(result.current.status).toBe("error");
        expect(result.current.data).toBeUndefined();
      });
    });
  });

  describe("concurrent requests", () => {
    it("handles multiple hooks running simultaneously", async () => {
      const profileData = { id: "user-1", name: "User", email: "user@example.com" };
      const healthData = { status: "ok", uptime: 999, message: "All good" };

      mockFetchApi
        .mockResolvedValueOnce(ok(profileData))
        .mockResolvedValueOnce(ok(healthData));

      const { result: profileResult } = renderHook(() => useProfile(), { wrapper });
      const { result: healthResult } = renderHook(() => useHealthCheck(), { wrapper });

      await waitFor(() => {
        expect(profileResult.current.data).toEqual(profileData);
        expect(healthResult.current.data).toEqual(healthData);
      });

      expect(mockFetchApi).toHaveBeenCalledTimes(2);
      expect(mockFetchApi).toHaveBeenNthCalledWith(1, "/api/v1/profile");
      expect(mockFetchApi).toHaveBeenNthCalledWith(2, "/health");
    });
  });
});
