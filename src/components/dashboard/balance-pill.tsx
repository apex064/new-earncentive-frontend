import { DollarSign, ChevronDown, Wifi, WifiOff } from "lucide-react";
import { useWsConnectionState } from "@/hooks/use-realtime";
import type { User } from "@/types";

/**
 * A mobile-responsive balance display pill.
 * Shows the available balance and a WebSocket connection indicator.
 */
export function BalancePill({ user }: { user: User | undefined }) {
  const { balanceConnected } = useWsConnectionState();

  const balance = user?.current_balance
    ? Number.parseFloat(user.current_balance).toFixed(2)
    : "0.00";

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-foreground border border-primary/20">
      <DollarSign size={14} className="text-primary shrink-0" />
      <span className="tabular-nums">${balance}</span>
      {/* WS connection indicator (mirrors crypt's Wifi/WifiOff) */}
      {balanceConnected ? (
        <Wifi size={10} className="text-green-500 shrink-0" />
      ) : (
        <WifiOff size={10} className="text-yellow-500 shrink-0" />
      )}
      <ChevronDown size={12} className="text-muted-foreground shrink-0" />
    </div>
  );
}

/**
 * Balance popover content — shows available + total earned.
 */
export function BalancePopoverContent({ user }: { user: User | undefined }) {
  const balance = user?.current_balance
    ? Number.parseFloat(user.current_balance).toFixed(2)
    : "0.00";
  const totalEarned = user?.total_earned
    ? Number.parseFloat(user.total_earned).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-foreground/70">
        <span>Available</span>
        <span className="font-semibold text-foreground tabular-nums">
          ${balance}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>Total Earned</span>
        <span className="font-semibold tabular-nums text-warning">
          ${totalEarned}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>Pending Balance</span>
        <span className="font-semibold tabular-nums text-muted-foreground">
          ${user?.pending_balance
            ? Number.parseFloat(user.pending_balance).toFixed(2)
            : "0.00"}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Complete tasks and offers to increase your balance.
      </p>
    </div>
  );
}
