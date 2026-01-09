import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import * as Sentry from "@sentry/nextjs";
import { authenticateWithBearerToken } from "@typebot.io/auth/helpers/authenticateWithBearerToken";
import { createContext } from "@typebot.io/config/orpc/builder/context";
import type { NextRequest } from "next/server";
import { appRouter } from "@/lib/orpcRouter";

type RouteContext<_T> = {
  params: Promise<{ rest?: string[] }>;
};

const handler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      specPath: "/openapi.json",
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        filter: ({ contract }) =>
          Boolean(contract["~orpc"].route.tags?.includes("docs")),
        info: {
          title: "Builder API",
          version: "1.0.0",
        },
        servers: [{ url: "https://app.typebot.io/api" }],
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
      },
    }),
  ],
});

async function handleRequest(
  request: NextRequest,
  routeContext: RouteContext<"/api/[[...rest]]">,
) {
  const resolvedPathname = `/api/${(await routeContext.params)?.rest?.join("/") ?? ""}`;
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
      authenticate: async () => {
        const user = await authenticateWithBearerToken(resolvedRequest);
        if (!user) return null;
        Sentry.setUser({ id: user?.id });
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
