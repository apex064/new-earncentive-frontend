import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

function StatusButton({
  className,
  priority,
  ...props
}: React.ComponentProps<typeof Badge> & {
  priority: Task["priority"];
}) {
  return (
    <Badge
      variant="outline"
      {...props}
      className={cn(
        priority === "high"
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400"
          : priority === "medium"
            ? "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-400"
            : "",
        className,
      )}
    >
      {priority}
    </Badge>
  );
}

export { StatusButton };
