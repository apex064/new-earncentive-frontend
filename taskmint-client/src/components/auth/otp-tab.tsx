import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useVerifyOtpMutation } from "@/hooks/use-auth-mutations";
import { useAuthStore } from "@/store/auth-store";

const OTPFormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

type TOTPForm = z.infer<typeof OTPFormSchema>;

export default function FormOTP() {
  const { mutate: verifyOTP, isPending: isVerifying } = useVerifyOtpMutation();
  const email = useAuthStore((s) => s.email);

  const OTPForm = useForm<TOTPForm>({
    resolver: zodResolver(OTPFormSchema),
    defaultValues: {
      pin: "",
    },
  });

  function onSubmitOTP(data: TOTPForm) {
    if (!email) {
      // Fallback: if no email in store, try to get it from the mutation's error handling
      verifyOTP(
        { email: "", code: data.pin },
        {
          onError: () => {
            OTPForm.resetField("pin");
          },
        },
      );
      return;
    }
    verifyOTP(
      { email, code: data.pin },
      {
        onError: () => {
          OTPForm.resetField("pin");
        },
      },
    );
  }

  return (
    <Form {...OTPForm}>
      <form onSubmit={OTPForm.handleSubmit(onSubmitOTP)} className="space-y-6">
        <FormField
          control={OTPForm.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Two-Factor Authentication Code</FormLabel>
              <FormControl>
                <InputOTP pattern={REGEXP_ONLY_DIGITS} maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
                Please enter the 6-digit code from your authenticator app.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size={"lg"}
          className="w-full rounded-full"
          disabled={isVerifying}
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </Form>
  );
}
