import type { Meta, User } from "@/types";

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "not started" | "in progress" | "completed";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  completed: boolean;
  startTime: string; // ISO String
  endTime: string; // ISO String
  createdAt: string;
  updatedAt: string;
  user: Pick<User, "id" | "fullname" | "email" | "role" | "username">;
}

export interface TasksResponse {
  tasks: Task[];
  meta: Meta;
}
