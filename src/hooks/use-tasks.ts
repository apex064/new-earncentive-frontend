import { useQuery } from "@tanstack/react-query";
import { type AllTasksQuery, getTasks } from "@/data/get-tasks";
import { taskKeys } from "@/lib/query-keys";

export const useTasks = (queries?: AllTasksQuery) => {
  return useQuery({
    queryKey: taskKeys.list(queries || {}),
    queryFn: () => getTasks(queries),
    staleTime: 5 * 60 * 1000,
  });
};
