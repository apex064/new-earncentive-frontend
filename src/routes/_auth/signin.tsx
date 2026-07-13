import { createFileRoute } from "@tanstack/react-router";
import AuthFormTabs from "@/components/auth/auth-form-tabs";
import SigninForm from "@/components/auth/signin-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_auth/signin")({
  component: Signin,
  head: () => ({
    meta: [
      { title: "Sign in — TaskMint" },
      {
        name: "description",
        content:
          "Welcome back — sign in to continue your streak and complete today's one task.",
      },

      // Open Graph
      { property: "og:title", content: "Sign in — TaskMint" },
      {
        property: "og:description",
        content:
          "Sign in to TaskMint to pick your daily focus, track streaks, and celebrate wins.",
      },

      { property: "og:type", content: "website" },
      { property: "og:url", content: "http://localhost:5173/signin" },
      {
        property: "og:image",
        content: "http://localhost:5173/taskmint-half.svg",
      },

      // misc
      { name: "robots", content: "noindex, nofollow" },
      { name: "theme-color", content: "#4f21a1" },
    ],
  }),
});

function Signin() {
  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="font-heading text-4xl font-bold">
          Signin
        </CardTitle>
        <CardDescription>
          Welcome back!, let continue where we left off
        </CardDescription>
      </CardHeader>

      <CardContent>
        <AuthFormTabs FormComponent={SigninForm} />
      </CardContent>
    </Card>
  );
}
