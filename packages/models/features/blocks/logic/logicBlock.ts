import { z } from 'zod'
import { codeOptionsSchema, codeBlockSchema } from './code'
import { conditionBlockSchema } from './condition'
import { redirectOptionsSchema, redirectBlockSchema } from './redirect'
import { setVariableOptionsSchema, setVariableBlockSchema } from './setVariable'
import { typebotLinkOptionsSchema, typebotLinkBlockSchema } from './typebotLink'

const logicBlockOptionsSchema = codeOptionsSchema
  .or(redirectOptionsSchema)
  .or(setVariableOptionsSchema)
  .or(typebotLinkOptionsSchema)

export const logicBlockSchema = codeBlockSchema
  .or(conditionBlockSchema)
  .or(redirectBlockSchema)
  .or(typebotLinkBlockSchema)
  .or(setVariableBlockSchema)

export type LogicBlock = z.infer<typeof logicBlockSchema>
export type LogicBlockOptions = z.infer<typeof logicBlockOptionsSchema>
