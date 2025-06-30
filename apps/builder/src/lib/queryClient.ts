import type { AppRouter } from "@/helpers/server/routers/appRouter";
import { type Query, QueryCache, QueryClient } from "@tanstack/react-query";
import { TRPCClientError, createTRPCClient, httpLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { env } from "@typebot.io/env";
import superjson from "superjson";
import { toast } from "./toast";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (error instanceof TRPCClientError) {
        if (error.data?.logError) {
          toast(error.data.logError);
          return;
        }
        if (error.data?.httpStatus === 404) return;
        toast({
          context:
            (query.meta?.errorContext as string | undefined) ??
            parseDefaultErrorContext(query),
          description: error.data?.zodError ?? error.message,
        });
      }
    },
  }),
});

const parseDefaultErrorContext = (
  query: Query<unknown, unknown, unknown, readonly unknown[]>,
): string | undefined => {
  if ("trpc" in query.options)
    return `Error: ${(query.options.trpc as { path: string }).path}`;
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: (() => {
        if (typeof window === "undefined")
          return `${env.NEXTAUTH_URL}/api/trpc`;
        return `${window.location.origin}/api/trpc`;
      })(),
      transformer: superjson,
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
