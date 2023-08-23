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
import { preprocessTypebot } from './typebot/helpers/preprocessTypebot'

export const publicTypebotSchema = z.preprocess(
  preprocessTypebot,
  z.object({
    id: z.string(),
    version: z.enum(['3', '4', '5']).nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    typebotId: z.string(),
    groups: z.array(groupSchema),
    edges: z.array(edgeSchema),
    variables: z.array(variableSchema),
    theme: themeSchema,
    settings: settingsSchema,
  })
) satisfies z.ZodType<PrismaPublicTypebot, z.ZodTypeDef, unknown>

const publicTypebotWithName = publicTypebotSchema._def.schema.merge(
  typebotSchema._def.schema.pick({
    name: true,
    isArchived: true,
    isClosed: true,
  })
)

export type PublicTypebot = z.infer<typeof publicTypebotSchema>
export type PublicTypebotWithName = z.infer<typeof publicTypebotWithName>
