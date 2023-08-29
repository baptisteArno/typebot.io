import { PublicTypebot as PrismaPublicTypebot } from '@typebot.io/prisma'
import {
  groupSchema,
  variableSchema,
  themeSchema,
  settingsSchema,
} from './typebot'
import { z } from 'zod'
import { preprocessTypebot } from './typebot/helpers/preprocessTypebot'
import { edgeSchema } from './typebot/edge'

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

export type PublicTypebot = z.infer<typeof publicTypebotSchema>
