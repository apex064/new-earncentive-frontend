import { createFileRoute } from "@tanstack/react-router";
import ChessLobby from "@/features/chess/pages/ChessLobby";

export const Route = createFileRoute("/dashboard/chess/lobby")({
  component: ChessLobby,
});
