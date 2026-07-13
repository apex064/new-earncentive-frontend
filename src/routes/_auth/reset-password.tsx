import { createFileRoute, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import z from "zod";
import ResetPasswordForm from "@/components/auth/reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_auth/reset-password")({
  component: RouteComponent,
  validateSearch: zodValidator(z.object({ token: z.string().optional() })),
  beforeLoad: ({ search }) => {
    if (!search.token) return redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Reset password — TaskMint" },
      {
        name: "description",
        content:
          "Choose a new password to secure your TaskMint account and continue building momentum.",
      },

      // Open Graph
      { property: "og:title", content: "Reset password — TaskMint" },
      {
        property: "og:description",
        content:
          "Choose a new password to secure your TaskMint account and continue building momentum.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:url",
        content: "http://localhost:5173/reset-password",
      },

      // misc
      { name: "robots", content: "noindex, nofollow" },
      { name: "theme-color", content: "#4f21a1" },
    ],
  }),
});

function RouteComponent() {
  const { token } = Route.useSearch();

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="font-heading text-3xl font-bold">
          Reset Password
        </CardTitle>
        <CardDescription>Enter your new credentials</CardDescription>
      </CardHeader>

      <CardContent>
        <ResetPasswordForm token={token!} />
      </CardContent>
    </Card>
  );
}
