import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_landing/_home/")({
  component: Index,
});

function Index() {
  return null;
}
