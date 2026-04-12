import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AppError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ServerError,
  TimeoutError,
  ApiError,
  ErrorFactory,
  ResultUtils,
  type ErrorDetails,
  type ErrorCategory,
  type ApiErrorType,
} from "@/lib/errors";
import { err, ok } from "neverthrow";

describe("AppError", () => {
  it("creates error with all required properties", () => {
    const details: ErrorDetails = {
      code: "TEST_ERROR",
      message: "Test error message",
      userMessage: "User-friendly message",
      severity: "medium",
      category: "network",
      retryable: true,
    };

    const error = new AppError(details);

    expect(error.name).toBe("AppError");
    expect(error.code).toBe("TEST_ERROR");
    expect(error.message).toBe("Test error message");
    expect(error.userMessage).toBe("User-friendly message");
    expect(error.severity).toBe("medium");
    expect(error.category).toBe("network");
    expect(error.retryable).toBe(true);
    expect(error.type).toBe("NETWORK_ERROR");
  });

  it("includes optional action and context", () => {
    const action = { label: "Retry", handler: vi.fn() };
    const context = { url: "https://example.com" };

    const error = new AppError({
      code: "TEST_ERROR",
      message: "Test",
      userMessage: "User message",
      severity: "low",
      category: "validation",
      retryable: false,
      action,
      context,
    });

    expect(error.action).toEqual(action);
    expect(error.context).toEqual(context);
  });

  it("converts to ErrorDetails", () => {
    const originalDetails: ErrorDetails = {
      code: "TEST_ERROR",
      message: "Test",
      userMessage: "User message",
      severity: "high",
      category: "server",
      retryable: true,
      context: { key: "value" },
    };

    const error = new AppError(originalDetails);
    const converted = error.toDetails();

    expect(converted).toEqual(originalDetails);
  });

  it("maps categories to types correctly", () => {
    const testCases: [ErrorCategory, ApiErrorType][] = [
      ["network", "NETWORK_ERROR"],
      ["authentication", "UNAUTHENTICATED"],
      ["authorization", "UNAUTHORIZED"],
      ["validation", "VALIDATION_ERROR"],
      ["not_found", "NOT_FOUND"],
      ["server", "INTERNAL_SERVER_ERROR"],
      ["unknown", "UNEXPECTED_ERROR"],
    ];

    testCases.forEach(([category, expectedType]) => {
      const error = new AppError({
        code: "TEST",
        message: "Test",
        userMessage: "Test",
        severity: "low",
        category,
        retryable: false,
      });

      expect(error.type).toBe(expectedType);
    });
  });
});

