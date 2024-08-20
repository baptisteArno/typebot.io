import { z } from '../../../../zod'
import { optionBaseSchema, blockBaseSchema } from '../../shared'
import { InputBlockType } from '../constants'
import { fileVisibilityOptions } from '../file/constants'

export const textInputOptionsBaseSchema = z.object({
  labels: z
    .object({
      placeholder: z.string().optional(),
      button: z.string().optional(),
    })
    .optional(),
})

export const textInputOptionsSchema = textInputOptionsBaseSchema
  .merge(optionBaseSchema)
  .merge(
    z.object({
      isLong: z.boolean().optional(),
      audioClip: z
        .object({
          isEnabled: z.boolean().optional(),
          saveVariableId: z.string().optional(),
          visibility: z.enum(fileVisibilityOptions).optional(),
        })
        .optional(),
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

export type TextInputBlock = z.infer<typeof textInputSchema>
