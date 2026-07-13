import z from "zod";
import { API } from "@/api/axios";
import type { ApiResponse, Meta } from "@/types";
import type { Task } from "@/types/task";

export const zTaskQuery = z.object({
  search: z.string().optional(),
  status: z.enum(["not started", "in progress", "completed", "all"]).optional(),
  priority: z.enum(["low", "medium", "high", "all"]).default("all").optional(),
  page: z.number().default(1).optional(),
  limit: z.number().default(10).optional(),
  sortBy: z
    .enum(["title", "createdAt", "startTime"])
    .default("createdAt")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
  completed: z.boolean().optional(),
  date: z.union([z.string(), z.date()]).optional(),
});

export type AllTasksQuery = z.infer<typeof zTaskQuery>;

export async function getTasks(
  params?: AllTasksQuery,
): Promise<ApiResponse<{ tasks: Task[]; meta: Meta }>> {
  const res = await API.get("/tasks", {
    params,
  });
  return res.data;
}
