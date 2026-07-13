import { createFileRoute } from "@tanstack/react-router";
import Faqs from "@/components/landing-page/faqs";

export const Route = createFileRoute("/_landing/about")({
  component: About,
});

function About() {
  return (
    <>
      <h1>About</h1>
      <Faqs />
    </>
  );
}
