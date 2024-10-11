import { z } from '../../../zod'
import { conditionBlockSchemas } from './condition'
import { jumpBlockSchema } from './jump'
import { redirectBlockSchema } from './redirect'
import { assignChatBlockSchema } from './assignChat'
import { scriptBlockSchema } from './script'
import { setVariableBlockSchema } from './setVariable'
import { typebotLinkBlockSchema } from './typebotLink'
import { waitBlockSchema } from './wait'
import { abTestBlockSchemas } from './abTest'
import { closeChatBlockSchema } from './closeChat'
import { globalJumpBlockSchema } from './globalJump'

export const logicBlockSchemas = {
  v5: [
    scriptBlockSchema,
    conditionBlockSchemas.v5,
    redirectBlockSchema,
    assignChatBlockSchema,
    setVariableBlockSchema,
    typebotLinkBlockSchema,
    waitBlockSchema,
    jumpBlockSchema,
    closeChatBlockSchema,
    abTestBlockSchemas.v5,
    globalJumpBlockSchema,
  ],
  v6: [
    scriptBlockSchema,
    conditionBlockSchemas.v6,
    redirectBlockSchema,
    assignChatBlockSchema,
    setVariableBlockSchema,
    typebotLinkBlockSchema,
    waitBlockSchema,
    jumpBlockSchema,
    closeChatBlockSchema,
    abTestBlockSchemas.v6,
    globalJumpBlockSchema,
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
