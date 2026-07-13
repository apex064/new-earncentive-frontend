import { createFileRoute, Outlet } from "@tanstack/react-router";
import Footer from "@/components/landing-page/footer";
import Navbar from "@/components/landing-page/navbar";
import Loading from "@/components/ui/loading";

export const Route = createFileRoute("/_landing")({
  component: RouteComponent,
  pendingComponent: () => <Loading />,
});

function RouteComponent() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
