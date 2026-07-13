import { createFileRoute } from "@tanstack/react-router";
import ChessHome from "@/chess/ChessHome";

export const Route = createFileRoute("/dashboard/")({
  component: ChessHome,
  head: () => ({
    meta: [
      { title: "Chess Lobby — TaskMint" },
      {
        name: "description",
        content: "Play 3D chess against AI or real opponents and compete for rewards.",
      },
    ],
  }),
});
