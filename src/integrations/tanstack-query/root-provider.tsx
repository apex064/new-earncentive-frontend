import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";

// export function getContext() {
//   const queryClient = new QueryClient({
//     queryCache: new QueryCache({
//       onError: (error) => {
//         if (error instanceof AxiosError && error.response?.status === 401) {
//           console.error("Unrecoverable auth error detected. Logging out.");
//           useAuthStore.getState().clearAuth();
//         }
//       },
//     }),
//   });

//   return {
//     queryClient,
//   };
// }

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
