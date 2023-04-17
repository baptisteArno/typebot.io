import { z } from 'zod'
import { buttonItemSchema } from '../blocks/inputs/choice'
import { conditionItemSchema } from '../blocks/logic/condition'
import { aItemSchema, bItemSchema } from '../blocks'

const itemSchema = buttonItemSchema
  .or(conditionItemSchema)
  .or(aItemSchema)
  .or(bItemSchema)

export type Item = z.infer<typeof itemSchema>
