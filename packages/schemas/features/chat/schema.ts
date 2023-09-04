import { z } from 'zod'
import {
  executableWebhookSchema,
  googleAnalyticsOptionsSchema,
  paymentInputRuntimeOptionsSchema,
  pixelOptionsSchema,
  redirectOptionsSchema,
} from '../blocks'
import { logSchema } from '../result'
import { listVariableValue, typebotSchema } from '../typebot'
import {
  textBubbleContentSchema,
  imageBubbleContentSchema,
  videoBubbleContentSchema,
  audioBubbleContentSchema,
  embedBubbleContentSchema,
} from '../blocks/bubbles'
import { BubbleBlockType } from '../blocks/bubbles/enums'
import { inputBlockSchemas } from '../blocks/schemas'
import { chatCompletionMessageSchema } from '../blocks/integrations/openai'
import { sessionStateSchema } from './sessionState'
import { dynamicThemeSchema } from './shared'
import { preprocessTypebot } from '../typebot/helpers/preprocessTypebot'

const chatSessionSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  state: sessionStateSchema,
})

const textMessageSchema = z.object({
  type: z.literal(BubbleBlockType.TEXT),
  content: textBubbleContentSchema,
})

const imageMessageSchema = z.object({
  type: z.enum([BubbleBlockType.IMAGE]),
  content: imageBubbleContentSchema,
})

const videoMessageSchema = z.object({
  type: z.enum([BubbleBlockType.VIDEO]),
  content: videoBubbleContentSchema,
})

const audioMessageSchema = z.object({
  type: z.enum([BubbleBlockType.AUDIO]),
  content: audioBubbleContentSchema,
})

const embedMessageSchema = z.object({
  type: z.enum([BubbleBlockType.EMBED]),
  content: embedBubbleContentSchema
    .omit({
      height: true,
    })
    .merge(z.object({ height: z.number().optional() })),
})

const chatMessageSchema = z
  .object({ id: z.string() })
  .and(
    z.discriminatedUnion('type', [
      textMessageSchema,
      imageMessageSchema,
      videoMessageSchema,
      audioMessageSchema,
      embedMessageSchema,
    ])
  )

const scriptToExecuteSchema = z.object({
  content: z.string(),
  args: z.array(
    z.object({
      id: z.string(),
      value: z
        .string()
        .or(z.number())
        .or(z.boolean())
        .or(listVariableValue)
        .nullish(),
    })
  ),
})

export const startTypebotSchema = z.preprocess(
  preprocessTypebot,
  typebotSchema._def.schema.pick({
    version: true,
    id: true,
    groups: true,
    edges: true,
    variables: true,
    settings: true,
    theme: true,
  })
)

const startParamsSchema = z.object({
  typebot: startTypebotSchema
    .or(z.string())
    .describe(
      'Either a Typebot ID or a Typebot object. If you provide a Typebot object, it will be executed in preview mode. ([How can I find my typebot ID?](https://docs.typebot.io/api#how-to-find-my-typebotid)).'
    ),
  isPreview: z
    .boolean()
    .optional()
    .describe(
      "If set to `true`, it will start a Preview session with the unpublished bot and it won't be saved in the Results tab. You need to be authenticated with a bearer token for this to work."
    ),
  resultId: z
    .string()
    .optional()
    .describe("Provide it if you'd like to overwrite an existing result."),
  startGroupId: z
    .string()
    .optional()
    .describe('Start chat from a specific group.'),
  prefilledVariables: z
    .record(z.unknown())
    .optional()
    .describe(
      '[More info about prefilled variables.](https://docs.typebot.io/editor/variables#prefilled-variables)'
    ),
  isStreamEnabled: z
    .boolean()
    .optional()
    .describe(
      'Set this to `true` if you intend to stream OpenAI completions on a client.'
    ),
  isOnlyRegistering: z
    .boolean()
    .optional()
    .describe(
      'If set to `true`, it will only register the session and not start the chat. This is used for other chat platform integration as it can require a session to be registered before sending the first message.'
    ),
})

