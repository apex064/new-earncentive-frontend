import { createFileRoute } from "@tanstack/react-router";
import ChessReady from "@/chess/ChessReady";

export const Route = createFileRoute("/dashboard/chess/ready/$id")({
  component: ChessReady,
});
