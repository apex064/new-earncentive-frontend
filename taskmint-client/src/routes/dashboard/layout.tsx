import {
  createFileRoute,
  Navigate,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import Navbar from "@/components/dashboard/navbar";
import DashboardSidebar from "@/components/dashboard/sidebar";
import SecondarySidebar from "@/components/dashboard/sidebar/secondary-sidebar";
import Loading from "@/components/ui/loading";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthStore } from "@/store/auth-store";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { isAuthed, isOtpVerified } = useAuthStore.getState();
    if (!isAuthed) throw redirect({ to: "/signin" });
    if (!isOtpVerified) throw redirect({ to: "/verify-otp" });
  },
  component: Dashboard,
  pendingComponent: () => <Loading />,
  notFoundComponent: () => <div>Layout - not found</div>,
});

function Dashboard() {
  const isAuthed = useAuthStore((s) => s.isAuthed);
  const isMobile = useIsMobile();

  if (!isAuthed) {
    return <Navigate to="/signin" />;
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <DashboardSidebar />

      <SidebarInset className="flex flex-col h-svh overflow-hidden">
        <Navbar />

        {isMobile ? (
          <div className="flex w-full flex-1 overflow-y-auto p-4">
            <Outlet />
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="flex-1 h-full">
            <ResizablePanel defaultSize={68} minSize={30}>
              <div className="h-full w-full overflow-y-auto p-8">
                <Outlet />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={32} minSize={32} maxSize={38}>
              <div className="h-full w-full overflow-y-auto border-l">
                <SecondarySidebar />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
