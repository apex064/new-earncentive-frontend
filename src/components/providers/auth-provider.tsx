import { type PropsWithChildren, useEffect } from "react";
import CountryDetector from "@/components/CountryDetector";
import Loading from "@/components/ui/loading";
import { useUser } from "@/hooks/use-user";
import { router } from "@/router";
import { useAuthStore } from "@/store/auth-store";

function AuthProvider({ children }: PropsWithChildren) {
  const token = useAuthStore((s) => s.token);
  const { isPending, isError } = useUser();

  useEffect(() => {
    if (token && isError) {
      useAuthStore.getState().clearAuth();
      router.navigate({ to: "/" });
    }
  }, [token, isError]);

  if (token && isPending) {
    return <Loading />;
  }

  if (token && isError) {
    return null;
  }

  return (
    <>
      <CountryDetector />
      {children}
    </>
  );
}

export default AuthProvider;
