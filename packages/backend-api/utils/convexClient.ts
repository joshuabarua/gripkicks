const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_CONVEX_SITE_URL = 'http://localhost:3210';

class ConvexRequestError extends Error {
  readonly status?: number;
  readonly url?: string;

  constructor(message: string, status?: number, url?: string) {
    super(message);
    this.name = 'ConvexRequestError';
    this.status = status;
    this.url = url;
  }
}

export interface ConvexCallOptions {
  baseUrls?: string[];
  serviceToken?: string;
  timeoutMs?: number;
}

interface ConvexEnvelope<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function getConvexSiteUrl(): string {
  return (
    process.env.CONVEX_HTTP_URL ||
    process.env.CONVEX_SITE_URL ||
    process.env.CONVEX_URL?.replace('.convex.cloud', '.convex.site') ||
    DEFAULT_CONVEX_SITE_URL
  );
}

export function getConvexBaseUrls(url: string = getConvexSiteUrl()): string[] {
  const normalized = url.replace(/\/$/, '');

  if (normalized.includes('.convex.cloud')) {
    return [normalized.replace('.convex.cloud', '.convex.site'), normalized];
  }

  if (normalized.includes('.convex.site')) {
    return [normalized, normalized.replace('.convex.site', '.convex.cloud')];
  }

  return [normalized];
}

function getConvexServiceToken(): string {
  const serviceToken = process.env.CONVEX_SERVICE_TOKEN;
  if (!serviceToken) {
    throw new Error('CONVEX_SERVICE_TOKEN is required');
  }
  return serviceToken;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  if (timeoutMs <= 0) {
    return fetch(url, init);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ConvexRequestError(
        `Convex request timed out after ${timeoutMs}ms`,
        undefined,
        url,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function callConvex<T = unknown>(
  path: string,
  body: Record<string, unknown> = {},
  options: ConvexCallOptions = {},
): Promise<T> {
  const baseUrls = options.baseUrls ?? [getConvexSiteUrl()];
  const serviceToken = options.serviceToken ?? getConvexServiceToken();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let lastError: Error | null = null;

  for (const baseUrl of baseUrls) {
    const url = `${baseUrl.replace(/\/$/, '')}${path}`;

    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${serviceToken}`,
          },
          body: JSON.stringify(body),
        },
        timeoutMs,
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new ConvexRequestError(
          `Convex request failed: ${response.status} ${responseText}`,
          response.status,
          url,
        );
      }

      let result: unknown;
      try {
        result = JSON.parse(responseText);
      } catch {
        throw new ConvexRequestError(
          'Invalid JSON response from Convex',
          undefined,
          url,
        );
      }

      if (result !== null && typeof result === 'object') {
        const envelope = result as ConvexEnvelope<T>;
        if (envelope.success === false) {
          throw new ConvexRequestError(
            envelope.error || envelope.message || 'Convex request failed',
            undefined,
            url,
          );
        }
        if ('data' in envelope) {
          return envelope.data as T;
        }
      }

      return result as T;
    } catch (error) {
      lastError = error as Error;
    }
  }

  throw lastError ?? new ConvexRequestError('Convex request failed');
}
