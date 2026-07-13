import { Link } from "@tanstack/react-router";
import { ArrowRight, type LucideProps, XIcon } from "lucide-react";
import { useState } from "react";
import MobileMenu from "@/components/landing-page/navbar/mobile-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

function NavActions() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { data: userResponse, isLoading } = useUser();
  const user = userResponse?.data;

  if (isLoading) {
    return (
      <Skeleton className="flex h-10 w-48 items-center gap-4">
        <Skeleton className="hidden h-10 w-24 animate-pulse rounded-md md:block"></Skeleton>
        <Skeleton className="h-10 w-20 animate-pulse rounded-md"></Skeleton>
      </Skeleton>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <Link
          to="/dashboard"
          className={cn(
            buttonVariants({ size: "lg" }),
            "hidden md:inline-flex",
          )}
        >
          Dashboard <ArrowRight />
        </Link>
      ) : (
        <>
          <Link
            to="/signup/modal"
            className={cn(
              buttonVariants({ size: "lg" }),
              "hidden md:inline-flex",
            )}
          >
            Get Started <ArrowRight />
          </Link>

          <Link
            to="/signin/modal"
            className={buttonVariants({
              variant: "outline",
              size: isMobile ? "default" : "lg",
            })}
          >
            Sign In
          </Link>
        </>
      )}

      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        data-mobile-toggle
        className="z-100 h-8 w-8 p-2 md:hidden"
      >
        {isOpen ? <XIcon className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      <MobileMenu setIsOpen={setIsOpen} isOpen={isOpen} />
    </div>
  );
}

function Menu(props: LucideProps) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: <...>
    <svg
      {...props}
      width="16"
      height="10"
      viewBox="0 0 16 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 9H15M1 1H15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default NavActions;
