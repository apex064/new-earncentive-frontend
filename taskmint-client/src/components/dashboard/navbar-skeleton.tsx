import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function NavbarSkeleton() {
  return (
    <nav className="bg-background sticky top-0 z-[50] flex h-16 w-full shrink-0 items-center gap-6 border-b px-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8" />
        <Separator orientation="vertical" className="mr-2 h-4!" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="ml-auto flex items-center gap-3">
        {/* Balance pill placeholder */}
        <Skeleton className="h-8 w-24 rounded-full" />
        {/* Avatar placeholder */}
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </nav>
  );
}
