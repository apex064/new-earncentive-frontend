import { Link } from "@tanstack/react-router";
import SidebarFooterMenu from "@/components/dashboard/sidebar/sidebar-footer-menu";
import SidebarMenus from "@/components/dashboard/sidebar/sidebar-menus";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

export default function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();

  return (
    <Sidebar {...props} collapsible="icon">
      <SidebarHeader className="group-data-[collapsible=icon]">
        <Link
          to="/"
          from="/dashboard"
          className="flex items-center gap-2 py-[0.23rem]"
        >
          <img
            src="/taskmint-half.svg"
            alt="Task mint's logo"
            className="size-10"
          />

          <h1
            data-state={state}
            className="text-3xl font-extrabold transition-all data-[state=collapsed]:hidden data-[state=collapsed]:scale-0"
          >
            Task<span className="text-primary">mint</span>
          </h1>
        </Link>
      </SidebarHeader>

      <Separator />

      <SidebarContent className="mt-4">
        <SidebarGroup>
          <SidebarMenus />
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarFooterMenu />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
