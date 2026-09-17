import { z } from '../../../../zod'
import type { TElement } from '@udecode/plate-common'
import { optionBaseSchema, blockBaseSchema } from '../../shared'
import { InputBlockType } from '../constants'
import { fileVisibilityOptions } from '../file/constants'

export const textInputOptionsBaseSchema = z.object({
  labels: z
    .object({
      placeholder: z.string().optional(),
      richTextPlaceholder: z.array(z.any()).optional(),
      button: z.string().optional(),
    })
    .optional(),
})

export const textInputOptionsSchema = textInputOptionsBaseSchema
  .merge(optionBaseSchema)
  .merge(
    z.object({
      isLong: z.boolean().optional(),
      attachments: z
        .object({
          isEnabled: z.boolean().optional(),
          saveVariableId: z.string().optional(),
          visibility: z.enum(fileVisibilityOptions).optional(),
        })
        .optional(),
    })
  )

export const textInputSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([InputBlockType.TEXT]),
      options: textInputOptionsSchema.optional(),
    })
  )
  .openapi({
    title: 'Text',
    ref: 'textInput',
  })

export type TextInputBlock = Omit<
  z.infer<typeof textInputSchema>,
  'options'
> & {
  options?: Omit<z.infer<typeof textInputOptionsSchema>, 'labels'> & {
    labels?: {
      placeholder?: string
      richTextPlaceholder?: TElement[]
      button?: string
    }
  }
}
