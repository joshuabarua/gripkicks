import { hc } from "hono/client";
import { ResultAsync } from "neverthrow";
import { AppError, ErrorFactory } from "./errors";

type ApiSuccessEnvelope<T> = {
  success: true;
  data: T;
};

// Use relative URL so requests go through Next.js proxy/rewrites
const apiBaseUrl = "";

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

      const json = await res.json();

      if (
        typeof json === "object" &&
        json !== null &&
        "success" in json &&
        json.success === true &&
        "data" in json
      ) {
        return (json as ApiSuccessEnvelope<T>).data;
      }

      return json as T;
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
