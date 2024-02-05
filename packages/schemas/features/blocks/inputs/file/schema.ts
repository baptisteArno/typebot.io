import { z } from '../../../../zod'
import { optionBaseSchema, blockBaseSchema } from '../../shared'
import { InputBlockType } from '../constants'
import { fileVisibilityOptions } from './constants'

const fileInputOptionsV5Schema = optionBaseSchema.merge(
  z.object({
    isRequired: z.boolean().optional(),
    isMultipleAllowed: z.boolean().optional(),
    labels: z
      .object({
        placeholder: z.string().optional(),
        button: z.string().optional(),
        clear: z.string().optional(),
        skip: z.string().optional(),
        success: z
          .object({
            single: z.string().optional(),
            multiple: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    sizeLimit: z.number().optional(),
    visibility: z.enum(fileVisibilityOptions).optional(),
  })
)

const fileInputOptionsSchemas = {
  v5: fileInputOptionsV5Schema,
  v6: fileInputOptionsV5Schema.omit({
    sizeLimit: true,
  }),
} as const

const fileInputBlockV5Schema = blockBaseSchema.merge(
  z.object({
    type: z.literal(InputBlockType.FILE),
    options: fileInputOptionsSchemas.v5.optional(),
  })
)

export const fileInputBlockSchemas = {
  v5: fileInputBlockV5Schema.openapi({
    title: 'File input v5',
    ref: 'fileInputV5',
  }),
  v6: fileInputBlockV5Schema
    .merge(
      z.object({
        options: fileInputOptionsSchemas.v6.optional(),
      })
    )
    .openapi({
      title: 'File',
      ref: 'fileInput',
    }),
}

const fileInputBlockSchema = z.union([
  fileInputBlockSchemas.v5,
  fileInputBlockSchemas.v6,
])

export type FileInputBlock = z.infer<typeof fileInputBlockSchema>
export type FileInputBlockV6 = z.infer<typeof fileInputBlockSchemas.v6>
