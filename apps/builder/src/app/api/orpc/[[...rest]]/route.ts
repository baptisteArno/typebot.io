import { RPCHandler } from "@orpc/server/fetch";
import { auth } from "@typebot.io/auth/lib/nextAuth";
import { createContext } from "@typebot.io/config/orpc/builder/context";
import { UserId } from "@typebot.io/shared-core/domain";
import { logServerRequest } from "@typebot.io/telemetry/logServerRequest";
import { after } from "next/server";
import { appRouter } from "../../router";

const handler = new RPCHandler(appRouter);

async function handleRequest(request: Request) {
  const startedAt = Date.now();

  try {
    const { response } = await handler.handle(request, {
      prefix: "/api/orpc",
      context: createContext({
        authenticate: async () => {
          const session = await auth();
          if (!session?.user) return null;
          return {
            id: UserId.makeUnsafe(session.user.id),
            email: session.user.email,
            groupTitlesAutoGeneration: session.user.groupTitlesAutoGeneration,
          };
        },
      }),
    });

    const resolvedResponse =
      response ?? new Response("Not found", { status: 404 });
    after(() =>
      logServerRequest({
        request,
        response: resolvedResponse,
        startedAt,
      }),
    );

    return resolvedResponse;
  } catch (error) {
    after(() =>
      logServerRequest({
        error,
        request,
        startedAt,
      }),
    );
    throw error;
  }
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest;
