import { PublicTypebot as PrismaPublicTypebot } from '@typebot.io/prisma'
import {
  variableSchema,
  themeSchema,
  settingsSchema,
  groupV5Schema,
  groupV6Schema,
} from './typebot'
import { z } from '../zod'
import { preprocessTypebot } from './typebot/helpers/preprocessTypebot'
import { edgeSchema } from './typebot/edge'
import { startEventSchema } from './events'

export const publicTypebotSchemaV5 = z.preprocess(
  preprocessTypebot,
  z.object({
    id: z.string(),
    version: z.enum(['3', '4', '5']),
    createdAt: z.date(),
    updatedAt: z.date(),
    typebotId: z.string(),
    groups: z.array(groupV5Schema),
    events: z.null().openapi({
      type: 'array',
    }),
    edges: z.array(edgeSchema),
    variables: z.array(variableSchema),
    theme: themeSchema,
    settings: settingsSchema,
  })
) satisfies z.ZodType<Partial<PrismaPublicTypebot>, z.ZodTypeDef, unknown>
export type PublicTypebotV5 = z.infer<typeof publicTypebotSchemaV5>

export const publicTypebotSchemaV6 = publicTypebotSchemaV5._def.schema.extend({
  version: z.literal('6'),
  groups: z.array(groupV6Schema),
  events: z.tuple([startEventSchema]),
})
export type PublicTypebotV6 = z.infer<typeof publicTypebotSchemaV6>

export const publicTypebotSchema = z.preprocess(
  preprocessTypebot,
  z.discriminatedUnion('version', [
    publicTypebotSchemaV6.openapi({
      ref: 'publicTypebotV6',
      title: 'Public Typebot V6',
    }),
    publicTypebotSchemaV5._def.schema.openapi({
      ref: 'publicTypebotV5',
      title: 'Public Typebot V5',
    }),
  ])
)
export type PublicTypebot = z.infer<typeof publicTypebotSchema>
