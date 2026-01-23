import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import * as Sentry from "@sentry/nextjs";
import { authenticateWithBearerToken } from "@typebot.io/auth/helpers/authenticateWithBearerToken";
import { auth } from "@typebot.io/auth/lib/nextAuth";
import { createContext } from "@typebot.io/config/orpc/builder/context";
import { convertSchemasListToCommonSchemas } from "@typebot.io/lib/convertSchemasListToCommonSchemas";
import {
  publicTypebotSchemaV5,
  publicTypebotSchemaV6,
} from "@typebot.io/typebot/schemas/publicTypebot";
import { typebotSchema } from "@typebot.io/typebot/schemas/typebot";
import type { NextRequest } from "next/server";
import { appRouter } from "../router";

type RouteContext<_T> = {
  params: Promise<{ rest?: string[] }>;
};

const RAW_REQUEST_CONTEXT = Symbol("RAW_REQUEST_CONTEXT");

const handler = new OpenAPIHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
  adapterInterceptors: [
    (options) =>
      options.next({
        ...options,
        context: {
          ...options.context,
          [RAW_REQUEST_CONTEXT as unknown as string]: {
            fetchRequest: options.request,
          },
        },
      }),
  ],
  rootInterceptors: [
    (options) => {
      const needsRawBody =
        options.request.url.pathname.includes("/stripe/webhook") ||
        options.request.url.pathname.includes("/resend/webhook");
      if (!needsRawBody) return options.next();

      const rawContext = (options.context as Record<symbol, unknown>)[
        RAW_REQUEST_CONTEXT
      ] as { fetchRequest: Request } | undefined;

      if (!rawContext?.fetchRequest) return options.next();

      return options.next({
        ...options,
        request: {
          ...options.request,
          body: () => rawContext.fetchRequest.text(),
        },
      });
    },
  ],
  plugins: [
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
        commonSchemas: {
          ...convertSchemasListToCommonSchemas(typebotSchema),
          "Public Typebot V5": { schema: publicTypebotSchemaV5 },
          "Public Typebot V6": { schema: publicTypebotSchemaV6 },
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
        const user =
          (await auth())?.user ||
          (await authenticateWithBearerToken(resolvedRequest));
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
