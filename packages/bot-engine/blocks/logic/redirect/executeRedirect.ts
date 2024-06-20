import { RedirectBlock, SessionState } from '@sniper.io/schemas'
import { sanitizeUrl } from '@sniper.io/lib'
import { ExecuteLogicResponse } from '../../../types'
import { parseVariables } from '@sniper.io/variables/parseVariables'

export const executeRedirect = (
  state: SessionState,
  block: RedirectBlock
): ExecuteLogicResponse => {
  const { variables } = state.snipersQueue[0].sniper
  if (!block.options?.url) return { outgoingEdgeId: block.outgoingEdgeId }
  const formattedUrl = sanitizeUrl(parseVariables(variables)(block.options.url))
  return {
    clientSideActions: [
      {
        type: 'redirect',
        redirect: { url: formattedUrl, isNewTab: block.options.isNewTab },
      },
    ],
    outgoingEdgeId: block.outgoingEdgeId,
  }
}
