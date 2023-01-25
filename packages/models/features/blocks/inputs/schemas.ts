import { z } from 'zod'
import { choiceInputOptionsSchema, choiceInputSchema } from './choice'
import { dateInputOptionsSchema, dateInputSchema } from './date'
import { emailInputOptionsSchema, emailInputSchema } from './email'
import { numberInputOptionsSchema, numberInputSchema } from './number'
import { paymentInputOptionsSchema, paymentInputSchema } from './payment'
import {
  phoneNumberInputOptionsSchema,
  phoneNumberInputBlockSchema,
} from './phone'
import { ratingInputOptionsSchema, ratingInputBlockSchema } from './rating'
import { textInputOptionsSchema, textInputSchema } from './text'
import { fileInputOptionsSchema, fileInputStepSchema } from './file'
import { urlInputOptionsSchema, urlInputSchema } from './url'
import { optionBaseSchema } from '../baseSchemas'

export type OptionBase = z.infer<typeof optionBaseSchema>

export const inputBlockOptionsSchema = textInputOptionsSchema
  .or(choiceInputOptionsSchema)
  .or(emailInputOptionsSchema)
  .or(numberInputOptionsSchema)
  .or(urlInputOptionsSchema)
  .or(phoneNumberInputOptionsSchema)
  .or(dateInputOptionsSchema)
  .or(paymentInputOptionsSchema)
  .or(ratingInputOptionsSchema)
  .or(fileInputOptionsSchema)

export const inputBlockSchema = textInputSchema
  .or(numberInputSchema)
  .or(emailInputSchema)
  .or(urlInputSchema)
  .or(dateInputSchema)
  .or(phoneNumberInputBlockSchema)
  .or(choiceInputSchema)
  .or(paymentInputSchema)
  .or(ratingInputBlockSchema)
  .or(fileInputStepSchema)

export type InputBlock = z.infer<typeof inputBlockSchema>
export type InputBlockOptions = z.infer<typeof inputBlockOptionsSchema>
