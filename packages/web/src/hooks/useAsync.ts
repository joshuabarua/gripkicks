import { useState, useCallback } from 'react';
import { errAsync, ResultAsync } from 'neverthrow';
import { AppError } from '@/lib/errors';

interface UseAsyncState<T> {
  data: T | null;
  error: AppError | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

function useAsyncState<T>() {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const setLoading = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true, error: null, isError: false }));
  }, []);

  const setSuccess = useCallback((data: T) => {
    setState({
      data,
      error: null,
      isLoading: false,
      isSuccess: true,
      isError: false,
    });
  }, []);

  const setError = useCallback((error: AppError) => {
    setState({
      data: null,
      error,
      isLoading: false,
      isSuccess: false,
      isError: true,
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return { state, setLoading, setSuccess, setError, reset };
}

function toAppError(error: unknown, fallbackMessage: string): AppError {
  if (error instanceof AppError) {
    return error;
  }
  return AppError.fromType('UNEXPECTED_ERROR', fallbackMessage);
}

export function useAsync<T>() {
  const { state, setLoading, setSuccess, setError, reset } = useAsyncState<T>();

  const execute = useCallback(
    async (asyncOperation: () => ResultAsync<T, AppError>) => {
      setLoading();
      try {
        const result = await asyncOperation();
        result.match(setSuccess, setError);
        return result;
      } catch (error) {
        const appError = toAppError(error, 'Async operation failed');
        setError(appError);
        return errAsync(appError);
      }
    },
    [setLoading, setSuccess, setError]
  );

  return {
    ...state,
    execute,
    reset,
  };
}

export function useMutation<T, P = void>(
  mutationFn: (params: P) => ResultAsync<T, AppError>
) {
  const { state, setLoading, setSuccess, setError, reset } = useAsyncState<T>();

  const mutate = useCallback(
    async (params: P) => {
      setLoading();
      try {
        const result = await mutationFn(params);
        result.match(setSuccess, setError);
        return result;
      } catch (error) {
        const appError = toAppError(error, 'Mutation failed');
        setError(appError);
        return errAsync(appError);
      }
    },
    [mutationFn, setLoading, setSuccess, setError]
  );

  return {
    ...state,
    mutate,
    reset,
  };
}
