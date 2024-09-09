import { SessionState, AssignChatBlock } from '@typebot.io/schemas'
import { sanitizeUrl } from '@typebot.io/lib'
import { ExecuteLogicResponse } from '../../../types'
import { parseVariables } from '@typebot.io/variables/parseVariables'

export const executeAssignChat = (
  state: SessionState,
  block: AssignChatBlock
): ExecuteLogicResponse => {
  console.log('Assigne Chat')
  return null
}

// export const executeAssignChat = (
//   state: SessionState,
//   block: RedirectBlock
// ): ExecuteLogicResponse => {
//   const { variables, close } = state.typebotsQueue[0].typebot
//   if (!block.options?.url) return { outgoingEdgeId: block.outgoingEdgeId }
//   const formattedUrl = sanitizeUrl(parseVariables(variables)(block.options.url))
//   return {
//     clientSideActions: [
//       {
//         type: 'redirect',
//         redirect: { url: formattedUrl, isNewTab: block.options.isNewTab },
//       },
//     ],
//     outgoingEdgeId: block.outgoingEdgeId,
//   }
// }
