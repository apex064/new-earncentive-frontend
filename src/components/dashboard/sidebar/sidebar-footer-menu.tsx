import { Link } from "@tanstack/react-router";
import { CircleQuestionMark } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = [
  {
    title: "Help & Support",
    icon: CircleQuestionMark,
    url: "/dashboard/help",
  },
];

function SidebarFooterMenu() {
  return (
    <SidebarMenu>
      {data.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton size={"lg"} asChild>
            <Link to={item.url}>
              <item.icon />
              {item.title}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export default SidebarFooterMenu;
