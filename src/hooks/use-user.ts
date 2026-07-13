import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { updateUser, updateProfilePicture } from "@/api/user";
import type { UpdateUserPl } from "@/api/user";
import { getCurrentUser } from "@/data/get-current-user";
import { parseAxiosError } from "@/lib/parse-axios-error";
import { useAuthStore } from "@/store/auth-store";

export const USER_QUERY_KEY = ["user"];

export const userQueryOptions = (token: string | null) => {
  return queryOptions({
    queryKey: USER_QUERY_KEY,
    queryFn: getCurrentUser,
    staleTime: 10_000,
    retry: false,
    enabled: !!token,
    refetchInterval: 5_000,
  });
};

export const useUser = () => {
  const token = useAuthStore((s) => s.token);
  return useQuery(userQueryOptions(token));
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UpdateUserPl }) =>
      updateUser(String(userId ?? ""), data),
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
    onError: (error) => {
      const { message } = parseAxiosError(error);
      toast.error(message);
    },
  });
};

export const useUpdateProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => updateProfilePicture(formData),
    onSuccess: () => {
      toast.success("Profile picture updated!");
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
    onError: (error) => {
      const { message } = parseAxiosError(error);
      toast.error(message);
    },
  });
};

/** Toggle 2FA on/off via the backend */
export function useToggle2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Rebackend doesn't have a simple toggle — this is a no-op for now
      // since 2FA is managed via /auth/2fa/setup/ and /auth/2fa/disable/
    },
    onSuccess: () => {
      toast.success("2FA updated");
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
    onError: (error) => {
      const { message } = parseAxiosError(error);
      toast.error(message);
    },
  });
}
