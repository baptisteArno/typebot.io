import { z } from 'zod'
import {
  audioBubbleContentSchema,
  BubbleBlockType,
  embedBubbleContentSchema,
  googleAnalyticsOptionsSchema,
  imageBubbleContentSchema,
  inputBlockSchema,
  textBubbleContentSchema,
  videoBubbleContentSchema,
} from './blocks'
import { publicTypebotSchema } from './publicTypebot'
import { ChatSession as ChatSessionPrisma } from 'db'
import { schemaForType } from './utils'
import { resultSchema } from './result'

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
  result: resultSchema.pick({ id: true, variables: true, hasStarted: true }),
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

const simplifiedTextBubbleContentSchema = textBubbleContentSchema.pick({
  plainText: true,
  html: true,
})

const chatMessageContentSchema = simplifiedTextBubbleContentSchema
  .or(imageBubbleContentSchema)
  .or(videoBubbleContentSchema)
  .or(embedBubbleContentSchema)
  .or(audioBubbleContentSchema)

const codeToExecuteSchema = z.object({
  content: z.string(),
  args: z.array(
    z.object({
      id: z.string(),
      value: z.string().or(z.number()).or(z.boolean()).nullish(),
    })
  ),
})

export const chatReplySchema = z.object({
  messages: z.array(
    z.object({
      type: z.nativeEnum(BubbleBlockType),
      content: chatMessageContentSchema,
    })
  ),
  input: inputBlockSchema.optional(),
  logic: z
    .object({
      redirectUrl: z.string().optional(),
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
})

export type ChatSession = z.infer<typeof chatSessionSchema>
export type SessionState = z.infer<typeof sessionStateSchema>
export type TypebotInSession = z.infer<typeof typebotInSessionStateSchema>
export type ChatReply = z.infer<typeof chatReplySchema>
export type ChatMessageContent = z.infer<typeof chatMessageContentSchema>
