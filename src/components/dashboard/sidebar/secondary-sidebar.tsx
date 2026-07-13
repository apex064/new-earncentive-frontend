import SecondarySidebarContent from "@/components/dashboard/sidebar/secondary-sidebar-content";
import SidebarTasks from "@/components/dashboard/sidebar/sidebar-tasks";

function SecondarySidebar() {
  return (
    <div className="bg-sidebar h-full min-h-full">
      <SecondarySidebarContent />
      <SidebarTasks />
    </div>
  );
}

export default SecondarySidebar;
