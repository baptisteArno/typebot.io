import { RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@typebot.io/auth/lib/nextAuth";
import { createContext } from "@typebot.io/config/orpc/builder/context";
import { appRouter } from "../../router";

const handler = new RPCHandler(appRouter, {
  plugins: [new CORSPlugin()],
});

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: "/api/orpc",
    context: createContext({
      authenticate: async () => {
        const session = await auth();
        if (!session?.user) return null;
        Sentry.setUser({ id: session.user.id });
        return session.user;
      },
    }),
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest;
