import type { AppRouter } from "@/helpers/server/routers/appRouter";
import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { env } from "@typebot.io/env";
import superjson from "superjson";

const getBaseUrl = () =>
  typeof window !== "undefined" ? "" : env.NEXTAUTH_URL;

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      transformer: superjson,
    };
  },
  ssr: false,
});

export const trpcVanilla = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
  transformer: superjson,
});

export const defaultQueryOptions = {
  refetchOnMount: env.NEXT_PUBLIC_E2E_TEST,
};
