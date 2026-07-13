import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { Edit2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Spinner } from "@/components/ui/spinner";
import {
  useUpdateProfilePicture,
  useUpdateUser,
  useUser,
} from "@/hooks/use-user";
import { getInitials } from "@/lib/get-name-initials";

export const Route = createFileRoute("/dashboard/settings/profile")({
  component: ProfileForm,
});

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters." })
    .max(30, { message: "Username must not be longer than 30 characters." }),
  fullname: z
    .string()
    .min(2, { message: "Fullname must be at least 2 characters." })
    .max(60, { message: "Fullname must not be longer than 60 characters." }),
  email: z.email({ error: "Please enter an email." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

function ProfileForm() {
  const { data, isLoading, isError } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateUserMutation = useUpdateUser();
  const updateProfilePictureMutation = useUpdateProfilePicture();
  // const [imagePreview, setImagePreview] = useState<string | null>(null);
  const user = data?.data;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      fullname: "",
      email: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        fullname: user.fullname,
        email: user.email,
      });
    }
  }, [user, form]);

  function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    updateUserMutation.mutate({ userId: user.id, data });
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      const formData = new FormData();
      formData.append("profileImg", file);
      updateProfilePictureMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="grid place-items-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !user) {
    return <div>Could not load user profile.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-medium">Profile</h3>
        <p className="text-muted-foreground text-sm">
          This is how others will see you on the site.
        </p>
      </div>
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="relative w-fit">
            <Avatar className="size-32">
              <AvatarImage src={user.profileImg} />
              <AvatarFallback>{getInitials(user.fullname)}</AvatarFallback>
            </Avatar>
            <Button
              type="button"
              size={"icon"}
              variant={"secondary"}
              className="absolute right-0 bottom-0 rounded-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={updateProfilePictureMutation.isPending}
            >
              {updateProfilePictureMutation.isPending ? (
                <Spinner className="size-4" />
              ) : (
                <Edit2 className="size-4" />
              )}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/gif"
            />
          </div>

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Your username" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fullname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fullname</FormLabel>
                <FormControl>
                  <Input placeholder="Your fullname" {...field} />
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
                  <Input
                    type="email"
                    placeholder="Your email"
                    disabled
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  We will use this email for notifications.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Update profile</Button>
        </form>
      </Form>
    </div>
  );
}
