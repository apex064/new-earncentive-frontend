import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusButton } from "@/components/ui/priority-btn";
import { useToggleTaskCompleteMutation } from "@/hooks/use-task-mutations";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

const getTaskTimeStatus = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  if (date < now) return "Overdue";
  return format(date, "h:mm a");
};

function UpcomingTaskCard({ task }: { task: Task }) {
  const { mutate: toggleComplete, isPending } = useToggleTaskCompleteMutation();

  return (
    <Card
      className={cn(
        "flex flex-col gap-0 border-l-4 py-2! shadow-sm transition-all hover:shadow-md",
        task.completed ? "border-l-green-500 opacity-60" : "border-l-primary",
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={task.completed}
            disabled={isPending}
            onCheckedChange={(checked) =>
              toggleComplete({ _id: task._id, completed: checked as boolean })
            }
          />
          <div className="space-y-1">
            <CardTitle
              className={cn(
                "max-w-[200px] truncate text-base leading-none font-semibold",
                task.completed && "text-muted-foreground line-through",
              )}
            >
              {task.title}
            </CardTitle>
            <p className="text-muted-foreground line-clamp-1 text-xs">
              {task.description || "No description"}
            </p>
          </div>
        </div>

        <StatusButton priority={task.priority}>{task.priority}</StatusButton>
      </CardHeader>

      <CardFooter className="bg-muted/30 text-muted-foreground mt-auto flex items-center justify-between border-t px-4 py-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {format(new Date(task.startTime), "h:mm a")} -{" "}
            {format(new Date(task.endTime), "h:mm a")}
          </span>
        </div>

        {/* Dynamic status text */}
        {!task.completed && (
          <span
            className={cn(
              "font-medium",
              getTaskTimeStatus(task.endTime) === "Overdue"
                ? "text-destructive"
                : "text-primary",
            )}
          >
            {getTaskTimeStatus(task.endTime)}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}

export default UpcomingTaskCard;
