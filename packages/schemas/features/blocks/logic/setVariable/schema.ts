import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'
import { extendZodWithOpenApi } from 'zod-openapi'

extendZodWithOpenApi(z)

const baseOptions = z.object({
  variableId: z.string().optional(),
  isExecutedOnClient: z.boolean().optional(),
})

const basicSetVariableOptionsSchema = baseOptions.extend({
  type: z.enum([
    'Today',
    'Moment of the day',
    'Empty',
    'Environment name',
    'User ID',
    'Result ID',
    'Random ID',
    'Phone number',
    'Contact name',
    'Transcript',
  ]),
})

const dateSetVariableOptionsSchema = baseOptions.extend({
  type: z.enum(['Now', 'Yesterday', 'Tomorrow']),
  timeZone: z.string().optional(),
})

const initialSetVariableOptionsSchema = baseOptions.extend({
  type: z.undefined().openapi({ type: 'string' }),
  expressionToEvaluate: z.string().optional(),
  isCode: z.boolean().optional(),
})

const customSetVariableOptionsSchema = baseOptions.extend({
  type: z.literal('Custom'),
  expressionToEvaluate: z.string().optional(),
  isCode: z.boolean().optional(),
})

const mapListItemsOptionsSchema = baseOptions.extend({
  type: z.literal('Map item with same index'),
  mapListItemParams: z
    .object({
      baseItemVariableId: z.string().optional(),
      baseListVariableId: z.string().optional(),
      targetListVariableId: z.string().optional(),
    })
    .optional(),
})

const appendItemToListOptionsSchema = baseOptions.extend({
  type: z.literal('Append value(s)'),
  item: z.string().optional(),
})

export const setVariableOptionsSchema = z.discriminatedUnion('type', [
  initialSetVariableOptionsSchema,
  dateSetVariableOptionsSchema,
  basicSetVariableOptionsSchema,
  customSetVariableOptionsSchema,
  mapListItemsOptionsSchema,
  appendItemToListOptionsSchema,
])

export const setVariableBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.SET_VARIABLE]),
    options: setVariableOptionsSchema.optional(),
  })
)

export type SetVariableBlock = z.infer<typeof setVariableBlockSchema>
