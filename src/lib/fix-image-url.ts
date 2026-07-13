/**
 * Resolves a profile image URL from the rebackend.
 * - `profile_picture_url` (from backend serializer) is already a full URL — use directly.
 * - `profile_picture` (raw field) may be relative — prepend API base.
 * - null/undefined returns undefined.
 */
export function resolveProfileImageUrl(
  profilePictureUrl: string | null | undefined,
  profilePicture: string | null | undefined,
): string | undefined {
  // Prefer the already-resolved URL from the backend
  if (profilePictureUrl) return profilePictureUrl;
  if (!profilePicture) return undefined;

  // Raw field — prepend base if relative
  if (
    profilePicture.startsWith("http://") ||
    profilePicture.startsWith("https://")
  ) {
    return profilePicture;
  }

  const API_URL =
    import.meta.env.VITE_API_URL || "https://api.earnquestapp.com";
  return `${API_URL}${profilePicture.startsWith("/") ? "" : "/"}${profilePicture}`;
}