describe("Specific Error Classes", () => {
  describe("NetworkError", () => {
    it("creates with default values", () => {
      const error = new NetworkError();

      expect(error.code).toBe("NETWORK_ERROR");
      expect(error.category).toBe("network");
      expect(error.severity).toBe("medium");
      expect(error.retryable).toBe(true);
      expect(error.userMessage).toContain("internet connection");
    });

    it("accepts custom message and context", () => {
      const context = { url: "https://api.example.com" };
      const error = new NetworkError("Custom network error", context);

      expect(error.message).toBe("Custom network error");
      expect(error.context).toEqual(context);
    });
  });

  describe("AuthenticationError", () => {
    it("creates with default values", () => {
      const error = new AuthenticationError();

      expect(error.code).toBe("AUTHENTICATION_ERROR");
      expect(error.category).toBe("authentication");
      expect(error.severity).toBe("high");
      expect(error.retryable).toBe(false);
      expect(error.userMessage).toContain("log in");
    });

    it("accepts custom message", () => {
      const error = new AuthenticationError("Custom auth error");
      expect(error.message).toBe("Custom auth error");
    });
  });

  describe("AuthorizationError", () => {
    it("creates with default values", () => {
      const error = new AuthorizationError();

      expect(error.code).toBe("AUTHORIZATION_ERROR");
      expect(error.category).toBe("authorization");
      expect(error.severity).toBe("medium");
      expect(error.retryable).toBe(false);
      expect(error.userMessage).toContain("permission");
    });
  });

  describe("ValidationError", () => {
    it("creates with message and fields", () => {
      const fields = { email: "Invalid email", password: "Too short" };
      const error = new ValidationError("Validation failed", fields);

      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.category).toBe("validation");
      expect(error.severity).toBe("low");
      expect(error.retryable).toBe(false);
      expect(error.context).toEqual({ fields });
    });

    it("uses default user message if none provided", () => {
      const error = new ValidationError("");
      expect(error.userMessage).toContain("check your input");
    });
  });

  describe("NotFoundError", () => {
    it("creates with default resource", () => {
      const error = new NotFoundError();

      expect(error.code).toBe("NOT_FOUND_ERROR");
      expect(error.message).toBe("Resource not found");
      expect(error.userMessage).toContain("resource");
    });

    it("accepts custom resource", () => {
      const error = new NotFoundError("User profile");
      expect(error.message).toBe("User profile not found");
      expect(error.userMessage).toContain("user profile");
    });
  });

  describe("ServerError", () => {
    it("creates with default values", () => {
      const error = new ServerError();

      expect(error.code).toBe("SERVER_ERROR");
      expect(error.category).toBe("server");
      expect(error.severity).toBe("high");
      expect(error.retryable).toBe(true);
      expect(error.userMessage).toContain("wrong on our end");
    });

    it("accepts custom message and context", () => {
      const error = new ServerError("DB connection failed", { query: "SELECT *" });
      expect(error.message).toBe("DB connection failed");
      expect(error.context).toEqual({ query: "SELECT *" });
    });
  });

  describe("TimeoutError", () => {
    it("creates with default operation", () => {
      const error = new TimeoutError();

      expect(error.code).toBe("TIMEOUT_ERROR");
      expect(error.category).toBe("network");
      expect(error.severity).toBe("medium");
      expect(error.retryable).toBe(true);
      expect(error.message).toBe("Operation timed out");
    });

    it("accepts custom operation", () => {
      const error = new TimeoutError("API call");
      expect(error.message).toBe("API call timed out");
      expect(error.context).toEqual({ operation: "API call" });
    });
  });
});

describe("ApiError", () => {
  it("creates with required properties", () => {
    const error = new ApiError({
      type: "NETWORK_ERROR",
      message: "API failed",
      details: { status: 500 },
    });

    expect(error.name).toBe("ApiError");
    expect(error.type).toBe("NETWORK_ERROR");
    expect(error.message).toBe("API failed");
    expect(error.details).toEqual({ status: 500 });
  });

  it("determines retryable errors correctly", () => {
    const retryableTypes: ApiErrorType[] = [
      "NETWORK_ERROR",
      "TIMEOUT_ERROR",
      "INTERNAL_SERVER_ERROR",
    ];

    retryableTypes.forEach((type) => {
      const error = new ApiError({ type, message: "Test" });
      expect(error.retryable).toBe(true);
    });

    const nonRetryableTypes: ApiErrorType[] = [
      "VALIDATION_ERROR",
      "UNAUTHENTICATED",
      "UNAUTHORIZED",
      "NOT_FOUND",
    ];

    nonRetryableTypes.forEach((type) => {
      const error = new ApiError({ type, message: "Test" });
      expect(error.retryable).toBe(false);
    });
  });
});

