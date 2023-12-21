import { z } from '../../zod'

const itemBaseV5Schema = z.object({
  id: z.string(),
  blockId: z.string().optional(),
  outgoingEdgeId: z.string().optional(),
})

export const itemBaseSchemas = {
  v5: itemBaseV5Schema,
  v6: itemBaseV5Schema.omit({ blockId: true }),
}

export const itemBaseSchema = z.union([itemBaseSchemas.v5, itemBaseSchemas.v6])

export type ItemBase = z.infer<typeof itemBaseSchema>
