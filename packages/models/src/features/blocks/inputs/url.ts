import { z } from 'zod'
import {
  defaultButtonLabel,
  InputBlockType,
  optionBaseSchema,
  blockBaseSchema,
} from '../shared'
import { textInputOptionsBaseSchema } from './text'

export const urlInputOptionsSchema = optionBaseSchema
  .and(textInputOptionsBaseSchema)
  .and(
    z.object({
      retryMessageContent: z.string(),
    })
  )

export const urlInputSchema = blockBaseSchema.and(
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
