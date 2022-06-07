import { z } from 'zod'
import { settingsSchema } from './settings'
import { stepSchema } from './steps'
import { themeSchema } from './theme'
import { variableSchema } from './variable'

const blockSchema = z.object({
  id: z.string(),
  title: z.string(),
  graphCoordinates: z.object({
    x: z.number(),
    y: z.number(),
  }),
  steps: z.array(stepSchema),
})

const sourceSchema = z.object({
  blockId: z.string(),
  stepId: z.string(),
  itemId: z.string().optional(),
})

const targetSchema = z.object({
  blockId: z.string(),
  stepId: z.string().optional(),
})

const edgeSchema = z.object({
  id: z.string(),
  from: sourceSchema,
  to: targetSchema,
})

const typebotSchema = z.object({
  id: z.string(),
  name: z.string(),
  blocks: z.array(blockSchema),
  edges: z.array(edgeSchema),
  variables: z.array(variableSchema),
  theme: themeSchema,
  settings: settingsSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  icon: z.string().nullable(),
  publishedTypebotId: z.string().nullable(),
  folderId: z.string().nullable(),
  publicId: z.string().nullable(),
  customDomain: z.string().nullable(),
  workspaceId: z.string(),
})

export type Typebot = z.infer<typeof typebotSchema>
export type Target = z.infer<typeof targetSchema>
export type Source = z.infer<typeof sourceSchema>
export type Edge = z.infer<typeof edgeSchema>
export type Block = z.infer<typeof blockSchema>
