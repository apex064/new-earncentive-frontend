import { Link, useLocation } from "@tanstack/react-router";
import {
  ChartColumnIncreasing,
  Grid2x2Check,
  LayoutDashboard,
  ListTodo,
  type LucideIcon,
  Settings,
  Trophy,
  UsersRound,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const baseUrl = "/dashboard";

type SidebarMenus = {
  item: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
};

const data: SidebarMenus = {
  item: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      url: baseUrl,
    },
    {
      title: "Tasks",
      icon: ListTodo,
      url: "/dashboard/tasks",
    },
    {
      title: "Performance",
      icon: ChartColumnIncreasing,
      url: "/dashboard/performance",
    },
    {
      title: "Projects",
      icon: Grid2x2Check,
      url: "/dashboard/projects",
    },
    {
      title: "Teams",
      icon: UsersRound,
      url: "/dashboard/teams",
    },
    {
      title: "Leaderboards",
      icon: Trophy,
      url: "/dashboard/leaderboards",
    },
    {
      title: "Settings",
      icon: Settings,
      url: "/dashboard/settings",
    },
  ],
};

function SidebarMenus() {
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();

  function isActive(url: string) {
    return pathname.endsWith(url);
  }

  return (
    <SidebarMenu>
      {data.item.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive(item.url)}
            asChild
          >
            <Link to={item.url} onClick={() => setOpenMobile(false)}>
              <item.icon />
              {item.title}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export default SidebarMenus;
