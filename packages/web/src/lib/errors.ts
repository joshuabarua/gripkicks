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
  public readonly action: ErrorDetails["action"] | undefined = undefined;
  public readonly context: Record<string, unknown> | undefined = undefined;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = "AppError";
    this.code = details.code;
    this.type = this.categoryToType(details.category);
    this.userMessage = details.userMessage;
    this.severity = details.severity;
    this.category = details.category;
    this.retryable = details.retryable;
    if (details.action !== undefined) {
      this.action = details.action;
    }
    if (details.context !== undefined) {
      this.context = details.context;
    }
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


// fallow-ignore-next-line unused-type
export type AsyncResult<T, E = AppError> = ResultAsync<T, E>;
// fallow-ignore-next-line unused-type
export type SyncResult<T, E = AppError> = Result<T, E>;

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
