import { z } from 'zod'
import {
  defaultButtonLabel,
  InputStepType,
  optionBaseSchema,
  stepBaseSchema,
} from '../shared'
import { textInputOptionsBaseSchema } from './text'

export const numberInputOptionsSchema = optionBaseSchema
  .and(textInputOptionsBaseSchema)
  .and(
    z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      step: z.number().optional(),
    })
  )

export const numberInputSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([InputStepType.NUMBER]),
    options: numberInputOptionsSchema,
  })
)

export const defaultNumberInputOptions: NumberInputOptions = {
  labels: { button: defaultButtonLabel, placeholder: 'Type a number...' },
}

export type NumberInputStep = z.infer<typeof numberInputSchema>
export type NumberInputOptions = z.infer<typeof numberInputOptionsSchema>
