import {
  type Mutation,
  MutationCache,
  type Query,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { createTRPCClient, httpLink, TRPCClientError } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { env } from "@typebot.io/env";
import superjson from "superjson";
import type { AppRouter } from "@/helpers/server/routers/appRouter";
import { toast } from "./toast";

export const showHttpRequestErrorToast = (
  error: unknown,
  {
    context,
  }: {
    context: string;
  },
) => {
  if (error instanceof TRPCClientError) {
    if (error.data?.logError) {
      toast(error.data.logError);
      return;
    }
    if (error.data?.httpStatus === 404) return;
    toast({
      title: context,
      description: error.data?.zodError || error.message || error.data.code,
    });
  }
};
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) =>
      showHttpRequestErrorToast(error, {
        context:
          (query.meta?.errorContext as string | undefined) ||
          parseDefaultErrorContext(query) ||
          "",
      }),
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      showHttpRequestErrorToast(error, {
        context:
          (mutation.meta?.errorContext as string | undefined) ||
          parseDefaultErrorContext(mutation) ||
          "",
      });
    },
  }),
});

const parseDefaultErrorContext = (
  source:
    | Query<unknown, unknown, unknown, readonly unknown[]>
    | Mutation<unknown, unknown, unknown, unknown>,
): string | undefined => {
  if ("trpc" in source.options)
    return `${(source.options.trpc as { path: string }).path}`;
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
