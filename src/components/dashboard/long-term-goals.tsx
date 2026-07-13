import { Ellipsis, Target } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGoalSummary } from "@/hooks/use-analytics";

const LongTermGoals = () => {
  const { data, isPending, isError } = useGoalSummary();

  const achievedValue = data?.data?.achievedValue ?? 0;
  const totalTasksCompleted = data?.data?.completedTasks ?? 0;
  const remainingValue = Math.max(0, 100 - achievedValue);

  const pieData = [
    { name: "Achieved", value: achievedValue, color: "#5624B2" },
    { name: "Remaining", value: remainingValue, color: "#E5E7EB" }, // Gray-200 for remaining
  ];

  if (isPending) return <Skeleton className="h-[300px] w-full rounded-xl" />;

  if (isError) {
    return (
      <div className="border-destructive/50 bg-destructive/5 text-destructive flex h-[300px] items-center justify-center rounded-xl border border-dashed p-4 text-center text-sm">
        Failed to load goal data
      </div>
    );
  }

  return (
    <div className="border-border/50 bg-card flex h-full w-full flex-col rounded-xl border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Long Term Goals
          </h2>
          <p className="text-muted-foreground text-xs">
            Overall progress tracker
          </p>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Ellipsis size={16} />
        </Button>
      </div>

      <div className="relative min-h-[200px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={450}
              paddingAngle={5}
              dataKey="value"
              cornerRadius={10}
              stroke="none"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [`${value}%`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-primary text-3xl font-bold">
            {achievedValue}%
          </span>
          <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Done
          </span>
        </div>
      </div>

      <div className="bg-accent/30 mt-4 flex items-center justify-center gap-2 rounded-lg p-3">
        <Target className="text-primary size-4" />
        <span className="text-sm font-medium">
          {totalTasksCompleted} {totalTasksCompleted === 1 ? "Goal" : "Goals"}{" "}
          Achieved
        </span>
      </div>
    </div>
  );
};

export default LongTermGoals;
