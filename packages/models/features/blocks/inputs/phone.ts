import { z } from 'zod'
import { optionBaseSchema, blockBaseSchema } from '../baseSchemas'
import { defaultButtonLabel } from './constants'
import { InputBlockType } from './enums'
import { textInputOptionsBaseSchema } from './text'

export const phoneNumberInputOptionsSchema = optionBaseSchema
  .merge(textInputOptionsBaseSchema)
  .merge(
    z.object({
      retryMessageContent: z.string(),
      defaultCountryCode: z.string().optional(),
    })
  )

export const phoneNumberInputBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([InputBlockType.PHONE]),
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

export type PhoneNumberInputBlock = z.infer<typeof phoneNumberInputBlockSchema>
export type PhoneNumberInputOptions = z.infer<
  typeof phoneNumberInputOptionsSchema
>
