import { createFileRoute } from "@tanstack/react-router";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_auth/forgot-password")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "Forgot password — TaskMint" },
      {
        name: "description",
        content:
          "Reset your TaskMint password to regain access to your tasks, streaks, and progress.",
      },

      // Open Graph
      { property: "og:title", content: "Forgot password — TaskMint" },
      {
        property: "og:description",
        content:
          "Reset your TaskMint password to regain access to your tasks, streaks, and progress.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:url",
        content: "http://localhost:5173/forgot-password",
      },

      // misc
      { name: "robots", content: "noindex, nofollow" },
      { name: "theme-color", content: "#4f21a1" },
    ],
  }),
});

function RouteComponent() {
  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="font-heading text-3xl font-bold">
          Forgot Password
        </CardTitle>
        <CardDescription>
          Enter your email to initate forgotten password
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}
