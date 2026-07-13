import { createFileRoute, Outlet } from "@tanstack/react-router";
import Cooperations from "@/components/landing-page/cooperations";
import Faqs from "@/components/landing-page/faqs";
import Features from "@/components/landing-page/features";
import Hero from "@/components/landing-page/hero";
import Interface from "@/components/landing-page/interface";
import Pricing from "@/components/landing-page/pricing";
import Testimonial from "@/components/landing-page/testimonials";

export const Route = createFileRoute("/_landing/_home")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Outlet />
      <Hero />
      <Cooperations />
      <Features />
      <Interface />
      <Testimonial />
      <Pricing />
      <Faqs />
    </>
  );
}
