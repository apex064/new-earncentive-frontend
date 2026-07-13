import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { parseAxiosError } from "@/lib/parse-axios-error";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"];

/** Fetch notifications from the backend with polling fallback */
export function useNotifications(filterBy: "all" | "read" | "unread" = "all") {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, filterBy],
    queryFn: () => fetchNotifications(filterBy),
    enabled: !!token,
    staleTime: 15_000,
    // Poll every 5s as fallback when WebSocket is not connected (mirrors crypt)
    refetchInterval: 5_000,
  });
}

/** Mark a single notification as read */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
    onError: (error) => {
      const { message } = parseAxiosError(error);
      toast.error(message);
    },
  });
}

/** Mark all notifications as read */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: (data) => {
      toast.success(data.status || "All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
    onError: (error) => {
      const { message } = parseAxiosError(error);
      toast.error(message);
    },
  });
}