describe("ErrorFactory", () => {
  describe("fromHttpStatus", () => {
    it("creates correct error types for status codes", () => {
      const testCases: [number, typeof AppError, string][] = [
        [400, ValidationError, "Invalid request"],
        [401, AuthenticationError, "Authentication required"],
        [403, AuthorizationError, "Access denied"],
        [404, NotFoundError, "Resource"],
        [408, TimeoutError, "Request"],
        [422, ValidationError, "Invalid data"],
        [429, ServerError, "Too many requests"],
        [500, ServerError, "Internal server error"],
        [502, ServerError, "Internal server error"],
        [503, ServerError, "Internal server error"],
        [504, ServerError, "Internal server error"],
      ];

      testCases.forEach(([status, ExpectedError, expectedMessage]) => {
        const error = ErrorFactory.fromHttpStatus(status);
        expect(error).toBeInstanceOf(ExpectedError);
        expect(error.message).toContain(expectedMessage);
      });
    });

    it("uses custom message when provided", () => {
      const error = ErrorFactory.fromHttpStatus(404, "Custom not found");
      expect(error.message).toBe("Custom not found");
    });

    it("creates NetworkError for unknown status", () => {
      const error = ErrorFactory.fromHttpStatus(418);
      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toContain("418");
    });
  });

  describe("fromUnknown", () => {
    it("returns AppError as-is", () => {
      const originalError = new NetworkError("Original");
      const result = ErrorFactory.fromUnknown(originalError);
      expect(result).toBe(originalError);
    });

    it("converts Error to NetworkError for network messages", () => {
      const error = new Error("Network request failed");
      const result = ErrorFactory.fromUnknown(error);
      expect(result).toBeInstanceOf(NetworkError);
      expect(result.message).toBe("Network request failed");
    });

    it("converts Error to ServerError for other messages", () => {
      const error = new Error("Database connection failed");
      const result = ErrorFactory.fromUnknown(error);
      expect(result).toBeInstanceOf(ServerError);
      expect(result.message).toBe("Database connection failed");
    });

    it("handles unknown error types", () => {
      const result = ErrorFactory.fromUnknown("string error");
      expect(result).toBeInstanceOf(ServerError);
      expect(result.message).toBe("An unexpected error occurred");
    });
  });
});

describe("ResultUtils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("retry", () => {
    it("returns success on first attempt", async () => {
      const fn = vi.fn().mockResolvedValue(ok("success"));
      const result = await ResultUtils.retry(fn, 3, 100);

      expect(result.isOk()).toBe(true);
      expect(result.value).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("retries on retryable errors", async () => {
      const fn = vi.fn()
        .mockResolvedValueOnce(err(new NetworkError("Fail 1")))
        .mockResolvedValueOnce(err(new NetworkError("Fail 2")))
        .mockResolvedValueOnce(ok("success"));

      const promise = ResultUtils.retry(fn, 3, 100);
      await vi.advanceTimersByTimeAsync(100); // First retry delay
      await vi.advanceTimersByTimeAsync(200); // Second retry delay
      
      const result = await promise;
      expect(result.isOk()).toBe(true);
      expect(result.value).toBe("success");
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("does not retry non-retryable errors", async () => {
      const fn = vi.fn().mockResolvedValue(err(new ValidationError("Invalid")));
      const result = await ResultUtils.retry(fn, 3, 100);

      expect(result.isErr()).toBe(true);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("returns error after max retries", async () => {
      const fn = vi.fn().mockResolvedValue(err(new NetworkError("Always fails")));
      
      const promise = ResultUtils.retry(fn, 2, 100);
      await vi.advanceTimersByTimeAsync(100); // First retry delay
      await vi.advanceTimersByTimeAsync(200); // Second retry delay
      
      const result = await promise;
      expect(result.isErr()).toBe(true);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("delays between retries with exponential backoff", async () => {
      const fn = vi.fn()
        .mockResolvedValueOnce(err(new NetworkError("Fail 1")))
        .mockResolvedValueOnce(err(new NetworkError("Fail 2")))
        .mockResolvedValueOnce(ok("success"));

      const promise = ResultUtils.retry(fn, 3, 100);
      
      // Advance timers for each retry attempt
      await vi.advanceTimersByTimeAsync(100); // First delay
      await vi.advanceTimersByTimeAsync(200); // Second delay
      
      const result = await promise;
      expect(result.isOk()).toBe(true);
    });
  });

  describe("getError", () => {
    it("returns error from Err result", () => {
      const error = new NetworkError("Test error");
      const result = err(error);
      const extracted = ResultUtils.getError(result);
      expect(extracted).toBe(error);
    });

    it("throws on Ok result", () => {
      const result = ok("success");
      expect(() => ResultUtils.getError(result)).toThrow("Called getError on Ok result");
    });
  });

  describe("getValue", () => {
    it("returns value from Ok result", () => {
      const result = ok("success");
      const value = ResultUtils.getValue(result);
      expect(value).toBe("success");
    });

    it("throws on Err result", () => {
      const result = err(new NetworkError("Test"));
      expect(() => ResultUtils.getValue(result)).toThrow("Called getValue on Err result");
    });
  });
});
