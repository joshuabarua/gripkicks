import { hc } from "hono/client";
import { ResultAsync } from "neverthrow";
import { AppError, ErrorFactory } from "./errors";

interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
}

function isApiSuccessEnvelope<T>(json: unknown): json is ApiSuccessEnvelope<T> {
  return (
    typeof json === "object" &&
    json !== null &&
    "success" in json &&
    json.success === true &&
    "data" in json
  );
}

function toErrorMessage(payload: unknown): string | undefined {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return undefined;

  const obj = payload as Record<string, unknown>;
  const errorValue = obj["error"];
  const errorsValue = obj["errors"];

  const extractors = [
    () => typeof obj["message"] === "string" ? obj["message"] : undefined,
    () => typeof errorValue === "string" ? errorValue : undefined,
    () => typeof errorValue === "object" && errorValue !== null
      ? (errorValue as Record<string, unknown>)["message"]
      : undefined,
    () => Array.isArray(errorsValue) && errorsValue[0]
      ? typeof errorsValue[0] === "string"
        ? errorsValue[0]
        : (errorsValue[0] as Record<string, unknown>)["message"]
      : undefined,
  ];

  for (const extract of extractors) {
    const result = extract();
    if (typeof result === "string") return result;
  }

  return undefined;
};

type PendingRequest<T> = ResultAsync<T, AppError>;
const pendingRequests = new Map<string, PendingRequest<unknown>>();

function getCacheKey(path: string, options?: RequestInit): string {
  const method = options?.method || "GET";
  const body = options?.body ? String(options.body) : "";
  return `${method}:${path}:${body}`;
}

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
  const cacheKey = getCacheKey(path, options);

  const existing = pendingRequests.get(cacheKey) as PendingRequest<T> | undefined;
  if (existing) {
    return existing;
  }

  const request = ResultAsync.fromPromise(
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

        const errorMessage = toErrorMessage(errorData);

        throw ErrorFactory.fromHttpStatus(
          res.status,
          errorMessage || `Request failed`,
        );
      }

      const json = await res.json();

      if (isApiSuccessEnvelope<T>(json)) {
        return json.data;
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

  pendingRequests.set(cacheKey, request as PendingRequest<unknown>);

  request.match(
    () => pendingRequests.delete(cacheKey),
    () => pendingRequests.delete(cacheKey),
  );

  return request;
}

export default apiClient;
