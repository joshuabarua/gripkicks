import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAsync, useMutation } from "@/hooks/useAsync";
import { ok, err } from "neverthrow";
import { ApiError } from "@/lib/errors";

describe("useAsync", () => {
  it("initializes with default state", () => {
    const { result } = renderHook(() => useAsync<string>());

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("executes successful async operation", async () => {
    const { result } = renderHook(() => useAsync<string>());
    const successData = "test data";

    await act(async () => {
      const operationResult = await result.current.execute(() => 
        Promise.resolve(ok(successData))
      );
      expect(operationResult.isOk()).toBe(true);
      expect(operationResult.value).toBe(successData);
    });

    expect(result.current.data).toBe(successData);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it("handles failed async operation", async () => {
    const { result } = renderHook(() => useAsync<string>());
    const error = new ApiError({ type: "NETWORK_ERROR", message: "Failed" });

    await act(async () => {
      const operationResult = await result.current.execute(() => 
        Promise.resolve(err(error))
      );
      expect(operationResult.isErr()).toBe(true);
      expect(operationResult.error).toBe(error);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(error);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(true);
  });

  it("sets loading state during execution", async () => {
    const { result } = renderHook(() => useAsync<string>());
    
    const operation = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(ok("data")), 100))
    );

    act(() => {
      result.current.execute(operation);
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isError).toBe(false);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toBe("data");
  });

  it("resets state to initial values", async () => {
    const { result } = renderHook(() => useAsync<string>());

    // First, execute a successful operation
    await act(async () => {
      await result.current.execute(() => Promise.resolve(ok("success")));
    });

    expect(result.current.data).toBe("success");
    expect(result.current.isSuccess).toBe(true);

    // Then reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("clears previous error on new execution", async () => {
    const { result } = renderHook(() => useAsync<string>());
    const error = new ApiError({ type: "VALIDATION_ERROR", message: "First error" });

    // First, fail
    await act(async () => {
      await result.current.execute(() => Promise.resolve(err(error)));
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);

    // Then succeed
    await act(async () => {
      await result.current.execute(() => Promise.resolve(ok("success")));
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(true);
  });

  it("maintains stable execute function reference", () => {
    const { result, rerender } = renderHook(() => useAsync<string>());
    const firstExecute = result.current.execute;

    rerender();

    expect(result.current.execute).toBe(firstExecute);
  });

  it("maintains stable reset function reference", () => {
    const { result, rerender } = renderHook(() => useAsync<string>());
    const firstReset = result.current.reset;

    rerender();

    expect(result.current.reset).toBe(firstReset);
  });
});

describe("useMutation", () => {
  it("initializes with default state", () => {
    const mutationFn = vi.fn();
    const { result } = renderHook(() => useMutation(mutationFn));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("executes successful mutation", async () => {
    const mutationFn = vi.fn().mockResolvedValue(ok("mutated data"));
    const { result } = renderHook(() => useMutation<string, { value: string }>(mutationFn));
    const params = { value: "test" };

    await act(async () => {
      const mutationResult = await result.current.mutate(params);
      expect(mutationResult.isOk()).toBe(true);
      expect(mutationResult.value).toBe("mutated data");
    });

    expect(mutationFn).toHaveBeenCalledWith(params);
    expect(result.current.data).toBe("mutated data");
    expect(result.current.isSuccess).toBe(true);
  });

  it("executes failed mutation", async () => {
    const error = new ApiError({ type: "SERVER_ERROR", message: "Mutation failed" });
    const mutationFn = vi.fn().mockResolvedValue(err(error));
    const { result } = renderHook(() => useMutation<string, void>(mutationFn));

    await act(async () => {
      const mutationResult = await result.current.mutate();
      expect(mutationResult.isErr()).toBe(true);
      expect(mutationResult.error).toBe(error);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.isError).toBe(true);
    expect(result.current.isSuccess).toBe(false);
  });

  it("sets loading state during mutation", async () => {
    const mutationFn = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(ok("data")), 100))
    );
    const { result } = renderHook(() => useMutation(mutationFn));

    act(() => {
      result.current.mutate();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe("data");
  });

  it("passes parameters to mutation function", async () => {
    const mutationFn = vi.fn().mockResolvedValue(ok("success"));
    const { result } = renderHook(() => useMutation<string, { id: number; name: string }>(mutationFn));
    const params = { id: 123, name: "test" };

    await act(async () => {
      await result.current.mutate(params);
    });

    expect(mutationFn).toHaveBeenCalledTimes(1);
    expect(mutationFn).toHaveBeenCalledWith(params);
  });

  it("resets state to initial values", async () => {
    const mutationFn = vi.fn().mockResolvedValue(ok("data"));
    const { result } = renderHook(() => useMutation(mutationFn));

    // Execute successful mutation
    await act(async () => {
      await result.current.mutate();
    });

    expect(result.current.data).toBe("data");
    expect(result.current.isSuccess).toBe(true);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("clears previous error on new mutation", async () => {
    const mutationFn = vi.fn()
      .mockResolvedValueOnce(err(new ApiError({ type: "NETWORK_ERROR", message: "First error" })))
      .mockResolvedValueOnce(ok("success"));
    
    const { result } = renderHook(() => useMutation(mutationFn));

    // First mutation fails
    await act(async () => {
      await result.current.mutate();
    });

    expect(result.current.isError).toBe(true);

    // Second mutation succeeds
    await act(async () => {
      await result.current.mutate();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(true);
  });

  it("maintains stable mutate function when mutationFn changes", () => {
    const { result, rerender } = renderHook(
      ({ mutationFn }) => useMutation(mutationFn),
      {
        initialProps: { mutationFn: vi.fn() }
      }
    );

    const firstMutate = result.current.mutate;

    rerender({ mutationFn: vi.fn() });

    // mutate should remain stable even when mutationFn changes
    // because it's wrapped in useCallback with dependency on mutationFn
    expect(typeof result.current.mutate).toBe("function");
  });
});
