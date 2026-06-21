// Lightweight in-memory sliding-window rate limiter.
//
// NOTE: this is best-effort — serverless instances each keep their own memory,
// so a determined abuser hitting different cold instances can exceed the limit.
// It's enough to stop casual spam / accidental loops at a Config-sized launch.
// For hard guarantees, back this with Vercel KV or a Postgres counter later.

const hits = new Map<string, number[]>();

/** Returns true if the action is allowed, false if the limit is exceeded. */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (hits.size > 5000) {
    for (const [k, arr] of hits) {
      const live = arr.filter((t) => now - t < windowMs);
      if (live.length === 0) hits.delete(k);
      else hits.set(k, live);
    }
  }
  return true;
}
