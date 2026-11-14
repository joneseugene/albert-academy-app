/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Pick `count` items at random without repeats; an item with weight 3 is
 * three times as likely to be picked as one with weight 1 (Efraimidis–Spirakis).
 */
export function weightedPick<T>(items: readonly T[], count: number, weight: (item: T) => number) {
  return items
    .map((item) => ({ item, key: Math.random() ** (1 / Math.max(weight(item), 0.0001)) }))
    .sort((a, b) => b.key - a.key)
    .slice(0, count)
    .map((x) => x.item);
}

/** A random index into a list of `length` items (0 when empty). */
export const randomIndex = (length: number) => Math.floor(Math.random() * Math.max(length, 1));
