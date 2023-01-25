import { z } from 'zod'
import { buttonItemSchema } from '../blocks/inputs/choice'
import { conditionItemSchema } from '../blocks/logic/condition'

const itemSchema = buttonItemSchema.or(conditionItemSchema)

export type Item = z.infer<typeof itemSchema>
