import { PublicTypebot as PrismaPublicTypebot } from '@typebot.io/prisma'
import {
  groupSchema,
  edgeSchema,
  variableSchema,
  themeSchema,
  settingsSchema,
  typebotSchema,
} from './typebot'
import { z } from 'zod'

export const publicTypebotSchema = z.object({
  id: z.string(),
  version: z.enum(['3']).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  typebotId: z.string(),
  groups: z.array(groupSchema),
  edges: z.array(edgeSchema),
  variables: z.array(variableSchema),
  theme: themeSchema,
  settings: settingsSchema,
}) satisfies z.ZodType<PrismaPublicTypebot>

const publicTypebotWithName = publicTypebotSchema.merge(
  typebotSchema.pick({ name: true, isArchived: true, isClosed: true })
)

export type PublicTypebot = z.infer<typeof publicTypebotSchema>
export type PublicTypebotWithName = z.infer<typeof publicTypebotWithName>
