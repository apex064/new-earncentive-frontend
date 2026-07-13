import { createFileRoute } from "@tanstack/react-router";
import ChessHome from "@/features/chess/pages/ChessHome";

export const Route = createFileRoute("/dashboard/chess")({
  component: ChessHome,
  head: () => ({
    meta: [
      { title: "Chess — TaskMint" },
      { name: "description", content: "Play 3D chess against AI or real opponents." },
    ],
  }),
});
