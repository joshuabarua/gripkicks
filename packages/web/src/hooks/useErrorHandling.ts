import { useCallback } from "react";
import { err, Result, ResultAsync } from "neverthrow";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { AppError, AuthenticationError, ErrorFactory } from "@/lib/errors";

interface UseErrorHandlingOptions {
  onAuthenticationError?: () => void;
  showToast?: boolean;
  logErrors?: boolean;
}

interface UseErrorHandlingReturn {
  handleError: (error: unknown, context?: string) => void;
  handleResult: <T>(
    result: Result<T, AppError>,
    onSuccess?: (value: T) => void,
  ) => boolean;
  handleAsyncResult: <T>(
    result: Promise<Result<T, AppError>>,
    onSuccess?: (value: T) => void,
  ) => Promise<boolean>;
  withErrorHandling: <T>(
    fn: () => Promise<T>,
    options?: { onSuccess?: (value: T) => void; errorMessage?: string },
  ) => Promise<T | null>;
  withRetry: <T>(
    fn: () => ResultAsync<T, AppError>,
    maxRetries?: number,
  ) => Promise<Result<T, AppError>>;
}

export function useErrorHandling(
  options: UseErrorHandlingOptions = {},
): UseErrorHandlingReturn {
  const { showToast = true, logErrors = true } = options;
  const toast = useToast();
  const router = useRouter();

  const handleError = useCallback(
    (error: unknown, context?: string) => {
      const appError =
        error instanceof AppError ? error : ErrorFactory.fromUnknown(error);

      if (logErrors) {
        console.error(`[${context || "Error"}]:`, appError);
      }

      if (appError instanceof AuthenticationError) {
        if (options.onAuthenticationError) {
          options.onAuthenticationError();
        } else {
          router.push("/auth/login");
        }
        return;
      }

      if (showToast) {
        toast.fromAppError(appError);
      }
    },
    [logErrors, showToast, toast, router, options],
  );

  const handleResult = useCallback(
    <T>(
      result: Result<T, AppError>,
      onSuccess?: (value: T) => void,
    ): boolean => {
      if (result.isOk()) {
        onSuccess?.(result.value);
        return true;
      } else {
        handleError(result.error);
        return false;
      }
    },
    [handleError],
  );

  const handleAsyncResult = useCallback(
    async <T>(
      result: Promise<Result<T, AppError>>,
      onSuccess?: (value: T) => void,
    ): Promise<boolean> => {
      const resolved = await result;
      return handleResult(resolved, onSuccess);
    },
    [handleResult],
  );

  const withErrorHandling = useCallback(
    async <T>(
      fn: () => Promise<T>,
      options?: { onSuccess?: (value: T) => void; errorMessage?: string },
    ): Promise<T | null> => {
      try {
        const result = await fn();
        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        if (options?.errorMessage) {
          toast.error(options.errorMessage);
        } else {
          handleError(error);
        }
        return null;
      }
    },
    [handleError, toast],
  );

  const withRetry = useCallback(
    async <T>(
      fn: () => ResultAsync<T, AppError>,
      maxRetries: number = 3,
    ): Promise<Result<T, AppError>> => {
      let lastError: AppError = new AppError({
        code: "RETRY_EXHAUSTED",
        message: "Max retries exceeded",
        userMessage: "Unable to complete the request. Please try again later.",
        severity: "medium",
        category: "network",
        retryable: true,
      });

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const result = await fn();

        if (result.isOk()) {
          return result;
        }

        const error = result.error;
        if (!error.retryable) {
          return result;
        }

        lastError = error;

        if (attempt < maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      return err(lastError);
    },
    [],
  );

  return {
    handleError,
    handleResult,
    handleAsyncResult,
    withErrorHandling,
    withRetry,
  };
}

export function useAsyncError() {
  const { handleError } = useErrorHandling();

  return useCallback(
    async <T>(promise: Promise<T>, context?: string): Promise<T | null> => {
      try {
        return await promise;
      } catch (error) {
        handleError(error, context);
        return null;
      }
    },
    [handleError],
  );
}
