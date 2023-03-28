import { z } from 'zod'
import { settingsSchema } from './settings'
import { themeSchema } from './theme'
import { variableSchema } from './variable'
import { Typebot as TypebotPrisma } from '@typebot.io/prisma'
import { blockSchema } from '../blocks/schemas'

export const groupSchema = z.object({
  id: z.string(),
  title: z.string(),
  graphCoordinates: z.object({
    x: z.number(),
    y: z.number(),
  }),
  blocks: z.array(blockSchema),
})

const sourceSchema = z.object({
  groupId: z.string(),
  blockId: z.string(),
  itemId: z.string().optional(),
})

const targetSchema = z.object({
  groupId: z.string(),
  blockId: z.string().optional(),
})

export const edgeSchema = z.object({
  id: z.string(),
  from: sourceSchema,
  to: targetSchema,
})

const resultsTablePreferencesSchema = z.object({
  columnsOrder: z.array(z.string()),
  columnsVisibility: z.record(z.string(), z.boolean()),
  columnsWidth: z.record(z.string(), z.number()),
})

export const typebotSchema = z.object({
  version: z.enum(['3']).nullable(),
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
  publicId: z.string().nullable(),
  customDomain: z.string().nullable(),
  workspaceId: z.string(),
  resultsTablePreferences: resultsTablePreferencesSchema.nullable(),
  isArchived: z.boolean(),
  isClosed: z.boolean(),
}) satisfies z.ZodType<TypebotPrisma>

export type Typebot = z.infer<typeof typebotSchema>
export type Target = z.infer<typeof targetSchema>
export type Source = z.infer<typeof sourceSchema>
export type Edge = z.infer<typeof edgeSchema>
export type Group = z.infer<typeof groupSchema>
export type ResultsTablePreferences = z.infer<
  typeof resultsTablePreferencesSchema
>
