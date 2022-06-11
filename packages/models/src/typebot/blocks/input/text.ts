import { z } from 'zod'
import {
  defaultButtonLabel,
  InputBlockType,
  optionBaseSchema,
  blockBaseSchema,
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

export const textInputSchema = blockBaseSchema.and(
  z.object({
    type: z.enum([InputBlockType.TEXT]),
    options: textInputOptionsSchema,
  })
)

export type TextInputBlock = z.infer<typeof textInputSchema>
export type TextInputOptions = z.infer<typeof textInputOptionsSchema>
