import { SessionState, AssignChatBlock } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '../../../types'
import { assignChatType } from '@typebot.io/schemas/features/blocks/logic/assignChat/constants'

export const executeAssignChat = (
  _: SessionState,
  block: AssignChatBlock
): ExecuteLogicResponse | void => {
  let assignType: assignChatType | undefined = block.options?.assignType
  if (!assignType) return

  const assign: AssignChatBlock['options'] = {
    assignType: assignType,
  }

  if (block.options?.email) {
    assign['email'] = block.options.email
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
