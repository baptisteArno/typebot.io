import { z } from 'zod'
import {
  defaultButtonLabel,
  InputBlockType,
  optionBaseSchema,
  blockBaseSchema,
} from '../shared'
import { textInputOptionsBaseSchema } from './text'

export const emailInputOptionsSchema = optionBaseSchema
  .and(textInputOptionsBaseSchema)
  .and(
    z.object({
      // TODO: make it required once database migration is done
      retryMessageContent: z.string().optional(),
    })
  )

export const emailInputSchema = blockBaseSchema.and(
  z.object({
    type: z.enum([InputBlockType.EMAIL]),
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

export type EmailInputBlock = z.infer<typeof emailInputSchema>
export type EmailInputOptions = z.infer<typeof emailInputOptionsSchema>
