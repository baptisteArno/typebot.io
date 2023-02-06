import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { LogicBlockType } from './enums'

export const transferOptionsSchema = z.object({
  departmentId: z.string().optional(),
  attendantId: z.string().optional(),
  message: z.string().optional(),
})

export const transferBlockSchema = blockBaseSchema.and(
  z.object({
    type: z.enum([LogicBlockType.TRANSFER]),
    options: transferOptionsSchema,
  })
)

export const defaultTransferOptions: TransferOptions = {}

export type TransferBlock = z.infer<typeof transferBlockSchema>
export type TransferOptions = z.infer<typeof transferOptionsSchema>
