import { z } from 'zod'

const sourceSchema = z.object({
  groupId: z.string(),
  blockId: z.string(),
  itemId: z.string().optional(),
})
export type Source = z.infer<typeof sourceSchema>

const targetSchema = z.object({
  groupId: z.string(),
  blockId: z.string().optional(),
})
export type Target = z.infer<typeof targetSchema>

export const edgeSchema = z.object({
  id: z.string(),
  from: sourceSchema,
  to: targetSchema,
})
export type Edge = z.infer<typeof edgeSchema>
