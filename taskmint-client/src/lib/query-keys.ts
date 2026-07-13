export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all] as const,
  // biome-ignore lint/suspicious/noExplicitAny: <...>
  list: (filters: Record<string, any>) =>
    [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

export const analyticsKeys = {
  all: ["analytics"] as const,
  goalSummary: ["goal-summary"] as const,
  weeklyProductivity: ["weekly-productivity"] as const,
};
