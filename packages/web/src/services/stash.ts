import { ResultAsync } from 'neverthrow';
import { fetchApi } from '@/lib/api-client';
import type { UserShoe, GetStashResponse } from '@/types/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export function getUserStash(): ResultAsync<GetStashResponse, Error> {
  return fetchApi<GetStashResponse>('/api/v1/stash');
}

export function addShoeToStash(shoeId: string): ResultAsync<ApiResponse<UserShoe>, Error> {
  return fetchApi<ApiResponse<UserShoe>>('/api/v1/stash', {
    method: 'POST',
    body: JSON.stringify({ shoeId }),
  });
}

export function updateShoeInStash(shoeId: string, payload: unknown): ResultAsync<ApiResponse<UserShoe>, Error> {
  return fetchApi<ApiResponse<UserShoe>>(`/api/v1/stash/${shoeId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function removeShoeFromStash(shoeId: string): ResultAsync<ApiResponse<null>, Error> {
  return fetchApi<ApiResponse<null>>(`/api/v1/stash/${shoeId}`, {
    method: 'DELETE',
  });
}

export function toggleFavouriteInStash(shoeId: string): ResultAsync<ApiResponse<UserShoe>, Error> {
  return fetchApi<ApiResponse<UserShoe>>(`/api/v1/stash/${shoeId}/favourite`, {
    method: 'POST',
  });
}
