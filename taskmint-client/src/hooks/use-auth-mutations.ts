import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  googleAuth,
  loginUser,
  logoutUser,
  registerUser,
  verifyTwoFactor,
  requestPasswordReset,
  confirmPasswordReset,
} from "@/api/auth";
import type {
  AuthTokenResponse,
  TwoFactorRequiredResponse,
} from "@/api/auth";
import { parseAxiosError } from "@/lib/parse-axios-error";
import { useAuthStore } from "@/store/auth-store";

// ─── SIGN IN ───
export function useSigninMutation() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setUnverifiedAuth = useAuthStore((s) => s.setUnverifiedAuth);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      // Check if 2FA is required
      if ("requires_2fa" in response && response.requires_2fa) {
        setUnverifiedAuth(
          "", // token comes after 2FA verify
          response.user_id,
          "", // username not available yet
          response.email,
        );
        toast.info("Two-factor authentication required");
        navigate({ to: "/verify-otp" });
        return;
      }

      // Normal login success
      const data = response as AuthTokenResponse;
      setAuth(data.token, data.user_id, data.username, data.email);
      toast.success(data.message || "Welcome back!");
      navigate({ to: "/dashboard", replace: true });
    },
    onError: (error) => {
      const { message } = parseAxiosError(error);
      toast.error(message);
    },
  });
}

// ─── SIGN UP ───
export function useSignupMutation() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setAuth(data.token, data.user_id, data.username, data.email);
      toast.success(data.message || "Account created successfully!");
      navigate({ to: "/dashboard", replace: true });
    },
    onError: (error) => {
      const { message } = parseAxiosError(error);
      toast.error(message);
    },
  });
}

// ─── GOOGLE LOGIN ───
export function useGoogleLoginMutation() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: googleAuth,
    onSuccess: (data) => {
      setAuth(data.token, data.user_id, data.username, data.email);
      toast.success(
        data.referral_applied
          ? "Google sign-in successful with referral bonus!"
          : data.created
            ? "Account created with Google!"
            : "Welcome back!",
      );
      navigate({ to: "/dashboard", replace: true });
    },
    onError: (error) => {
      const { message } = parseAxiosError(error);
      toast.error(message);
    },
  });
}

// ─── 2FA VERIFICATION ───
export function useVerifyOtpMutation() {
  const navigate = useNavigate();
  const markVerified = useAuthStore((s) => s.markVerified);

  return useMutation({
    mutationFn: verifyTwoFactor,
    onSuccess: (data) => {
      markVerified(data.token);
      // Also update username in store
      useAuthStore.setState({
        username: data.username,
        userId: data.user_id,
        email: data.email,
      });
      localStorage.setItem("username", data.username);
      localStorage.setItem("user_id", String(data.user_id));
      localStorage.setItem(
        "user",
        JSON.stringify({ id: data.user_id, username: data.username, email: data.email }),
      );
      toast.success("Verification successful!");
      navigate({ to: "/dashboard", replace: true });
    },
    onError: (error) => {
      const { message } = parseAxiosError(error);
      toast.error(message);
    },
  });
}

// ─── FORGOT PASSWORD ─── (sends reset email)
export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: (data) => {
      toast.success(data.message || "Password reset link sent! Check your email.");
    },
    onError: (error) => {
      const { message } = parseAxiosError(error);
      toast.error(message);
    },
  });
}

// ─── RESET PASSWORD ─── (confirms with token)
export function useResetPasswordMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: confirmPasswordReset,
    onSuccess: (data) => {
      toast.success(data.message || "Password reset successful!");
      navigate({ to: "/signin" });
    },
    onError: (error) => {
      const { message } = parseAxiosError(error);
      toast.error(message);
    },
  });
}

// ─── LOGOUT ───
export function useLogoutMutation() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      clearAuth();
      navigate({ to: "/signin" });
      toast.success("Logged out successfully");
    },
  });
}
