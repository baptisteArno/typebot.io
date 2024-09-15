import { SessionState, AssignChatBlock } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '../../../types'
import { assignChatType } from '@typebot.io/schemas/features/blocks/logic/assignChat/constants'

export const executeAssignChat = (
  _: SessionState,
  block: AssignChatBlock
): ExecuteLogicResponse => {
  let assignType: assignChatType = block.options.assignType
  const assign: AssignChatBlock['options'] = {
    assignType: assignType,
  }

  if (assignType === assignChatType.AGENT) {
    assign['email'] = block.options?.email
  }

  if (assignType === assignChatType.TEAM) {
    assign['name'] = block.options?.name
  }

  return {
    outgoingEdgeId: undefined,
    clientSideActions: [
      {
        type: 'assign',
        assign,
      },
    ],
  }
}
