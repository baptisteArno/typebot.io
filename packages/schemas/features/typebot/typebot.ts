import { z } from 'zod'
import { settingsSchema } from './settings'
import { themeSchema } from './theme'
import { variableSchema } from './variable'
import { Typebot as TypebotPrisma } from '@typebot.io/prisma'
import { blockSchema } from '../blocks/schemas'
import { preprocessTypebot } from './helpers/preprocessTypebot'
import { edgeSchema } from './edge'

export const groupSchema = z.object({
  id: z.string(),
  title: z.string(),
  graphCoordinates: z.object({
    x: z.number(),
    y: z.number(),
  }),
  blocks: z.array(blockSchema),
})

const resultsTablePreferencesSchema = z.object({
  columnsOrder: z.array(z.string()),
  columnsVisibility: z.record(z.string(), z.boolean()),
  columnsWidth: z.record(z.string(), z.number()),
})

const isDomainNameWithPathNameCompatible = (str: string) =>
  /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?:\/[\w-\/]*)?)$/.test(
    str
  )

export const typebotSchema = z.preprocess(
  preprocessTypebot,
  z.object({
    version: z.enum(['3', '4', '5']).nullable(),
    id: z.string(),
    name: z.string(),
    groups: z.array(groupSchema),
    edges: z.array(edgeSchema),
    variables: z.array(variableSchema),
    theme: themeSchema,
    selectedThemeTemplateId: z.string().nullable(),
    settings: settingsSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
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
    whatsAppPhoneNumberId: z.string().nullable(),
  }) satisfies z.ZodType<TypebotPrisma, z.ZodTypeDef, unknown>
)

export const typebotCreateSchema = typebotSchema._def.schema
  .pick({
    name: true,
    icon: true,
    selectedThemeTemplateId: true,
    groups: true,
    theme: true,
    settings: true,
    folderId: true,
    variables: true,
    edges: true,
    resultsTablePreferences: true,
    publicId: true,
    customDomain: true,
  })
  .partial()

export type Typebot = z.infer<typeof typebotSchema>

export type Group = z.infer<typeof groupSchema>
export type ResultsTablePreferences = z.infer<
  typeof resultsTablePreferencesSchema
>
