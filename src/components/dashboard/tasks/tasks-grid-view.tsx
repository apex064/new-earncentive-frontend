import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { TaskActions } from "@/components/dashboard/tasks/task-action";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

interface TasksGridViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export function TasksGridView({ tasks, onEdit }: TasksGridViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <Card
          key={task._id}
          className={cn(
            "flex flex-col gap-0 p-0 shadow-sm transition-shadow hover:shadow-md",
            task.completed ? "opacity-75" : "",
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3">
            <div className="flex flex-col gap-1">
              <Badge
                variant="outline"
                className={
                  task.priority === "high"
                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400"
                    : task.priority === "medium"
                      ? "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-400"
                      : ""
                }
              >
                {task.priority}
              </Badge>
            </div>
            <TaskActions task={task} onEdit={onEdit} />
          </CardHeader>

          <CardContent className="flex-1 px-4 py-2">
            <h3
              className={cn(
                "line-clamp-1 leading-none font-semibold tracking-tight",
                task.completed && "text-muted-foreground line-through",
              )}
              title={task.title}
            >
              {task.title}
            </h3>
            <p className="text-muted-foreground mt-2 line-clamp-2 min-h-10 text-sm">
              {task.description || "No description provided."}
            </p>
          </CardContent>

          <CardFooter className="bg-muted/20 text-muted-foreground flex flex-col gap-2 border-t p-3 text-xs">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(task.startTime), "MMM dd")}
              </div>
              <Badge
                variant={task.status === "completed" ? "default" : "secondary"}
                className="h-5 text-[10px]"
              >
                {task.status}
              </Badge>
            </div>
            <div className="text-muted-foreground/80 flex w-full items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {format(new Date(task.startTime), "h:mm a")} -{" "}
                {format(new Date(task.endTime), "h:mm a")}
              </span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
