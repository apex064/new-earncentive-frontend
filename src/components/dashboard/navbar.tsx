import { Link } from "@tanstack/react-router";
import { Settings, LogOut } from "lucide-react";
import DashboardBreadcrumb from "@/components/dashboard/dashboard-breadcrumb";
import MobileSecondarySidebar from "@/components/dashboard/sidebar/mobile-secondary-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Box from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLogoutMutation } from "@/hooks/use-auth-mutations";
import { useUser } from "@/hooks/use-user";
import { resolveProfileImageUrl } from "@/lib/fix-image-url";
import { getInitials } from "@/lib/get-name-initials";
import { NavbarSkeleton } from "./navbar-skeleton";
import {
  BalancePill,
  BalancePopoverContent,
} from "@/components/dashboard/balance-pill";

function Navbar() {
  const { data: userResponse, isLoading } = useUser();
  const user = userResponse?.data;
  const { mutate: logout, isPending } = useLogoutMutation();

  const profileImageUrl = resolveProfileImageUrl(
    user?.profile_picture_url ?? null,
    user?.profile_picture ?? null,
  );

  if (isLoading) return <NavbarSkeleton />;
  if (!user) return null;

  return (
    <nav className="bg-sidebar sticky top-0 z-50 flex h-16 w-full shrink-0 items-center gap-3 border-b px-4">
      {/* Left: sidebar trigger + breadcrumb (desktop only) */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 rotate-180 md:rotate-[initial]" />
        <Separator orientation="vertical" className="mr-2 hidden h-4! md:block" />
        <div className="hidden md:block">
          <DashboardBreadcrumb />
        </div>
      </div>

      {/* Right: balance pill, notifications, avatar */}
      <div className="ml-auto flex items-center gap-3">
        {/* Balance Pill — always visible */}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button">
              <BalancePill user={user} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-64 bg-card border border-border rounded-2xl p-4"
            align="end"
          >
            <BalancePopoverContent user={user} />
          </PopoverContent>
        </Popover>

        {/* Mobile sidebar trigger (notifications, calendar) */}
        <MobileSecondarySidebar />

        {/* Profile Avatar + Dropdown */}
        <Popover>
          <Box className="hover:bg-secondary cursor-pointer gap-2 rounded-md p-1 text-sm font-medium transition-colors duration-300">
            <PopoverTrigger asChild>
              <Avatar>
                <AvatarImage src={profileImageUrl} />
                <AvatarFallback>{getInitials(user.fullname)}</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
          </Box>
          <PopoverContent className="w-80!" align="end">
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={profileImageUrl} />
                  <AvatarFallback>{getInitials(user.fullname)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{user.fullname}</h2>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-2">
                <Link
                  to="/dashboard/settings"
                  className="hover:bg-accent/50 inline-flex items-center gap-2 rounded-full p-2 pl-4 text-base"
                >
                  <Settings size={16} /> Account Settings
                </Link>
                <Button
                  disabled={isPending}
                  variant="destructive"
                  onClick={() => logout()}
                  className="inline-flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
}

export default Navbar;
