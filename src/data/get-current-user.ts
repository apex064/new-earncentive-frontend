import { API } from "@/api/axios";
import type { ApiResponse, User } from "@/types";

/**
 * Fetch the currently authenticated user's profile from the rebackend.
 * Uses the token attached by the axios interceptor.
 */
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  const res = await API.get("/profile/");
  const data = res.data;

  // Compute fullname and profileImg for taskmint UI compatibility
  const fullname = [data.first_name, data.last_name]
    .filter(Boolean)
    .join(" ") || data.username;

  const user: User = {
    ...data,
    fullname,
    // Use the resolved profile_picture_url from the backend (handles Cloudinary, relative, etc.)
    profileImg: data.profile_picture_url ?? data.profile_picture ?? undefined,
  };

  // Store role flags + level in localStorage (matching crypt's pattern)
  if (data.level) {
    localStorage.setItem("user_level", data.level);
  }

  return { success: true, message: "", data: user };
}
