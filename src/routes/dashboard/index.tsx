import { createFileRoute } from "@tanstack/react-router";
import ChessLobby from "@/chess/ChessLobby";

export const Route = createFileRoute("/dashboard/")({
  component: ChessLobby,
  head: () => ({
    meta: [
      { title: "Chess Arena — TaskMint" },
      { name: "description", content: "Play chess against AI or real opponents. Create lobbies, join games, and compete for rewards." },
    ],
  }),
});
