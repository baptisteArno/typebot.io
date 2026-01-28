import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'

export const validateCnpjOptionsSchema = z.object({
  inputVariableId: z.string().optional(),
  outputVariableId: z.string().optional(),
  isValidVariableId: z.string().optional(),
  removeFormatting: z.boolean().optional().default(true).openapi({ effectType: 'input' }),
})

export const validateCnpjBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.VALIDATE_CNPJ]),
    options: validateCnpjOptionsSchema.optional(),
  })
)

export type ValidateCnpjBlock = z.infer<typeof validateCnpjBlockSchema>
export type ValidateCnpjOptions = z.infer<typeof validateCnpjOptionsSchema>
