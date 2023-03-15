import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { LogicBlockType } from './enums'

export const redirectOptionsSchema = z.object({
  url: z.string().optional(),
  isNewTab: z.boolean(),
})

export const redirectBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.REDIRECT]),
    options: redirectOptionsSchema,
  })
)

export const defaultRedirectOptions: RedirectOptions = { isNewTab: false }

export type RedirectBlock = z.infer<typeof redirectBlockSchema>
export type RedirectOptions = z.infer<typeof redirectOptionsSchema>
