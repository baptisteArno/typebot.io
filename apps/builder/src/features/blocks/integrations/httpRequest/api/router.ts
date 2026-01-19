import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { z } from "zod";
import {
  getResultExampleInputSchema,
  handleGetResultExample,
} from "./handleGetResultExample";
import {
  handleListHttpRequestBlocks,
  listHttpRequestBlocksInputSchema,
} from "./handleListHttpRequestBlocks";
import {
  handleSubscribeHttpRequest,
  subscribeHttpRequestInputSchema,
} from "./handleSubscribeHttpRequest";
import {
  handleTestHttpRequest,
  testHttpRequestInputSchema,
} from "./handleTestHttpRequest";
import {
  handleUnsubscribeHttpRequest,
  unsubscribeHttpRequestInputSchema,
} from "./handleUnsubscribeHttpRequest";

export const httpRequestRouter = {
  listHttpRequestBlocks: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/typebots/{typebotId}/webhookBlocks",
      summary: "List HTTP request blocks",
      description:
        "Returns a list of all the HTTP request blocks that you can subscribe to.",
      tags: ["HTTP request"],
    })
    .input(listHttpRequestBlocksInputSchema)
    .output(
      z.object({
        webhookBlocks: z.array(
          z.object({
            id: z.string(),
            type: z.enum([
              IntegrationBlockType.HTTP_REQUEST,
              IntegrationBlockType.ZAPIER,
              IntegrationBlockType.MAKE_COM,
              IntegrationBlockType.PABBLY_CONNECT,
            ]),
            label: z.string(),
            url: z.string().optional(),
          }),
        ),
      }),
    )
    .handler(handleListHttpRequestBlocks),

  getResultExample: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/typebots/{typebotId}/webhookBlocks/{blockId}/getResultExample",
      summary: "Get result example",
      description:
        'Returns "fake" result for http request block to help you anticipate how the webhook will behave.',
      tags: ["HTTP request"],
    })
    .input(getResultExampleInputSchema)
    .output(
      z.object({
        resultExample: z
          .record(z.string(), z.unknown())
          .describe("Can contain any fields."),
      }),
    )
    .handler(handleGetResultExample),

  subscribeHttpRequest: authenticatedProcedure
    .route({
      method: "POST",
      path: "/v1/typebots/{typebotId}/webhookBlocks/{blockId}/subscribe",
      summary: "Subscribe to HTTP request block",
      tags: ["HTTP request"],
    })
    .input(subscribeHttpRequestInputSchema)
    .output(
      z.object({
        id: z.string(),
        url: z.string().nullable(),
      }),
    )
    .handler(handleSubscribeHttpRequest),

  unsubscribeHttpRequest: authenticatedProcedure
    .route({
      method: "POST",
      path: "/v1/typebots/{typebotId}/webhookBlocks/{blockId}/unsubscribe",
      summary: "Unsubscribe from HTTP request block",
      tags: ["HTTP request"],
    })
    .input(unsubscribeHttpRequestInputSchema)
    .output(
      z.object({
        id: z.string(),
        url: z.string().nullable(),
      }),
    )
    .handler(handleUnsubscribeHttpRequest),
  testHttpRequest: authenticatedProcedure
    .input(testHttpRequestInputSchema)
    .output(
      z.object({
        statusCode: z.number(),
        data: z.unknown().optional(),
      }),
    )
    .handler(handleTestHttpRequest),
};
