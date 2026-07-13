import { cn } from "@/lib/utils";

function DotPattern() {
  return (
    <div
      className={cn(
        "absolute inset-0 -z-10",
        "bg-size-[20px_20px]",
        "bg-[radial-gradient(#d4d4d4_1px,transparent_1px)]",
        "bg-[radial-gradient(#4e20a2ce_1px,transparent_1px)]",
      )}
    />
  );
}

export default DotPattern;
