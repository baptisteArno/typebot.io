import { z } from 'zod'
import { optionBaseSchema, blockBaseSchema } from '../baseSchemas'
import { InputBlockType } from './enums'

export const fileInputOptionsSchema = optionBaseSchema.merge(
  z.object({
    isRequired: z.boolean().optional(),
    isMultipleAllowed: z.boolean(),
    labels: z.object({
      placeholder: z.string(),
      button: z.string(),
      clear: z.string().optional(),
      skip: z.string().optional(),
    }),
    sizeLimit: z.number().optional(),
  })
)

export const fileInputStepSchema = blockBaseSchema.merge(
  z.object({
    type: z.literal(InputBlockType.FILE),
    options: fileInputOptionsSchema,
  })
)

export const defaultFileInputOptions = {
  isRequired: true,
  isMultipleAllowed: false,
  labels: {
    placeholder: `<strong>
      Click to upload
    </strong> or drag and drop<br>
    (size limit: 10MB)`,
    button: 'Upload',
    clear: 'Clear',
    skip: 'Skip',
  },
} satisfies FileInputOptions

export type FileInputBlock = z.infer<typeof fileInputStepSchema>
export type FileInputOptions = z.infer<typeof fileInputOptionsSchema>
