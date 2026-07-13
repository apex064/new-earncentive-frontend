import { CheckCheck, Loader } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-notifications";
import type { NotificationItem } from "@/api/auth";

/** Get a nice icon/emoji for each notification category */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    deposit: "💰 Deposit",
    withdrawal: "🏦 Withdrawal",
    withdrawal_declined: "❌ Declined",
    withdrawal_suspended: "⏸️ Suspended",
    withdrawal_error: "⚠️ Error",
    referral: "👥 Referral",
    tasks: "✅ Tasks",
    bonus: "🎁 Bonus",
    ticket: "🎫 Support",
    achievement: "🏆 Achievement",
    offerwall: "📋 Offerwall",
    surveys: "📊 Surveys",
    kyc: "🪪 KYC",
    security: "🔐 Security",
    chargeback: "↩️ Chargeback",
    advertising: "📢 Advertising",
    account_banned: "🚫 Banned",
    chat_reply: "💬 Chat Reply",
    chat_mention: "💬 Mention",
    faucet: "💧 Faucet",
    chess: "♟️ Chess",
    admin: "🛡️ Admin",
    general: "📌 General",
  };
  return labels[category] || `📌 ${category}`;
}

function Notifications() {
  const {
    data,
    isLoading,
    isError,
  } = useNotifications("all");
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } =
    useMarkAllNotificationsRead();

  const notifications: NotificationItem[] = data?.results ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="py-4">
            <CardHeader className="px-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Could not load notifications.
        </p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No notifications yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with mark-all-read */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">
            {unreadCount} unread
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={isMarkingAll}
            onClick={() => markAllRead()}
            className="h-auto gap-1 text-xs"
          >
            <CheckCheck size={12} />
            {isMarkingAll ? "Marking..." : "Mark all read"}
          </Button>
        </div>
      )}

      {/* Notification cards */}
      <div className="grid grid-cols-1 gap-3">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkRead={markRead}
          />
        ))}
      </div>
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: NotificationItem;
  onMarkRead: (id: number) => void;
}) {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
  });

  return (
    <Card
      className={`cursor-pointer py-4 transition-colors ${
        !notification.is_read ? "border-primary/30 bg-primary/5" : ""
      }`}
      onClick={() => {
        if (!notification.is_read) {
          onMarkRead(notification.id);
        }
      }}
    >
      <CardHeader className="px-4 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-tight">
            {notification.action}
          </CardTitle>
          {!notification.is_read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <CardDescription className="flex items-center justify-between gap-2 text-xs">
          <span>{getCategoryLabel(notification.category)}</span>
          <span>{timeAgo}</span>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export default Notifications;
