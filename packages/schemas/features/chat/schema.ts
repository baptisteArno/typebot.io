import { z } from 'zod'
import {
  executableWebhookSchema,
  googleAnalyticsOptionsSchema,
  paymentInputRuntimeOptionsSchema,
  pixelOptionsSchema,
  redirectOptionsSchema,
} from '../blocks'
import { logSchema } from '../result'
import { listVariableValue } from '../typebot'
import {
  textBubbleContentSchema,
  imageBubbleContentSchema,
  videoBubbleContentSchema,
  audioBubbleContentSchema,
  embedBubbleContentSchema,
} from '../blocks/bubbles'
import { nativeMessageSchema } from '../blocks/integrations/openai'
import { sessionStateSchema } from './sessionState'
import { dynamicThemeSchema } from './shared'
import { preprocessTypebot } from '../typebot/helpers/preprocessTypebot'
import { typebotV5Schema, typebotV6Schema } from '../typebot/typebot'
import { inputBlockSchemas } from '../blocks/inputs/schema'
import { BubbleBlockType } from '../blocks/bubbles/constants'

const chatSessionSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  state: sessionStateSchema,
})
export type ChatSession = z.infer<typeof chatSessionSchema>

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

export const chatMessageSchema = z
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
export type ChatMessage = z.infer<typeof chatMessageSchema>

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
export type ScriptToExecute = z.infer<typeof scriptToExecuteSchema>

const startTypebotPick = {
  version: true,
  id: true,
  groups: true,
  events: true,
  edges: true,
  variables: true,
  settings: true,
  theme: true,
} as const
export const startTypebotSchema = z.preprocess(
  preprocessTypebot,
  z.discriminatedUnion('version', [
    typebotV5Schema._def.schema.pick(startTypebotPick),
    typebotV6Schema.pick(startTypebotPick),
  ])
)
export type StartTypebot = z.infer<typeof startTypebotSchema>

export const chatLogSchema = logSchema
  .pick({
    status: true,
    description: true,
  })
  .merge(z.object({ details: z.unknown().optional() }))
export type ChatLog = z.infer<typeof chatLogSchema>

export const startChatInputSchema = z.object({
  publicId: z.string(),
  isStreamEnabled: z.boolean().optional(),
  message: z.string().optional(),
  resultId: z
    .string()
    .optional()
    .describe("Provide it if you'd like to overwrite an existing result."),
  isOnlyRegistering: z
    .boolean()
    .optional()
    .describe(
      'If set to `true`, it will only register the session and not start the bot. This is used for 3rd party chat platforms as it can require a session to be registered before sending the first message.'
    ),
  prefilledVariables: z
    .record(z.unknown())
    .optional()
    .describe(
      '[More info about prefilled variables.](https://docs.typebot.io/editor/variables#prefilled-variables)'
    ),
})
export type StartChatInput = z.infer<typeof startChatInputSchema>

export const startFromSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('group'),
    groupId: z.string(),
  }),
  z.object({
    type: z.literal('event'),
    eventId: z.string(),
  }),
])
export type StartFrom = z.infer<typeof startFromSchema>

export const startPreviewChatInputSchema = z.object({
  typebotId: z.string(),
  isStreamEnabled: z.boolean().optional(),
  message: z.string().optional(),
  isOnlyRegistering: z
    .boolean()
    .optional()
    .describe(
      'If set to `true`, it will only register the session and not start the bot. This is used for 3rd party chat platforms as it can require a session to be registered before sending the first message.'
    ),
  typebot: startTypebotSchema
    .optional()
    .describe(
      'If set, it will override the typebot that is used to start the chat.'
    ),
  startFrom: startFromSchema.optional(),
})
export type StartPreviewChatInput = z.infer<typeof startPreviewChatInputSchema>

export const runtimeOptionsSchema = paymentInputRuntimeOptionsSchema.optional()
export type RuntimeOptions = z.infer<typeof runtimeOptionsSchema>

const startPropsToInjectSchema = z.object({
  googleAnalyticsId: z.string().optional(),
  pixelIds: z.array(z.string()).optional(),
  gtmId: z.string().optional(),
  customHeadCode: z.string().optional(),
})
export type StartPropsToInject = z.infer<typeof startPropsToInjectSchema>

export const clientSideActionSchema = z
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
              nativeMessageSchema.pick({ content: true, role: true })
            ),
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

const typebotInChatReplyPick = {
  version: true,
  id: true,
  groups: true,
  edges: true,
  variables: true,
  settings: true,
  theme: true,
} as const
export const typebotInChatReply = z.preprocess(
  preprocessTypebot,
  z.discriminatedUnion('version', [
    typebotV5Schema._def.schema.pick(typebotInChatReplyPick),
    typebotV6Schema.pick(typebotInChatReplyPick),
  ])
)

const chatResponseBaseSchema = z.object({
  lastMessageNewFormat: z
    .string()
    .optional()
    .describe(
      'The sent message is validated and formatted on the backend. This is set only if the message differs from the formatted version.'
    ),
  messages: z.array(chatMessageSchema),
  input: z
    .union([
      z.discriminatedUnion('type', [...inputBlockSchemas.v5]),
      z.discriminatedUnion('type', [...inputBlockSchemas.v6]),
    ])
    .and(
      z.object({
        prefilledValue: z.string().optional(),
        runtimeOptions: runtimeOptionsSchema.optional(),
      })
    )
    .optional(),
  clientSideActions: z.array(clientSideActionSchema).optional(),
  logs: z.array(chatLogSchema).optional(),
  dynamicTheme: dynamicThemeSchema.optional(),
})

export const startChatResponseSchema = chatResponseBaseSchema.extend({
  sessionId: z.string().optional(),
  typebot: z.object({
    id: z.string(),
    theme: z.union([
      typebotV5Schema._def.schema.shape.theme,
      typebotV6Schema.shape.theme,
    ]),
    settings: z.union([
      typebotV5Schema._def.schema.shape.settings,
      typebotV6Schema.shape.settings,
    ]),
  }),
  resultId: z.string().optional(),
})
export type StartChatResponse = z.infer<typeof startChatResponseSchema>

export const startPreviewChatResponseSchema = startChatResponseSchema.omit({
  resultId: true,
})

export const continueChatResponseSchema = chatResponseBaseSchema
export type ContinueChatResponse = z.infer<typeof continueChatResponseSchema>
