import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import z from "zod";
import DashboardTabs from "@/components/dashboard/tabs";
import UserProgress from "@/components/dashboard/user-progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";

export const TABS = ["upcoming", "board", "notes"] as const;

export const Route = createFileRoute("/dashboard/")({
  component: Dashboard,
  validateSearch: zodValidator(
    z.object({
      tab: z.enum(TABS).catch(TABS[0]).default(TABS[0]),
    }),
  ),
});

function Dashboard() {
  const { tab } = Route.useSearch();
  const { data: userResponse, isPending } = useUser();
  const user = userResponse?.data;

  if (isPending) {
    return (
      <div className="w-full space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold">
          Hello {user?.fullname.split(" ").at(0)}
        </h1>
        <p className="text-muted-foreground">Let's make some progress today!</p>
      </div>

      <UserProgress />
      <DashboardTabs tab={tab} />
    </div>
  );
}
