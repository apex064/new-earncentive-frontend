import { createFileRoute } from "@tanstack/react-router";
import LeaderboardPage from "@/components/LeaderboardPage";

export const Route = createFileRoute("/dashboard/leaderboard")({
  component: LeaderboardPage,
  head: () => ({
    meta: [{ title: "Leaderboard — TaskMint" }, { name: "description", content: "See top earners and compete for the top spot." }],
  }),
});
