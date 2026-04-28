// Error logging utilities for consistent error handling across the application

export interface ErrorContext {
  userId?: string;
  operation?: string;
  endpoint?: string;
  additionalData?: Record<string, unknown>;
}

export interface LoggedError {
  message: string;
  error: unknown;
  context: ErrorContext;
  timestamp: string;
  stack?: string;
}

class ErrorLogger {
  private logErrors: boolean;
  private logToConsole: boolean;

  constructor() {
    this.logErrors = process.env.NODE_ENV !== "test";
    this.logToConsole = true;
  }

  // Log an error with context
  log(message: string, error: unknown, context: ErrorContext = {}): void {
    if (!this.logErrors) return;

    const loggedError: LoggedError = {
      message,
      error,
      context,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
    };

    // Log to console with structured format
    if (this.logToConsole) {
      console.error("=== ERROR LOG ===");
      console.error(`Message: ${message}`);
      console.error(`Timestamp: ${loggedError.timestamp}`);
      console.error(`Context:`, context);
      
      if (error instanceof Error) {
        console.error(`Error: ${error.name}: ${error.message}`);
        if (error.stack) {
          console.error(`Stack: ${error.stack}`);
        }
      } else {
        console.error(`Error:`, error);
      }
      console.error("=== END ERROR ===");
    }

    // In production, you might want to send this to a logging service
    // like Sentry, LogRocket, DataDog, etc.
    if (process.env.NODE_ENV === "production") {
      // Example: Send to external logging service
      // this.sendToLoggingService(loggedError);
    }
  }

  // Log API errors with request context
  logApiError(
    message: string,
    error: unknown,
    request: {
      method?: string;
      url?: string;
      userId?: string;
      body?: unknown;
    }
  ): void {
    this.log(message, error, {
      userId: request.userId,
      operation: `${request.method} ${request.url}`,
      endpoint: request.url,
      additionalData: {
        requestBody: request.body,
      },
    });
  }

  // Log database errors
  logDatabaseError(
    operation: string,
    error: unknown,
    context: {
      table?: string;
      query?: unknown;
      userId?: string;
    }
  ): void {
    this.log(`Database error during ${operation}`, error, {
      userId: context.userId,
      operation: `database:${operation}`,
      additionalData: {
        table: context.table,
        query: context.query,
      },
    });
  }

  // Log authentication errors
  logAuthError(message: string, error: unknown, userId?: string): void {
    this.log(message, error, {
      userId,
      operation: "authentication",
    });
  }

  // Create a user-friendly error message from an error
  getUserFriendlyMessage(error: unknown, defaultMessage = "An unexpected error occurred"): string {
    if (error instanceof Error) {
      // Don't expose internal error details to users in production
      if (process.env.NODE_ENV === "production") {
        return defaultMessage;
      }
      
      // In development, provide more details
      return error.message || defaultMessage;
    }
    
    return defaultMessage;
  }

  // Create a standardized error response
  createErrorResponse(
    error: unknown,
    defaultMessage = "An unexpected error occurred",
    statusCode = 500
  ): {
    success: false;
    message: string;
    error?: string;
    timestamp: string;
  } {
    return {
      success: false,
      message: this.getUserFriendlyMessage(error, defaultMessage),
      error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const logger = new ErrorLogger();

// Convenience functions for common error scenarios
export const logApiError = (
  message: string,
  error: unknown,
  request: {
    method?: string;
    url?: string;
    userId?: string;
    body?: unknown;
  }
) => logger.logApiError(message, error, request);

export const createErrorResponse = (
  error: unknown,
  defaultMessage?: string,
  statusCode?: number
) => logger.createErrorResponse(error, defaultMessage, statusCode);
