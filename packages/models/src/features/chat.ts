import { z } from 'zod'
import {
  audioBubbleContentSchema,
  BubbleBlockType,
  embedBubbleContentSchema,
  googleAnalyticsOptionsSchema,
  imageBubbleContentSchema,
  inputBlockSchema,
  paymentInputRuntimeOptionsSchema,
  redirectOptionsSchema,
  textBubbleContentSchema,
  videoBubbleContentSchema,
} from './blocks'
import { publicTypebotSchema } from './publicTypebot'
import { ChatSession as ChatSessionPrisma } from 'db'
import { schemaForType } from './utils'
import { resultSchema } from './result'
import { typebotSchema } from './typebot'

const typebotInSessionStateSchema = publicTypebotSchema.pick({
  id: true,
  groups: true,
  edges: true,
  variables: true,
})

export const sessionStateSchema = z.object({
  typebot: typebotInSessionStateSchema,
  linkedTypebots: z.object({
    typebots: z.array(typebotInSessionStateSchema),
    queue: z.array(z.object({ edgeId: z.string(), typebotId: z.string() })),
  }),
  currentTypebotId: z.string(),
  result: resultSchema
    .pick({ id: true, variables: true, hasStarted: true })
    .optional(),
  isPreview: z.boolean(),
  currentBlock: z
    .object({
      blockId: z.string(),
      groupId: z.string(),
    })
    .optional(),
})

const chatSessionSchema = schemaForType<ChatSessionPrisma>()(
  z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    state: sessionStateSchema,
  })
)

const textMessageSchema = z.object({
  type: z.enum([BubbleBlockType.TEXT]),
  content: textBubbleContentSchema.omit({
    richText: true,
  }),
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
  content: embedBubbleContentSchema,
})

const chatMessageSchema = textMessageSchema
  .or(imageMessageSchema)
  .or(videoMessageSchema)
  .or(audioMessageSchema)
  .or(embedMessageSchema)

const codeToExecuteSchema = z.object({
  content: z.string(),
  args: z.array(
    z.object({
      id: z.string(),
      value: z.string().or(z.number()).or(z.boolean()).nullish(),
    })
  ),
})

const startParamsSchema = z.object({
  typebotId: z.string({
    description:
      '[How can I find my typebot ID?](https://docs.typebot.io/api#how-to-find-my-typebotid)',
  }),
  isPreview: z
    .boolean()
    .optional()
    .describe(
      "If set to `true`, it will start a Preview session with the unpublished bot and it won't be saved in the Results tab."
    ),
  resultId: z
    .string()
    .optional()
    .describe("Provide it if you'd like to overwrite an existing result."),
  prefilledVariables: z.record(z.unknown()).optional(),
})

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
})

const runtimeOptionsSchema = paymentInputRuntimeOptionsSchema.optional()

export const chatReplySchema = z.object({
  messages: z.array(chatMessageSchema),
  input: inputBlockSchema
    .and(
      z.object({
        prefilledValue: z.string().optional(),
        runtimeOptions: runtimeOptionsSchema.optional(),
      })
    )
    .optional(),
  logic: z
    .object({
      redirect: redirectOptionsSchema.optional(),
      codeToExecute: codeToExecuteSchema.optional(),
    })
    .optional(),
  integrations: z
    .object({
      chatwoot: z
        .object({
          codeToExecute: codeToExecuteSchema,
        })
        .optional(),
      googleAnalytics: googleAnalyticsOptionsSchema.optional(),
    })
    .optional(),
  sessionId: z.string().optional(),
  typebot: typebotSchema.pick({ theme: true, settings: true }).optional(),
  resultId: z.string().optional(),
})

export const initialChatReplySchema = z
  .object({
    sessionId: z.string(),
    resultId: z.string(),
    typebot: typebotSchema.pick({ theme: true, settings: true }),
  })
  .and(chatReplySchema)

export type ChatSession = z.infer<typeof chatSessionSchema>
export type SessionState = z.infer<typeof sessionStateSchema>
export type TypebotInSession = z.infer<typeof typebotInSessionStateSchema>
export type ChatReply = z.infer<typeof chatReplySchema>
export type InitialChatReply = z.infer<typeof initialChatReplySchema>
export type ChatMessage = z.infer<typeof chatMessageSchema>
export type SendMessageInput = z.infer<typeof sendMessageInputSchema>
export type CodeToExecute = z.infer<typeof codeToExecuteSchema>
export type StartParams = z.infer<typeof startParamsSchema>
export type RuntimeOptions = z.infer<typeof runtimeOptionsSchema>
