import { z } from 'zod'
import {
  defaultButtonLabel,
  InputStepType,
  optionBaseSchema,
  stepBaseSchema,
} from '../shared'

export const textInputOptionsBaseSchema = z.object({
  labels: z.object({
    placeholder: z.string(),
    button: z.string(),
  }),
})

export const textInputOptionsSchema = textInputOptionsBaseSchema
  .and(optionBaseSchema)
  .and(
    z.object({
      isLong: z.boolean(),
    })
  )

export const defaultTextInputOptions: TextInputOptions = {
  isLong: false,
  labels: { button: defaultButtonLabel, placeholder: 'Type your answer...' },
}

export const textInputSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([InputStepType.TEXT]),
    options: textInputOptionsSchema,
  })
)

export type TextInputStep = z.infer<typeof textInputSchema>
export type TextInputOptions = z.infer<typeof textInputOptionsSchema>
