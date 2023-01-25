import { z } from 'zod'

export const blockBaseSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  outgoingEdgeId: z.string().optional(),
})

export const optionBaseSchema = z.object({
  variableId: z.string().optional(),
})
