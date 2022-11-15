import { z } from 'zod'
import {
  defaultButtonLabel,
  InputBlockType,
  optionBaseSchema,
  blockBaseSchema,
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

export const numberInputSchema = blockBaseSchema.and(
  z.object({
    type: z.enum([InputBlockType.NUMBER]),
    options: numberInputOptionsSchema,
  })
)

export const defaultNumberInputOptions: NumberInputOptions = {
  labels: { button: defaultButtonLabel, placeholder: 'Type a number...' },
}

export type NumberInputBlock = z.infer<typeof numberInputSchema>
export type NumberInputOptions = z.infer<typeof numberInputOptionsSchema>
