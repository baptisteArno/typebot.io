import { googleAnalyticsOptionsSchema } from "@typebot.io/blocks-integrations/googleAnalytics/schema";
import { executableHttpRequestSchema } from "@typebot.io/blocks-integrations/httpRequest/schema";
import { nativeMessageSchema } from "@typebot.io/blocks-integrations/openai/schema";
import { pixelOptionsSchema } from "@typebot.io/blocks-integrations/pixel/schema";
import { redirectOptionsSchema } from "@typebot.io/blocks-logic/redirect/schema";
import { listVariableValue } from "@typebot.io/variables/schemas";
import { z } from "zod";

const startPropsToInjectSchema = z.object({
  googleAnalyticsId: z.string().optional(),
  pixelIds: z.array(z.string()).optional(),
  gtmId: z.string().optional(),
  customHeadCode: z.string().optional(),
});
export type StartPropsToInject = z.infer<typeof startPropsToInjectSchema>;

const scriptToExecuteSchema = z.object({
  content: z.string(),
  isUnsafe: z.boolean().optional(),
  isCode: z.boolean().optional(),
  args: z.array(
    z.object({
      id: z.string(),
      value: z
        .string()
        .or(z.number())
        .or(z.boolean())
        .or(listVariableValue)
        .nullish(),
    }),
  ),
});
export type ScriptToExecute = z.infer<typeof scriptToExecuteSchema>;

const clientSideActionBaseSchema = z.object({
  lastBubbleBlockId: z.string().optional(),
  expectsDedicatedReply: z.boolean().optional(),
});

export const clientSideActionSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("scriptToExecute"),
      scriptToExecute: scriptToExecuteSchema,
    })
    .merge(clientSideActionBaseSchema),
  z
    .object({
      type: z.literal("redirect"),
      redirect: redirectOptionsSchema,
    })
    .merge(clientSideActionBaseSchema),
  z
    .object({
      type: z.literal("chatwoot"),
      chatwoot: z.object({ scriptToExecute: scriptToExecuteSchema }),
    })
    .merge(clientSideActionBaseSchema),
  z
    .object({
      type: z.literal("googleAnalytics"),
      googleAnalytics: googleAnalyticsOptionsSchema,
    })
    .merge(clientSideActionBaseSchema),
  z
    .object({
      type: z.literal("wait"),
      wait: z.object({
        secondsToWaitFor: z.number(),
      }),
    })
    .merge(clientSideActionBaseSchema),
  z
    .object({
      type: z.literal("setVariable"),
      setVariable: z.object({ scriptToExecute: scriptToExecuteSchema }),
    })
    .merge(clientSideActionBaseSchema),
  z
    .object({
      type: z.literal("streamOpenAiChatCompletion"),
      streamOpenAiChatCompletion: z.object({
        messages: z.array(
          nativeMessageSchema.pick({ content: true, role: true }),
        ),
      }),
    })
    .merge(clientSideActionBaseSchema),
  z
    .object({
      type: z.literal("httpRequestToExecute"),
      httpRequestToExecute: executableHttpRequestSchema,
    })
    .merge(clientSideActionBaseSchema),
  z
    .object({
      type: z.literal("startPropsToInject"),
      startPropsToInject: startPropsToInjectSchema,
    })
    .merge(clientSideActionBaseSchema),
  z
    .object({
      type: z.literal("pixel"),
      pixel: pixelOptionsSchema,
    })
    .merge(clientSideActionBaseSchema),
  z
    .object({
      type: z.literal("stream"),
      stream: z.literal(true),
    })
    .merge(clientSideActionBaseSchema),
  z
    .object({
      type: z.literal("codeToExecute"),
      codeToExecute: z.object({
        args: z.record(z.string(), z.unknown()),
        content: z.string(),
      }),
    })
    .merge(clientSideActionBaseSchema),
  z
    .object({
      type: z.literal("listenForWebhook"),
    })
    .merge(clientSideActionBaseSchema),
]);
export type ClientSideAction = z.infer<typeof clientSideActionSchema>;
