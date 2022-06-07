import { z } from 'zod'
import {
  defaultButtonLabel,
  InputStepType,
  optionBaseSchema,
  stepBaseSchema,
} from '../shared'
import { textInputOptionsBaseSchema } from './text'

export const emailInputOptionsSchema = optionBaseSchema
  .and(textInputOptionsBaseSchema)
  .and(
    z.object({
      retryMessageContent: z.string(),
    })
  )

export const emailInputSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([InputStepType.EMAIL]),
    options: emailInputOptionsSchema,
  })
)

export const defaultEmailInputOptions: EmailInputOptions = {
  labels: {
    button: defaultButtonLabel,
    placeholder: 'Type your email...',
  },
  retryMessageContent:
    "This email doesn't seem to be valid. Can you type it again?",
}

export type EmailInputStep = z.infer<typeof emailInputSchema>
export type EmailInputOptions = z.infer<typeof emailInputOptionsSchema>
