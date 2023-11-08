import { z } from 'zod'
import { optionBaseSchema, blockBaseSchema } from '../../shared'
import { InputBlockType } from '../constants'

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
    })
  )

export const textInputSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([InputBlockType.TEXT]),
    options: textInputOptionsSchema.optional(),
  })
)

export type TextInputBlock = z.infer<typeof textInputSchema>
