import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function TaskCardSkeleton() {
  return (
    <Card className="border-border/50 rounded-3xl pt-4 pb-0 shadow-lg">
      <CardHeader className="px-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <Skeleton className="h-7 w-3/4 rounded-md" />
        <div className="space-y-2 pt-1">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </CardHeader>
      <CardContent className="from-primary/12 to-accent/20 mt-auto flex items-center justify-between rounded-t-xl rounded-b-[inherit] bg-gradient-to-b p-4 text-sm">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export default TaskCardSkeleton;
