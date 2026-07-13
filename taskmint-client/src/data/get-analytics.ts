import { API } from "@/api/axios";
import type { ApiResponse } from "@/types";

export type GoalSummary = {
  achievedValue: number;
  totalTasks: number;
  completedTasks: number;
};

export type ChartDataPoint = {
  label: string;
  value: number;
};

export const fetchGoalSummary = async (): Promise<ApiResponse<GoalSummary>> => {
  const res = await API.get("/analytics/goal-summary");
  return res.data;
};

// Fetcher function
export const fetchWeeklyProductivity = async (): Promise<
  ApiResponse<ChartDataPoint[]>
> => {
  const res = await API.get("/analytics/weekly-productivity");
  return res.data;
};
