import { z } from 'zod'
import {
  defaultButtonLabel,
  InputStepType,
  optionBaseSchema,
  stepBaseSchema,
} from '../shared'
import { textInputOptionsBaseSchema } from './text'

export const phoneNumberInputOptionsSchema = optionBaseSchema
  .and(textInputOptionsBaseSchema)
  .and(
    z.object({
      retryMessageContent: z.string(),
      defaultCountryCode: z.string().optional(),
    })
  )

export const phoneNumberInputStepSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([InputStepType.PHONE]),
    options: phoneNumberInputOptionsSchema,
  })
)

export const defaultPhoneInputOptions: PhoneNumberInputOptions = {
  labels: {
    button: defaultButtonLabel,
    placeholder: 'Type your phone number...',
  },
  retryMessageContent:
    "This phone number doesn't seem to be valid. Can you type it again?",
}

export type PhoneNumberInputStep = z.infer<typeof phoneNumberInputStepSchema>
export type PhoneNumberInputOptions = z.infer<
  typeof phoneNumberInputOptionsSchema
>
