import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import * as Sentry from "@sentry/nextjs";
import { authenticateWithBearerToken } from "@typebot.io/auth/helpers/authenticateWithBearerToken";
import { auth } from "@typebot.io/auth/lib/nextAuth";
import { audioBubbleBlockSchema } from "@typebot.io/blocks-bubbles/audio/schema";
import { embedBubbleBlockSchema } from "@typebot.io/blocks-bubbles/embed/schema";
import { imageBubbleBlockSchema } from "@typebot.io/blocks-bubbles/image/schema";
import { textBubbleBlockSchema } from "@typebot.io/blocks-bubbles/text/schema";
import { videoBubbleBlockSchema } from "@typebot.io/blocks-bubbles/video/schema";
import { buttonsInputSchemas } from "@typebot.io/blocks-inputs/choice/schema";
import { dateInputSchema } from "@typebot.io/blocks-inputs/date/schema";
import { emailInputSchema } from "@typebot.io/blocks-inputs/email/schema";
import { fileInputBlockSchemas } from "@typebot.io/blocks-inputs/file/schema";
import { numberInputSchema } from "@typebot.io/blocks-inputs/number/schema";
import { paymentInputSchema } from "@typebot.io/blocks-inputs/payment/schema";
import { phoneNumberInputBlockSchema } from "@typebot.io/blocks-inputs/phone/schema";
import { pictureChoiceBlockSchemas } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import { ratingInputBlockSchema } from "@typebot.io/blocks-inputs/rating/schema";
import { textInputSchema } from "@typebot.io/blocks-inputs/text/schema";
import { timeInputSchema } from "@typebot.io/blocks-inputs/time/schema";
import { urlInputSchema } from "@typebot.io/blocks-inputs/url/schema";
import { chatwootBlockSchema } from "@typebot.io/blocks-integrations/chatwoot/schema";
import { googleAnalyticsBlockSchema } from "@typebot.io/blocks-integrations/googleAnalytics/schema";
import { googleSheetsBlockSchemas } from "@typebot.io/blocks-integrations/googleSheets/schema";
import { httpBlockSchemas } from "@typebot.io/blocks-integrations/httpRequest/schema";
import { makeComBlockSchemas } from "@typebot.io/blocks-integrations/makeCom/schema";
import { pabblyConnectBlockSchemas } from "@typebot.io/blocks-integrations/pabblyConnect/schema";
import { pixelBlockSchema } from "@typebot.io/blocks-integrations/pixel/schema";
import { sendEmailBlockSchema } from "@typebot.io/blocks-integrations/sendEmail/schema";
import { zapierBlockSchemas } from "@typebot.io/blocks-integrations/zapier/schema";
import { abTestBlockSchemas } from "@typebot.io/blocks-logic/abTest/schema";
import { conditionBlockSchemas } from "@typebot.io/blocks-logic/condition/schema";
import { jumpBlockSchema } from "@typebot.io/blocks-logic/jump/schema";
import { redirectBlockSchema } from "@typebot.io/blocks-logic/redirect/schema";
import { returnBlockSchema } from "@typebot.io/blocks-logic/return/schema";
import { scriptBlockSchema } from "@typebot.io/blocks-logic/script/schema";
import { setVariableBlockSchema } from "@typebot.io/blocks-logic/setVariable/schema";
import { typebotLinkBlockSchema } from "@typebot.io/blocks-logic/typebotLink/schema";
import { waitBlockSchema } from "@typebot.io/blocks-logic/wait/schema";
import { webhookBlockSchema } from "@typebot.io/blocks-logic/webhook/schema";
import { createContext } from "@typebot.io/config/orpc/builder/context";
import {
  commandEventSchema,
  invalidReplyEventSchema,
  replyEventSchema,
  startEventSchema,
} from "@typebot.io/events/schemas";
import { forgedBlockSchemas } from "@typebot.io/forge-repository/schemas";
import { groupV6Schema } from "@typebot.io/groups/schemas";
import { settingsSchema } from "@typebot.io/settings/schemas";
import { themeSchema } from "@typebot.io/theme/schemas";
import {
  blockSourceSchema,
  eventSourceSchema,
} from "@typebot.io/typebot/schemas/edge";
import {
  publicTypebotSchemaV5,
  publicTypebotSchemaV6,
} from "@typebot.io/typebot/schemas/publicTypebot";
import {
  typebotV5Schema,
  typebotV6Schema,
} from "@typebot.io/typebot/schemas/typebot";
import type { NextRequest } from "next/server";
import { appRouter } from "@/lib/orpcRouter";

