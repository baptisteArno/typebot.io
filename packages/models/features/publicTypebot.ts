import {
  groupSchema,
  edgeSchema,
  variableSchema,
  themeSchema,
  settingsSchema,
  typebotSchema,
} from './typebot'
import { PublicTypebot as PublicTypebotPrisma } from 'db'
import { z } from 'zod'
import { schemaForType } from './utils'

export const publicTypebotSchema = schemaForType<PublicTypebotPrisma>()(
  z.object({
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
  })
)

const publicTypebotWithName = publicTypebotSchema.and(
  typebotSchema.pick({ name: true, isArchived: true, isClosed: true })
)

export type PublicTypebot = z.infer<typeof publicTypebotSchema>
export type PublicTypebotWithName = z.infer<typeof publicTypebotWithName>
