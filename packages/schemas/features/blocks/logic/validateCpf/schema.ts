import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'

export const validateCpfOptionsSchema = z.object({
  inputVariableId: z.string().optional(),
  outputVariableId: z.string().optional(),
  isValidVariableId: z.string().optional(),
  removeFormatting: z.boolean().optional().default(true),
})

export const validateCpfBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.VALIDATE_CPF]),
    options: validateCpfOptionsSchema.optional(),
  })
)

export type ValidateCpfBlock = z.infer<typeof validateCpfBlockSchema>
export type ValidateCpfOptions = z.infer<typeof validateCpfOptionsSchema>
