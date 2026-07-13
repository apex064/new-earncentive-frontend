// ─── Single Auth + User API for Rebackend (Earncentive Django Backend) ───
// All auth, user, and notification endpoints in one file.

import { API } from "@/api/axios";
import type { ApiResponse } from "@/types";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface RegisterPayload {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  agree_to_terms: boolean;
  referral_code?: string;
  recaptcha_token?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
  recaptcha_token?: string | null;
}

export interface GoogleAuthPayload {
  id_token: string;
  referral_code?: string;
  recaptcha_token?: string | null;
}

export interface PasswordResetRequestPayload {
  email: string;
  recaptcha_token?: string | null;
}

export interface PasswordResetConfirmPayload {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface TwoFactorVerifyPayload {
  email: string;
  code: string;
}

export interface AuthTokenResponse {
  token: string;
  user_id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  country?: string;
  message?: string;
}

export interface GoogleAuthResponse extends AuthTokenResponse {
  created: boolean;
  google_auth: boolean;
  referral_applied: boolean;
}

export interface TwoFactorRequiredResponse {
  requires_2fa: true;
  user_id: number;
  email: string;
  message: string;
}

export interface BanResponse {
  error: string;
  is_banned: true;
  ban_reason: string;
  banned_at: string;
}

// ═══════════════════════════════════════════════════════════════
// Notification Types
// ═══════════════════════════════════════════════════════════════

export interface NotificationItem {
  id: number;
  action: string;
  category: string;
  is_read: boolean;
  created_at: string;
  action_data?: Record<string, unknown> | null;
}

export interface PaginatedNotifications {
  count: number;
  next: string | null;
  previous: string | null;
  results: NotificationItem[];
}

// ═══════════════════════════════════════════════════════════════
// Auth Endpoints
// ═══════════════════════════════════════════════════════════════

export async function registerUser(data: RegisterPayload): Promise<AuthTokenResponse> {
  const res = await API.post<AuthTokenResponse>("/auth/register/", data, {
    skipAuthRefresh: true,
  });
  return res.data;
}

export async function loginUser(
  data: LoginPayload,
): Promise<AuthTokenResponse | TwoFactorRequiredResponse> {
  const res = await API.post<AuthTokenResponse | TwoFactorRequiredResponse>(
    "/auth/login/",
    data,
    { skipAuthRefresh: true },
  );
  return res.data;
}

export async function googleAuth(data: GoogleAuthPayload): Promise<GoogleAuthResponse> {
  const res = await API.post<GoogleAuthResponse>("/auth/google/", data, {
    skipAuthRefresh: true,
  });
  return res.data;
}

export async function logoutUser(): Promise<void> {
  await API.post("/auth/logout/");
}

export async function requestPasswordReset(
  data: PasswordResetRequestPayload,
): Promise<{ message?: string; detail?: string; error?: string }> {
  const res = await API.post("/auth/password-reset/", data, {
    skipAuthRefresh: true,
  });
  return res.data;
}

export async function confirmPasswordReset(
  data: PasswordResetConfirmPayload,
): Promise<{ message?: string; error?: string }> {
  const res = await API.post("/auth/password-reset/confirm/", data, {
    skipAuthRefresh: true,
  });
  return res.data;
}

export async function verifyEmail(
  token: string,
): Promise<{ message?: string; error?: string }> {
  const res = await API.post(
    "/auth/verify-email/",
    { token },
    { skipAuthRefresh: true },
  );
  return res.data;
}

export async function verifyTwoFactor(
  data: TwoFactorVerifyPayload,
): Promise<AuthTokenResponse> {
  const res = await API.post<AuthTokenResponse>("/auth/2fa/verify-login/", data, {
    skipAuthRefresh: true,
  });
  return res.data;
}

export async function getTwoFactorStatus(): Promise<{ enabled: boolean }> {
  const res = await API.get<{ enabled: boolean }>("/auth/2fa/status/");
  return res.data;
}

export async function validateReferralCode(
  code: string,
): Promise<{ valid: boolean; username?: string; error?: string }> {
  const res = await API.get(`/validate-referral/${code.toUpperCase()}/`);
  return res.data;
}

// ═══════════════════════════════════════════════════════════════
// User / Profile Endpoints
// ═══════════════════════════════════════════════════════════════

export interface RebackendUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string | null;
  profile_picture_url?: string | null;
  is_admin: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_moderator: boolean;
  level: string;
  country?: string;
  current_balance?: string;
  total_earned?: string;
}

export async function getUserProfile(userId: number): Promise<ApiResponse<RebackedUser>> {
  const res = await API.get(`/profile/${userId}/`);
  return { success: true, message: "", data: res.data };
}

export async function getCurrentUserProfile(): Promise<ApiResponse<RebackedUser>> {
  const res = await API.get("/profile/");
  return { success: true, message: "", data: res.data };
}

// ═══════════════════════════════════════════════════════════════
// Notification Endpoints
// ═══════════════════════════════════════════════════════════════

/** Fetch paginated notifications for the current user */
export async function fetchNotifications(
  filterBy: "all" | "read" | "unread" = "all",
  offset = 0,
  limit = 20,
): Promise<PaginatedNotifications> {
  const res = await API.get<PaginatedNotifications>("/notifications/", {
    params: { filter_by: filterBy, offset, limit },
  });
  return res.data;
}

/** Mark a single notification as read */
export async function markNotificationRead(notificationId: number): Promise<void> {
  await API.post(`/notifications/mark-read/${notificationId}/`);
}

/** Mark all notifications as read */
export async function markAllNotificationsRead(): Promise<{ status: string }> {
  const res = await API.post<{ status: string }>("/notifications/mark-all-read/");
  return res.data;
}
