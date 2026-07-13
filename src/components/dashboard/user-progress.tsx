import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useGoalSummary } from "@/hooks/use-analytics";

function UserProgress() {
  const { data, isPending } = useGoalSummary();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (data?.data?.achievedValue) {
      const timer = setTimeout(() => setProgress(data.data.achievedValue), 100);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (isPending) {
    return (
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-2 flex-1" />
        <Skeleton className="h-4 w-12" />
      </div>
    );
  }

  const achieved = data?.data?.achievedValue ?? 0;

  return (
    <div className="text-muted-foreground flex items-center gap-4 text-sm font-medium">
      <h3>Overall</h3>
      <Progress value={progress} className="flex-1" />
      <p className="min-w-[4ch] text-right">{achieved}%</p>
    </div>
  );
}

export default UserProgress;
