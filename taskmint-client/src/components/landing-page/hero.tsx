import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import heroEllipse from "@/assets/images/hero-ellipse.png";
import Banner from "@/components/globals/banner";
import { buttonVariants } from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import { TextShimmer } from "@/components/ui/text-shimmer";

function Hero() {
  return (
    <Banner>
      {/* <GridPattern /> */}

      <Banner.Header>
        <Tag>
          <TextShimmer className="font-mono text-sm">
            celebrate tiny wins
          </TextShimmer>
        </Tag>

        <Banner.Title className="font-heading py-2">
          From To-Do <br /> to Done.
        </Banner.Title>

        <Banner.Description className="max-w-[95%]">
          Track progress, celebrate tiny wins, and stay focused - one task at a
          time.
        </Banner.Description>

        <Banner.CTA>
          <Link to="/signin" className={buttonVariants({ size: "lg" })}>
            Get Started <ArrowRight />
          </Link>

          <Link
            to="/"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            How It Works <ArrowUpRight />
          </Link>
        </Banner.CTA>
      </Banner.Header>

      <Banner.OverlayImg
        src={heroEllipse}
        alt="Hero overlay"
        loading="eager"
        fetchPriority="high"
        height={800}
        className="-bottom-4 left-1/2 h-[50%] w-full -translate-x-1/2 md:h-auto"
      />
    </Banner>
  );
}

export default Hero;
