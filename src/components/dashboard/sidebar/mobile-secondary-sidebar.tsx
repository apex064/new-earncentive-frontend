import { Bell, EllipsisVertical } from "lucide-react";
import SecondarySidebarContent from "@/components/dashboard/sidebar/secondary-sidebar-content";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function MobileSecondarySidebar({ unreadCount = 0 }: { unreadCount?: number }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden relative">
          <EllipsisVertical />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="py-8">
        <SecondarySidebarContent />
      </SheetContent>
    </Sheet>
  );
}

export default MobileSecondarySidebar;
