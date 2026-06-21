// Validate that a URL is one of our own Vercel Blob URLs, so the server never
// stores arbitrary client-supplied image URLs (external hotlinks, tracking
// pixels, etc). Pure — safe to import in server actions.
export function isBlobUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.protocol === "https:" &&
      u.hostname.endsWith(".public.blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}
