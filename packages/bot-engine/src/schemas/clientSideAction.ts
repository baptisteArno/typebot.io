import { googleAnalyticsOptionsSchema } from "@typebot.io/blocks-integrations/googleAnalytics/schema";
import { executableHttpRequestSchema } from "@typebot.io/blocks-integrations/httpRequest/schema";
import { nativeMessageSchema } from "@typebot.io/blocks-integrations/openai/schema";
import { pixelOptionsSchema } from "@typebot.io/blocks-integrations/pixel/schema";
import { redirectOptionsSchema } from "@typebot.io/blocks-logic/redirect/schema";
import { listVariableValue } from "@typebot.io/variables/schemas";
import { z } from "@typebot.io/zod";

const startPropsToInjectSchema = z.object({
  googleAnalyticsId: z.string().optional(),
  pixelIds: z.array(z.string()).optional(),
  gtmId: z.string().optional(),
  customHeadCode: z.string().optional(),
});
export type StartPropsToInject = z.infer<typeof startPropsToInjectSchema>;

const scriptToExecuteSchema = z.object({
  content: z.string(),
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
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: "csaScriptToExecute",
      title: "Script to execute",
    }),
  z
    .object({
      type: z.literal("redirect"),
      redirect: redirectOptionsSchema,
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: "csaRedirect",
      title: "Redirect",
    }),
  z
    .object({
      type: z.literal("chatwoot"),
      chatwoot: z.object({ scriptToExecute: scriptToExecuteSchema }),
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: "csaChatwoot",
      title: "Chatwoot",
    }),
  z
    .object({
      type: z.literal("googleAnalytics"),
      googleAnalytics: googleAnalyticsOptionsSchema,
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: "csaGa",
      title: "Google Analytics",
    }),
  z
    .object({
      type: z.literal("wait"),
      wait: z.object({
        secondsToWaitFor: z.number(),
      }),
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: "csaWait",
      title: "Wait",
    }),
  z
    .object({
      type: z.literal("setVariable"),
      setVariable: z.object({ scriptToExecute: scriptToExecuteSchema }),
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: "csaSetVariable",
      title: "Set variable",
    }),
  z
    .object({
      type: z.literal("streamOpenAiChatCompletion"),
      streamOpenAiChatCompletion: z.object({
        messages: z.array(
          nativeMessageSchema.pick({ content: true, role: true }),
        ),
      }),
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: "csaStreamOpenAiChatCompletion",
      title: "Stream OpenAI",
    }),
  z
    .object({
      type: z.literal("httpRequestToExecute"),
      httpRequestToExecute: executableHttpRequestSchema,
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: "csaHttpRequestToExecute",
      title: "Execute HTTP request",
    }),
  z
    .object({
      type: z.literal("startPropsToInject"),
      startPropsToInject: startPropsToInjectSchema,
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: "csaInjectStartProps",
      title: "Inject start props",
    }),
  z
    .object({
      type: z.literal("pixel"),
      pixel: pixelOptionsSchema,
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: "csaPixel",
      title: "Init Pixel",
    }),
  z
    .object({
      type: z.literal("stream"),
      stream: z.literal(true),
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: "csaStream",
      title: "Exec stream",
    }),
  z
    .object({
      type: z.literal("codeToExecute"),
      codeToExecute: z.object({
        args: z.record(z.string(), z.unknown()),
        content: z.string(),
      }),
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: "csaCodeToExecute",
      title: "Execute code",
    }),
  z
    .object({
      type: z.literal("listenForWebhook"),
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: "csaListenForWebhook",
      title: "Listen to webhook",
    }),
]);
export type ClientSideAction = z.infer<typeof clientSideActionSchema>;
