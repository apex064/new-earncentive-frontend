// ─── Single Auth + User API for Rebackend (Earncentive Django Backend) ───
// All auth & user endpoints in one file. Uses Token-based auth (not JWT Bearer).

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
// Auth Endpoints
// ═══════════════════════════════════════════════════════════════

/** Register a new user */
export async function registerUser(data: RegisterPayload): Promise<AuthTokenResponse> {
  const res = await API.post<AuthTokenResponse>("/auth/register/", data, {
    skipAuthRefresh: true,
  });
  return res.data;
}

/** Login with email + password */
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

/** Google OAuth login/register */
export async function googleAuth(data: GoogleAuthPayload): Promise<GoogleAuthResponse> {
  const res = await API.post<GoogleAuthResponse>("/auth/google/", data, {
    skipAuthRefresh: true,
  });
  return res.data;
}

/** Logout — invalidates the token server-side */
export async function logoutUser(): Promise<void> {
  await API.post("/auth/logout/");
}

/** Request password reset email */
export async function requestPasswordReset(
  data: PasswordResetRequestPayload,
): Promise<{ message?: string; detail?: string; error?: string }> {
  const res = await API.post("/auth/password-reset/", data, {
    skipAuthRefresh: true,
  });
  return res.data;
}

/** Confirm password reset with token from email */
export async function confirmPasswordReset(
  data: PasswordResetConfirmPayload,
): Promise<{ message?: string; error?: string }> {
  const res = await API.post("/auth/password-reset/confirm/", data, {
    skipAuthRefresh: true,
  });
  return res.data;
}

/** Verify email with token from email */
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

/** Verify 2FA code during login */
export async function verifyTwoFactor(
  data: TwoFactorVerifyPayload,
): Promise<AuthTokenResponse> {
  const res = await API.post<AuthTokenResponse>("/auth/2fa/verify-login/", data, {
    skipAuthRefresh: true,
  });
  return res.data;
}

/** Check 2FA status for current user */
export async function getTwoFactorStatus(): Promise<{ enabled: boolean }> {
  const res = await API.get<{ enabled: boolean }>("/auth/2fa/status/");
  return res.data;
}

/** Validate a referral code */
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
  is_admin: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_moderator: boolean;
  level: string;
  country?: string;
  current_balance?: string;
  total_earned?: string;
}

/** Fetch current user's profile by ID */
export async function getUserProfile(userId: number): Promise<ApiResponse<RebackedUser>> {
  const res = await API.get(`/profile/${userId}/`);
  return { success: true, message: "", data: res.data };
}

/** Fetch current user's profile (no ID required — gets from token context) */
export async function getCurrentUserProfile(): Promise<ApiResponse<RebackedUser>> {
  // The rebackend expects user ID. We get it from the store.
  // This is called via the hook which injects the user ID.
  const res = await API.get("/profile/me/");
  return { success: true, message: "", data: res.data };
}
