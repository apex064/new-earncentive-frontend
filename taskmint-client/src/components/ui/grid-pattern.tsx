import type { ClassValue } from "clsx";
import { cn } from "@/lib/utils";

function GridPattern({ className }: { className?: ClassValue }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 bg-size-[40px_40px] select-none",
        "-z-10 bg-[linear-gradient(to_right,#171717be_1px,transparent_1px),linear-gradient(to_bottom,#171717be_1px,transparent_1px)]",
        className,
      )}
    />
  );
}

export default GridPattern;
