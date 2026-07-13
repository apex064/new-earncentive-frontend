import { createFileRoute } from "@tanstack/react-router";
import ChessPlay from "@/features/chess/pages/ChessPlay";

export const Route = createFileRoute("/dashboard/chess/play/$id")({
  component: ChessPlay,
});
