import { createFileRoute } from "@tanstack/react-router";
import AuthFormTabs from "@/components/auth/auth-form-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_auth/verify-otp")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="font-heading text-4xl font-bold">
          Verify OTP
        </CardTitle>
        <CardDescription>
          Verify your otp, let continue where we left off
        </CardDescription>
      </CardHeader>

      <CardContent>
        <AuthFormTabs FormComponent={() => null} initialTab="form-otp" />
      </CardContent>
    </Card>
  );
}
