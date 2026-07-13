import axios from "axios";
import { parseAxiosError } from "@/lib/parse-axios-error";
import { useAuthStore } from "@/store/auth-store";

// Rebackend API base URL (Earncentive Django backend)
const API_URL = import.meta.env.VITE_API_URL || "https://api.earnquestapp.com/api";

export const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 60_000,
});

// Attach DRF Token auth to every request
API.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Global error handling — clear auth on 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Don't clear auth on login/register/forgot-password pages
      if (
        !currentPath.includes("/signin") &&
        !currentPath.includes("/signup") &&
        !currentPath.includes("/forgot-password") &&
        !currentPath.includes("/reset-password")
      ) {
        console.error("Auth error (401). Logging out.");
        useAuthStore.getState().clearAuth();
      }
    }
    return Promise.reject(error);
  },
);
