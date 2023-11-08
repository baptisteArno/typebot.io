import { z } from 'zod'
import { optionBaseSchema, blockBaseSchema } from '../../shared'
import { InputBlockType } from '../constants'
import { textInputOptionsBaseSchema } from '../text'

export const phoneNumberInputOptionsSchema = optionBaseSchema
  .merge(textInputOptionsBaseSchema)
  .merge(
    z.object({
      retryMessageContent: z.string().optional(),
      defaultCountryCode: z.string().optional(),
    })
  )

export const phoneNumberInputBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([InputBlockType.PHONE]),
    options: phoneNumberInputOptionsSchema.optional(),
  })
)

export type PhoneNumberInputBlock = z.infer<typeof phoneNumberInputBlockSchema>
