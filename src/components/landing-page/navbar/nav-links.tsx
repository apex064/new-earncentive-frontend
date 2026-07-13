import { Link } from "@tanstack/react-router";
import type * as React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const components: { title: string; to: string; description: string }[] = [
  {
    title: "Focus Mode",
    to: "/features/focus",
    description:
      "Pick one task to focus on each day — fewer distractions, more momentum.",
  },
  {
    title: "Streaks",
    to: "/features/streaks",
    description:
      "Track consecutive completions and celebrate consistent progress.",
  },
  {
    title: "Rewards & Badges",
    to: "/features/rewards",
    description: "Earn small rewards and badges to keep motivation high.",
  },
  {
    title: "Tasks",
    to: "/features/tasks",
    description: "Create, edit, and organize tasks with priorities and notes.",
  },
  {
    title: "Analytics",
    to: "/features/analytics",
    description:
      "See your weekly and monthly progress, best streaks and completion trends.",
  },
  {
    title: "Integrations",
    to: "/features/integrations",
    description: "Connect calendars, notifications, and sync across devices.",
  },
];

export default function NavigationLinks() {
  return (
    <NavigationMenu viewport={false} className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Home</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="from-card to-background flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-4 no-underline outline-hidden select-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mt-4 mb-2 text-xl font-bold">
                      Task<span className="text-primary">mint</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      Celebrate small wins. One-task focus, streaks, and easy
                      habit tracking.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem to="/about" title="What is TaskMint">
                Learn how TaskMint helps you build momentum with one-task focus.
              </ListItem>
              <ListItem to="/getting-started" title="Getting Started">
                Quick setup guide to create your first task and start a streak.
              </ListItem>
              <ListItem to="/style" title="Style & Theme">
                Customize themes, typography, and app appearance.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Features</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  to={component.to}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link to="/about">About</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link to={"/" + "#features"}>
                    <div className="font-medium">All Features</div>
                    <div className="text-muted-foreground">
                      Browse TaskMint capabilities and workflows.
                    </div>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to={"/" + "#pricing"}>
                    <div className="font-medium">Pricing</div>
                    <div className="text-muted-foreground">
                      See plans — Free, Flex, and Premium.
                    </div>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  {/* FIXME: change to appropriate link */}
                  <Link to="/">
                    <div className="font-medium">Blog</div>
                    <div className="text-muted-foreground">
                      Tips, case studies, and productivity guides.
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/">Blogs</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to="/">Guides</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to="/">Community</Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({
  title,
  children,
  to,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { to: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link to={to}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
