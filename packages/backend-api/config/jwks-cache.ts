interface JwksCacheEntry {
  promise: Promise<unknown[]>;
  expiresAt: number;
}

export function createJwksCache(
  load: () => Promise<unknown>,
  ttlMs: number,
  now: () => number = Date.now,
) {
  let entry: JwksCacheEntry | null = null;

  return {
    get(): Promise<unknown[]> {
      if (entry && now() < entry.expiresAt) {
        return entry.promise.then((keys) => [...keys]);
      }

      const promise = load().then((result) =>
        Array.isArray(result) ? result : [],
      );
      const next: JwksCacheEntry = { promise, expiresAt: now() + ttlMs };
      entry = next;
      promise.catch(() => {
        if (entry === next) {
          entry = null;
        }
      });
      return promise.then((keys) => [...keys]);
    },
    invalidate(): void {
      entry = null;
    },
  };
}
