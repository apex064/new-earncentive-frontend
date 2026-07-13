// ─── User CRUD for Rebackend (Earncentive Django Backend) ───
// Profile update, picture upload, etc.

import { API } from "@/api/axios";
import type { ApiResponse, User } from "@/types";

export type UpdateUserPl = {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  country?: string;
};

/** Update user profile fields */
export async function updateUser(
  userId: string,
  data: UpdateUserPl,
): Promise<ApiResponse<{ user: User }>> {
  const res = await API.patch(`/profile/${userId}/`, data);
  return { success: true, message: "Profile updated", data: res.data };
}

/** Upload profile picture */
export async function updateProfilePicture(
  formData: FormData,
): Promise<ApiResponse<{ user: User }>> {
  const res = await API.post("/profile/picture/upload/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return { success: true, message: "Profile picture updated", data: res.data };
}
