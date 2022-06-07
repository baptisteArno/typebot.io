import { z } from 'zod'
import { optionBaseSchema } from '../shared'
import { choiceInputOptionsSchema, choiceInputSchema } from './choice'
import { dateInputOptionsSchema, dateInputSchema } from './date'
import { emailInputOptionsSchema, emailInputSchema } from './email'
import { numberInputOptionsSchema, numberInputSchema } from './number'
import { paymentInputOptionsSchema, paymentInputSchema } from './payment'
import {
  phoneNumberInputOptionsSchema,
  phoneNumberInputStepSchema,
} from './phone'
import { ratingInputOptionsSchema, ratingInputStepSchema } from './rating'
import { textInputOptionsSchema, textInputSchema } from './text'
import { urlInputOptionsSchema, urlInputSchema } from './url'

export type OptionBase = z.infer<typeof optionBaseSchema>

export const inputStepOptionsSchema = textInputOptionsSchema
  .or(choiceInputOptionsSchema)
  .or(emailInputOptionsSchema)
  .or(numberInputOptionsSchema)
  .or(urlInputOptionsSchema)
  .or(phoneNumberInputOptionsSchema)
  .or(dateInputOptionsSchema)
  .or(paymentInputOptionsSchema)
  .or(ratingInputOptionsSchema)

export const inputStepSchema = textInputSchema
  .or(numberInputSchema)
  .or(emailInputSchema)
  .or(urlInputSchema)
  .or(dateInputSchema)
  .or(phoneNumberInputStepSchema)
  .or(choiceInputSchema)
  .or(paymentInputSchema)
  .or(ratingInputStepSchema)

export type InputStep = z.infer<typeof inputStepSchema>
export type InputStepOptions = z.infer<typeof inputStepOptionsSchema>
