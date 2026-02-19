import { hc } from "hono/client";
import { ResultAsync } from "neverthrow";
import { AppError, ErrorFactory } from "./errors";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const apiClient = hc(apiBaseUrl, {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    return fetch(input, {
      ...init,
      credentials: "include",
    });
  },
});

export function fetchApi<T>(
  path: string,
  options?: RequestInit,
): ResultAsync<T, AppError> {
  return ResultAsync.fromPromise(
    (async () => {
      const res = await fetch(`${apiBaseUrl}${path}`, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!res.ok) {
        const errorData = res.headers
          .get("content-type")
          ?.includes("application/json")
          ? await res.json().catch(() => ({}))
          : {};

        throw ErrorFactory.fromHttpStatus(
          res.status,
          errorData.message || errorData.error || `Request failed`,
        );
      }

      return res.json();
    })(),
    (error) => {
      if (error instanceof AppError) {
        return error;
      }
      return ErrorFactory.fromUnknown(error);
    },
  );
}

export default apiClient;
