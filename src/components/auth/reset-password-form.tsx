import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, EyeIcon, EyeOffIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useResetPasswordMutation } from "@/hooks/use-auth-mutations";

const formSchema = z
  .object({
    password: z
      .string()
      .regex(/.{6,}/, { error: "Password must be at least 6 characters" })
      .regex(/[0-9]/, { error: "Password must contain at least 1 number" })
      .regex(/[A-Z]/, {
        error: "Password must contain at least 1 uppercase letter",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof formSchema>;

export default function ResetPasswordForm({ token }: { token: string }) {
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(true);
  const [isPending, startTransition] = useTransition();
  const resetPasswordMutation = useResetPasswordMutation();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: ResetPasswordFormData) {
    startTransition(async () => {
      resetPasswordMutation.mutate(
        {
          token,
          new_password: data.password,
          confirm_password: data.confirmPassword,
        },
        {
          onError: (error) => {
            const message =
              error instanceof Error ? error.message : "Something went wrong";
            toast.error(message);
          },
        },
      );
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
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

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={isConfirmPasswordHidden ? "password" : "text"}
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>

                <button
                  type="button"
                  onClick={() => setIsConfirmPasswordHidden((s) => !s)}
                  aria-label={
                    isConfirmPasswordHidden ? "Hide password" : "Show password"
                  }
                  className="text-muted-foreground/80 hover:text-foreground absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-all"
                >
                  {isConfirmPasswordHidden ? (
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

        <Button disabled={isPending} type="submit" className="w-full">
          {isPending ? "Submitting" : "Submit"} <ChevronRight />
        </Button>
      </form>
    </Form>
  );
}
