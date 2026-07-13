import { createFileRoute } from "@tanstack/react-router";
import ChessLobby from "@/chess/ChessLobby";

export const Route = createFileRoute("/dashboard/chess/lobby")({
  component: ChessLobby,
});
