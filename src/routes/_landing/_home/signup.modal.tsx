import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import z from "zod";
import AuthFormTabs from "@/components/auth/auth-form-tabs";
import SignupForm from "@/components/auth/signup-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PLANS } from "@/constants/pricing";

export const Route = createFileRoute("/_landing/_home/signup/modal")({
  component: SignupModal,
  validateSearch: zodValidator(z.object({ plan: z.enum(PLANS).optional() })),
  head: () => ({
    meta: [
      { title: "Create your free TaskMint account — One task. Big momentum." },
      {
        name: "description",
        content:
          "Create a TaskMint account to focus on one task at a time, build streaks, and celebrate progress. Start for free.",
      },

      { property: "og:title", content: "Create your free TaskMint account" },
      {
        property: "og:description",
        content:
          "Focus on one task at a time, track streaks, and celebrate tiny wins with TaskMint.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "http://localhost:5173/signup" },
      {
        property: "og:image",
        content: "http://localhost:5173/taskmint-half.svg",
      },

      { name: "robots", content: "noindex, nofollow" },
      { name: "theme-color", content: "#4f21a1" },
    ],
  }),
  errorComponent: ({ error }) => <div>Error: {error.message}</div>,
});

function SignupModal() {
  const navigate = useNavigate();
  const { plan } = Route.useSearch();

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
            Signup
          </DialogTitle>
          <DialogDescription>
            Join us and start enjoying tiny wins
          </DialogDescription>
        </DialogHeader>

        <AuthFormTabs
          formProps={{ plan, useOneTap: false }}
          FormComponent={SignupForm}
        />
      </DialogContent>
    </Dialog>
  );
}
