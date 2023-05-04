import { z } from 'zod'
import { buttonItemSchema } from '../blocks/inputs/choice'
import { conditionItemSchema } from '../blocks/logic/condition'
import { aItemSchema, bItemSchema } from '../blocks'
import { pictureChoiceItemSchema } from '../blocks/inputs/pictureChoice'

const itemSchema = z.union([
  buttonItemSchema,
  conditionItemSchema,
  pictureChoiceItemSchema,
  aItemSchema,
  bItemSchema,
])

export type Item = z.infer<typeof itemSchema>
