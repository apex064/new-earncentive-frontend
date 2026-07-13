import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react";
import { useTransition } from "react";
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
import { useForgotPasswordMutation } from "@/hooks/use-auth-mutations";
import { useReCaptcha } from "@/hooks/use-recaptcha";

const formSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
});

export type ForgotPasswordFormData = z.infer<typeof formSchema>;

export default function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const { executeRecaptcha } = useReCaptcha();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    const recaptchaToken = await executeRecaptcha("password_reset");
    startTransition(async () => {
      forgotPasswordMutation.mutate(
        { email: data.email, recaptcha_token: recaptchaToken },
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

        <Button disabled={isPending} type="submit" className="w-full">
          {isPending ? "Submitting" : "Submit"} <ChevronRight />
        </Button>
      </form>
    </Form>
  );
}
