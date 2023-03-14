import { z } from 'zod'
import { optionBaseSchema, blockBaseSchema } from '../baseSchemas'
import { defaultButtonLabel } from './constants'
import { InputBlockType } from './enums'

export const defaultRatingInputOptions: RatingInputOptions = {
  buttonType: 'Numbers',
  length: 10,
  labels: { button: defaultButtonLabel },
  customIcon: { isEnabled: false },
}

export const ratingInputOptionsSchema = optionBaseSchema.merge(
  z.object({
    buttonType: z.literal('Icons').or(z.literal('Numbers')),
    length: z.number(),
    labels: z.object({
      left: z.string().optional(),
      right: z.string().optional(),
      button: z.string(),
    }),
    customIcon: z.object({
      isEnabled: z.boolean(),
      svg: z.string().optional(),
    }),
    isOneClickSubmitEnabled: z.boolean().optional(),
  })
)

export const ratingInputBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.literal(InputBlockType.RATING),
    options: ratingInputOptionsSchema,
  })
)

export type RatingInputBlock = z.infer<typeof ratingInputBlockSchema>
export type RatingInputOptions = z.infer<typeof ratingInputOptionsSchema>
