"use client";

import { FileText, Gift, Gamepad2, Calendar, Monitor } from "lucide-react";
import { PiCoinsThin } from "react-icons/pi";
import { HiOutlineBanknotes } from "react-icons/hi2";
import { Task } from "@/hooks/useTasks";
import { useCurrency } from "@/contexts/CurrencyContext";

const taskIconMap: Record<
  string,
  { icon: React.ComponentType<{ className: string }>; color: string }
> = {
  survey: { icon: FileText, color: "bg-primary/20 text-primary" },
  offerwall: { icon: Gift, color: "bg-success/20 text-success" },
  gpt: { icon: Gamepad2, color: "bg-secondary/20 text-secondary" },
  daily_bonus: { icon: Calendar, color: "bg-warning/20 text-warning" },
  offerwall_task: { icon: Monitor, color: "bg-primary/20 text-primary" },
  default: { icon: FileText, color: "bg-muted/20 text-muted-foreground" },
};
interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  onStart: (taskId: number) => void;
}

// Status rail color: mirrors the difficulty badge semantics
function getDifficultyRailColor(difficulty?: string) {
  switch (difficulty) {
    case "easy":
      return "bg-success";
    case "medium":
      return "bg-warning";
    case "hard":
      return "bg-destructive";
    default:
      return "bg-primary";
  }
}

export function TaskCard({ task, onClick, onStart }: TaskCardProps) {
  const { formatDollarAmount, isDollarMode } = useCurrency();
  const CurrencyIcon = isDollarMode ? HiOutlineBanknotes : PiCoinsThin;
  const iconData = taskIconMap[task.type] || taskIconMap.default;
  const IconComponent = iconData.icon;

  return (
    <div
      className="relative flex-shrink-0 w-[31%] min-w-[110px] sm:w-32 bg-card rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group border border-border hover:border-primary/50 flex flex-col h-[220px]"
      onClick={() => onClick(task)}
    >
      {/* Vertical status rail */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 z-10 ${getDifficultyRailColor(task.difficulty)}`}
      />

      <div className="h-28 bg-background relative overflow-hidden flex-shrink-0">
        <img
          src="https://api.earnquestapp.com/static/default-avatar.png"
          alt={task.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Type icon chip - Top Left */}
        <div
          className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm ${iconData.color}`}
        >
          <IconComponent className="h-3 w-3" />
        </div>

        {/* Payout Badge - soft pill, tabular-nums */}
        <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm text-foreground px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm border border-border/50 flex items-center gap-1 tabular-nums">
          <CurrencyIcon className="h-2.5 w-2.5 text-primary" />
          {formatDollarAmount(parseFloat(task.reward_amount))}
        </div>
      </div>

      <div className="p-2 pl-2.5 flex flex-col flex-grow bg-card">
        <h3 className="font-semibold text-foreground text-[10px] leading-tight text-center line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {task.title}
        </h3>

        <div className="flex items-center justify-center text-[9px] text-muted-foreground mb-2">
          <span
            className={`rounded-full px-2 py-1 ${
              task.difficulty === "easy"
                ? "bg-success/10 text-success"
                : task.difficulty === "medium"
                  ? "bg-warning/10 text-warning"
                  : task.difficulty === "hard"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
            }`}
          >
            {task.difficulty || "Normal"}
          </span>
        </div>

        <div className="mt-auto pt-1">
          <button
            className="w-full py-1 rounded-lg font-medium transition-all text-[10px] flex items-center justify-center gap-1 bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onStart(task.id);
            }}
          >
            Start Task
          </button>
        </div>
      </div>
    </div>
  );
}
