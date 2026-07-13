import { format } from "date-fns";
import { TaskActions } from "@/components/dashboard/tasks/task-action";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

interface TasksListViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export function TasksListView({ tasks, onEdit }: TasksListViewProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task._id}>
              <TableCell className="max-w-[300px]">
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "truncate font-medium",
                      task.completed && "text-muted-foreground line-through",
                    )}
                  >
                    {task.title}
                  </span>
                  {task.description && (
                    <span className="text-muted-foreground max-w-[200px] truncate text-xs">
                      {task.description}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={task.status === "completed" ? "default" : "outline"}
                  className="capitalize"
                >
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={
                    task.priority === "high"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : task.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "capitalize"
                  }
                >
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  <span className="font-medium">
                    {format(new Date(task.startTime), "MMM dd, yyyy")}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {format(new Date(task.startTime), "h:mm a")} -{" "}
                    {format(new Date(task.endTime), "h:mm a")}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <TaskActions task={task} onEdit={onEdit} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
