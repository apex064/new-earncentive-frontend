import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import DotPattern from "@/components/ui/dot-pattern";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <section className="from-background to-card relative z-0 flex min-h-screen items-center justify-center bg-linear-to-tl p-4">
      <DotPattern />

      <Button
        asChild
        size="icon"
        variant="outline"
        className="absolute top-2 left-2"
      >
        <Link to="..">
          <ChevronLeft />
        </Link>
      </Button>

      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center mask-[radial-gradient(ellipse_at_center,transparent_20%,black)] bg-black"></div>

      <div className="flex-1 mt-12 md:mt-0">
        <Outlet />
      </div>
    </section>
  );
}
