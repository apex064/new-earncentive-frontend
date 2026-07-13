/** biome-ignore-all lint/style/noNonNullAssertion: <...> */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { LayoutGrid, List, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { TaskDialog } from "@/components/dashboard/tasks/task-dialog";
import { TasksGridView } from "@/components/dashboard/tasks/tasks-grid-view";
import { TasksListView } from "@/components/dashboard/tasks/tasks-list-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zTaskQuery } from "@/data/get-tasks";
import { useDebounce } from "@/hooks/use-debouce";
import { useTasks } from "@/hooks/use-tasks";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

// --- Schema for URL Search Params ---
const tasksSearchSchema = z
  .object({
    view: z.enum(["list", "grid"]).catch("list").default("list"),
  })
  .extend(zTaskQuery.shape);

export const Route = createFileRoute("/dashboard/tasks")({
  component: TasksPage,
  validateSearch: zodValidator(tasksSearchSchema),
});

function TasksPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const searchParams = Route.useSearch();

  // Local state for search input to prevent aggressive URL updates while typing
  const [searchTerm, setSearchTerm] = useState(searchParams.search || "");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Sync debounced search to URL
  useEffect(() => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: debouncedSearch || undefined,
        page: 1,
      }),
      replace: true,
    });
  }, [debouncedSearch, navigate]);

  // Data Fetching
  const queryParams = {
    ...searchParams,
    status: searchParams.status === "all" ? undefined : searchParams.status,
    priority:
      searchParams.priority === "all" ? undefined : searchParams.priority,
    page: searchParams.page,
    limit: searchParams.limit,
  };

  const { data, isPending, isError } = useTasks(queryParams);

  const tasks = data?.data.tasks || [];
  const meta = data?.data.meta;

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setTaskToEdit(null);
    setIsDialogOpen(true);
  };

  // Pagination Handlers
  const handleNextPage = () => {
    if (meta?.nextPage) {
      navigate({ search: (prev) => ({ ...prev, page: meta.nextPage! }) });
    }
  };

  const handlePrevPage = () => {
    if (meta?.prevPage) {
      navigate({ search: (prev) => ({ ...prev, page: meta.prevPage! }) });
    }
  };

  return (
    <div className="flex h-full flex-col space-y-6 flex-1">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your daily tasks and track progress.
          </p>
        </div>

        {/* Actions Row: Contains Mobile View Toggle & Create Button */}
        <div className="flex items-center gap-2">
          <Button onClick={handleCreate} className="flex-1 md:flex-none">
            <Plus className="size-4" /> Create Task
          </Button>

          {/* Mobile Only: View Toggle */}
          <div className="md:hidden">
            <ViewTabs />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-card flex flex-col gap-4 rounded-lg border p-4 shadow-sm md:flex-row md:items-center">
        {/* Search Input: Full width on mobile, Flex-1 on desktop */}
        <div className="relative w-full md:flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search tasks..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-muted-foreground hover:text-foreground absolute top-3 right-3"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 w-full md:flex md:w-auto">
          <Select
            value={searchParams.status}
            onValueChange={(val) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  status: val as TaskStatus,
                  page: 1,
                }),
              })
            }
          >
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not started">Not Started</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={searchParams.priority}
            onValueChange={(val) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  priority: val as TaskPriority,
                  page: 1,
                }),
              })
            }
          >
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          {/* Desktop Only: View Toggle */}
          <div className="hidden md:block">
            <ViewTabs />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {isPending ? (
          <div className="space-y-4">
            <div className="bg-muted/50 h-10 w-full animate-pulse rounded-md" />
            <div className="bg-muted/50 h-10 w-full animate-pulse rounded-md" />
            <div className="bg-muted/50 h-10 w-full animate-pulse rounded-md" />
          </div>
        ) : isError ? (
          <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed text-center">
            <p className="text-lg font-medium">Something went wrong</p>
            <p className="text-muted-foreground">Failed to fetch tasks.</p>
            <Button
              variant="link"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed text-center">
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-muted-foreground">
              Try adjusting your filters or create a new task.
            </p>
            <Button onClick={handleCreate} className="mt-4" variant="outline">
              Create Task
            </Button>
          </div>
        ) : searchParams.view === "grid" ? (
          <TasksGridView tasks={tasks} onEdit={handleEdit} />
        ) : (
          <TasksListView tasks={tasks} onEdit={handleEdit} />
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <div className="text-muted-foreground mr-4 text-sm">
            Page {meta.page} of {meta.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={!meta.prevPage}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!meta.nextPage}
          >
            Next
          </Button>
        </div>
      )}

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}

function ViewTabs() {
  const navigate = useNavigate({ from: Route.fullPath });
  const searchParams = Route.useSearch();

  return (
    <div className="bg-background flex items-center rounded-md border px-1">
      <Tabs
        value={searchParams.view}
        onValueChange={(val) =>
          navigate({
            search: (prev) => ({ ...prev, view: val as "list" | "grid" }),
          })
        }
      >
        <TabsList className="h-8 bg-transparent p-0">
          <TabsTrigger
            value="list"
            className="data-[state=active]:bg-muted h-7 px-2"
          >
            <List className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger
            value="grid"
            className="data-[state=active]:bg-muted h-7 px-2"
          >
            <LayoutGrid className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
