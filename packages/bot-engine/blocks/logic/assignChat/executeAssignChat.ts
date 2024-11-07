import { SessionState, AssignChatBlock } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '../../../types'
import { assignChatType } from '@typebot.io/schemas/features/blocks/logic/assignChat/constants'
import { TRPCError } from '@trpc/server'

export const executeAssignChat = (
  _: SessionState,
  block: AssignChatBlock
): ExecuteLogicResponse => {
  let assignType: assignChatType | undefined = block.options?.assignType
  if (!assignType)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'You forgot to select the asssign type',
    })

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
