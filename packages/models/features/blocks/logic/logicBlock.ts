import { z } from 'zod'
import { codeOptionsSchema, codeBlockSchema } from './code'
import { conditionBlockSchema } from './condition'
import { redirectOptionsSchema, redirectBlockSchema } from './redirect'
import { setVariableOptionsSchema, setVariableBlockSchema } from './setVariable'
import { typebotLinkOptionsSchema, typebotLinkBlockSchema } from './typebotLink'
import { waitBlockSchema, waitOptionsSchema } from './wait'

const logicBlockOptionsSchema = codeOptionsSchema
  .or(redirectOptionsSchema)
  .or(setVariableOptionsSchema)
  .or(typebotLinkOptionsSchema)
  .or(waitOptionsSchema)

export const logicBlockSchema = codeBlockSchema
  .or(conditionBlockSchema)
  .or(redirectBlockSchema)
  .or(typebotLinkBlockSchema)
  .or(setVariableBlockSchema)
  .or(waitBlockSchema)

export type LogicBlock = z.infer<typeof logicBlockSchema>
export type LogicBlockOptions = z.infer<typeof logicBlockOptionsSchema>
