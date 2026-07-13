import { DollarSign, ChevronDown, Wallet } from "lucide-react";
import type { User } from "@/types";

/**
 * A mobile-responsive balance display pill.
 * Shows the available balance from the user profile.
 */
export function BalancePill({ user }: { user: User | undefined }) {
  const balance = user?.current_balance
    ? Number.parseFloat(user.current_balance).toFixed(2)
    : "0.00";

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-foreground border border-primary/20">
      <DollarSign size={14} className="text-primary shrink-0" />
      <span className="tabular-nums">${balance}</span>
      <ChevronDown size={12} className="text-muted-foreground shrink-0" />
    </div>
  );
}

/**
 * Balance display that also shows pending balance in an expanded popover.
 * Use as a trigger inside a Popover for the full balance details.
 */
export function BalancePopoverContent({
  user,
}: {
  user: User | undefined;
}) {
  const balance = user?.current_balance
    ? Number.parseFloat(user.current_balance).toFixed(2)
    : "0.00";
  const pending = user?.total_earned
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
        <span className="inline-flex items-center gap-1 font-semibold text-warning tabular-nums">
          ${pending}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Complete tasks and offers to increase your balance.
      </p>
    </div>
  );
}
