import { useState, useCallback } from 'react';
import { ResultAsync } from 'neverthrow';
import { ApiError } from '@/lib/errors';

interface UseAsyncState<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export function useAsync<T>() {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const execute = useCallback(
    async (asyncOperation: () => ResultAsync<T, ApiError>) => {
      setState(prev => ({ ...prev, isLoading: true, error: null, isError: false }));

      const result = await asyncOperation();

      result.match(
        (data) => {
          setState({
            data,
            error: null,
            isLoading: false,
            isSuccess: true,
            isError: false,
          });
        },
        (error) => {
          setState({
            data: null,
            error,
            isLoading: false,
            isSuccess: false,
            isError: true,
          });
        }
      );

      return result;
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useMutation<T, P = void>(
  mutationFn: (params: P) => ResultAsync<T, ApiError>
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const mutate = useCallback(
    async (params: P) => {
      setState(prev => ({ ...prev, isLoading: true, error: null, isError: false }));

      const result = await mutationFn(params);

      result.match(
        (data) => {
          setState({
            data,
            error: null,
            isLoading: false,
            isSuccess: true,
            isError: false,
          });
        },
        (error) => {
          setState({
            data: null,
            error,
            isLoading: false,
            isSuccess: false,
            isError: true,
          });
        }
      );

      return result;
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}
