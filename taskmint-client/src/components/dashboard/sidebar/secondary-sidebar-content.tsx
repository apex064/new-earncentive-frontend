import { Bell, Calendar } from "lucide-react";
import type { ComponentType } from "react";
import DashboardCalendar from "@/components/dashboard/dashboard-calendar";
import Notifications from "@/components/dashboard/notifications";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS_Header: {
  label: ComponentType;
  value: "calendar" | "notifications";
  badge?: number;
}[] = [
  {
    label: Calendar,
    value: "calendar",
  },
  {
    label: Bell,
    value: "notifications",
  },
];

function SecondarySidebarContent() {
  return (
    <Tabs defaultValue="calendar" className="w-full! p-4">
      <TabsList className="ml-auto">
        {TABS_Header.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="dark:data-[state=active]:text-primary p-2 before:hidden"
          >
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <...> */}
            {<tab.label />}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="calendar">
        <DashboardCalendar />
      </TabsContent>
      <TabsContent value="notifications">
        <Notifications />
      </TabsContent>
    </Tabs>
  );
}

export default SecondarySidebarContent;
