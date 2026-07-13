import { Link } from "@tanstack/react-router";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import LongTermGoals from "@/components/dashboard/long-term-goals";
import ProductivityChart from "@/components/dashboard/performance-chart";
import Board from "@/components/dashboard/tabs/board";
import Notes from "@/components/dashboard/tabs/notes";
import UpcomingTasksTab from "@/components/dashboard/tabs/upcoming-tasks";
import Box from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Route as DashboardRoute, TABS } from "@/routes/dashboard";

function DashboardTabs({ tab }: { tab: (typeof TABS)[number] }) {
  return (
    <Tabs defaultValue={tab} className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <TabTriggers />

        <Box className="gap-0.5 md:gap-1">
          <Button variant={"ghost"} size={"icon"}>
            <RotateCcw size={16} />
          </Button>
          <Button variant={"ghost"} size={"icon"}>
            <SlidersHorizontal size={16} />
          </Button>
        </Box>
      </div>

      <Separator className="bg-border/50" />

      <TabsContent value="upcoming">
        <UpcomingTasksTab />
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
          <ProductivityChart />
          <LongTermGoals />
        </div>
      </TabsContent>

      <TabsContent value="board">
        <Board />
      </TabsContent>

      <TabsContent value="notes">
        <Notes />
      </TabsContent>
    </Tabs>
  );
}

function TabTriggers() {
  return (
    <TabsList>
      {TABS.map((tab) => (
        <TabsTrigger key={tab} value={tab} className="capitalize">
          <Link to={DashboardRoute.to} search={(prev) => ({ ...prev, tab })}>
            {tab}
          </Link>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}

export default DashboardTabs;
