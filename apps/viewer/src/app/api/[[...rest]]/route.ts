import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { CORSPlugin } from "@orpc/server/plugins";
import { authenticateWithBearerToken } from "@typebot.io/auth/helpers/authenticateWithBearerToken";
import { createContext } from "@typebot.io/config/orpc/viewer/context";
import { logServerRequest } from "@typebot.io/telemetry/logServerRequest";
import { after, type NextRequest } from "next/server";
import {
  openApiSchemaConverters,
  openApiSpecGenerateOptions,
} from "../openApiSpecGenerateOptions";
import { appRouter } from "./router";

type RouteContext<_T> = {
  params: Promise<{ rest?: string[] }>;
};

const RAW_REQUEST_CONTEXT = "RAW_REQUEST_CONTEXT";

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
        context: Object.assign({}, options.context, {
          [RAW_REQUEST_CONTEXT]: {
            fetchRequest: options.request,
          },
        }),
      }),
  ],
  rootInterceptors: [
    (options) => {
      const needsRawBody =
        options.request.url.pathname.includes("/whatsapp/") &&
        options.request.url.pathname.endsWith("/webhook");
      if (!needsRawBody) return options.next();

      const rawContext = Reflect.get(options.context, RAW_REQUEST_CONTEXT);
      if (!isRawRequestContext(rawContext)) return options.next();

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
    new CORSPlugin(),
    new OpenAPIReferencePlugin({
      specPath: "/openapi.json",
      schemaConverters: openApiSchemaConverters,
      specGenerateOptions: openApiSpecGenerateOptions,
    }),
  ],
});

const isRawRequestContext = (
  value: unknown,
): value is { fetchRequest: Request } =>
  typeof value === "object" &&
  value !== null &&
  "fetchRequest" in value &&
  Reflect.get(value, "fetchRequest") instanceof Request;

async function handleRequest(
  request: NextRequest,
  ctx: RouteContext<"/api/[[...rest]]">,
) {
  const startedAt = Date.now();
  // Reconstruct request to make it work with Next.js rewrites
  const resolvedPathname = `/api/${(await ctx.params)?.rest?.join("/") ?? ""}`;
  const resolvedRequest =
    resolvedPathname === request.nextUrl.pathname
      ? request
      : new Request(
          request.url.replace(request.nextUrl.pathname, resolvedPathname),
          request,
        );
  try {
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

    const resolvedResponse =
      response ?? new Response("Not found", { status: 404 });
    after(() =>
      logServerRequest({
        request: resolvedRequest,
        response: resolvedResponse,
        startedAt,
      }),
    );

    return resolvedResponse;
  } catch (error) {
    after(() =>
      logServerRequest({
        error,
        request: resolvedRequest,
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
