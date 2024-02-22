import { z } from '../../../zod'
import { buttonsInputSchemas } from './choice'
import { dateInputSchema } from './date'
import { emailInputSchema } from './email'
import { numberInputSchema } from './number'
import { paymentInputSchema } from './payment'
import { phoneNumberInputBlockSchema } from './phone'
import { pictureChoiceBlockSchemas } from './pictureChoice'
import { ratingInputBlockSchema } from './rating'
import { textInputSchema } from './text'
import { urlInputSchema } from './url'
import { fileInputBlockSchemas } from './file'

export const inputBlockSchemas = {
  v5: [
    textInputSchema,
    buttonsInputSchemas.v5,
    emailInputSchema,
    numberInputSchema,
    urlInputSchema,
    phoneNumberInputBlockSchema,
    dateInputSchema,
    paymentInputSchema,
    ratingInputBlockSchema,
    fileInputBlockSchemas.v5,
    pictureChoiceBlockSchemas.v5,
  ],
  v6: [
    textInputSchema,
    buttonsInputSchemas.v6,
    emailInputSchema,
    numberInputSchema,
    urlInputSchema,
    phoneNumberInputBlockSchema,
    dateInputSchema,
    paymentInputSchema,
    ratingInputBlockSchema,
    fileInputBlockSchemas.v6,
    pictureChoiceBlockSchemas.v6,
  ],
} as const

const inputBlockV5Schema = z.discriminatedUnion('type', [
  ...inputBlockSchemas.v5,
])

const inputBlockV6Schema = z.discriminatedUnion('type', [
  ...inputBlockSchemas.v6,
])

const inputBlockSchema = z.union([inputBlockV5Schema, inputBlockV6Schema])

export type InputBlock = z.infer<typeof inputBlockSchema>
