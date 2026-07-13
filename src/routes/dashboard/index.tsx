import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import z from "zod";
import ChessHome from "@/features/chess/pages/ChessHome";

export const TABS = ["upcoming", "board", "notes"] as const;

export const Route = createFileRoute("/dashboard/")({
  component: ChessHome,
  validateSearch: zodValidator(
    z.object({
      tab: z.enum(TABS).catch(TABS[0]).default(TABS[0]),
    }),
  ),
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
