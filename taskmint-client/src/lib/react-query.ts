import { QueryCache, QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useAuthStore } from "@/store/auth-store";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        console.error("Auth error detected (401). Logging out.");
        useAuthStore.getState().clearAuth();
      }
    },
  }),
});
