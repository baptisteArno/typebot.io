import { z } from 'zod'
import { LogicStepType, stepBaseSchema } from '../shared'

export const redirectOptionsSchema = z.object({
  url: z.string().optional(),
  isNewTab: z.boolean(),
})

export const redirectStepSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([LogicStepType.REDIRECT]),
    options: redirectOptionsSchema,
  })
)

export const defaultRedirectOptions: RedirectOptions = { isNewTab: false }

export type RedirectStep = z.infer<typeof redirectStepSchema>
export type RedirectOptions = z.infer<typeof redirectOptionsSchema>