type RouteContext<_T> = {
  params: Promise<{ rest?: string[] }>;
};

const RAW_REQUEST_CONTEXT = Symbol("RAW_REQUEST_CONTEXT");

const forgeBlockCommonSchemas = Object.fromEntries(
  Object.entries(forgedBlockSchemas).map(([id, schema]) => [id, { schema }]),
);

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
      if (!options.request.url.pathname.includes("/stripe/webhook"))
        return options.next();

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
        commonSchemas: {
          "Event node": { schema: eventSourceSchema },
          "Block node": { schema: blockSourceSchema },
          "Start Event": { schema: startEventSchema },
          "Command Event": { schema: commandEventSchema },
          "Reply Event": { schema: replyEventSchema },
          "Invalid Reply Event": { schema: invalidReplyEventSchema },
          Settings: { schema: settingsSchema },
          Theme: { schema: themeSchema },
          "Group V6": { schema: groupV6Schema },
          "Typebot V5": { schema: typebotV5Schema },
          "Typebot V6": { schema: typebotV6Schema },
          "Public Typebot V5": { schema: publicTypebotSchemaV5 },
          "Public Typebot V6": { schema: publicTypebotSchemaV6 },
          Text: { schema: textBubbleBlockSchema },
          Image: { schema: imageBubbleBlockSchema },
          Video: { schema: videoBubbleBlockSchema },
          Audio: { schema: audioBubbleBlockSchema },
          Embed: { schema: embedBubbleBlockSchema },
          TextInput: { schema: textInputSchema },
          Email: { schema: emailInputSchema },
          Url: { schema: urlInputSchema },
          Number: { schema: numberInputSchema },
          PhoneNumber: { schema: phoneNumberInputBlockSchema },
          Date: { schema: dateInputSchema },
          Time: { schema: timeInputSchema },
          Payment: { schema: paymentInputSchema },
          Rating: { schema: ratingInputBlockSchema },
          ButtonsInput: { schema: buttonsInputSchemas.v6 },
          PictureChoice: { schema: pictureChoiceBlockSchemas.v6 },
          FileInput: { schema: fileInputBlockSchemas.v6 },
          SetVariable: { schema: setVariableBlockSchema },
          Condition: { schema: conditionBlockSchemas.v6 },
          Redirect: { schema: redirectBlockSchema },
          Script: { schema: scriptBlockSchema },
          TypebotLink: { schema: typebotLinkBlockSchema },
          Wait: { schema: waitBlockSchema },
          Jump: { schema: jumpBlockSchema },
          AbTest: { schema: abTestBlockSchemas.v6 },
          Return: { schema: returnBlockSchema },
          Webhook: { schema: webhookBlockSchema },
          GoogleSheets: { schema: googleSheetsBlockSchemas.v6 },
          GoogleAnalytics: { schema: googleAnalyticsBlockSchema },
          SendEmail: { schema: sendEmailBlockSchema },
          Chatwoot: { schema: chatwootBlockSchema },
          HttpRequest: { schema: httpBlockSchemas.v6 },
          Zapier: { schema: zapierBlockSchemas.v6 },
          MakeCom: { schema: makeComBlockSchemas.v6 },
          PabblyConnect: { schema: pabblyConnectBlockSchemas.v6 },
          Pixel: { schema: pixelBlockSchema },
          ...forgeBlockCommonSchemas,
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
