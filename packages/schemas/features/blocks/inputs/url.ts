import { z } from 'zod'
import { optionBaseSchema, blockBaseSchema } from '../baseSchemas'
import { defaultButtonLabel } from './constants'
import { InputBlockType } from './enums'
import { textInputOptionsBaseSchema } from './text'

export const urlInputOptionsSchema = optionBaseSchema
  .merge(textInputOptionsBaseSchema)
  .merge(
    z.object({
      retryMessageContent: z.string(),
    })
  )

export const urlInputSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([InputBlockType.URL]),
    options: urlInputOptionsSchema,
  })
)

export const defaultUrlInputOptions: UrlInputOptions = {
  labels: {
    button: defaultButtonLabel,
    placeholder: 'Type a URL...',
  },
  retryMessageContent:
    "This URL doesn't seem to be valid. Can you type it again?",
}

export type UrlInputBlock = z.infer<typeof urlInputSchema>
export type UrlInputOptions = z.infer<typeof urlInputOptionsSchema>
