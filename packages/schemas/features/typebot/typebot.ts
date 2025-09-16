import { z } from '../../zod'
import { settingsSchema } from './settings'
import { themeSchema } from './theme'
import { variableSchema } from './variable'
import { Typebot as TypebotPrisma } from '@typebot.io/prisma'
import {
  preprocessColumnsWidthResults,
  preprocessTypebot,
} from './helpers/preprocessTypebot'
import { edgeSchema } from './edge'
import { groupV5Schema, groupV6Schema } from './group'
import { startEventSchema } from '../events/start/schema'

export const resultsTablePreferencesSchema = z.object({
  columnsOrder: z.array(z.string()),
  columnsVisibility: z.record(z.string(), z.boolean()),
  columnsWidth: z.preprocess(
    preprocessColumnsWidthResults,
    z.record(z.string(), z.number())
  ),
})

const isDomainNameWithPathNameCompatible = (str: string) =>
  /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?:\/[\w-\/]*)?)$/.test(
    str
  )

export const typebotV5Schema = z.preprocess(
  preprocessTypebot,
  z.object({
    version: z.enum(['3', '4', '5']),
    id: z.string(),
    name: z.string(),
    events: z
      .preprocess((val) => (val === undefined ? null : val), z.null())
      .openapi({ type: 'array' }),
    groups: z.array(groupV5Schema),
    edges: z.array(edgeSchema),
    variables: z.array(variableSchema),
    theme: themeSchema,
    selectedThemeTemplateId: z.string().nullable(),
    settings: settingsSchema,
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    icon: z.string().nullable(),
    folderId: z.string().nullable(),
    publicId: z
      .string()
      .refine((str) => /^[a-zA-Z0-9-.]+$/.test(str))
      .nullable(),
    customDomain: z
      .string()
      .refine(isDomainNameWithPathNameCompatible)
      .nullable(),
    workspaceId: z.string(),
    resultsTablePreferences: resultsTablePreferencesSchema.nullable(),
    isArchived: z.boolean(),
    isClosed: z.boolean(),
    whatsAppCredentialsId: z.string().nullable(),
    riskLevel: z.number().nullable(),
  }) satisfies z.ZodType<TypebotPrisma, z.ZodTypeDef, unknown>
)

export type TypebotV5 = z.infer<typeof typebotV5Schema>

export const typebotV6Schema = typebotV5Schema._def.schema
  .extend({
    version: z.literal('6'),
    groups: z.array(groupV6Schema),
    events: z.tuple([startEventSchema]),
  })
  .openapi({
    title: 'Typebot V6',
    ref: 'typebotV6',
  })
export type TypebotV6 = z.infer<typeof typebotV6Schema>

export const typebotSchema = z.preprocess(
  preprocessTypebot,
  z.discriminatedUnion('version', [
    typebotV6Schema,
    typebotV5Schema._def.schema.openapi({
      title: 'Typebot V5',
      ref: 'typebotV5',
    }),
  ])
)
export type Typebot = z.infer<typeof typebotSchema>

export type ResultsTablePreferences = z.infer<
  typeof resultsTablePreferencesSchema
>
