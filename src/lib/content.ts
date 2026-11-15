type Publishable = { data: { draft?: boolean; verified?: boolean } };

/**
 * Unverified / draft content is visible in `npm run dev` so the layout can be
 * tested, but is excluded from production builds. Flip `verified: true` only
 * after the entry has been checked against the public résumé or directly
 * confirmed by the owner.
 */
export function isPublic(entry: Publishable): boolean {
  const includeDrafts =
    import.meta.env.DEV || process.env.INCLUDE_DRAFTS === '1';
  if (includeDrafts) return true;
  if (entry.data.verified === false) return false;
  return entry.data.draft !== true;
}

export function byOrder<T extends { data: { order?: number } }>(a: T, b: T): number {
  return (a.data.order ?? 99) - (b.data.order ?? 99);
}
