import { z } from 'zod'
import { optionBaseSchema, blockBaseSchema } from '../baseSchemas'
import { defaultButtonLabel } from './constants'
import { InputBlockType } from './enums'
import { textInputOptionsBaseSchema } from './text'

export const emailInputOptionsSchema = optionBaseSchema
  .merge(textInputOptionsBaseSchema)
  .merge(
    z.object({
      retryMessageContent: z.string().optional(),
    })
  )

export const emailInputSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([InputBlockType.EMAIL]),
    options: emailInputOptionsSchema,
  })
)

export const invalidEmailDefaultRetryMessage =
  "This email doesn't seem to be valid. Can you type it again?"

export const defaultEmailInputOptions: EmailInputOptions = {
  labels: {
    button: defaultButtonLabel,
    placeholder: 'Type your email...',
  },
}

export type EmailInputBlock = z.infer<typeof emailInputSchema>
export type EmailInputOptions = z.infer<typeof emailInputOptionsSchema>
