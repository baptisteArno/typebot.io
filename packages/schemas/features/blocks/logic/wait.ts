import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { LogicBlockType } from './enums'

export const waitOptionsSchema = z.object({
  secondsToWaitFor: z.string().optional(),
})

export const waitBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.WAIT]),
    options: waitOptionsSchema,
  })
)

export const defaultWaitOptions: WaitOptions = {}

export type WaitBlock = z.infer<typeof waitBlockSchema>
export type WaitOptions = z.infer<typeof waitOptionsSchema>
