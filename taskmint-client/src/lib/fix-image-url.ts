/**
 * Fixes image URLs from the rebackend — Cloudinary URLs pass through as-is,
 * relative paths get the API base prepended.
 */
export function fixImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Relative path — prepend the API base
  const API_URL = import.meta.env.VITE_API_URL || "https://api.earnquestapp.com";
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}
