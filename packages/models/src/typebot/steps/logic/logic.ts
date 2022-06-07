import { z } from 'zod'
import { codeOptionsSchema, codeStepSchema } from './code'
import { conditionStepSchema } from './condition'
import { redirectOptionsSchema, redirectStepSchema } from './redirect'
import { setVariableOptionsSchema, setVariableStepSchema } from './setVariable'
import { typebotLinkOptionsSchema, typebotLinkStepSchema } from './typebotLink'

const logicStepOptionsSchema = codeOptionsSchema
  .or(redirectOptionsSchema)
  .or(setVariableOptionsSchema)
  .or(typebotLinkOptionsSchema)

export const logicStepSchema = codeStepSchema
  .or(conditionStepSchema)
  .or(redirectStepSchema)
  .or(typebotLinkStepSchema)
  .or(setVariableStepSchema)

export type LogicStep = z.infer<typeof logicStepSchema>
export type LogicStepOptions = z.infer<typeof logicStepOptionsSchema>
