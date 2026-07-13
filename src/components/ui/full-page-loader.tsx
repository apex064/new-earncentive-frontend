import { Loader2 } from "lucide-react";

export default function FullPageLoader() {
  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-500">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-primary/10 relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ring-1 ring-black/5">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <h3 className="font-space-grotesk text-lg font-bold text-gray-900">
            TaskMint
          </h3>
          <p className="animate-pulse text-sm font-medium text-gray-500">
            Authenticating...
          </p>
        </div>
      </div>
    </div>
  );
}
