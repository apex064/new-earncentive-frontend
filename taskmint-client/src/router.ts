import { createRouteMask, createRouter } from "@tanstack/react-router";
import { queryClient } from "@/lib/react-query";
import { routeTree } from "./routeTree.gen";

const signinModalToSigninMask = createRouteMask({
  routeTree,
  from: "/signin/modal",
  to: "/signin",
  unmaskOnReload: true,
});

const signupModalToSignupMask = createRouteMask({
  routeTree,
  from: "/signup/modal",
  to: "/signup",
  unmaskOnReload: true,
});

export const router = createRouter({
  routeTree,
  routeMasks: [signinModalToSigninMask, signupModalToSignupMask],
  context: {
    queryClient,
    // biome-ignore lint/style/noNonNullAssertion: <...>
    auth: undefined!,
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
