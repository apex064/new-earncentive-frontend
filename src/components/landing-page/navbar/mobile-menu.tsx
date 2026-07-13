"use client";

import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Flame,
  Home,
  Layers3,
  LayoutDashboard,
} from "lucide-react";
import type * as React from "react";
import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Box from "@/components/ui/box";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const features = [
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

const resources = [
  { title: "Blogs", to: "/blogs" },
  { title: "Guides", to: "/guides" },
  { title: "Community", to: "/community" },
];

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  setIsOpen,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isAuthed = useAuthStore((state) => state.isAuthed);

  const variants = {
    open: { opacity: 1, y: 20 },
    closed: { opacity: 0, y: 0 },
  };

  return (
    <div
      className={cn(
        "bg-background absolute top-14 left-0 z-[200] flex h-[calc(100vh-3rem)] w-full rounded-md p-4 backdrop-blur-2xl",
        isOpen ? "flex" : "hidden",
      )}
    >
      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={variants}
        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
        className="flex w-full flex-col justify-start"
      >
        <ul className="flex w-full flex-1 flex-col items-start space-y-3">
          <li onClick={() => setIsOpen(false)}>
            <Link
              to="/"
              className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-4 py-2 text-lg font-medium"
            >
              <Home className="h-5 w-5" /> Home
            </Link>
          </li>
          <li onClick={() => setIsOpen(false)}>
            <Link
              to="/"
              className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-4 py-2 text-lg font-medium"
            >
              <Flame className="h-5 w-5" /> What's Cooking?
            </Link>
          </li>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="features" className="border-none">
              <AccordionTrigger className="hover:text-muted-foreground px-4 py-2 text-lg font-medium">
                <span className="flex items-center">
                  <LayoutDashboard className="mr-2 h-5 w-5" /> Features
                </span>
              </AccordionTrigger>
              <AccordionContent
                onClick={() => setIsOpen(false)}
                className="mt-1 flex flex-col items-start gap-1"
              >
                {features.map((item) => (
                  <Link
                    key={item.title}
                    to={item.to}
                    className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-4 py-2 text-lg"
                  >
                    {item.title}
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="resources" className="border-none">
              <AccordionTrigger className="hover:text-muted-foreground px-4 py-2 text-lg font-medium">
                <span className="flex items-center">
                  <Layers3 className="mr-2 h-5 w-5" /> Resources
                </span>
              </AccordionTrigger>
              <AccordionContent
                onClick={() => setIsOpen(false)}
                className="mt-1 flex flex-col items-start gap-1"
              >
                {resources.map((item) => (
                  <Link
                    key={item.title}
                    to={item.to}
                    className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-4 py-2 text-lg"
                  >
                    {item.title}
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {isAuthed ? (
            <Link
              to="/dashboard"
              className={cn(buttonVariants({ size: "lg" }), "mx-auto mt-6")}
            >
              Dashboard <ArrowRight />
            </Link>
          ) : (
            <Box className="mt-4 w-full justify-center">
              <Link to="/signup" className={buttonVariants({ size: "lg" })}>
                Get Started
                <ArrowRight />
              </Link>

              <Link
                to="/signin"
                className={buttonVariants({ size: "lg", variant: "outline" })}
              >
                Sign in
              </Link>
            </Box>
          )}
        </ul>
      </motion.div>
    </div>
  );
};

export default MobileMenu;
