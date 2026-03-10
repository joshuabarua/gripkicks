import { ResultAsync } from 'neverthrow';
import { fetchApi } from '@/lib/api-client';
import type { UserShoe } from '@/types/api';

export function getUserStash(): ResultAsync<UserShoe[], Error> {
  return fetchApi<UserShoe[]>('/api/v1/stash');
}

export function addShoeToStash(shoeId: string): ResultAsync<{ userShoeId: string }, Error> {
  return fetchApi<{ userShoeId: string }>('/api/v1/stash', {
    method: 'POST',
    body: JSON.stringify({ shoeId }),
  });
}

export function updateShoeInStash(shoeId: string, payload: unknown): ResultAsync<UserShoe, Error> {
  return fetchApi<UserShoe>(`/api/v1/stash/${shoeId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function removeShoeFromStash(shoeId: string): ResultAsync<null, Error> {
  return fetchApi<null>(`/api/v1/stash/${shoeId}`, {
    method: 'DELETE',
  });
}

export function toggleFavouriteInStash(shoeId: string): ResultAsync<UserShoe, Error> {
  return fetchApi<UserShoe>(`/api/v1/stash/${shoeId}/favourite`, {
    method: 'POST',
  });
}
