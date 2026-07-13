import { zodResolver } from "@hookform/resolvers/zod";
import { type CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { Link } from "@tanstack/react-router";
import { ChevronRight, EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  useGoogleLoginMutation,
  useSigninMutation,
} from "@/hooks/use-auth-mutations";
import { useReCaptcha } from "@/hooks/use-recaptcha";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

export type SignInFormData = z.infer<typeof formSchema>;

export default function SigninForm({
  useOneTap = true,
}: {
  useOneTap?: boolean;
}) {
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);

  const { mutate: signin, isPending: isSigninPending } = useSigninMutation();
  const { mutate: googleLogin } = useGoogleLoginMutation();
  const { executeRecaptcha } = useReCaptcha();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: SignInFormData) {
    const recaptchaToken = await executeRecaptcha("login");
    signin({
      email: data.email,
      password: data.password,
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="youremail@example.com" {...field} />
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
              <div className="relative">
                <FormControl>
                  <Input
                    type={isPasswordHidden ? "password" : "text"}
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>

                <button
                  type="button"
                  onClick={() => setIsPasswordHidden((s) => !s)}
                  aria-label={
                    isPasswordHidden ? "Hide password" : "Show password"
                  }
                  className="text-muted-foreground/80 hover:text-foreground absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-all"
                >
                  {isPasswordHidden ? (
                    <EyeOffIcon size={16} />
                  ) : (
                    <EyeIcon size={16} />
                  )}
                </button>
              </div>

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="-mt-4 flex items-center justify-between text-sm">
          <Link
            to="/forgot-password"
            className={cn(
              buttonVariants({ variant: "link" }),
              "text-foreground",
            )}
          >
            Forgot password?
          </Link>

          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row-reverse items-center">
                <FormLabel>Remember me</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FieldGroup>
          <Button
            disabled={isSigninPending}
            type="submit"
            size="lg"
            className="w-full"
          >
            {isSigninPending ? "Signing in..." : "Signin"} <ChevronRight />
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
          Don't have an account?{" "}
          <Link
            to="/signup"
            className={cn(
              buttonVariants({ variant: "link" }),
              "text-foreground px-1",
            )}
          >
            Signup
          </Link>
        </p>
      </form>
    </Form>
  );
}
