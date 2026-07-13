import { createFileRoute } from "@tanstack/react-router";
import ChessReady from "@/features/chess/pages/ChessReady";

export const Route = createFileRoute("/dashboard/chess/ready/$id")({
  component: ChessReady,
});
