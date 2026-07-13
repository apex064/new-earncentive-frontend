import { createFileRoute, useNavigate } from "@tanstack/react-router";
import AuthFormTabs from "@/components/auth/auth-form-tabs";
import SigninForm from "@/components/auth/signin-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_landing/_home/signin/modal")({
  component: SigninModal,
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

function SigninModal() {
  const navigate = useNavigate();
  return (
    <Dialog
      defaultOpen
      onOpenChange={(open) => {
        if (!open) {
          navigate({
            to: "/",
          });
        }
      }}
    >
      <DialogContent className="mx-auto max-w-sm sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading text-left text-4xl font-bold">
            Signin
          </DialogTitle>
          <DialogDescription>
            Welcome back!, let continue where we left off
          </DialogDescription>
        </DialogHeader>

        <AuthFormTabs
          formProps={{ useOneTap: false }}
          FormComponent={SigninForm}
        />
      </DialogContent>
    </Dialog>
  );
}
