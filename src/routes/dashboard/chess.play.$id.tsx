import { createFileRoute } from "@tanstack/react-router";
import ChessPlay from "@/chess/ChessPlay";

export const Route = createFileRoute("/dashboard/chess/play/$id")({
  component: ChessPlay,
});
