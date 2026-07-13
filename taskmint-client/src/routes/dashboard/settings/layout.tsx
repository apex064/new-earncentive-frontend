import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsLayout,
});

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/dashboard/settings/profile",
  },
  {
    title: "Account",
    href: "/dashboard/settings/account",
  },
];

function SettingsLayout() {
  return (
    <section className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="border-border/30 card_gradient flex flex-col space-y-8 rounded-lg border p-4 lg:flex-row lg:space-y-0 lg:space-x-12">
        <aside className="lg:w-1/3">
          <nav className="flex space-x-2 lg:flex-col lg:space-y-1 lg:space-x-0">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "justify-start",
                )}
                activeProps={{
                  className: "bg-muted hover:bg-muted",
                }}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 lg:max-w-2xl">
          <Outlet />
        </main>
      </div>
    </section>
  );
}
