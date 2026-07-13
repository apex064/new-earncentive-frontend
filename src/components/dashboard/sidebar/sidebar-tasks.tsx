import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const sidebarTasks = [
  { id: 1, title: "Schedule post Dusk&Dawn", isCompleted: false },
  { id: 2, title: "Plan marketing campaign", isCompleted: true },
  { id: 3, title: "Prepare presentation for client", isCompleted: false },
];

function SidebarTasks() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between border-b py-2">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <Edit size={16} />
      </div>

      <ul className="mt-4 space-y-2">
        {sidebarTasks.map((task) => (
          <li
            key={task.id}
            className={cn("flex items-center gap-4 p-2", {
              "pointer-events-none opacity-50": task.isCompleted,
            })}
          >
            <Checkbox checked={task.isCompleted} />
            <span>{task.title}</span>
          </li>
        ))}
      </ul>

      <div className="flex justify-end">
        <Button className="mt-8">Schedule a Task</Button>
      </div>
    </div>
  );
}

export default SidebarTasks;
