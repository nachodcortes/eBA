type CacheEntry<T> = {
  value: T;
  updatedAt: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

export const setCached = <T>(key: string, value: T) => {
  cache.set(key, {
    value,
    updatedAt: Date.now(),
  });
};

export const getCached = <T>(key: string, maxAgeMs = 5 * 60 * 1000) => {
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  if (!entry) return null;

  const isFresh = Date.now() - entry.updatedAt <= maxAgeMs;

  if (!isFresh) return null;

  return entry.value;
};
