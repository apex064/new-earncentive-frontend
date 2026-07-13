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
    profileImg: data.profile_picture ?? data.profile_picture ?? undefined,
  };

  // Store role flags in localStorage (matching crypt's pattern)
  if (user.is_admin !== undefined) {
    localStorage.setItem("is_admin", user.is_admin ? "true" : "false");
  }
  if (user.is_staff !== undefined) {
    localStorage.setItem("is_staff", user.is_staff ? "true" : "false");
  }
  if (user.is_superuser !== undefined) {
    localStorage.setItem("is_superuser", user.is_superuser ? "true" : "false");
  }
  if (user.is_moderator !== undefined) {
    localStorage.setItem("is_moderator", user.is_moderator ? "true" : "false");
  }
  if (user.level) {
    localStorage.setItem("user_level", user.level);
  }

  return { success: true, message: "", data: user };
}