const replyLogSchema = logSchema
  .pick({
    status: true,
    description: true,
  })
  .merge(z.object({ details: z.unknown().optional() }))

export const sendMessageInputSchema = z.object({
  message: z
    .string()
    .optional()
    .describe(
      'The answer to the previous chat input. Do not provide it if you are starting a new chat.'
    ),
  sessionId: z
    .string()
    .optional()
    .describe(
      'Session ID that you get from the initial chat request to a bot. If not provided, it will create a new session.'
    ),
  startParams: startParamsSchema.optional(),
  clientLogs: z
    .array(replyLogSchema)
    .optional()
    .describe('Logs while executing client side actions'),
})

const runtimeOptionsSchema = paymentInputRuntimeOptionsSchema.optional()

const startPropsToInjectSchema = z.object({
  googleAnalyticsId: z.string().optional(),
  pixelId: z.string().optional(),
  gtmId: z.string().optional(),
  customHeadCode: z.string().optional(),
})

const clientSideActionSchema = z
  .object({
    lastBubbleBlockId: z.string().optional(),
    expectsDedicatedReply: z.boolean().optional(),
  })
  .and(
    z
      .object({
        scriptToExecute: scriptToExecuteSchema,
      })
      .or(
        z.object({
          redirect: redirectOptionsSchema,
        })
      )
      .or(
        z.object({
          chatwoot: z.object({ scriptToExecute: scriptToExecuteSchema }),
        })
      )
      .or(
        z.object({
          googleAnalytics: googleAnalyticsOptionsSchema,
        })
      )
      .or(
        z.object({
          wait: z.object({
            secondsToWaitFor: z.number(),
          }),
        })
      )
      .or(
        z.object({
          setVariable: z.object({ scriptToExecute: scriptToExecuteSchema }),
        })
      )
      .or(
        z.object({
          streamOpenAiChatCompletion: z.object({
            messages: z.array(
              chatCompletionMessageSchema.pick({ content: true, role: true })
            ),
            displayStream: z.boolean().optional(),
          }),
        })
      )
      .or(
        z.object({
          webhookToExecute: executableWebhookSchema,
        })
      )
      .or(
        z.object({
          startPropsToInject: startPropsToInjectSchema,
        })
      )
      .or(
        z.object({
          pixel: pixelOptionsSchema,
        })
      )
  )

export const chatReplySchema = z.object({
  messages: z.array(chatMessageSchema),
  input: z
    .discriminatedUnion('type', [...inputBlockSchemas])
    .and(
      z.object({
        prefilledValue: z.string().optional(),
        runtimeOptions: runtimeOptionsSchema.optional(),
      })
    )
    .optional(),
  clientSideActions: z.array(clientSideActionSchema).optional(),
  sessionId: z.string().optional(),
  typebot: typebotSchema._def.schema
    .pick({ id: true, theme: true, settings: true })
    .optional(),
  resultId: z.string().optional(),
  dynamicTheme: dynamicThemeSchema.optional(),
  logs: z.array(replyLogSchema).optional(),
  lastMessageNewFormat: z
    .string()
    .optional()
    .describe(
      'The sent message is validated and formatted on the backend. This is set only if the message differs from the formatted version.'
    ),
})

export type ChatSession = z.infer<typeof chatSessionSchema>

export type ChatReply = z.infer<typeof chatReplySchema>
export type ChatMessage = z.infer<typeof chatMessageSchema>
export type SendMessageInput = z.infer<typeof sendMessageInputSchema>
export type ScriptToExecute = z.infer<typeof scriptToExecuteSchema>
export type StartParams = z.infer<typeof startParamsSchema>
export type RuntimeOptions = z.infer<typeof runtimeOptionsSchema>
export type StartTypebot = z.infer<typeof startTypebotSchema>
export type ReplyLog = z.infer<typeof replyLogSchema>
export type StartPropsToInject = z.infer<typeof startPropsToInjectSchema>
