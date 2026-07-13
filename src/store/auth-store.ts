import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { queryClient } from "@/lib/react-query";

export interface AuthState {
  token: string | null;
  userId: number | null;
  username: string | null;
  email: string | null;
  isAuthed: boolean;
  isOtpVerified: boolean;
  setAuth: (token: string, userId: number, username: string, email?: string) => void;
  setUnverifiedAuth: (token: string, userId: number, username: string, email?: string) => void;
  markVerified: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      username: null,
      email: null,
      isAuthed: false,
      isOtpVerified: false,

      setAuth: (token, userId, username, email) => {
        set({
          token,
          userId,
          username,
          email: email ?? null,
          isAuthed: true,
          isOtpVerified: true,
        });
        // Also store in localStorage for non-zustand consumers (matching crypt pattern)
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("user_id", String(userId));
        localStorage.setItem(
          "user",
          JSON.stringify({ id: userId, username, email }),
        );
        queryClient.invalidateQueries({ queryKey: ["user"] });
      },

      setUnverifiedAuth: (token, userId, username, email) => {
        set({
          token,
          userId,
          username,
          email: email ?? null,
          isAuthed: true,
          isOtpVerified: false,
        });
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("user_id", String(userId));
      },

      markVerified: (token) => {
        set({ isOtpVerified: true, token });
        localStorage.setItem("token", token);
        queryClient.invalidateQueries({ queryKey: ["user"] });
      },

      clearAuth: () => {
        set({
          token: null,
          userId: null,
          username: null,
          email: null,
          isAuthed: false,
          isOtpVerified: false,
        });
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user");
        localStorage.removeItem("is_admin");
        localStorage.removeItem("is_staff");
        localStorage.removeItem("is_superuser");
        localStorage.removeItem("is_moderator");
        localStorage.removeItem("user_level");
        queryClient.clear();
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
