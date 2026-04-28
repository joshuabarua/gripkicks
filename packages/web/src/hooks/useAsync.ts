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

  const setError = useCallback((error: ApiError) => {
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

export function useAsync<T>() {
  const { state, setLoading, setSuccess, setError, reset } = useAsyncState<T>();

  const execute = useCallback(
    async (asyncOperation: () => ResultAsync<T, ApiError>) => {
      setLoading();
      const result = await asyncOperation();
      result.match(setSuccess, setError);
      return result;
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
  mutationFn: (params: P) => ResultAsync<T, ApiError>
) {
  const { state, setLoading, setSuccess, setError, reset } = useAsyncState<T>();

  const mutate = useCallback(
    async (params: P) => {
      setLoading();
      const result = await mutationFn(params);
      result.match(setSuccess, setError);
      return result;
    },
    [mutationFn, setLoading, setSuccess, setError]
  );

  return {
    ...state,
    mutate,
    reset,
  };
}
