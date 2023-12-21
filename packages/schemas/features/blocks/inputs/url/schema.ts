import { z } from '../../../../zod'
import { optionBaseSchema, blockBaseSchema } from '../../shared'
import { InputBlockType } from '../constants'
import { textInputOptionsBaseSchema } from '../text'

export const urlInputOptionsSchema = optionBaseSchema
  .merge(textInputOptionsBaseSchema)
  .merge(
    z.object({
      retryMessageContent: z.string().optional(),
    })
  )

export const urlInputSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([InputBlockType.URL]),
      options: urlInputOptionsSchema.optional(),
    })
  )
  .openapi({
    title: 'URL',
    ref: 'url',
  })

export type UrlInputBlock = z.infer<typeof urlInputSchema>
