import { Link } from "@tanstack/react-router";
import { AlertTriangle, Inbox } from "lucide-react";
import { useMemo } from "react";
import TaskCardSkeleton from "@/components/dashboard/tasks/task-card-skeleton";
import UpcomingTaskCard from "@/components/dashboard/tasks/upcoming-task-card";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useTasks } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";

function UpcomingTasksTab() {
  const currentDate = new Date();

  return (
    <section className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Today's Focus</h1>
        <p className="text-muted-foreground text-sm font-medium">
          {currentDate.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <UpcomingTasks />
    </section>
  );
}

function UpcomingTasks() {
  const todayDateString = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const { data, isPending, isError } = useTasks({
    date: todayDateString,
    sortBy: "startTime",
    sortOrder: "asc",
  });

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <TaskCardSkeleton key={`index-${i + 1}`} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-destructive/5 border-destructive/20 flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <AlertTriangle className="text-destructive mb-4 h-10 w-10" />
        <h2 className="text-destructive text-lg font-semibold">
          Could not load tasks
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Please check your connection and try again.
        </p>
      </div>
    );
  }

  if (!data?.data?.tasks || data.data.tasks.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox className="text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>No tasks for today</EmptyTitle>
          <EmptyDescription>
            You're free! Or maybe you should plan something?
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link className={cn(buttonVariants())} to={"/dashboard/tasks"}>
            Manage Tasks
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {data.data.tasks.map((task) => (
        <UpcomingTaskCard key={task._id} task={task} />
      ))}
    </div>
  );
}

export default UpcomingTasksTab;
