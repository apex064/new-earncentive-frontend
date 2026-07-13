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
    staleTime: 5 * 60 * 1000, // 5 minutes (profile changes less often)
    retry: false,
    enabled: !!token,
  });
};

export const useUser = () => {
  const token = useAuthStore((s) => s.token);
  return useQuery(userQueryOptions(token));
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: ({ data }: { userId: string; data: UpdateUserPl }) =>
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
