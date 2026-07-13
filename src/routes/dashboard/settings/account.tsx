import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToggle2FA, useUser } from "@/hooks/use-user";

export const Route = createFileRoute("/dashboard/settings/account")({
  component: AccountForm,
});

const accountFormSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type AccountFormValues = z.infer<typeof accountFormSchema>;

function AccountForm() {
  const { data, isLoading, isError } = useUser();
  const { mutate, isPending } = useToggle2FA();
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  function onSubmit(data: AccountFormValues) {
    console.log("Submitted data:", data);
    alert(`Password change requested!`);
  }

  if (isError) {
    return (
      <div className="grid size-full place-items-center">
        Error loading user data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-medium">Account</h3>
        <p className="text-muted-foreground text-sm">
          Update your account settings.
        </p>
      </div>
      <Separator />
      <div className="flex justify-between">
        <p className="font-medium">Two-Factor Authentication</p>
        {isLoading ? (
          <Skeleton className="h-6 w-12" />
        ) : (
          <Switch
            checked={data?.data.twoFactorEnabled}
            onCheckedChange={() => mutate()}
            disabled={isPending}
          />
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormDescription>
                  Leave blank to keep your current password.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Update account</Button>
        </form>
      </Form>
    </div>
  );
}
