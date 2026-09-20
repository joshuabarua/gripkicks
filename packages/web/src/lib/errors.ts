import { Result, ResultAsync, err } from "neverthrow";

type ErrorSeverity = "low" | "medium" | "high" | "critical";

type ErrorCategory =
  | "network"
  | "authentication"
  | "authorization"
  | "validation"
  | "not_found"
  | "server"
  | "unknown";

interface ErrorDetails {
  code: string;
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  retryable: boolean;
  type?: ApiErrorType;
  details?: unknown;
  action?: {
    label: string;
    handler: () => void;
  };
  context?: Record<string, unknown>;
}

type ApiErrorType =
  | "VALIDATION_ERROR"
  | "INVALID_DATA"
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "DATABASE_ERROR"
  | "INTERNAL_SERVER_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT_ERROR"
  | "UNEXPECTED_ERROR"
  | "RANDOM_ERROR";

export class AppError extends Error {
  public readonly code: string;
  public readonly type: ApiErrorType;
  public readonly userMessage: string;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly retryable: boolean;
  public readonly details: unknown = undefined;
  public readonly action: ErrorDetails["action"] | undefined = undefined;
  public readonly context: Record<string, unknown> | undefined = undefined;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = "AppError";
    this.code = details.code;
    this.type = details.type ?? this.categoryToType(details.category);
    this.userMessage = details.userMessage;
    this.severity = details.severity;
    this.category = details.category;
    this.retryable = details.retryable;
    if (details.details !== undefined) {
      this.details = details.details;
    }
    if (details.action !== undefined) {
      this.action = details.action;
    }
    if (details.context !== undefined) {
      this.context = details.context;
    }
  }

  static fromType(
    type: ApiErrorType,
    message: string,
    details?: unknown,
  ): AppError {
    const categoryByType: Record<ApiErrorType, ErrorCategory> = {
      VALIDATION_ERROR: "validation",
      INVALID_DATA: "validation",
      UNAUTHENTICATED: "authentication",
      UNAUTHORIZED: "authorization",
      NOT_FOUND: "not_found",
      DATABASE_ERROR: "server",
      INTERNAL_SERVER_ERROR: "server",
      NETWORK_ERROR: "network",
      TIMEOUT_ERROR: "network",
      UNEXPECTED_ERROR: "unknown",
      RANDOM_ERROR: "unknown",
    };
    const category = categoryByType[type];
    const retryable = [
      "NETWORK_ERROR",
      "TIMEOUT_ERROR",
      "INTERNAL_SERVER_ERROR",
    ].includes(type);

    return new AppError({
      code: type,
      type,
      message,
      userMessage: message,
      severity: category === "server" ? "high" : "medium",
      category,
      retryable,
      ...(details !== undefined ? { details } : {}),
    });
  }

  private categoryToType(category: ErrorCategory): ApiErrorType {
    const mapping: Record<ErrorCategory, ApiErrorType> = {
      network: "NETWORK_ERROR",
      authentication: "UNAUTHENTICATED",
      authorization: "UNAUTHORIZED",
      validation: "VALIDATION_ERROR",
      not_found: "NOT_FOUND",
      server: "INTERNAL_SERVER_ERROR",
      unknown: "UNEXPECTED_ERROR",
    };
    return mapping[category];
  }
}

class ServerError extends AppError {
  constructor(
    message: string = "Internal server error",
    context?: Record<string, unknown>,
  ) {
    super({
      code: "SERVER_ERROR",
      message,
      userMessage: "Something went wrong on our end. Please try again later.",
      severity: "high",
      category: "server",
      retryable: true,
      ...(context !== undefined ? { context } : {}),
    });
  }
}

// fallow-ignore-next-line unused-type
export type AsyncResult<T, E = AppError> = ResultAsync<T, E>;
// fallow-ignore-next-line unused-type
export type SyncResult<T, E = AppError> = Result<T, E>;

export class ErrorFactory {
  static fromHttpStatus(status: number, message: string): AppError {
    const categoryMap: Record<number, ErrorCategory> = {
      400: "validation",
      401: "authentication",
      403: "authorization",
      404: "not_found",
      500: "server",
      502: "network",
      503: "server",
      504: "network",
    };

    const category = categoryMap[status] ?? "unknown";
    const codeByCategory: Record<ErrorCategory, string> = {
      network: "NETWORK_ERROR",
      authentication: "UNAUTHENTICATED_ERROR",
      authorization: "UNAUTHORIZED_ERROR",
      validation: "VALIDATION_ERROR",
      not_found: "NOT_FOUND_ERROR",
      server: "INTERNAL_SERVER_ERROR",
      unknown: "UNKNOWN_ERROR",
    };
    const code = codeByCategory[category];

    return new AppError({
      code,
      message,
      userMessage: message,
      severity: status >= 500 ? "high" : "medium",
      category,
      retryable: status >= 500,
    });
  }

  static fromNetwork(error: unknown): AppError {
    const message = error instanceof Error ? error.message : "Network request failed";

    return new AppError({
      code: "NETWORK_ERROR",
      message,
      userMessage: "Unable to connect. Please check your connection and try again.",
      severity: "medium",
      category: "network",
      retryable: true,
    });
  }
}

const ResultUtils = {
  retry: async <T>(
    fn: () => Promise<Result<T, AppError>>,
    maxRetries: number = 3,
    delayMs: number = 1000,
  ): Promise<Result<T, AppError>> => {
    let lastError: AppError = new ServerError("Max retries exceeded");

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const result = await fn();

      if (result.isOk()) {
        return result;
      }

      const error = ResultUtils.getError(result);
      if (!error.retryable) {
        return result;
      }

      lastError = error;

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * (attempt + 1)),
        );
      }
    }

    return err(lastError);
  },

  getError: <T>(result: Result<T, AppError>): AppError => {
    if (result.isOk()) {
      throw new Error("Called getError on Ok result");
    }
    return result.error;
  },

  getValue: <T, E>(result: Result<T, E>): T => {
    if (result.isErr()) {
      throw new Error("Called getValue on Err result");
    }
    return result.value;
  },
};
