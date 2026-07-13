import { zodResolver } from "@hookform/resolvers/zod";
import { type CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldGroup, FieldSeparator } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import type { PlanName } from "@/constants/pricing";
import {
  useGoogleLoginMutation,
  useSignupMutation,
} from "@/hooks/use-auth-mutations";
import { useReCaptcha } from "@/hooks/use-recaptcha";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, { message: "Fullname is required" }),
  email: z.email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .regex(/.{6,}/, { message: "Password must be at least 6 characters" })
    .regex(/[0-9]/, { message: "Password must contain at least 1 number" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least 1 uppercase letter",
    }),
});

export type SignUpFormData = z.infer<typeof formSchema>;

export default function SignupForm({
  plan,
  useOneTap = true,
}: {
  plan?: PlanName;
  useOneTap?: boolean;
}) {
  const { mutate: signup, isPending } = useSignupMutation();
  const { mutate: googleLogin } = useGoogleLoginMutation();
  const { executeRecaptcha } = useReCaptcha();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignUpFormData) {
    // Split full name into first/last for rebackend compatibility
    const [firstName, ...lastNameParts] = data.name.trim().split(" ");
    const lastName = lastNameParts.join(" ");

    const recaptchaToken = await executeRecaptcha("register");

    signup({
      username: data.email.split("@")[0],
      first_name: firstName || "",
      last_name: lastName || "",
      email: data.email,
      password: data.password,
      confirm_password: data.password,
      agree_to_terms: true,
      recaptcha_token: recaptchaToken,
    });
  }

  function handleGoogleSuccess(credentialResponse: CredentialResponse): void {
    if (!credentialResponse.credential) {
      toast.error("Google sign-in failed. No credential received.");
      return;
    }
    googleLogin({ id_token: credentialResponse.credential });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fullname</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FieldGroup>
          <Button
            disabled={isPending}
            type="submit"
            size="lg"
            className="w-full"
          >
            {isPending ? "Signing up..." : "Signup"} <ChevronRight />
          </Button>

          <FieldSeparator>or</FieldSeparator>

          <GoogleLogin
            shape="pill"
            theme="outline"
            width={"100%"}
            size="large"
            text="continue_with"
            useOneTap={useOneTap}
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.error("Google login failed");
              toast.error("Google sign-in failed. Please try again.");
            }}
          />
        </FieldGroup>

        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link
            to="/signin"
            className={cn(
              buttonVariants({ variant: "link" }),
              "text-foreground px-1",
            )}
          >
            Signin
          </Link>
        </p>
      </form>
    </Form>
  );
}
