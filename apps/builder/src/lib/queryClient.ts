import { createORPCClient, ORPCError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import {
  type Mutation,
  MutationCache,
  type Query,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { env } from "@typebot.io/env";
import type { ToastErrorData } from "@typebot.io/lib/toastErrorData";
import type { AppRouter } from "@/app/api/router";
import { toast } from "./toast";

export const showHttpRequestErrorToast = (
  error: Error,
  {
    context,
  }: {
    context: string;
  },
) => {
  if (error instanceof ORPCError) {
    if (error.code === "NOT_FOUND") return;
    const data = error.data as ToastErrorData | undefined;
    toast({
      title: data?.context ?? context,
      description: error.message || error.code || "",
      details: data?.details,
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
  if ("orpc" in source.options)
    return `${(source.options.orpc as { path: string }).path}`;
};

const link = new RPCLink({
  url: () => {
    if (typeof window === "undefined") return `${env.NEXTAUTH_URL}/api/orpc`;
    return `${window.location.origin}/api/orpc`;
  },
});

export const orpcClient: RouterClient<AppRouter> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(orpcClient);
