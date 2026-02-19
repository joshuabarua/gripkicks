import { Result, ResultAsync, err, ok } from "neverthrow";

export type ErrorSeverity = "low" | "medium" | "high" | "critical";

export type ErrorCategory =
  | "network"
  | "authentication"
  | "authorization"
  | "validation"
  | "not_found"
  | "server"
  | "unknown";

export interface ErrorDetails {
  code: string;
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  retryable: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
  context?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly type: ApiErrorType;
  public readonly userMessage: string;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly retryable: boolean;
  public readonly action?: ErrorDetails["action"];
  public readonly context?: Record<string, unknown>;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = "AppError";
    this.code = details.code;
    this.type = this.categoryToType(details.category);
    this.userMessage = details.userMessage;
    this.severity = details.severity;
    this.category = details.category;
    this.retryable = details.retryable;
    this.action = details.action;
    this.context = details.context;
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

  toDetails(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      severity: this.severity,
      category: this.category,
      retryable: this.retryable,
      action: this.action,
      context: this.context,
    };
  }
}

export class NetworkError extends AppError {
  constructor(
    message: string = "Network request failed",
    context?: Record<string, unknown>,
  ) {
    super({
      code: "NETWORK_ERROR",
      message,
      userMessage:
        "Unable to connect. Please check your internet connection and try again.",
      severity: "medium",
      category: "network",
      retryable: true,
      context,
    });
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super({
      code: "AUTHENTICATION_ERROR",
      message,
      userMessage: "Please log in to continue.",
      severity: "high",
      category: "authentication",
      retryable: false,
    });
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super({
      code: "AUTHORIZATION_ERROR",
      message,
      userMessage: "You don't have permission to perform this action.",
      severity: "medium",
      category: "authorization",
      retryable: false,
    });
  }
}

export class ValidationError extends AppError {
  constructor(message: string, fields?: Record<string, string>) {
    super({
      code: "VALIDATION_ERROR",
      message,
      userMessage: message || "Please check your input and try again.",
      severity: "low",
      category: "validation",
      retryable: false,
      context: fields ? { fields } : undefined,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super({
      code: "NOT_FOUND_ERROR",
      message: `${resource} not found`,
      userMessage: `The ${resource.toLowerCase()} you're looking for doesn't exist or has been removed.`,
      severity: "low",
      category: "not_found",
      retryable: false,
    });
  }
}

export class ServerError extends AppError {
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
      context,
    });
  }
}

export class TimeoutError extends AppError {
  constructor(operation: string = "Operation") {
    super({
      code: "TIMEOUT_ERROR",
      message: `${operation} timed out`,
      userMessage: "The request took too long. Please try again.",
      severity: "medium",
      category: "network",
      retryable: true,
      context: { operation },
    });
  }
}

export type ApiErrorType =
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

export class ApiError extends Error {
  public readonly type: ApiErrorType;
  public readonly details?: unknown;
  public readonly retryable: boolean;

  constructor({
    type,
    message,
    details,
  }: {
    type: ApiErrorType;
    message: string;
    details?: unknown;
  }) {
    super(message);
    this.name = "ApiError";
    this.type = type;
    this.details = details;
    this.retryable = [
      "NETWORK_ERROR",
      "TIMEOUT_ERROR",
      "INTERNAL_SERVER_ERROR",
    ].includes(type);
  }
}

export const ErrorFactory = {
  fromHttpStatus: (status: number, message?: string): AppError => {
    switch (status) {
      case 400:
        return new ValidationError(message || "Invalid request");
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthorizationError(message);
      case 404:
        return new NotFoundError(message || "Resource");
      case 408:
        return new TimeoutError(message || "Request");
      case 422:
        return new ValidationError(message || "Invalid data");
      case 429:
        return new ServerError("Too many requests. Please wait and try again.");
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(message);
      default:
        return new NetworkError(
          message || `Request failed with status ${status}`,
        );
    }
  },

  fromUnknown: (error: unknown): AppError => {
    if (error instanceof AppError) return error;
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes("network") || message.includes("fetch")) {
        return new NetworkError(error.message);
      }
      return new ServerError(error.message);
    }
    return new ServerError("An unexpected error occurred");
  },
};

export type AsyncResult<T, E = AppError> = ResultAsync<T, E>;
export type SyncResult<T, E = AppError> = Result<T, E>;

export const ResultUtils = {
  retry: async <T>(
    fn: () => AsyncResult<T>,
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
