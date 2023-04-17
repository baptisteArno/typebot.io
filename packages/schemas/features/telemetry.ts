import { Plan } from '@typebot.io/prisma'
import { z } from 'zod'

const userEvent = z.object({
  userId: z.string(),
})

const workspaceEvent = userEvent.merge(
  z.object({
    workspaceId: z.string(),
  })
)

const typebotEvent = workspaceEvent.merge(
  z.object({
    typebotId: z.string(),
  })
)

const workspaceCreatedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal('Workspace created'),
    data: z.object({
      name: z.string().optional(),
      plan: z.nativeEnum(Plan),
    }),
  })
)

const userCreatedEventSchema = userEvent.merge(
  z.object({
    name: z.literal('User created'),
    data: z.object({
      email: z.string(),
      name: z.string().optional(),
    }),
  })
)

const typebotCreatedEventSchema = typebotEvent.merge(
  z.object({
    name: z.literal('Typebot created'),
    data: z.object({
      name: z.string(),
      template: z.string().optional(),
    }),
  })
)

const publishedTypebotEventSchema = typebotEvent.merge(
  z.object({
    name: z.literal('Typebot published'),
    data: z.object({
      name: z.string(),
      isFirstPublish: z.literal(true).optional(),
    }),
  })
)

const subscriptionUpdatedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal('Subscription updated'),
    data: z.object({
      plan: z.nativeEnum(Plan),
      additionalChatsIndex: z.number(),
      additionalStorageIndex: z.number(),
    }),
  })
)

const newResultsCollectedEventSchema = typebotEvent.merge(
  z.object({
    name: z.literal('New results collected'),
    data: z.object({
      total: z.number(),
      isFirstOfKind: z.literal(true).optional(),
    }),
  })
)

const workspaceLimitReachedEventSchema = workspaceEvent.merge(
  z.object({
    name: z.literal('Workspace limit reached'),
    data: z.object({
      chatsLimit: z.number(),
      storageLimit: z.number(),
      totalChatsUsed: z.number(),
      totalStorageUsed: z.number(),
    }),
  })
)

export const eventSchema = z.discriminatedUnion('name', [
  workspaceCreatedEventSchema,
  userCreatedEventSchema,
  typebotCreatedEventSchema,
  publishedTypebotEventSchema,
  subscriptionUpdatedEventSchema,
  newResultsCollectedEventSchema,
  workspaceLimitReachedEventSchema,
])

export type TelemetryEvent = z.infer<typeof eventSchema>
