import { PublicSniper as PrismaPublicSniper } from '@sniper.io/prisma'
import {
  variableSchema,
  themeSchema,
  settingsSchema,
  groupV5Schema,
  groupV6Schema,
} from './sniper'
import { z } from '../zod'
import { preprocessSniper } from './sniper/helpers/preprocessSniper'
import { edgeSchema } from './sniper/edge'
import { startEventSchema } from './events'

export const publicSniperSchemaV5 = z.preprocess(
  preprocessSniper,
  z.object({
    id: z.string(),
    version: z.enum(['3', '4', '5']),
    createdAt: z.date(),
    updatedAt: z.date(),
    sniperId: z.string(),
    groups: z.array(groupV5Schema),
    events: z.null().openapi({
      type: 'array',
    }),
    edges: z.array(edgeSchema),
    variables: z.array(variableSchema),
    theme: themeSchema,
    settings: settingsSchema,
  })
) satisfies z.ZodType<Partial<PrismaPublicSniper>, z.ZodTypeDef, unknown>
export type PublicSniperV5 = z.infer<typeof publicSniperSchemaV5>

export const publicSniperSchemaV6 = publicSniperSchemaV5._def.schema.extend({
  version: z.literal('6'),
  groups: z.array(groupV6Schema),
  events: z.tuple([startEventSchema]),
})
export type PublicSniperV6 = z.infer<typeof publicSniperSchemaV6>

export const publicSniperSchema = z.preprocess(
  preprocessSniper,
  z.discriminatedUnion('version', [
    publicSniperSchemaV6.openapi({
      ref: 'publicSniperV6',
      title: 'Public Sniper V6',
    }),
    publicSniperSchemaV5._def.schema.openapi({
      ref: 'publicSniperV5',
      title: 'Public Sniper V5',
    }),
  ])
)
export type PublicSniper = z.infer<typeof publicSniperSchema>
