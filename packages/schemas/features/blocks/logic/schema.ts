import { z } from '../../../zod'
import { conditionBlockSchemas } from './condition'
import { jumpBlockSchema } from './jump'
import { redirectBlockSchema } from './redirect'
import { scriptBlockSchema } from './script'
import { setVariableBlockSchema } from './setVariable'
import { typebotLinkBlockSchema } from './typebotLink'
import { waitBlockSchema } from './wait'
import { abTestBlockSchemas } from './abTest'

export const logicBlockSchemas = {
  v5: [
    scriptBlockSchema,
    conditionBlockSchemas.v5,
    redirectBlockSchema,
    setVariableBlockSchema,
    typebotLinkBlockSchema,
    waitBlockSchema,
    jumpBlockSchema,
    abTestBlockSchemas.v5,
  ],
  v6: [
    scriptBlockSchema,
    conditionBlockSchemas.v6,
    redirectBlockSchema,
    setVariableBlockSchema,
    typebotLinkBlockSchema,
    waitBlockSchema,
    jumpBlockSchema,
    abTestBlockSchemas.v6,
  ],
} as const

const logicBlockV5Schema = z.discriminatedUnion('type', [
  ...logicBlockSchemas.v5,
])

const logicBlockV6Schema = z.discriminatedUnion('type', [
  ...logicBlockSchemas.v6,
])

const logicBlockSchema = z.union([logicBlockV5Schema, logicBlockV6Schema])

export type LogicBlock = z.infer<typeof logicBlockSchema>
