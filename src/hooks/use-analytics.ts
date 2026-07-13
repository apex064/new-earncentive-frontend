import { useQuery } from "@tanstack/react-query";
import {
  fetchGoalSummary,
  fetchWeeklyProductivity,
} from "@/data/get-analytics";

export const useGoalSummary = () => {
  return useQuery({
    queryKey: ["goal-summary"],
    queryFn: fetchGoalSummary,
    staleTime: 5 * 60 * 1000,
  });
};

export const useWeeklyProductivity = () => {
  return useQuery({
    queryKey: ["weekly-productivity"],
    queryFn: fetchWeeklyProductivity,
    staleTime: 5 * 60 * 1000,
  });
};
