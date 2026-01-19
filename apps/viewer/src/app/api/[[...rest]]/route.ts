import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { CORSPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { authenticateWithBearerToken } from "@typebot.io/auth/helpers/authenticateWithBearerToken";
import {
  audioMessageSchema,
  commandMessageSchema,
  startFromEventSchema,
  startFromGroupSchema,
  textMessageSchema,
} from "@typebot.io/chat-api/schemas";
import { createContext } from "@typebot.io/config/orpc/viewer/context";
import type { NextRequest } from "next/server";
import { appRouter } from "./router";

type RouteContext<_T> = {
  params: Promise<{ rest?: string[] }>;
};

const handler = new OpenAPIHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
  plugins: [
    new CORSPlugin(),
    new OpenAPIReferencePlugin({
      specPath: "/openapi.json",
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        filter: ({ contract }) =>
          Boolean(
            contract["~orpc"].route.method &&
              !contract["~orpc"].route.deprecated,
          ),
        info: {
          title: "Chat API",
          version: "3.0.0",
        },
        servers: [{ url: "https://typebot.io/api" }],
        externalDocs: {
          url: "https://docs.typebot.io/api-reference",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
            },
          },
        },
        commonSchemas: {
          Text: {
            schema: textMessageSchema,
          },
          Audio: {
            schema: audioMessageSchema,
          },
          Command: {
            schema: commandMessageSchema,
          },
          Group: {
            schema: startFromGroupSchema,
          },
          Event: {
            schema: startFromEventSchema,
          },
        },
      },
    }),
  ],
});

async function handleRequest(
  request: NextRequest,
  ctx: RouteContext<"/api/[[...rest]]">,
) {
  // Reconstruct request to make it work with Next.js rewrites
  const resolvedPathname = `/api/${(await ctx.params)?.rest?.join("/") ?? ""}`;
  const resolvedRequest =
    resolvedPathname === request.nextUrl.pathname
      ? request
      : new Request(
          request.url.replace(request.nextUrl.pathname, resolvedPathname),
          request,
        );
  const { response } = await handler.handle(resolvedRequest, {
    prefix: "/api",
    context: createContext({
      req: resolvedRequest,
      authenticate: async () => {
        const user = await authenticateWithBearerToken(resolvedRequest);
        if (!user) return null;
        return user;
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
